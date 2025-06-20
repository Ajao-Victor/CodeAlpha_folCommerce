    Folcommerce
Hey there! Welcome to Folcommerce, my passion project—an e-commerce platform crafted to make online shopping in Nigeria super smooth and fun. Whether you're browsing cool products, checking out detailed item pages, managing your cart, or checking out, Folcommerce has you covered with a sleek, mobile-friendly interface and a rock-solid backend. Built with love using HTML, CSS, JavaScript for the front end and Node.js/Express for the backend, it’s ready to deliver a top-notch shopping experience. Wanna give it a spin or help make it even better? Let’s dive in! 😊
Features

Product Browsing: Explore a catalog of products with a handy search bar to find what you love.
Product Details: Click any product to see its full info—images, descriptions, and price—pulled straight from a PostgreSQL database.
Cart Management: Add items, tweak quantities, or clear your cart, with real-time updates for a seamless flow.
Checkout: Wrap up your purchase with a clean, secure checkout process.
Secure Authentication: JWT-based login keeps your account safe and sound.
Responsive Design: Looks great on any device, from phones to desktops, with a modern vibe thanks to Animate.css and Font Awesome.
API-Driven: Backend powered by Node.js/Express, with sample data seeded from the Fake Store API.

    Tech Stack

    Frontend: HTML5, CSS3, JavaScript, Animate.css, Font Awesome
Backend: Node.js, Express.js
Database: PostgreSQL
Authentication: JSON Web Tokens
Tools: npm, http-server` for local development
Deployment: Ready for Netlify (frontend) and Render (backend) (optional)

    Getting Started
Ready to try Folcommerce out locally? Here’s how to set it up:
Prerequisites

Node.js (v16 or higher)
PostgreSQL (set up locally or via a cloud provider like RenderDB or Heroku)
Git
A browser (Chrome, Firefox, etc.)

    Installation

Clone the Repo:
git clone https://github.com/Ajao-Victor/folcommerce.git
cd folcommerce


    Set Up the Backend:

Navigate to the backend folder (if separate, e.g., backend/):cd backend
npm install


Create a .env file in the backend folder with:DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret_key


Start the backend:npm start

Note: Ensure PostgreSQL is running and has products and cart_items tables (see schema below).


Set Up the Frontend:

Navigate to the frontend folder (e.g., root or frontend/):cd ../frontend


Install http-server globally (if not already installed):npm install -g http-server


Serve the frontend:http-server


Open http://localhost:8080/index.html in your browser.


Database Schema:Create the required tables in PostgreSQL:
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    price DECIMAL NOT NULL,
    description TEXT,
    image_url TEXT
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER DEFAULT 1
);


    Test It Out:

Register/login to get a JWT token (stored in localStorage).
Browse products, add to cart, view cart, and checkout.
Use the search bar to filter products.



Project Structure
folcommerce/
├── server/                 # Node.js/Express backend
│   ├── server.js            # Main server file
│   ├── .env                 # Environment variables
│   └── node_modules/
|-Client/
|    ├── cssFiles/                # CSS styles
│       ├── cart.css
│       ├── checkout.css
│       ├── index.css
│       ├── product-detail.css
│       └── products.css
├── logo.png                 # App logo
|    |-shop/
|        ├── about.html
|        ├── cart.html
|        ├── checkout.html
|        ├── contact.html
|        ├── index.html               # Home page
|        ├── product-detail.html
|        ├── products.html            # Product listing
|        ├── registration.html        # Login/registration
|        └── services.html

    Contributing
Love the project and wanna help? Awesome! Here’s how:

Fork the repo.
Create a branch: git checkout -b feature/your-feature.
Commit changes: git commit -m "Add your feature".
Push to your fork: git push origin feature/your-feature.
Open a pull request with a clear description.

Please open an issue first for major changes or bugs to discuss ideas!
Known Issues

Checkout is minimal (no payment gateway yet—Paystack integration planned).
Product data uses Fake Store API; custom products to be added.
Add error handling for edge cases (e.g., invalid tokens).

    Future Plans

Integrate Paystack for payments.
Add user profiles and order history.
Implement product categories and filters.
Optimize performance with lazy-loaded images.

    Contact Me
Got questions or ideas? Reach out!

Email: svictoroluwatimileyin3@gmail.com
Phone: +234 913 110 9245
GitHub: Ajao-Victor
LinkedIn: Victor Ajao or www.linkedin.com/in/victor-ajao-970771253
Location: Osun State, Nigeria


Thanks for checking out Folcommerce! Let’s build something amazing together. 🚀
