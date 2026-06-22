# E-Commerce Backend API

A TypeScript-based Express backend for an e-commerce application with authentication, product management, reviews, orders, and Cloudinary image upload support.

## Features

- JWT-based authentication with secure cookies
- User registration, login, logout, and profile update
- Role-based access control (admin/user)
- Product CRUD operations
- Product image upload via Cloudinary
- Review creation, update, deletion, and product review listing
- Order creation, viewing, and payment status management
- Centralized error handling and 404 middleware

## Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB + Mongoose
- Zod for request validation
- JSON Web Tokens (`jsonwebtoken`)
- Bcrypt for password hashing
- Cloudinary for image uploads
- Express File Upload

## Project Structure

- `src/index.ts` - application entry point
- `src/routes` - API routes for auth, users, products, reviews, and orders
- `src/controllers` - request handlers and business logic
- `src/models` - Mongoose models for users, products, reviews, and orders
- `src/middleware` - auth, error handling, and not-found middleware
- `src/utils` - helpers for JWT, token creation, and authorization
- `src/config/cloudinary.ts` - Cloudinary configuration
- `src/populateData/importProducts.ts` - sample product import script
- `src/mockData/products.json` - product seed data

## Setup

1. Clone the repository

```bash
git clone <repo-url>
cd E-Commerce
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the project root with the following variables:

```env
MONGO_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
COOKIE_SECRET=<your-cookie-secret>
CLOUD_NAME=<cloudinary-cloud-name>
API_KEY=<cloudinary-api-key>
API_SECRET=<cloudinary-api-secret>
NODE_ENV=development
PORT=5000
```

4. Start the development server

```bash
npm run dev
```

5. To build for production

```bash
npm run build
npm start
```

## API Endpoints

### Auth

- `POST /api/v1/auth/register` - register a new user
- `POST /api/v1/auth/login` - login and receive cookie-based JWT
- `GET /api/v1/auth/logout` - logout and clear auth cookie

### Users

- `GET /api/v1/users/` - admin-only: list all users
- `GET /api/v1/users/showMe` - get current authenticated user
- `PATCH /api/v1/users/updateUser` - update authenticated user profile
- `PATCH /api/v1/users/updateUserPassword` - change authenticated user password
- `GET /api/v1/users/:id` - get a single user by id

### Products

- `GET /api/v1/products/` - list all products
- `POST /api/v1/products/` - admin-only: create a product
- `GET /api/v1/products/:id` - get a single product
- `PATCH /api/v1/products/:id` - admin-only: update a product
- `DELETE /api/v1/products/:id` - admin-only: delete a product
- `POST /api/v1/products/uploadImage` - admin-only: upload product image
- `GET /api/v1/products/:id/reviews` - list reviews for a product

### Reviews

- `GET /api/v1/reviews/` - list all reviews
- `POST /api/v1/reviews/` - authenticated: create a review
- `GET /api/v1/reviews/:id` - get a single review
- `PATCH /api/v1/reviews/:id` - authenticated: update review
- `DELETE /api/v1/reviews/:id` - authenticated: delete review

### Orders

- `GET /api/v1/orders/` - admin-only: list all orders
- `POST /api/v1/orders/` - authenticated: create an order
- `GET /api/v1/orders/showAllMyOrders` - authenticated: list current user orders
- `GET /api/v1/orders/:id` - authenticated: get single order
- `PATCH /api/v1/orders/:id` - authenticated: update order payment status

## Seed Data

- Use `src/populateData/importProducts.ts` to import sample products from `src/mockData/products.json`.
- Ensure MongoDB is running and `MONGO_URL` is set.

## Notes

- The API expects secure cookie support for authentication and signed cookies configured by `COOKIE_SECRET`.
- Image uploads require valid Cloudinary credentials.
- Reviews are restricted so each user can create only one review per product.

## License

This project is available under the MIT License.
