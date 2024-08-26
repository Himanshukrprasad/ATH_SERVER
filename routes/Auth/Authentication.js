const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// CORS configuration
router.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
}));

router.get('/', async (req, res) => {
  const { userName, password } = req.query;

  if (!userName || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  pool.query(
    'SELECT * FROM user_tb WHERE username = ?',
    [userName],
    async (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Database query error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const roleName = user.role_name;
      const updatePermission = ['Admin', 'Manager', 'Accounts'].includes(roleName);
      const deletePermission = roleName === 'Admin';

      res.status(200).json({
        ...user,
        update_permission: updatePermission,
        delete_permission: deletePermission,
      });
    }
  );
});

module.exports = router;
