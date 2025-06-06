const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // เก็บ user_id ของผู้สั่งซื้อ
  buyer_name: { type: String, required: true },
  items: [
    {
      product_id: { type: String, required: true },
      product_name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total_price: { type: Number, required: true },
    }
  ],
  total_price: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);

