const mongoose = require('mongoose');
const { Schema } = mongoose;
const Counter = require('./counter.model');

const productsSchema = new mongoose.Schema({
    product_id: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    product_description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: { // Add size for clothing items
        type: [String],
        enum: ['S', 'M', 'L', 'XL', 'XXL', 
            '28"', '29"', '30"', '32"', '34"', '38"', 
            '7 US', '7.5 US', '8 US', '8.5 US', '9 US', '9.5 US', '10 US', 
            '50" x 72"', 'Free Size'],
        required: true
    },
    color: { // Add color for clothing items
        type: String,
        required: true
    },
    material: { type: String }, // Material of the clothing
    product_type: { 
        type: String, 
        enum: ['T-Shirt', 'Sweatshirt', 'Sweaters', 'Pants', 'Hats', 'Shoes', 'Accessories'], // New product types for clothing
        required: true
    },
    product_image_urls: { type: [String] },
    status: { 
        type: String, 
        enum: ['Available', 'Out of Stock'],
        default: 'Available'
    }
});

// แก้ไขการตั้งค่า product_id อัตโนมัติให้ใช้รหัสขึ้นต้นตามประเภทสินค้า
productsSchema.pre('save', async function(next) {
    if (!this.isNew) return next();  // ตรวจสอบว่าเป็นการบันทึกใหม่หรือไม่
    try {
        const prefix = this.product_type.charAt(0).toUpperCase();
        const counter = await Counter.findOneAndUpdate(
            { name: `${prefix}_product_id` },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );

        this.product_id = `${prefix}${String(counter.count).padStart(3, '0')}`;
        next();
    } catch (error) {
        next(error);
    }
});

// ป้องกันไม่ให้แก้ไข product_id ในการอัปเดต
productsSchema.pre('findOneAndUpdate', function(next) {
    this.set({ product_id: this._update.product_id || this.getQuery().product_id });  // ตรวจสอบว่า product_id ไม่ถูกเปลี่ยนแปลง
    next();
});

module.exports = mongoose.model('products', productsSchema);