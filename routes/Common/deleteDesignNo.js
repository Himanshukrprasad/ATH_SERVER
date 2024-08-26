const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");
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

router.post("/", async (req, res) => {
    let { processName, designNo } = req.body;

    let header;
    let tables;
    let operation;
    let recTable;
    let isRec =  true
    

    switch (processName) {
        case 'ESTIMATED':
            header = 'Estimated_CS_header';
            tables = ['Estimated_CS_Item_Detail', 'Estimated_CS_JW_Detail'];
            operation = 'NA';
            isRec = false;
           
            break;

        case 'CUTTING':
            header = 'cutting_header';
            tables = ['cutting_component', 'cutting_item_detail'];
            operation = 'NA';
            isRec = false;
            break;

        case 'SPLITING':
            header = 'spliting_header';
            tables = ['spliting_source', 'spliting_destination'];
            operation = 'SPLIT';
            isRec = false;
            break;

        case 'EMBROIDERY ISSUE':
            header = ['emb_iss_header', 'emb_rec_header'];
            tables = ['emb_iss_source', 'emb_iss_destination','emb_rec_source', 'emb_rec_destination'];
            operation = 'EMB';
            recTable = 'emb_iss_source'
            break;

        case 'FUSING ISSUE':
            header = ['fus_iss_header','fus_rec_header'];
            tables = ['fus_iss_source', 'fus_iss_destination','fus_rec_source', 'fus_rec_destination'];
            operation = 'FUS';
            recTable = 'fus_iss_source'
            break;

        case 'HANDWORK ISSUE':
            header = ['handwork_iss_header', 'handwork_rec_header'];
            tables = ['handwork_iss_source', 'handwork_iss_destination', 'handwork_rec_destination','handwork_rec_source'];
            operation = 'HND';
            recTable = 'handwork_iss_source'
            break;

        case 'WASHING ISSUE':
            header = ['washing_iss_header', 'washing_rec_header'];
            tables = ['washing_iss_source', 'washing_iss_destination','washing_rec_source', 'washing_rec_destination'];
            operation = 'WASH';
             recTable = 'washing_iss_source'
            break;

        case 'STITCHING ISSUE':
            header = ['stitching_iss_header', 'stitching_rec_header'];
            tables = ['stitching_iss_source', 'stitching_iss_destination','stitching_rec_source', 'stitching_rec_destination'];
            operation = 'STICH';
            recTable = 'stitching_iss_source'
            break;

        case 'REFINISHING ISSUE':
            header = ['Refinishing_iss_header', 'Refinishing_rec_header'];
            tables = ['Refinishing_iss_source', 'Refinishing_iss_destination','Refinishing_rec_source', 'Refinishing_rec_destination'];
            operation = 'REFINISH';
            recTable = 'Refinishing_iss_source'
            break;

        case 'PRINTING ISSUE':
            header = ['printing_iss_header','printing_rec_header'];
            tables = ['printing_iss_source', 'printing_iss_destination','printing_rec_source', 'printing_rec_destination'];
            operation = 'PRT';
            recTable = 'printing_iss_source'
            break;

        case 'PLEATING ISSUE':
            header = ['pleating_iss_header' , 'pleating_rec_header'];
            tables = ['pleating_iss_source', 'pleating_iss_destination','pleating_rec_source', 'pleating_rec_destination'];
            operation = 'PLE';
            recTable = 'pleating_iss_source'
            break;

        case 'SMOKING ISSUE':
            header = ['smoking_iss_header', 'smoking_rec_header'];
            tables = ['smoking_iss_source', 'smoking_iss_destination','smoking_rec_source', 'smoking_rec_destination'];
            operation = 'SMOKE';
            recTable = 'smoking_iss_source'
            break;

        case 'IRON ISSUE':
            header = ['iron_iss_header', 'iron_rec_header'];
            tables = ['iron_iss_source', 'iron_iss_destination','iron_rec_source', 'iron_rec_destination'];
            operation = 'IRON';
            recTable = 'iron_iss_source'
            break;

        case 'EMBROIDERY RECEIVE':
            header = 'emb_rec_header';
            tables = ['emb_rec_source', 'emb_rec_destination'];
            operation = 'EMB';
            recTable = 'emb_iss_source'
            break;

        case 'FUSING RECEIVE':
            header = 'fus_rec_header';
            tables = ['fus_rec_source', 'fus_rec_destination'];
            operation = 'FUS';
             recTable = 'fus_iss_source'
            break;

        case 'HANDWORK RECEIVE':
            header = 'handwork_rec_header';
            tables = [ 'handwork_rec_destination','handwork_rec_source'];
            operation = 'HND';
             recTable = 'handwork_iss_source'
            break;

        case 'WASHING RECEIVE':
            header = 'washing_rec_header';
            tables = ['washing_rec_source', 'washing_rec_destination'];
            operation = 'WASH';
             recTable = 'washing_iss_source'
            break;

        case 'STITCHING RECEIVE':
            header = 'stitching_rec_header';
            tables = ['stitching_rec_source', 'stitching_rec_destination'];
            operation = 'STICH';
             recTable = 'stitching_iss_source'
            break;

        case 'REFINISHING RECEIVE':
            header = 'Refinishing_rec_header';
            tables = ['Refinishing_rec_source', 'Refinishing_rec_destination'];
            operation = 'REFINISH';
             recTable = 'Refinishing_iss_source'
            break;

        case 'PRINTING RECEIVE':
            header = 'printing_rec_header';
            tables = ['printing_rec_source', 'printing_rec_destination'];
            operation = 'PRT';
             recTable = 'printing_iss_source'
            break;

        case 'PLEATING RECEIVE':
            header = 'pleating_rec_header';
            tables = ['pleating_rec_source', 'pleating_rec_destination'];
            operation = 'PLE';
             recTable = 'pleating_iss_source'
            break;

        case 'SMOKING RECEIVE':
            header = 'smoking_rec_header';
            tables = ['smoking_rec_source', 'smoking_rec_destination'];
            operation = 'SMOKE';
              recTable = 'smoking_iss_source'
            break;

        case 'IRON RECEIVE':
            header = 'iron_rec_header';
            tables = ['iron_rec_source', 'iron_rec_destination'];
            operation = 'IRON';
            recTable = 'iron_iss_source'
            break;

        case 'SEMI FINISHED GOODS':
                header = 'sfg_header';
                tables = ['sfg_source', 'sfg_destination'];
                operation = 'SFG';
                recTable = 'NA'
                isRec = false;
                break;
       
    }
// Create a new array to store the updated results
let updatedDataArray = [];
    const updateSplitingDestination = async (dataArray) => {
        try {
            for (let i = 0; i < dataArray.length; i++) {
                const { design_no, item_name, type, pName } = dataArray[i];
                await pool.query(`
                    UPDATE spliting_destination 
                    SET last_operation = ? 
                    WHERE design_no = ? AND item_name = ? AND type = ?
                `, [pName, design_no, item_name, type]);
            }
            console.log('spliting_destination table updated successfully');
        } catch (error) {
            console.error('Error updating spliting_destination table:', error);
        }
    };

    try {
       
        let vchNos = [];
        let designNoArray = designNo.split(',');


        // Handle multiple headers if present
        if (Array.isArray(header)) {
            for (const h of header) {
                const [headerResult] = await pool.query(`SELECT vch_no FROM ${h} WHERE design_no = ?`, [designNo]);
                if (headerResult.length > 0) {
                    vchNos.push(...headerResult.map(row => row.vch_no));
                }
            }
        } else {
            const [headerResult] = await pool.query(`SELECT vch_no FROM ${header} WHERE design_no = ?`, [designNo]);
            if (headerResult.length > 0) {
                vchNos.push(...headerResult.map(row => row.vch_no));
            }
        }
    
        if (vchNos.length === 0) {
            return res.status(404).json({ message: 'No records found' });
        }
    
        // Update is_delete to 1 for all headers
        if (Array.isArray(header)) {
            for (const h of header) {
                await pool.query(`UPDATE ${h} SET is_delete = 1 WHERE vch_no IN (?)`, [vchNos]);
            }
        } else {
            await pool.query(`UPDATE ${header} SET is_delete = 1 WHERE vch_no IN (?)`, [vchNos]);
        }
    
        // Update is_delete to 1 for all tables
        for (const table of tables) {
            await pool.query(`UPDATE ${table} SET is_delete = 1 WHERE vch_no IN (?)`, [vchNos]);
          
        }
    
    
        await pool.query(`UPDATE spliting_destination SET is_iss = 0 WHERE design_no IN (?) AND last_operation = ?`, [designNoArray, operation]);

       if(isRec){
       
        await pool.query(`UPDATE ${recTable} SET is_rec = 0 WHERE design_no IN (?)`, [designNoArray]);

        // Step 1: Create dataArray
        let dataArray = designNoArray.map(design_no => ({
            design_no,
            item_name: '',
            type: '',
            pName: ''
        }));

        // Step 2: Fetch item_name and type from recTable
        for (let i = 0; i < dataArray.length; i++) {
            const { design_no } = dataArray[i];
            const [recResults] = await pool.query(`
                SELECT item_name, type 
                FROM ${recTable} 
                WHERE design_no = ?`, [design_no]);
        
            // If there are results, create new entries for each type
            if (recResults.length > 0) {
                recResults.forEach(result => {
                    updatedDataArray.push({
                        design_no,
                        item_name: result.item_name,
                        type: result.type,
                        pName: 'REFINISH' // Add any other static values or logic needed
                    });
                });
            }
        }
        
        // Optionally, update dataArray with the new values
        dataArray = updatedDataArray;

// Step 3: Fetch process_name from log_tb
for (let i = 0; i < dataArray.length; i++) {
    const { design_no, item_name, type } = dataArray[i];
    const [logResult] = await pool.query(`
        SELECT process_name 
        FROM log_tb 
        WHERE design_no = ? 
          AND item_name = ? 
          AND type = ? 
          AND process_name NOT LIKE CONCAT('%', ?, '%') 
          AND process_name NOT LIKE '%REC%' 
          AND process_name != 'SFG'
          AND process_name NOT LIKE '%IRON%'
          AND is_delete = 0
        ORDER BY sl_no DESC
        LIMIT 1
    `, [design_no, item_name, type, operation]);

    if (logResult.length > 0) {
        dataArray[i].pName = logResult[0].process_name;
    } 
    else {
        dataArray[i].pName = null;
    }
}

for (let i = 0; i < dataArray.length; i++) {
    const { item_name, type } = dataArray[i];
    try {
      await pool.query(`
        UPDATE log_tb 
        SET is_delete = 1
        WHERE
          item_name = ? 
          AND type = ?
          AND process_name LIKE ?
      `, [item_name, type, `%${operation}%`]);
    
    } catch (error) {
      console.error(`Error updating log_tb for item_name: ${item_name}, type: ${type}`, error);
    }
  }
  

  
        await updateSplitingDestination(dataArray);
        }
    
        res.status(200).json({ message: 'Records updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
    
});


module.exports = router;
