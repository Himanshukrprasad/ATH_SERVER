const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');

const app = express();
const port = 6001;
app.use(cors());

// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
  host: '193.203.184.53',
  user: 'u114727550_artherv',
  password: 'Artherv@321',
  database: 'u114727550_artherv_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log('hehehe')
// Define an API endpoint to fetch all columns
app.get('/api/all_data', (req, res) => {
  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).send('Error fetching data');
      return;
    }

    // Query the database to retrieve all columns (replace 'demo_tb' with your table name)
    connection.query('SELECT * FROM Estimated_CS_header', (err, results) => {
      // Release the connection back to the pool
      connection.release();

      if (err) {
        console.error('Error executing query:', err);
       
        res.status(500).send('Error fetching data');
        return;
      }

      // Send the retrieved data as JSON response
      console.log(results)
      res.json(results);
    });
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
