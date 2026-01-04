
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).json({ error: "All fields required" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password too short" });

  if (password !== confirmPassword)
    return res.status(400).json({ error: "Passwords do not match" });

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ error: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });

  res.status(201).json({ message: "Registration successful" });
});

module.exports = router;
