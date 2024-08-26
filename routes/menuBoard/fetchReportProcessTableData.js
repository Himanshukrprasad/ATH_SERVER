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
        const { process, unitVal } = req.body;


        
        // Array to hold the results from different tables
        const searchResults = [];

        // Get a connection from the pool
        const connection = await pool.getConnection();

        try {
            let header = '';
            let source = '';
            let destination = '';
            let prUnit = '';
            let isFinalCost = false; 

            switch (process) {
                case 'Estimated Cs':
                    header = 'Estimated_CS_header';
                    source = 'Estimated_CS_Item_Detail';
                    destination = 'Estimated_CS_JW_Detail';
                    prUnit = `UNIT-0${unitVal}`;
                    break;

                case 'Cutting':
                    header = 'cutting_header';
                    source = 'cutting_item_detail';
                    destination = 'cutting_component';
                    prUnit = `Cutting(U-${unitVal})`;
                    break;

                case 'Spliting':
                    header = 'spliting_header';
                    source = 'spliting_destination';
                    destination = 'spliting_source';
                    item = 'spliting_component';
                   prUnit = `SPLIT-${unitVal}`
                    // No prUnit for spliting_header
                    break;

                case 'SEMI FINISH GOODs':
                    header = 'sfg_header';
                    source = 'sfg_source';
                    destination = 'sfg_destination';
                    prUnit = unitVal
                    // No prUnit for sfg_header
                    break;

                case 'Embroidery ISS':
                    header = 'emb_iss_header';
                    source = 'emb_iss_source';
                    destination = 'emb_iss_destination';
                    prUnit = `EMBROIDERY ISS-0${unitVal}`;
                    break;

                case 'Embroidery REC':
                    header = 'emb_rec_header';
                    source = 'emb_rec_destination';
                    destination = 'emb_rec_source';
                    prUnit = `EMBROIDERY REC-0${unitVal}`;
                    break;

                case 'Fusing ISS':
                    header = 'fus_iss_header';
                    source = 'fus_iss_source';
                    destination = 'fus_iss_destination';
                    prUnit = `FUSSING ISS -${unitVal}`;
                    break;

                case 'Fusing REC':
                    header = 'fus_rec_header';
                    source = 'fus_rec_destination';
                    destination = 'fus_rec_source';
                    prUnit = `FUSSING REC -${unitVal}`;
                    break;

                case 'Handwork ISS':
                    header = 'handwork_iss_header';
                    source = 'handwork_iss_source';
                    destination = 'handwork_iss_destination';
                    prUnit = `HANDWORK ISS -${unitVal}`;
                    break;

                case 'Handwork REC':
                    header = 'handwork_rec_header';
                    source = 'handwork_rec_source';
                    destination = 'handwork_rec_destination';
                    prUnit = `HANDWORK REC -${unitVal}`;
                    break;

                case 'Washing ISS':
                    header = 'washing_iss_header';
                    source = 'washing_iss_source';
                    destination = 'washing_iss_destination';
                    prUnit = `WASHING ISS -${unitVal}`;
                    break;

                case 'Washing REC':
                    header = 'washing_rec_header';
                    source = 'washing_rec_destination';
                    destination = 'washing_rec_source';
                    prUnit = `WASHING REC-${unitVal}`;
                    break;

                case 'Stitching ISS':
                    header = 'stitching_iss_header';
                    source = 'stitching_iss_source';
                    destination = 'stitching_iss_destination';
                    prUnit = `STITCHING ISS -${unitVal}`;
                    break;

                case 'Stitching REC':
                    header = 'stitching_rec_header';
                    source = 'stitching_rec_destination';
                    destination = 'stitching_rec_source';
                    prUnit = `STITCHING REC -${unitVal}`;
                    break;

                case 'Refinishing ISS':
                    header = 'Refinishing_iss_header';
                    source = 'Refinishing_iss_source';
                    destination = 'Refinishing_iss_destination';
                    prUnit = `REFINISHING ISS -${unitVal}`;
                    break;

                case 'Refinishing REC':
                    header = 'Refinishing_rec_header';
                    source = 'Refinishing_rec_destination';
                    destination = 'Refinishing_rec_source';
                    prUnit = `REFINISHING REC-${unitVal}`;
                    break;

                case 'Printing ISS':
                    header = 'printing_iss_header';
                    source = 'printing_iss_source';
                    destination = 'printing_iss_destination';
                    prUnit = `PRINTING ISS-${unitVal}`;
                    break;

                case 'Printing REC':
                    header = 'printing_rec_header';
                    source = 'printing_rec_destination';
                    destination = 'printing_rec_source';
                    prUnit = `PRINTING REC-${unitVal}`;
                    break;

                case  'Pleating ISS':
                    header = 'pleating_iss_header';
                    source = 'pleating_iss_source';
                    destination = 'pleating_iss_destination';
                    prUnit = `PLEATING ISS -${unitVal}`;
                    break;

                case  'Pleating REC':
                    header = 'pleating_rec_header';
                    source = 'pleating_rec_destination';
                    destination = 'pleating_rec_source';
                    prUnit = `PLEATING REC -${unitVal}`;
                    break;

                case 'Smoking ISS':
                    header = 'smoking_iss_header';
                    source = 'smoking_iss_source';
                    destination = 'smoking_iss_destination';
                    prUnit = `SMOKING ISS-${unitVal}`;
                    break;

                case 'Smoking REC':
                    header = 'smoking_rec_header';
                    source = 'smoking_rec_destination';
                    destination = 'smoking_rec_source';
                    prUnit = `SMOKING REC-${unitVal}`;
                    break;

                case 'Ironing ISS':
                    header = 'iron_iss_header';
                    source = 'iron_iss_source';
                    destination = 'iron_iss_destination';
                    prUnit = `IRONING ISS-${unitVal}`;
                    break;

                case 'Ironing REC':
                    header = 'iron_rec_header';
                    source = 'iron_rec_destination';
                    destination = 'iron_rec_source';
                    prUnit = `IRONING REC-${unitVal}`;
                    break;

                case 'Final Costing':
                    header = 'fc_header';
                    source = 'fc_process_detail';
                    destination = 'fc_fabric_detail';
                    isFinalCost = true;
                    prUnit = `${unitVal}`;
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid process specified' });
            }

            if (isFinalCost) {
                // Query to fetch vch_no from the header table
                const [headerRows] = await connection.query(
                    `SELECT * FROM ?? WHERE unit_no = ?`,
                    [header, prUnit]
                  );
                for (const headerRow of headerRows) {
                    const vchNo = headerRow.vch_no;

                    // Fetch rows from the source table
                    const [sourceRows] = await connection.query(
                        `SELECT * FROM ${source} WHERE vch_no = ?`,
                        [vchNo]
                    );

                    // Fetch rows from the destination table
                    const [destinationRows] = await connection.query(
                        `SELECT * FROM ${destination} WHERE vch_no = ?`,
                        [vchNo]
                    );

                    // Add tableName key to each object in the arrays
                    headerRow.table_name = header;
                    sourceRows.forEach(row => row.table_name = source);
                    destinationRows.forEach(row => row.table_name = destination);

                    // Create an object for each vch_no and push it to searchResults
                    searchResults.push({
                        header: headerRow,
                        source: sourceRows,
                        destination: destinationRows
                    });
                }
            }

            else {
                // Query to fetch vch_no from the header table
                const [headerRows] = await connection.query(
                    `SELECT * FROM ?? WHERE unit_no = ?`,
                    [header, prUnit]
                  );

                console.log('hhh', header, prUnit, headerRows);

                for (const headerRow of headerRows) {
                    const vchNo = headerRow.vch_no;

                    // Fetch rows from the source table
                    const [sourceRows] = await connection.query(
                        `SELECT * FROM ${source} WHERE vch_no = ?`,
                        [vchNo]
                    );

                    // Fetch rows from the destination table
                    const [destinationRows] = await connection.query(
                        `SELECT * FROM ${destination} WHERE vch_no = ?`,
                        [vchNo]
                    );

                    // Add tableName key to each object in the arrays
                    headerRow.table_name = header;
                    sourceRows.forEach(row => row.table_name = source);
                    destinationRows.forEach(row => row.table_name = destination);

                    // Create an object for each vch_no and push it to searchResults
                    searchResults.push({
                        header: headerRow,
                        source: sourceRows,
                        destination: destinationRows
                    });
                }
            }

        }

        finally {
            // Ensure the connection is released even if an error occurs
            connection.release();
        }

        // Send the collected results as the response
        console.log('my data', searchResults);
        res.json(searchResults);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;