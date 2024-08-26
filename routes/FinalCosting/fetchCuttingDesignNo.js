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

router.get('/', (req, res) => {
  pool.query('SELECT * FROM cutting_header WHERE is_delete != 1', (error, results, fields) => {
    if (error) {
      console.error('Error fetching cutting headers:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const data = results.map(result => ({
        ...result,  // Spread the result object to include all its properties
        cutting_charges: null,
        types: []
      }));

      let completed = 0;

      data.forEach((item, index) => {
        pool.query('SELECT cutting_charges FROM cutting_component WHERE vch_no = ?', [item.vch_no], (err, resCharges) => {
          if (err) {
            console.error('Error fetching cutting charges:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
          
          if (resCharges.length > 0) {
            item.cutting_charges = resCharges[0].cutting_charges;
          }

          pool.query('SELECT type FROM cutting_item_detail WHERE vch_no = ?', [item.vch_no], (err, resTypes) => {
            if (err) {
              console.error('Error fetching types:', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }

            item.types = resTypes.map(typeRow => typeRow.type);

            if (++completed === data.length) {
              res.json(data);
            }
          });
        });
      });
    }
  });
});


module.exports = router;
