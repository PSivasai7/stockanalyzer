const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database"); // Your DB connection

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Hash the password (using 10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 2. Insert into MySQL
    const sql =
      "INSERT INTO users (username, uemail, upassword) VALUES (?, ?, ?)";
    await pool.execute(sql, [username, email, hashedPassword]);

    res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});
// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const [users] = await pool.execute("SELECT * FROM users WHERE uemail = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    const user = users[0];

    // 2. Check if password matches (Compare typed password with the Hashed DB password)
    const isMatch = await bcrypt.compare(password, user.upassword);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    // 3. Create a JWT Token
    // This token contains the user's ID and is signed with your secret key
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }, // Token lasts for 1 day
    );

    // 4. Send the token and user info back to the frontend
    res.json({
      message: "Login successful!",
      token: token,
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});
module.exports = router;
