import csv from 'csv-parser';
import stream from 'stream';
import { Product } from '../models/Product.js';

const uploadProductsCSV = async (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Please upload a CSV file.' });
    }
    
    // Check if the file is a CSV by its original name's extension.
    if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
        return res.status(400).json({ message: 'Invalid file type. Please upload a CSV file.' });
    }

    const validProducts = [];
    const failedRows = [];
    let rowCounter = 1;

    // Creating readable stream from the uploaded file buffer
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
        .pipe(csv())
        .on('data', (row) => {
            rowCounter++; // Increment for each data row
            const { sku, name, brand, mrp, price, quantity, color, size } = row;

            // Validation checks
            // Check for required fields
            if (!sku || !name || !brand || !mrp || !price || !quantity) {
                failedRows.push({ row: rowCounter, error: 'Missing required fields.', data: row });
                return;
            }

            const priceNum = parseFloat(price);
            const mrpNum = parseFloat(mrp);
            const quantityNum = parseInt(quantity, 10);
            
            // Check for valid numbers
            if (isNaN(priceNum) || isNaN(mrpNum) || isNaN(quantityNum)) {
                failedRows.push({ row: rowCounter, error: 'Invalid data type for price, mrp, or quantity.', data: row });
                return;
            }

            // Check business logic
            if (priceNum > mrpNum) {
                failedRows.push({ row: rowCounter, error: 'Price cannot be greater than MRP.', data: row });
                return;
            }
            if (quantityNum < 0) {
                failedRows.push({ row: rowCounter, error: 'Quantity cannot be negative.', data: row });
                return;
            }
            
            // If all checks pass, add to valid products array
            validProducts.push({
                sku,
                name,
                brand,
                mrp: mrpNum,
                price: priceNum,
                quantity: quantityNum,
                color: color || null,
                size: size || null,
            });
        })
        .on('end', async () => {
            if (validProducts.length > 0) {
                try {
                    // Bulk insert valid products, 'ordered: false' continues on errors
                    const result = await Product.insertMany(validProducts, { ordered: false });
                    res.status(201).json({
                        message: 'CSV processed.',
                        stored: result.length,
                        failed: failedRows,
                    });
                } catch (error) {
                    // Handle duplicate SKU errors from `insertMany`
                    if (error.code === 11000 && error.writeErrors) {
                         error.writeErrors.forEach(err => {
                            failedRows.push({
                                row: 'N/A',
                                error: `Duplicate SKU found: ${err.op.sku}`,
                                data: err.op
                            });
                        });
                        res.status(201).json({
                            message: 'CSV processed with some duplicate SKU errors.',
                            stored: error.result.nInserted,
                            failed: failedRows,
                        });
                    } else {
                        res.status(500).json({ message: 'Error storing products.', error: error.message, failed: failedRows });
                    }
                }
            } else {
                res.status(200).json({
                    message: 'CSV processed. No valid products found to store.',
                    stored: 0,
                    failed: failedRows,
                });
            }
        })
        .on('error', (error) => {
            res.status(500).json({ message: 'Error parsing CSV file.', error: error.message });
        });
};


const getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const products = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();
        
        res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products.', error: error.message });
    }
};

const searchProducts = async (req, res) => {
    const { brand, color, minPrice, maxPrice } = req.query;
    const filter = {};

    if (brand) {
        // Case-insensitive search for brand
        filter.brand = new RegExp(brand, 'i');
    }
    if (color) {
        // Case-insensitive search for color
        filter.color = new RegExp(color, 'i');
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) {
            filter.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
            filter.price.$lte = parseFloat(maxPrice);
        }
    }

    try {
        const products = await Product.find(filter);
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found matching your criteria.' });
        }
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for products.', error: error.message });
    }
};

export { uploadProductsCSV, getAllProducts, searchProducts };  