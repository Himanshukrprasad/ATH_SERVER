const mysql = require('mysql2/promise');

async function fetchData() {
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

    // The query to fetch the data
    const query = `
      SELECT 
        jobber_tb.jobber_name,
        jobber_tb.jobber_id,
        jobber_tb.gst_type,
        jobwork_tb.jobwork_name_id,
        jobwork_tb.jobwork_name,
        jobwork_tb.tax_prcnt
      FROM 
        jobber_tb
      JOIN 
        cutting_header ON jobber_tb.jobber_name = cutting_header.jobber_name
      JOIN 
        jobwork_tb ON jobwork_tb.jobwork_name LIKE '%%'
      WHERE 
        jobber_tb.jobber_name = 'Aalafa Uddin Molla'
        AND jobber_tb.state_name = 'West Bengal';
    `;

    // Fetch the data
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query);
    connection.release();

    // Console.log the fetched data
    console.log(rows);

    console.log('Data fetched successfully.');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
