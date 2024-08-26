const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 4001;

async function fetchRowByRawMaterial() {
  try {
    // Create a connection pool to MySQL database
    const pool = mysql.createPool({
      host: '193.203.184.53',
      user: 'u114727550_test_atharv',
      password: 'Sbe@54321',
      database: 'u114727550_test_atharv_db',
     
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Fetch row from the table where the raw_material column matches a specific value
    const query = 'SELECT * FROM Estimated_CS_header WHERE vch_no = ?';
    const params = ['EC/24-25/0002'];

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
    connection.release();

    if (rows.length > 0) {
      console.log('Found row:', rows[0]);
    } else {
      console.log('Not found');
    }
  } catch (error) {
    console.error('Error fetching row:', error);
  }
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  fetchRowByRawMaterial();
});
