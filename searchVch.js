const mysql = require("mysql2/promise");

async function fetchLastVchNo() {
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

    // Fetch the last vch_no value
    const getLastVchNoQuery = "SELECT vch_no FROM Estimated_CS_header ORDER BY master_id DESC LIMIT 1";
    const [lastVchNoResult] = await connection.query(getLastVchNoQuery);
    let lastVchNo = lastVchNoResult[0]?.vch_no || "EC-23-24-000";

    // Extract the last 4 digits and increment by 1
    const lastDigits = parseInt(lastVchNo.split('EC-23-24-')[1]);
    const newLastDigits = (lastDigits + 1).toString().padStart(3, '0');

    // Construct the new vch_no
    const newVchNo = `EC-23-24-${newLastDigits}`;

    console.log("Last vch_no value:", lastVchNo);
    console.log("New vch_no value:", newVchNo);

    // Release the connection
    connection.release();
    
    // Close the connection pool
    await pool.end();
  } catch (error) {
    console.error("Error fetching last vch_no:", error);
  }
}

// Call the function to fetch the last vch_no
fetchLastVchNo();
