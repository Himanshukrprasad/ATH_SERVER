const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');
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

const tables = [
  'Estimated_CS_header','cutting_header', 'spliting_header', 'emb_iss_header', 'emb_rec_header',
  'fus_iss_header', 'fus_rec_header', 'handwork_iss_header', 'handwork_rec_header',
  'washing_iss_header', 'washing_rec_header', 'pleating_iss_header', 'pleating_rec_header',
  'printing_iss_header', 'printing_rec_header', 'Refinishing_iss_header', 'Refinishing_rec_header',
  'smoking_iss_header', 'smoking_rec_header', 'stitching_iss_header', 'stitching_rec_header',
  'sfg_header', 'iron_iss_header', 'iron_rec_header','fc_header'
];

router.get('/', (req, res) => {
    const promises = tables.map(table => {
      return new Promise((resolve, reject) => {
        pool.query(`SELECT COUNT(*) AS count FROM ${table} where is_delete = 0`, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve({ table, count: results[0].count });
          }
        });
      });
    });
  
    Promise.all(promises)
      .then(results => {
        const tableCounts = results.reduce((acc, curr) => {
          acc[curr.table] = curr.count;
          return acc;
        }, {});
        res.json(tableCounts);
      })
      .catch(error => {
        res.status(500).json({ error: error.message });
      });
  });
  

module.exports = router;
