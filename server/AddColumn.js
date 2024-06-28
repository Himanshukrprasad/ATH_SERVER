const mysql = require('mysql2/promise');

async function addColumns() {
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

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Execute ALTER TABLE queries to add new columns
   
    await connection.query('ALTER TABLE fus_rec_header ADD COLUMN estimate_cs_vch_no VARCHAR(255)');

    // Release the connection
    connection.release();

    console.log('Columns added successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to add columns
addColumns();
