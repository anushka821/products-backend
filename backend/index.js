import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as productRoutes } from './routes/productRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Successfully connected to MongoDB.'))
.catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});

// API routes
app.use('/api', productRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Streamoid Product Catalog API!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
