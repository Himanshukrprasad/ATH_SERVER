const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2');
require('dotenv').config();

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

router.post('/', async (req, res) => {
    const { table, unit } = req.query;


    let header;
    let unitVal;


    switch (table) {
        case 'CUTTING': 
            header = 'cutting_header';
            unitVal = `Cutting(U-${unit})`;
            slVal = 1;
            
            break;
        case 'EMBISS':
            header = 'emb_iss_header';
            unitVal = `EMBROIDERY ISS-0${unit}`;
            slVal = 1;

            break;

        case 'FUSISS':
            header = 'fus_iss_header';
            unitVal = `FUSING ISS -${unit}`;
            slVal = 1;
            break;

        case 'HNDISS':
            header = 'handwork_iss_header';
            unitVal = `HANDWORK ISS -${unit}`;
            slVal = 1;
            break;

        case 'WASISS':
            header = 'washing_iss_header';
            unitVal = `WASHING ISS -${unit}`;
            break;

        case 'STIISS':
            header = 'stitching_iss_header';
            unitVal = `STITCHING ISS -${unit}`;
            slVal = 1;
            break;

        case 'RFGISS':
            header = 'Refinishing_iss_header';
            unitVal = `REFINISHING ISS -${unit}`;
            slVal = 2;
            break;

        case 'PRTISS':
            header = 'printing_iss_header';
            unitVal = `PRINTING ISS-${unit}`;
            slVal = 2;
            break;

        case 'PLEISS':
            header = 'pleating_iss_header';
            unitVal = `PLEATING ISS -${unit}`;
            slVal = 2;
            break;

        case 'SMOISS':
            header = 'smoking_iss_header';
            unitVal = `SMOKING ISS-${unit}`;
            slVal = 2;
            break;

        case 'IRNISS':
            header = 'iron_iss_header';
            unitVal = `IRONING ISS-${unit}`;
            slVal = 2;
            break;

        case 'EMBREC':
            header = 'emb_rec_header';
            unitVal = `EMBROIDERY REC-0${unit}`;
            slVal = 1;
            break;

        case 'FUSREC':
            header = 'fus_rec_header';
            unitVal = `FUSING REC -${unit}`;
            slVal = 1;
            break;

        case 'HNDREC':
            header = 'handwork_rec_header';
            unitVal = `HANDWORK REC -${unit}`;
            slVal = 1;
            break;

        case 'WASREC':
            header = 'washing_rec_header';
            unitVal = `WASHING REC-${unit}`;
            slVal = 1;
            break;

        case 'STIREC':
            header = 'stitching_rec_header';
            unitVal = `STITCHING REC -${unit}`;
            slVal = 1;
            break;

        case 'RFGREC':
            header = 'Refinishing_rec_header';
            unitVal = `REFINISHING REC-${unit}`;
            slVal = 2;
            break;

        case 'PRTREC':
            header = 'printing_rec_header';
            unitVal = `PRINTING REC-${unit}`;
            slVal = 2;
            break;

        case 'PLEREC':
            header = 'pleating_rec_header';
            unitVal = `PLEATING REC -${unit}`;
            slVal = 2;
            break;

        case 'SMOREC':
            header = 'smoking_rec_header';
            unitVal = `SMOKING REC-${unit}`;
            slVal = 2;
            break;

        case 'IRNREC':
            header = 'iron_rec_header';
            unitVal = `IRONING REC-${unit}`;
            slVal = 2;
            break;

            default:
                return res.status(400).json({ error: 'Invalid table specified' });
    }

    const query = `
        SELECT vch_no FROM ${header}
        WHERE unit_no = ?
        ORDER BY sl_no DESC
        LIMIT 1
    `;


    try {
        pool.query(query, [unitVal], (error, results) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }
            if (results.length === 0) {
              
              return res.json('001');

               
            }
            const vchNo = results[0].vch_no;
        
            // Extract the numeric part from vch_no using a regex
            const match = vchNo.match(/\/(\d{3})\//);
      
            if (match) {
                const numPart = match[1];
                const newNumPart = String(parseInt(numPart, 10) + 1).padStart(numPart.length, '0');
              
                res.json(newNumPart);
            } else {
                res.status(500).json({ error: 'Invalid vch_no format' });
             
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
