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
        const { searchQuery, menuSelectedProcess } = req.body;

        let header;
        let prUnitPrefix;
        let prUnitSuffix = '';

        switch (menuSelectedProcess) {
            case 'Estimated_CS_header':
                header = 'Estimated_CS_header';
                prUnitPrefix = 'UNIT-0';
                break;
            case 'cutting_header':
                header = 'cutting_header';
                prUnitPrefix = 'Cutting(U-';
                prUnitSuffix = ')';
                break;

            case 'spliting_header':
                header = 'spliting_header';
                prUnitPrefix = 'SPLIT-';
                break;
            case 'sfg_header':
                header = 'sfg_header';
                prUnitPrefix = '';
                break;
            case 'emb_iss_header':
                header = 'emb_iss_header';
                prUnitPrefix = 'EMBROIDERY ISS-0';
                break;
            case 'emb_rec_header':
                header = 'emb_rec_header';
                prUnitPrefix = 'EMBROIDERY REC-0';
                break;
            case 'fus_iss_header':
                header = 'fus_iss_header';
                prUnitPrefix = 'FUSSING ISS -';
                break;
            case 'fus_rec_header':
                header = 'fus_rec_header';
                prUnitPrefix = 'FUSSING REC -';
                break;
            case 'handwork_iss_header':
                header = 'handwork_iss_header';
                prUnitPrefix = 'HANDWORK ISS -';
                break;
            case 'handwork_rec_header':
                header = 'handwork_rec_header';
                prUnitPrefix = 'HANDWORK REC -';
                break;
            case 'washing_iss_header':
                header = 'washing_iss_header';
                prUnitPrefix = 'WASHING ISS -';
                break;
            case 'washing_rec_header':
                header = 'washing_rec_header';
                prUnitPrefix = 'WASHING REC-';
                break;
            case 'stitching_iss_header':
                header = 'stitching_iss_header';
                prUnitPrefix = 'STITCHING ISS -';
                break;
            case 'stitching_rec_header':
                header = 'stitching_rec_header';
                prUnitPrefix = 'STITCHING REC -';
                break;
            case 'Refinishing_iss_header':
                header = 'Refinishing_iss_header';
                prUnitPrefix = 'REFINISHING ISS -';
                break;
            case 'Refinishing_rec_header':
                header = 'Refinishing_rec_header';
                prUnitPrefix = 'REFINISHING REC-';
                break;
            case 'printing_iss_header':
                header = 'printing_iss_header';
                prUnitPrefix = 'PRINTING ISS-';
                break;
            case 'printing_rec_header':
                header = 'printing_rec_header';
                prUnitPrefix = 'PRINTING REC-';
                break;
            case 'pleating_iss_header':
                header = 'pleating_iss_header';
                prUnitPrefix = 'PLEATING ISS -';
                break;
            case 'pleating_rec_header':
                header = 'pleating_rec_header';
                prUnitPrefix = 'PLEATING REC -';
                break;
            case 'smoking_iss_header':
                header = 'smoking_iss_header';
                prUnitPrefix = 'SMOKING ISS-';
                break;
            case 'smoking_rec_header':
                header = 'smoking_rec_header';
                prUnitPrefix = 'SMOKING REC-';
                break;
            case 'iron_iss_header':
                header = 'iron_iss_header';
                prUnitPrefix = 'IRONING ISS-';
                break;
            case 'iron_rec_header':
                header = 'iron_rec_header';
                prUnitPrefix = 'IRONING REC-';
                break;

            case 'fc_header':
                header = 'fc_header';
                prUnitPrefix = '';
                break;
            default:
                return res.status(400).json({ error: 'Invalid process specified' });
        }

        // Properly parameterized SQL query
        const query = `SELECT * FROM ${header} WHERE design_no LIKE ?`;
        const [results] = await pool.query(query, [`%${searchQuery}%`]);

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;