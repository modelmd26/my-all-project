var express = require('express');
var router = express.Router();
var orderSchema = require('../models/order.model');
var productsSchema = require('../models/products.model');
var userSchema = require('../models/users.model');

/* GET ALL Orders */
router.get('/', async (req, res) => {
  try {
    const orders = await orderSchema.find().populate('items.product_id', 'product_name price'); // Include product details
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

/* GET Order by ID */
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    // ดึงข้อมูลคำสั่งซื้อที่ตรงกับ user_id
    const orders = await orderSchema.find({ user_id }).populate('items.product_id', 'product_name price');
    
    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

// POST Create New Order
router.post('/', async (req, res) => {
  try {
    const { user_id, items } = req.body;
    const user = await userSchema.findById(user_id);  // ใช้ user_id ในการค้นหาผู้ใช้

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

    let total_price = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await productsSchema.findOne({ product_id: item.product_id });
      if (!product) {
        return res.status(404).json({ message: `ไม่พบสินค้าด้วย ID ${item.product_id}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `สินค้ามีจำนวนไม่เพียงพอสำหรับ ${product.product_name}` });
      }

      const itemTotalPrice = product.price * item.quantity;
      total_price += itemTotalPrice;

      orderItems.push({
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: item.quantity,
        price: product.price,
        total_price: itemTotalPrice,
      });

      product.quantity -= item.quantity;
      if (product.quantity <= 0) {
        product.status = 'Out of Stock';
      }

      await product.save();
    }

    const order = new orderSchema({
      buyer_name: `${user.firstName} ${user.lastName}`,
      items: orderItems,
      total_price: total_price,
      user_id: user._id,  // เก็บ user_id ใน order
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างออร์เดอร์', error });
  }
});

/* POST Add New Product */
router.post('/', async (req, res) => {
  try {
    const { product_name, price, quantity, status } = req.body;

    const newProduct = new productsSchema({
      product_name,
      price,
      quantity,
      status,
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
});

/* PUT Update Product */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, quantity, status } = req.body;

    const updatedProduct = await productsSchema.findByIdAndUpdate(
      id,
      { product_name, price, quantity, status },
      { new: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error });
  }
});

/* DELETE Product */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productsSchema.findByIdAndDelete(id);

    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
});


module.exports = router;
