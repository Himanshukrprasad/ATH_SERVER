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
    const { process } = req.body;

    let header;
    let prUnitPrefix;
    let prUnitSuffix = '';

    switch (process) {
      case 'Estimated_CS_header':
      case 'Estimated Cs':
        header = 'Estimated_CS_header';
        prUnitPrefix = 'UNIT-0';
        break;
      case 'cutting_header':
      case 'Cutting':
        header = 'cutting_header';
        prUnitPrefix = 'Cutting(U-';
        prUnitSuffix = ')'
        break;
      case 'spliting_header':
      case 'Spliting':
        header = 'spliting_header';
        prUnitPrefix = 'SPLIT-';
        break;
      case 'sfg_header':
      case 'SEMI FINISH GOODs':
        header = 'sfg_header';
        prUnitPrefix = '';
        break;
      case 'emb_iss_header':
      case 'Embroidery ISS':
        header = 'emb_iss_header';
        prUnitPrefix = 'EMBROIDERY ISS-0';
        break;
      case 'emb_rec_header':
      case 'Embroidery REC':
        header = 'emb_rec_header';
        prUnitPrefix = 'EMBROIDERY REC-0';
        break;
      case 'fus_iss_header':
      case 'Fusing ISS':
        header = 'fus_iss_header';
        prUnitPrefix = 'FUSSING ISS -';
        break;
      case 'fus_rec_header':
      case 'Fusing REC':
        header = 'fus_rec_header';
        prUnitPrefix = 'FUSSING REC -';
        break;
      case 'handwork_iss_header':
      case 'Handwork ISS':
        header = 'handwork_iss_header';
        prUnitPrefix = 'HANDWORK ISS -';
        break;
      case 'handwork_rec_header':
      case 'Handwork REC':
        header = 'handwork_rec_header';
        prUnitPrefix = 'HANDWORK REC -';
        break;
      case 'washing_iss_header':
      case 'Washing ISS':
        header = 'washing_iss_header';
        prUnitPrefix = 'WASHING ISS -';
        break;
      case 'washing_rec_header':
      case 'Washing REC':
        header = 'washing_rec_header';
        prUnitPrefix = 'WASHING REC-';
        break;
      case 'stitching_iss_header':
      case 'Stitching ISS':
        header = 'stitching_iss_header';
        prUnitPrefix = 'STITCHING ISS -';
        break;
      case 'stitching_rec_header':
      case 'Stitching REC':
        header = 'stitching_rec_header';
        prUnitPrefix = 'STITCHING REC -';
        break;
      case 'Refinishing_iss_header':
      case 'Refinishing ISS':
        header = 'Refinishing_iss_header';
        prUnitPrefix = 'REFINISHING ISS -';
        break;
      case 'Refinishing_rec_header':
      case 'Refinishing REC':
        header = 'Refinishing_rec_header';
        prUnitPrefix = 'REFINISHING REC-';
        break;
      case 'printing_iss_header':
      case 'Printing ISS':
        header = 'printing_iss_header';
        prUnitPrefix = 'PRINTING ISS-';
        break;
      case 'printing_rec_header':
      case 'Printing REC':
        header = 'printing_rec_header';
        prUnitPrefix = 'PRINTING REC-';
        break;
      case 'pleating_iss_header':
      case 'Pleating ISS':
        header = 'pleating_iss_header';
        prUnitPrefix = 'PLEATING ISS -';
        break;
      case 'pleating_rec_header':
      case 'Pleating REC':
        header = 'pleating_rec_header';
        prUnitPrefix = 'PLEATING REC -';
        break;
      case 'smoking_iss_header':
      case 'Smoking ISS':
        header = 'smoking_iss_header';
        prUnitPrefix = 'SMOKING ISS-';
        break;
      case 'smoking_rec_header':
      case 'Smoking REC':
        header = 'smoking_rec_header';
        prUnitPrefix = 'SMOKING REC-';
        break;
      case 'iron_iss_header':
      case 'Ironing ISS':
        header = 'iron_iss_header';
        prUnitPrefix = 'IRONING ISS-';
        break;
      case 'iron_rec_header':
      case "Ironing REC":
        header = 'iron_rec_header';
        prUnitPrefix = 'IRONING REC-';
        break;

      case 'fc_header':
      case 'Final Costing':
        header = 'fc_header';
        prUnitPrefix = '';
        break;
      default:
        return res.status(400).json({ error: 'Invalid process specified' });
    }

    let counts = {};
    for (let unit = 1; unit <= 8; unit++) {
      const prUnit = `${prUnitPrefix}${unit}${prUnitSuffix}`;
      const query = `SELECT COUNT(*) as count FROM ${header} WHERE unit_no = ? AND is_delete = 0`;
      const values = [prUnit]; // Use prUnit as the value for unit_no
      console.log('prUnit:', prUnit);
      const [result] = await pool.query(query, values); // Adjust according to your database driver
      counts[`unit${unit}`] = result[0].count; // Adjust depending on your query result structure
    }

    console.log('res', counts)
    res.json(counts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;