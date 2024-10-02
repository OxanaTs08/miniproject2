import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  dateAdded: { type: Date, default: Date.now },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  totalProducts: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  status: { type: String, default: "in process" },
});

export { orderSchema };

const Order = mongoose.model("Order", orderSchema);

export default Order;
