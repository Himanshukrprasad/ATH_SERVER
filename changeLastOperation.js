const mysql = require('mysql2/promise');

async function updateLastColumnToNull() {
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

    // Tables to update
    const tables = ['spliting_header'];

    // Iterate over tables
    for (const table of tables) {
      // Get a connection from the pool
      const connection = await pool.getConnection();

      try {
        // Find the master_id of the last row in the current table
        const [rows] = await connection.execute(`SELECT master_id FROM ${table} ORDER BY master_id DESC LIMIT 1`);
        if (rows.length > 0) {
          const lastMasterId = rows[0].master_id;

          // Get the last column name dynamically
          const [columns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
          const lastColumnName = columns[columns.length - 1].Field;

          // Update the last column of the last row to NULL
          const updateQuery = `UPDATE ${table} SET ${lastColumnName} = "SFG" WHERE master_id = ?`;
          await connection.execute(updateQuery, [lastMasterId]);

          console.log(`Updated last column of the last row in ${table} to NULL`);
        } else {
          console.log(`No rows found in ${table}`);
        }
      } finally {
        connection.release();
      }
    }

    console.log('Update completed successfully.');
  } catch (error) {
    console.error('Error updating rows:', error);
  }
}

updateLastColumnToNull();
