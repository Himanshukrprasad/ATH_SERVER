const express = require('express')
const router = express.Router();
const mysql2 = require('mysql2/promise');
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

const processSets = [
    { header: 'Estimated_CS_header', tables: ['Estimated_CS_Item_Detail', 'Estimated_CS_JW_Detail'], tableName: 'ESTIMATED' },
    { header: 'cutting_header', tables: ['cutting_component', 'cutting_item_detail'], tableName: 'CUTTING' },
    { header: 'spliting_header', tables: ['spliting_source', 'spliting_destination'], tableName: 'SPLITING'},
    { header: 'emb_iss_header', tables: ['emb_iss_source', 'emb_iss_destination'], tableName: 'EMBROIDERY ISSUE' },
    { header: 'fus_iss_header', tables: ['fus_iss_source', 'fus_iss_destination'], tableName: 'FUSING ISSUE' },
    { header: 'handwork_iss_header', tables: ['handwork_iss_source', 'handwork_iss_destination'] ,tableName: 'HANDWORK ISSUE' },
    { header: 'washing_iss_header', tables: ['washing_iss_source', 'washing_iss_destination'], tableName: 'WASHING ISSUE'  },
    { header: 'stitching_iss_header', tables: ['stitching_iss_source', 'stitching_iss_destination'],tableName: 'STITCHING ISSUE'},
    { header: 'Refinishing_iss_header', tables: ['Refinishing_iss_source', 'Refinishing_iss_destination'],tableName: 'REFINISHING ISSUE' },
    { header: 'printing_iss_header', tables: ['printing_iss_source', 'printing_iss_destination'],tableName: 'PRINTING ISSUE' },
    { header: 'pleating_iss_header', tables: ['pleating_iss_source', 'pleating_iss_destination'],tableName: 'PLEATING ISSUE' },
    { header: 'smoking_iss_header', tables: ['smoking_iss_source', 'smoking_iss_destination'],tableName: 'SMOKING ISSUE' },
    { header: 'iron_iss_header', tables: ['iron_iss_source', 'iron_iss_destination'],tableName: 'IRON ISSUE' },
    { header: 'emb_rec_header', tables: ['emb_rec_source', 'emb_rec_destination'] , tableName: 'EMBROIDERY RECEIVE' },
    { header: 'fus_rec_header', tables: ['fus_rec_source', 'fus_rec_destination']  , tableName: 'FUSING RECEIVE' },
    { header: 'handwork_rec_header', tables: ['handwork_rec_source', 'handwork_rec_destination'] , tableName: 'HANDWORK RECEIVE'  },
    { header: 'washing_rec_header', tables: ['washing_rec_source', 'washing_rec_destination'] , tableName: 'WASHING RECEIVE'  },
    { header: 'stitching_rec_header', tables: ['stitching_rec_source', 'stitching_rec_destination']  , tableName: 'STITCHING RECEIVE' },
    { header: 'Refinishing_rec_header', tables: ['Refinishing_rec_source', 'Refinishing_rec_destination'] , tableName: 'REFINISHING RECEIVE'  },
    { header: 'printing_rec_header', tables: ['printing_rec_source', 'printing_rec_destination'] , tableName: 'PRINTING RECEIVE'  },
    { header: 'pleating_rec_header', tables: ['pleating_rec_source', 'pleating_rec_destination'] , tableName: 'PLEATING RECEIVE'  },
    { header: 'smoking_rec_header', tables: ['smoking_rec_source', 'smoking_rec_destination'] , tableName: 'SMOKING RECEIVE'  },
    { header: 'iron_rec_header', tables: ['iron_rec_source', 'iron_rec_destination'] , tableName: 'IRON RECEIVE'  },
    { header: 'sfg_header', tables: ['sfg_source', 'sfg_destination'], tableName: 'SEMI FINISHED GOODS' }
];



router.get("/", async (req, res) => {
   
    try {
        const result = [];

        for (const set of processSets) {
            const { header, tables, tableName } = set;

            // Fetch all rows from the header table
            const [headerRows] = await pool.query(`SELECT * FROM ${header} WHERE is_delete = 0`);

            for (const headerRow of headerRows) {
                const vchNo = headerRow.vch_no;
                headerRow.tableName = tableName; // Add the header table name to the header object

                const groupedData = {
                    vch_no: vchNo,
                    header: headerRow,
                    tables: {}
                };

                // Fetch rows from the associated tables for the current vch_no
                for (const table of tables) {
                    const [tableRows] = await pool.query(`SELECT * FROM ${table} WHERE vch_no = ?`, [vchNo]);
                    groupedData.tables[table] = tableRows;
                }

                result.push(groupedData);
            }
        }
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
});

module.exports = router;
