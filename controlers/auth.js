import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/busketModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const jwtSecret = process.env.JWT_SECRET;

export const registerController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  try {
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      return;
    }

    const hashRounds = 10;
    const hashedPassword = await bcrypt.hash(password, hashRounds);

    const user = await User.create({
      username,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      res.status(500).json(error);
    }
  }
};

export const loginController = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      res.status(400).send("User not found");
      return;
    }
    if (foundUser) {
      const isPasswordValid = bcrypt.compare(password, foundUser.password);

      if (!isPasswordValid) {
        res.status(400).send("Invalid password");
        return;
      }

      const token = jwt.sign(
        { id: foundUser._id, username: foundUser.username },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      res.status(200).json({ token });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const createProductController = async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    return res.status(400).json({ message: "Data is required" });
  }
  try {
    const product = await Product.create({
      name,
      price,
    });
    res.status(201).json({ message: "product is created", product });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const productGetController = async (req, res) => {
  try {
    const products = await Product.find();
    console.log("Products found:", products);
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error);
  }
};

export const productByIdGetController = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const createOrderController = async (req, res) => {
  const { products } = req.body;
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "products are required" });
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = decodedToken.id;

    console.log("user:", user);

    const existingProducts = await Product.find({ _id: { $in: products } });

    if (existingProducts.length !== products.length) {
      return res.status(400).json({ message: "Some products do not exist" });
    }

    const totalProducts = existingProducts.length;
    const totalPrice = existingProducts.reduce(
      (total, product) => total + product.price,
      0
    );

    const order = await Order.create({
      user,
      products,
      totalProducts,
      totalPrice,
    });
    res.status(201).json({ message: "order is created", order });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const orderByIdGetController = async (req, res) => {
  const { id } = req.params;

  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const orderGetController = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await Order.find({ user: userId });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json(error);
  }
};
export const orderGetAdminController = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const updateOrderController = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    await order.save();
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const deleteOrderController = async (req, res) => {
  const { id } = req.params;
  try {
    const userRole = req.user.role;
    if (userRole !== "admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.findByIdAndDelete(id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};
