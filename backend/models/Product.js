import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, 'SKU is a required field.'],
        unique: true, // Ensure SKU is unique
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Product name is a required field.'],
        trim: true,
    },
    brand: {
        type: String,
        required: [true, 'Brand is a required field.'],
        trim: true,
        index: true,
    },
    color: {
        type: String,
        trim: true,
        index: true,
    },
    size: {
        type: String,
        trim: true,
    },
    mrp: {
        type: Number,
        required: [true, 'MRP is a required field.'],
        min: [0, 'MRP cannot be negative.'],
    },
    price: {
        type: Number,
        required: [true, 'Price is a required field.'],
        min: [0, 'Price cannot be negative.'],
        // price must be ≤ mrp 
        validate: {
            validator: function(value) {
                return value <= this.mrp;
            },
            message: 'Price cannot be greater than MRP.'
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is a required field.'],
        // quantity ≥ 0
        min: [0, 'Quantity cannot be negative.'],
    },
}, {
    timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export { Product };
