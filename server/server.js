const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const SECRET = process.env.SECRET;

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const corsOption = {
  origin : '*'
}

// const allowedOrigin = 'https://folcommerce.onrender.com';

// app.use(cors({
//   origin: allowedOrigin,
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true
// }));
app.use(express.json());
app.use(cors(corsOption));
app.use(express.static('../client'));

async function createTables() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                price NUMERIC NOT NULL,
                description TEXT,
                image_url TEXT
            );
            CREATE TABLE IF NOT EXISTS cart_items (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id),
                product_id INT REFERENCES products(id),
                quantity INT DEFAULT 1
            );
        `);
        console.log('Tables created (if not existing)');
    } catch (err) {
        console.error('Error creating tables:', err.stack);
    }
}

createTables();

app.get('/', async(req,res) => {
  res.json("folCommerce server Created by AJ Stack running")
})

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hash]);
        res.json({ message: 'User created' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const valid = await bcrypt.compare(password, result.rows[0].password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = jwt.sign({ userId: result.rows[0].id }, SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}


app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.json(result.rows[0]);
  } catch (err) {
      console.error('Error fetching product:', err.stack);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/products', async (req, res) => {
    try {
        const dbResult = await pool.query('SELECT * FROM products');
        if (dbResult.rows.length > 0) {
            return res.json(dbResult.rows);
        }
        const { data } = await axios.get('https://fakestoreapi.com/products');
        for (const product of data) {
            await pool.query(
                'INSERT INTO products (id, title, price, description, image_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                [product.id, product.title, product.price, product.description, product.image]
            );
        }
        const result = await pool.query('SELECT * FROM products');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/cart', authenticateToken, async (req, res) => {
    const { productId } = req.body;
    try {
        await pool.query(
            'INSERT INTO cart_items (user_id, product_id) VALUES ($1, $2)',
            [req.user.userId, productId]
        );
        res.json({ message: 'Added to cart' });
    } catch (err) {
        console.error('Error adding to cart:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.put('/cart/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  try {
      if (quantity < 1) {
          await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.userId, productId]);
          return res.json({ message: 'Item removed from cart' });
      }
      const result = await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
          [quantity, req.user.userId, productId]
      );
      if (result.rows.length === 0) {
          await pool.query(
              'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
              [req.user.userId, productId, quantity]
          );
      }
      res.json({ message: 'Cart updated' });
  } catch (err) {
      console.error('Error updating cart:', err.stack);
      res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/cart/:productId', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  try {
      await pool.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.user.userId, productId]);
      res.json({ message: 'Item removed from cart' });
  } catch (err) {
      console.error('Error removing from cart:', err.stack);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/cartDisplay', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.title, p.price, p.image_url, p.description, c.quantity
            FROM cart_items c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1
        `, [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cart:', err.stack);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/checkout', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.userId]);
        res.json({ message: 'Checked out' });
    } catch (err) {
        console.error('Error during checkout:', err.stack);
        res.status(500).json({ error: 'Server error' });
    }
});

// app.listen(3000, () => console.log('Server running on http://127.0.0.1:3000'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
