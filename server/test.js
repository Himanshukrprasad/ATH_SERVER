const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 4001;

async function fetchRowByRawMaterial() {
  try {
    // Create a connection pool to MySQL database
    const pool = mysql.createPool({
      host: '193.203.184.53',
      user: 'u114727550_artherv',
      password: 'Artherv@321',
      database: 'u114727550_artherv_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Fetch row from the table where the raw_material column matches a specific value
    const query = 'SELECT * FROM grp_items_tb WHERE raw_material = ?';
    const params = ['FINISH FABRIC 60063200 (INDRANI)'];

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
