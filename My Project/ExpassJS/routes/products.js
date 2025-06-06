var express = require('express');
var router = express.Router();
var productsSchema = require('../models/products.model');
const Counter = require('../models/counter.model');  
const multer = require('multer');
const path = require('path');

// File upload setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|WEBP/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// GET ALL products
router.get('/', async function(req, res, next) {
    try {
        let { product_type } = req.query;
        let filter = product_type ? { product_type } : {};
        let products = await productsSchema.find(filter);
        res.send(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send({ message: 'Error fetching products', error: error.message });
    }
});

// GET product by ID
router.get('/:product_id', async function(req, res, next) {
  try {
    let { product_id } = req.params;
    console.log('Product ID received:', product_id);
    let product = await productsSchema.findOne({ product_id });
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send({ message: 'Error fetching product', error: error.message });
  }
});

// GET products by category
router.get('/shop/:product_type', async function(req, res, next) {
    try {
        let { product_type } = req.params;
        console.log('Product type:', product_type);  // ดูค่าที่ได้รับจาก URL
        let products = await productsSchema.find({ product_type: product_type });
        console.log('Fetched products:', products);  // ตรวจสอบข้อมูลที่ส่งกลับ
        if (!products || products.length === 0) {
            return res.status(404).send({ message: 'No products found for this category' });
        }
        res.send(products);
    } catch (error) {
        console.error('Error fetching category products:', error);
        res.status(500).send({ message: 'Error fetching category products', error: error.message });
    }
});

// POST (Create a new product)
router.post('/', upload.array('product_image', 10), async function (req, res) {
    try {
        console.log('Request Body:', req.body);  // Log ข้อมูลจาก FormData
        console.log('Uploaded Files:', req.files);  // Log ไฟล์ที่อัพโหลด

        let { product_name, product_description, price, quantity, product_type, size, color, material } = req.body;

        // ค่าที่ได้จาก req.files
        const product_image_urls = req.files.map(file => `/images/${file.filename}`);

        // เช็คเงื่อนไขต่างๆ
        let status = quantity > 0 ? 'Available' : 'Out of Stock';

        if (!product_name || !price || !quantity || !product_type || !size || !color) {
            return res.status(400).send({ message: 'Please provide all required fields' });
        }

        let counter = await Counter.findOne({ name: 'product_id_counter' });
        if (!counter) {
            counter = new Counter({ name: 'product_id_counter', count: 1 });
        }

        let newId = `C${counter.count.toString().padStart(3, '0')}`;
        counter.count++;

        await counter.save();

        let product = new productsSchema({
            product_id: newId,
            product_name,
            product_description,
            price,
            quantity,
            product_type,
            size,
            color,
            material,
            product_image_urls,
            status
        });

        await product.save();
        res.send(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send({ message: 'Error adding product', error: error.message });
    }
});

// PUT (Update product details)
router.put('/:product_id', upload.single('product_image'), async function (req, res) {
    try {
        let { product_name, product_description, price, quantity, product_type, size, color, material } = req.body;
        let { product_id } = req.params;

        // ตรวจสอบว่า size เป็น array
        size = Array.isArray(size) ? size : [size];

        const product_image_urls = req.file ? [`/images/${req.file.filename}`] : undefined;
        let status = quantity > 0 ? 'Available' : 'Out of Stock';

        let updatedFields = {
            product_name,
            product_description,
            price,
            quantity,
            product_type,
            size,
            color,
            material,
            status
        };

        if (product_image_urls) {
            updatedFields.product_image_urls = product_image_urls;
        }

        // ทำให้มั่นใจว่า product_id จะไม่ถูกเปลี่ยนในระหว่างการอัปเดต
        let product = await productsSchema.findOneAndUpdate(
            { product_id },
            updatedFields,
            { new: true }
        );

        if (!product) {
            return res.status(404).send({ message: 'ไม่พบสินค้าที่ต้องการอัปเดต' });
        }

        res.send(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({ message: 'เกิดข้อผิดพลาดในการอัปเดตสินค้า', error: error.message });
    }
});

// DELETE product
router.delete('/:product_id', async function(req, res) {
    try {
        let { product_id } = req.params;

        let product = await productsSchema.findOneAndDelete({ product_id });
        if (!product) {
            return res.status(404).send({ message: 'Product not found to delete' });
        }

        res.send({ message: 'Product deleted successfully', product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send({ message: 'Error deleting product', error: error.message });
    }
});

module.exports = router;
