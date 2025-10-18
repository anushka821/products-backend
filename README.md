# Backend Product Catalog Service (MERN Stack)

This project is a backend service built with Node.js, Express, and MongoDB that allows sellers to upload a CSV file of their product catalog, validates the data, and provides APIs to list and search the products.

## Features

  * **CSV Upload**: `POST /api/upload` endpoint to upload a product catalog.

  * **Data Validation**:

      * Ensures required fields (`sku`, `name`, `brand`, `mrp`, `price`, `quantity`) are present.

      * Validates that `price` is less than or equal to `mrp`.

      * Validates that `quantity` is not negative.

      * Handles duplicate SKUs.

  * **Database Storage**: Stores valid product data in a MongoDB database.

  * **List Products**: `GET /api/products` endpoint to retrieve all products with pagination.

  * **Search Products**: `GET /api/products/search` endpoint to filter products by `brand`, `color`, and price range.

## Tech Stack

  * **Node.js**: JavaScript runtime environment.

  * **Express.js**: Web framework for Node.js.

  * **MongoDB**: NoSQL database for storing product data.

  * **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js.

  * **Multer**: Middleware for handling `multipart/form-data`, used for file uploads.

  * **csv-parser**: Streaming CSV parser.

## Setup and Installation

### Prerequisites

  * [Node.js](https://nodejs.org/) (v14 or higher)

  * [npm](https://www.npmjs.com/) (comes with Node.js)

  * [MongoDB](https://www.mongodb.com/try/download/community) (or a MongoDB Atlas account)

### Steps

1.  **Clone the repository:**

    ```
    git clone <your-repository-url>
    cd <your-project-directory>

    ```

2.  **Install dependencies:**

    ```
    npm install

    ```

3.  **Set up environment variables:**

      * Create a file named `.env` in the root directory.

      * Add your MongoDB connection string to this file:

        ```
        MONGO_URI=your_mongodb_connection_string
        PORT=8000

        ```

      * **For MongoDB Atlas:** Replace `<username>`, `<password>`, and `<cluster-name>` with your credentials.

      * **For a local MongoDB instance:** `MONGO_URI=mongodb://127.0.0.1:27017/streamoid-catalog`

4.  **Run the application:**

      * For production:

        ```
        npm start

        ```

      * For development (with automatic server restart):

        ```
        npm run dev

        ```

    The server will be running on `http://localhost:8000`.

## API Documentation

### 1\. Upload CSV

  * **Endpoint**: `POST /api/upload`

  * **Description**: Uploads a CSV file of products. The file should be sent as `multipart/form-data` with the key `file`.

  * **Sample Request (`curl`):**

    ```
    curl -X POST -F "file=@products.csv" http://localhost:8000/api/upload

    ```

  * **Success Response (201 Created):**

    ```
    {
        "message": "CSV processed.",
        "stored": 19,
        "failed": [
            {
                "row": 22,
                "error": "Price cannot be greater than MRP.",
                "data": { "sku": "INVALID-PRICE", "price": "600", "mrp": "500" }
            }
        ]
    }

    ```

### 2\. List All Products

  * **Endpoint**: `GET /api/products`

  * **Description**: Returns a paginated list of all products.

  * **Query Parameters**:

      * `page` (optional, default: `1`): The page number to retrieve.

      * `limit` (optional, default: `10`): The number of products per page.

  * **Sample Request:**

    ```
    GET http://localhost:8000/api/products?page=1&limit=5

    ```

  * **Success Response (200 OK):**

    ```
    {
        "totalProducts": 20,
        "totalPages": 4,
        "currentPage": 1,
        "products": [
            {
                "_id": "64c8f5b8e9d1c3a4b5e6f7d0",
                "sku": "TSHIRT-RED-001",
                "name": "Classic Cotton T-Shirt",
                "brand": "StreamThreads"
            }
        ]
    }

    ```

### 3\. Search Products

  * **Endpoint**: `GET /api/products/search`

  * **Description**: Searches for products based on filter criteria.

  * **Query Parameters**:

      * `brand` (optional): Filter by brand name (case-insensitive).

      * `color` (optional): Filter by color (case-insensitive).

      * `minPrice` (optional): Minimum price of products.

      * `maxPrice` (optional): Maximum price of products.

  * **Sample Request:**

    ```
    GET http://localhost:8000/api/products/search?brand=BloomWear&maxPrice=2000

    ```

  * **Success Response (200 OK):**

    ```
    [
        {
            "_id": "64c8f5b8e9d1c3a4b5e6f7d5",
            "sku": "DRESS-YLW-M",
            "name": "Floral Summer Dress",
            "brand": "BloomWear",
            "price": 1999
        }
    ]

    ```
