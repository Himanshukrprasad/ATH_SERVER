const express = require('express')
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
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).send('Error fetching data');
        return;
      }
  
      const fetchDesignNos = `
        SELECT design_no 
        FROM Estimated_CS_header 
        WHERE is_delete != 1
      `;
      connection.query(fetchDesignNos, (err, designResults) => {
        if (err) {
          console.error('Error executing query:', err);
          connection.release();
          res.status(500).send('Error fetching data');
          return;
        }
  
        const designNos = designResults.map(row => row.design_no);
  
        const fetchStockItems = `
          SELECT name, master_id, parent 
          FROM stock_tb 
          WHERE name != "N/A" AND grandparent = "WORK-IN-PROGRESS"
        `;
        connection.query(fetchStockItems, (err, stockResults) => {
          connection.release();
  
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error fetching data');
            return;
          }
  
          const updatedResults = stockResults.map(item => {
            if (designNos.includes(item.name)) {
              return { ...item, hidden: 1 };
            }
            return item;
          });
  
          res.json(updatedResults);
        });
      });
    });
  });
  


module.exports = router;