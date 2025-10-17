import express from 'express';
import multer from 'multer';
import { uploadProductsCSV } from '../controllers/productController.js';
import { getAllProducts } from '../controllers/productController.js';
import { searchProducts } from '../controllers/productController.js';

const router = express.Router();

// Configure multer for file uploads.
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
// FOR WINDOWS USERS -> curl.exe -X POST -F "file=@products.csv;type=text/csv" http://localhost:8000/api/upload
// to upload CSV file from terminal
router.post('/upload', upload.single('file'), uploadProductsCSV);

// GET /api/products
// Returns all stored products with pagination support (page, limit). 
router.get('/products', getAllProducts);

// GET /api/products/search
// Filtering by brand, color, and price range
// By brand -> /products/search?brand=StreamThreads 
// By color -> /products/search?color=Red 
// By price range -> /products/search?minPrice=500&maxPrice=2000
router.get('/products/search', searchProducts);

export { router };
