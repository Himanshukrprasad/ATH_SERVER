const mysql = require('mysql2/promise');

async function deleteAllRows() {
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

    // Tables to delete rows from
    const tables = ['spliting_header', 'spliting_source', 'spliting_destination' ];

    // Iterate over tables
    for (const table of tables) {
      // Delete all rows from the current table
      const query = `DELETE FROM ${table}`;
      const connection = await pool.getConnection();
      await connection.execute(query);
      connection.release();
      console.log(`Deleted all rows from ${table}`);
    }

    console.log('Deletion completed successfully.');
  } catch (error) {
    console.error('Error deleting rows:', error);
  }
}

deleteAllRows();
