const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");

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

router.post("/", async (req, res) => {
  const { lastOp, designNo, wType } = req.body;

  try {
    const connection = await pool.getConnection();
    
    let query = '';
    let values = [designNo, wType];

    if (lastOp === 'EMB') {
      query = 'SELECT * FROM emb_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === null) {
      query = 'SELECT * FROM spliting_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'FUS') {
      query = 'SELECT * FROM fus_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'HND') {
      query = 'SELECT * FROM handwork_rec_source WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'PRT') {
      query = 'SELECT * FROM printing_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'STICH') {
      query = 'SELECT * FROM stitching_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'SMOKING') {
      query = 'SELECT * FROM smoking_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'REFINISH') {
      query = 'SELECT * FROM Refinishing_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'PLE') {
      query = 'SELECT * FROM pleating_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'WASH') {
      query = 'SELECT * FROM washing_rec_destination WHERE design_no = ? AND type = ?';
    } else if (lastOp === 'IRON' || lastOp === 'SFG') {
      return res.status(204).send(); // No Content
    }

    if (query) {
      const [rows] = await connection.query(query, values);
      connection.release();
      console.log(rows); 
      return res.json(rows);

    } else {
      connection.release();
      return res.status(400).json({ error: 'Invalid lastOp value' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
