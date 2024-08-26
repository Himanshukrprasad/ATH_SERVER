const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');
const router = express.Router();
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


router.post('/', async (req, res) => {
    try {
      const { vchSearchValue, field } = req.body;
      const trimmedVchSearchValue = vchSearchValue;

  
      // Array to hold the results from different tables
      const searchResults = [];
  
      // Get a connection from the pool
      const connection = await pool.getConnection();
  
      try {
        let tables = [];
  
        // Determine which tables to search based on the field value
        if (field === 'EMB_ISS') {
          tables = ['emb_iss_header', 'emb_iss_destination', 'emb_iss_source'];
        } else if (field === 'EMB_REC') {
          tables = ['emb_rec_header', 'emb_rec_destination', 'emb_rec_source'];
        }
        else if (field === 'FUS_ISS') {
          tables = ['fus_iss_header', 'fus_iss_destination', 'fus_iss_source'];
        }
        else if (field === 'FUS_REC') {
          tables = ['fus_rec_header', 'fus_rec_destination', 'fus_rec_source'];
        }
        else if (field === 'HND_ISS') {
          tables = ['handwork_iss_header', 'handwork_iss_destination', 'handwork_iss_source'];
        }
        else if (field === 'HND_REC') {
        
          tables = ['handwork_rec_header', 'handwork_rec_destination', 'handwork_rec_source'];
        }
        else if (field === 'WASH_ISS') {
          tables = ['washing_iss_header', 'washing_iss_destination', 'washing_iss_source'];
        }
        else if (field === 'WASH_REC') {
          tables = ['washing_rec_header', 'washing_rec_destination', 'washing_rec_source'];
        }
        else if (field === 'PLE_ISS') {
          tables = ['pleating_iss_header', 'pleating_iss_destination', 'pleating_iss_source'];
        }
        else if (field === 'PLE_REC') {
          tables = ['pleating_rec_header', 'pleating_rec_destination', 'pleating_rec_source'];
        }
        else if (field === 'PRT_ISS') {
          tables = ['printing_iss_header', 'printing_iss_destination', 'printing_iss_source'];
        }
        else if (field === 'PRT_REC') {
          tables = ['printing_rec_header', 'printing_rec_destination', 'printing_rec_source'];
        }
        else if (field === 'WASH_ISS') {
          tables = ['washing_iss_header', 'washing_iss_destination', 'washing_iss_source'];
        }
        else if (field === 'WASH_REC') {
          tables = ['washing_rec_header', 'washing_rec_destination', 'washing_rec_source'];
        }
        else if (field === 'REF_ISS') {
          tables = ['Refinishing_iss_header', 'Refinishing_iss_destination', 'Refinishing_iss_source'];
        }
        else if (field === 'REF_REC') {
          tables = ['Refinishing_rec_header', 'Refinishing_rec_destination', 'Refinishing_rec_source'];
        }
        else if (field === 'SMK_ISS') {
          tables = ['smoking_iss_header', 'smoking_iss_destination', 'smoking_iss_source'];
        }
        else if (field === 'SMK_REC') {
          tables = ['smoking_rec_header', 'smoking_rec_destination', 'smoking_rec_source'];
        }
        else if (field === 'STIT_ISS') {
          tables = ['stitching_iss_header', 'stitching_iss_destination', 'stitching_iss_source'];
        }
        else if (field === 'STIT_REC') {
          tables = ['stitching_rec_header', 'stitching_rec_destination', 'stitching_rec_source'];
        }
        else if (field === 'IRON_ISS') {
          tables = ['iron_iss_header', 'iron_iss_destination', 'iron_iss_source'];
        }
        else if (field === 'IRON_REC') {
          tables = ['iron_rec_header', 'iron_rec_destination', 'iron_rec_source'];
        }
        else if (field === 'SPLITING') {
          tables = ['spliting_header', 'spliting_destination', 'spliting_source'];
        }
        else if (field === 'cutting') {
          tables = ['cutting_header', 'cutting_component', 'cutting_item_detail'];
        }else if (field === 'final_cost') {
          tables = ['fc_header', 'fc_fabric_detail', 'fc_process_detail'];
        }
        else if (field === 'SFG') {
          tables = ['sfg_header', 'sfg_source', 'sfg_destination'];
        }
         else {
          return res.status(400).send('Invalid field value');
        }
  
        // Loop through tables to perform search
        for (const table of tables) {
          // Query to search for the value in the current table
          const query = `SELECT * FROM ${connection.escapeId(table)} WHERE vch_no = ? AND is_delete = 0`;
        
          // Execute the query
          const [results] = await connection.execute(query, [trimmedVchSearchValue]);

        
          // Add results along with table and column names to searchResults array
          results.forEach((row) => {
            searchResults.push({
              tableName: table,
              data: row
            });
          });
        }
      } finally {
        // Ensure the connection is released even if an error occurs
        connection.release();
      }
  
      // Send the collected results as the response
    
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).send('Internal Server Error');
    }
  });



module.exports = router;
