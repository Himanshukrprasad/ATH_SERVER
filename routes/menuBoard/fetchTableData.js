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
        const { process, month, year, unitVal } = req.body;

        console.log('pr', process, month, unitVal)

        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.indexOf(month.toLowerCase());

        if (monthIndex === -1) {
            return res.status(400).json({ error: 'Invalid month name' });
        }

        // Calculate start and end dates for the month
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0); // This still gives the last day of the previous month

        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };


        // Correctly set endDate to the last day of the current month
        endDate.setDate(endDate.getDate()); // This line is redundant but harmless

        // Format dates as 'YYYY-MM-DD'
        const startDateString = startDate.toLocaleDateString('en-CA', options).replace(/\//g, '-');
        const endDateString = endDate.toLocaleDateString('en-CA', options).replace(/\//g, '-');


        console.log('Start Date:', startDateString); // Should be '2024-07-01'
        console.log('End Date:', endDateString);

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
                case 'Estimated_CS_header':
                    header = 'Estimated_CS_header';
                    source = 'Estimated_CS_Item_Detail';
                    destination = 'Estimated_CS_JW_Detail';
                    prUnit = `UNIT-0${unitVal}`;
                    break;

                case 'cutting_header':
                    header = 'cutting_header';
                    source = 'cutting_item_detail';
                    destination = 'cutting_component';
                    prUnit = `Cutting(U-${unitVal})`;
                    break;
                case 'spliting_header':
                    header = 'spliting_header';
                    source = 'spliting_destination';
                    destination = 'spliting_source';
                    item = 'spliting_component';
                    prUnit = `SPLIT-${unitVal}`
                    // No prUnit for spliting_header
                    break;
                case 'sfg_header':
                    header = 'sfg_header';
                    source = 'sfg_destination';
                    destination = 'sfg_source';
                    prUnit = unitVal
                    // No prUnit for sfg_header
                    break;
                case 'emb_iss_header':
                    header = 'emb_iss_header';
                    source = 'emb_iss_source';
                    destination = 'emb_iss_destination';
                    prUnit = `EMBROIDERY ISS-0${unitVal}`;
                    break;
                case 'emb_rec_header':
                    header = 'emb_rec_header';
                    source = 'emb_rec_source';
                    destination = 'emb_rec_destination';
                    prUnit = `EMBROIDERY REC-0${unitVal}`;
                    break;
                case 'fus_iss_header':
                    header = 'fus_iss_header';
                    source = 'fus_iss_source';
                    destination = 'fus_iss_destination';
                    prUnit = `FUSSING ISS -${unitVal}`;
                    break;
                case 'fus_rec_header':
                    header = 'fus_rec_header';
                    source = 'fus_rec_source';
                    destination = 'fus_rec_destination';
                    prUnit = `FUSSING REC -${unitVal}`;
                    break;
                case 'handwork_iss_header':
                    header = 'handwork_iss_header';
                    source = 'handwork_iss_source';
                    destination = 'handwork_iss_destination';
                    prUnit = `HANDWORK ISS -${unitVal}`;
                    break;
                case 'handwork_rec_header':
                    header = 'handwork_rec_header';
                    source = 'handwork_rec_source';
                    destination = 'handwork_rec_destination';
                    prUnit = `HANDWORK REC -${unitVal}`;
                    break;
                case 'washing_iss_header':
                    header = 'washing_iss_header';
                    source = 'washing_iss_source';
                    destination = 'washing_iss_destination';
                    prUnit = `WASHING ISS -${unitVal}`;
                    break;
                case 'washing_rec_header':
                    header = 'washing_rec_header';
                    source = 'washing_rec_source';
                    destination = 'washing_rec_destination';
                    prUnit = `WASHING REC-${unitVal}`;
                    break;
                case 'stitching_iss_header':
                    header = 'stitching_iss_header';
                    source = 'stitching_iss_source';
                    destination = 'stitching_iss_destination';
                    prUnit = `STITCHING ISS -${unitVal}`;
                    break;
                case 'stitching_rec_header':
                    header = 'stitching_rec_header';
                    source = 'stitching_rec_source';
                    destination = 'stitching_rec_destination';
                    prUnit = `STITCHING REC -${unitVal}`;
                    break;
                case 'Refinishing_iss_header':
                    header = 'Refinishing_iss_header';
                    source = 'Refinishing_iss_source';
                    destination = 'Refinishing_iss_destination';
                    prUnit = `REFINISHING ISS -${unitVal}`;
                    break;
                case 'Refinishing_rec_header':
                    header = 'Refinishing_rec_header';
                    source = 'Refinishing_rec_source';
                    destination = 'Refinishing_rec_destination';
                    prUnit = `REFINISHING REC-${unitVal}`;
                    break;
                case 'printing_iss_header':
                    header = 'printing_iss_header';
                    source = 'printing_iss_source';
                    destination = 'printing_iss_destination';
                    prUnit = `PRINTING ISS-${unitVal}`;
                    break;
                case 'printing_rec_header':
                    header = 'printing_rec_header';
                    source = 'printing_rec_source';
                    destination = 'printing_rec_destination';
                    prUnit = `PRINTING REC-${unitVal}`;
                    break;
                case 'pleating_iss_header':
                    header = 'pleating_iss_header';
                    source = 'pleating_iss_source';
                    destination = 'pleating_iss_destination';
                    prUnit = `PLEATING ISS -${unitVal}`;
                    break;
                case 'pleating_rec_header':
                    header = 'pleating_rec_header';
                    source = 'pleating_rec_source';
                    destination = 'pleating_rec_destination';
                    prUnit = `PLEATING REC -${unitVal}`;
                    break;
                case 'smoking_iss_header':
                    header = 'smoking_iss_header';
                    source = 'smoking_iss_source';
                    destination = 'smoking_iss_destination';
                    prUnit = `SMOKING ISS-${unitVal}`;
                    break;
                case 'smoking_rec_header':
                    header = 'smoking_rec_header';
                    source = 'smoking_rec_source';
                    destination = 'smoking_rec_destination';
                    prUnit = `SMOKING REC-${unitVal}`;
                    break;
                case 'iron_iss_header':
                    header = 'iron_iss_header';
                    source = 'iron_iss_source';
                    destination = 'iron_iss_destination';
                    prUnit = `IRONING ISS-${unitVal}`;
                    break;
                case 'iron_rec_header':
                    header = 'iron_rec_header';
                    source = 'iron_rec_source';
                    destination = 'iron_rec_destination';
                    prUnit = `IRONING REC-${unitVal}`;
                    break;
                case 'fc_header':
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
                    `SELECT * FROM ${header} WHERE vch_date BETWEEN ? AND ? `,
                    [startDateString, endDateString]
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
                    headerRow.tableName = header;
                    sourceRows.forEach(row => row.tableName = source);
                    destinationRows.forEach(row => row.tableName = destination);

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
                    `SELECT * FROM ${header} WHERE vch_date BETWEEN ? AND ? AND unit_no = ?`,
                    [startDateString, endDateString, prUnit]
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
                    headerRow.tableName = header;
                    sourceRows.forEach(row => row.tableName = source);
                    destinationRows.forEach(row => row.tableName = destination);

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