const mysql = require('mysql2/promise');
async function deleteLastThreeRows() {
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
  
      // Tables to delete the last 3 rows from
      const tables = ['fus_iss_source', 'fus_iss_destination'];
  
      // Iterate over tables
      for (const table of tables) {
        // Delete the last 3 rows from the current table
        const query = `DELETE FROM ${table} WHERE master_id IN (SELECT master_id FROM (SELECT master_id FROM ${table} ORDER BY master_id DESC LIMIT 2) AS temp)`;
        const connection = await pool.getConnection();
        await connection.execute(query);
        connection.release();
        console.log(`Deleted the last 3 rows from ${table}`);
      }
  
      console.log('Deletion completed successfully.');
    } catch (error) {
      console.error('Error deleting rows:', error);
    }
  }
  
  deleteLastThreeRows();
  
  