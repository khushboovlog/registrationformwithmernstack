require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const FormDataModel = require("./models/FormData");

const app = express();
app.use(express.json());
app.use(cors());

/* ================= MONGODB ================= */
mongoose
  .connect("mongodb://127.0.0.1:27017/practice_mern")
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

/* ================= EMAIL ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error("EMAIL ERROR:", err);
  else console.log("EMAIL SERVER READY");
});

/* ================= JWT MIDDLEWARE ================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json("No token provided");

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json("Invalid token");
  }
};

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("SERVER IS ALIVE");
});

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await FormDataModel.findOne({ email });
    if (exists) return res.json("Already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    await FormDataModel.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json("Registered successfully");
  } catch {
    res.status(500).json("Server error");
  }
});

/* ================= LOGIN (JWT) ================= */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await FormDataModel.findOne({ email });
    if (!user) return res.json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json("Wrong password");

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch {
    res.status(500).json("Server error");
  }
});

/* ================= PROTECTED ROUTE ================= */
app.get("/dashboard", verifyToken, (req, res) => {
  res.json(`Welcome ${req.user.email}`);
});

/* ================= FORGOT PASSWORD ================= */
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await FormDataModel.findOne({ email });
    if (!user) return res.json("User not found");

    const otp = crypto.randomInt(100000, 999999).toString();

    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. Valid for 10 minutes.`,
    });

    res.json("OTP sent to email");
  } catch {
    res.status(500).json("Failed to send OTP");
  }
});

/* ================= RESET PASSWORD ================= */
app.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await FormDataModel.findOne({ email });

    if (
      !user ||
      user.resetOTP !== otp ||
      user.otpExpiry < Date.now()
    ) {
      return res.json("Invalid or expired OTP");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.otpExpiry = null;

    await user.save();

    res.json("Password updated successfully");
  } catch {
    res.status(500).json("Server error");
  }
});

/* ================= START ================= */
app.listen(3001, () => {
  console.log("SERVER STARTED ON PORT 3001");
});
