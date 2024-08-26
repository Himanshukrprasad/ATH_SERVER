const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");
const md5 = require("md5");
require('dotenv').config();

// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Route to update the password of a user
router.post('/', async (req, res) => {
  const { userId, newPassword } = req.body;

  console.log('airuf', userId, newPassword)

  if (!userId || !newPassword) {
    return res.status(400).json({ error: "userId and newPassword are required" });
  }

  try {
    // Hash the new password using MD5
    const hashedPassword = md5(newPassword);

    // Update the password in the database
    const [result] = await pool.query(
      "UPDATE user_tb SET password = ? WHERE userName = ?",
      [hashedPassword, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
