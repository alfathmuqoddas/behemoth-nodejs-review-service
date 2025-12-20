# Node.js Review Service

This is a Twelve-Factor App compliant service built with Node.js, Express, and Sequelize, using TypeScript. It provides user registration and login functionality using JSON Web Tokens (JWT) signed with RS256 (RSA). This service provide CRUD API for movie reviews.

The service is designed to work with an external authentication service (e.g., `behemoth/nodejs-auth-service`). It uses asymmetric (RSA) encryption for JWT verification, requiring the public key from the auth service.

## Features

- **JWT-based Authentication**: Secure RS256 signing using public/private key pairs.
- **Database**: PostgreSQL integration via Sequelize.
- **Logging**: Structured logging with `pino`.
- **Metrics**: Prometheus metrics exposed at `/metrics`.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT) (RS256), bcryptjs
- **Logging:** Pino, Pino-http
- **Monitoring:** Prometheus (prom-client)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd behemoth-nodejs-auth-service
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Docker

1.  Build the Docker image:
    ```bash
    docker build -t <image-name> .
    ```
2.  Run the Docker image:
    ```bash
    docker run -d -p 3010:3000 --env-file ./.env -e DB_HOST=host.docker.internal -v /home/alfath/keys:/usr/src/app/keys --add-host=host.docker.internal:host-gateway --name behemoth-review-service localhost:5000/behemoth-nodejs-review-service
    ```

### Configuration

1.  Create a `.env` file in the root directory based on the following template:

    ```env
    # Server Configuration
    PORT=3000

    # Database Configuration
    DB_HOST=127.0.0.1
    DB_PORT=5432
    DB_NAME=postgres
    DB_USER=postgres
    DB_PASSWORD=your_password
    ```

2.  **Generate RSA Keys:**
    This project uses RS256 for JWTs, requiring a private and public key pair. You must generate these keys in the `keys/` directory.

    ```bash
    # Create keys directory if it doesn't exist (it should exist in the repo)
    mkdir -p keys

    # Generate Private Key
    openssl genrsa -out keys/private.pem 2048

    # Generate Public Key
    openssl rsa -in keys/private.pem -outform PEM -pubout -out keys/public.pem
    ```

### Database Setup

1.  Ensure your PostgreSQL server is running and the database specified in `DB_NAME` exists (or let Sequelize create it if configured).
2.  Run migrations to create the necessary tables:
    ```bash
    npm run db:migrate
    ```

## Available Scripts

- `npm run dev`: Runs the app in development mode with `nodemon`.
- `npm run build`: Compiles TypeScript to JavaScript in the `dist/` folder.
- `npm start`: Runs the compiled app (requires `npm run build` first).
- `npm run db:migrate`: Runs pending migrations.
- `npm run db:migrate:undo`: Reverts the most recent migration.
- `npm run db:status`: Shows the status of all migrations.

## API Endpoints

### Reviews

#### Get All Reviews By Movie

- **URL:** `/getByMovie/:movieId`
- **Method:** `GET`

#### Get All Reviews By User

- **URL:** `/getByUser/:userId`
- **Method:** `GET`

#### Get ALL Reviews (admin only)

- **URL:** `/get`
- **Method:** `GET`

#### Create Review

- **URL:** `/add`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "movieId": "uuid",
    "userId": "uuid",
    "userName": "string",
    "rating": 1,
    "review": "string"
  }
  ```
- **Success Response:**
  ```json
  {
    "id": "uuid",
    "movieId": "uuid",
    "userId": "uuid",
    "userName": "string",
    "rating": 1,
    "review": "string",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Update Review

- **URL:** `/update/:id`
- **Method:** `PUT`
- **Body:**

  ```json
  {
    "id": "uuid",
    "movieId": "uuid",
    "userId": "uuid",
    "userName": "string",
    "rating": 1,
    "review": "string"
  }
  ```

- **Success Response:**
  ```json
  {
    "id": "uuid",
    "movieId": "uuid",
    "userId": "uuid",
    "userName": "string",
    "rating": 1,
    "review": "string",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Delete Review

- **URL:** `/delete/:id`
- **Method:** `DELETE`
- **Response:**
  ```json
  {
    "message": "Review deleted successfully"
  }
  ```

### Monitoring

#### Prometheus Metrics

- **URL:** `/metrics`
- **Method:** `GET`
- **Description:** Exposes application metrics for Prometheus scraping.
