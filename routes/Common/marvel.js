const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise'); // Use the promise wrapper
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

function filterDuplicates(array) {
  const seen = new Set();
  return array.filter(item => {
    const key = `${item.item_name}|${item.design_no}|${item.design_id}|${item.type}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

router.post('/', async (req, res) => {

  const { esVch, wType, prName } = req.body;


  try {
    // Fetch vch_no from the spliting_header table
    const [headerRows] = await pool.query(
      `SELECT vch_no FROM spliting_header WHERE estimated_cs_vch_no = ?`,
      [esVch]
    );

    if (headerRows.length === 0) {
      return res.status(404).send("No matching vch_no found in spliting_header");
    }

    const vch_no = headerRows[0].vch_no;

    // Fetch details from the spliting_destination table
    const [destinationRows] = await pool.query(
      `SELECT sl_no, last_operation, type, item_name, is_iss
       FROM spliting_destination 
       WHERE vch_no = ? AND type IN (${wType.map(() => '?').join(', ')})`,
      [vch_no, ...wType]
    );

    // Array to store results after additional queries
    const resultArray = [];

    // Iterate over each row in destinationRows
    for (const row of destinationRows) {
      const { last_operation, type, is_iss} = row;


      if (last_operation === null) {
       
        const [nullOperationRows] = await pool.query(
          `SELECT DISTINCT *
           FROM spliting_destination
           WHERE vch_no = ? AND type = ? AND is_delete != 1`,
          [vch_no, type]
        );

        resultArray.push(...nullOperationRows);
      }
      else if (last_operation === 'FUS') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM fus_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );


        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in fusing_header for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }


        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_fus = headerRows[i].vch_no;

          if (is_iss !== 1 || last_operation !== prName) {
          // Execute query for 'EMB' last_operation using fetched vch_no and wType
          const [fusRows] = await pool.query(
            `SELECT DISTINCT *
             FROM fus_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_fus, type]
          );

          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = fusRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
        }
      }
      else if (last_operation === 'EMB') {
        // Fetch vch_no from emb_rec_header table where estimate_cs_vch_no includes esVch
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM emb_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in emb_rec_header for estimate_cs_vch_no including ${esVch}`);
          continue; // or handle as needed
        }

        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_emb = headerRows[i].vch_no;

          // Execute query for 'EMB' last_operation using fetched vch_no and type
          if (is_iss !== 1 || last_operation !== prName) {
         
           const [embRows] = await pool.query(
              `SELECT DISTINCT *
               FROM emb_rec_destination
               WHERE vch_no = ? AND type = ?`,
              [vch_no_emb, type]
            );
          

            const [logRows] = await pool.query(
              `SELECT design_no, type, process_name
               FROM log_tb
               WHERE process_name = ? AND is_delete = 0`,
              [prName]
            ); 
    
             // Filter out objects from hndRows that match the log_tb entries
             const filteredHndRows = embRows.filter(row => {
              return !logRows.some(logRow => 
                logRow.design_no === row.design_no &&
                logRow.type === row.type &&
                logRow.process_name === prName
              );
            });
    
            resultArray.push(...filteredHndRows);
          }
        }
      }
      else if (last_operation === 'HND') {

        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM handwork_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in handwork for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }
        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_hnd = headerRows[i].vch_no;

      
        if (is_iss !== 1 || last_operation !== prName) {
        // Execute query for 'EMB' last_operation using fetched vch_no and wType
        const [hndRows] = await pool.query(
          `SELECT DISTINCT *
           FROM handwork_rec_source
           WHERE vch_no = ? AND type = ?`,
          [vch_no_hnd, type]
        );

        const [logRows] = await pool.query(
          `SELECT design_no, type, process_name
           FROM log_tb
           WHERE process_name = ? AND is_delete = 0`,
          [prName]
        ); 

         // Filter out objects from hndRows that match the log_tb entries
         const filteredHndRows = hndRows.filter(row => {
          return !logRows.some(logRow => 
            logRow.design_no === row.design_no &&
            logRow.type === row.type &&
            logRow.process_name === prName
          );
        });

        resultArray.push(...filteredHndRows);     
        }
      }
      }
      else if (last_operation === 'SMOKING') {
        // Fetch vch_no from fusing_rec_header table
       
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM smoking_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );
       
        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in handwork for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }

        // const vch_no_smk = headerRows[0].vch_no;
        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_smk = headerRows[i].vch_no;

       
          const [smkRows] = await pool.query(
            `SELECT DISTINCT *
             FROM smoking_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_smk, type]
          );
         
          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = smkRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);     
          }
        
        

        // Execute query for 'EMB' last_operation using fetched vch_no and wType

      }
      else if (last_operation === 'PLE') { 
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM pleating_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in pleating for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }


        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_ple = headerRows[i].vch_no;

          if (is_iss !== 1 || last_operation !== prName) {
          const [pleRows] = await pool.query(
            `SELECT DISTINCT *
             FROM pleating_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_ple, type]
          );
        
          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = pleRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
      }

      }
      else if (last_operation === 'PRT') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM printing_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in printing for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }

       
        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_prt = headerRows[i].vch_no;


          // Execute query for 'EMB' last_operation using fetched vch_no and wType
          if (is_iss !== 1 || last_operation !== prName) {
          const [priRows] = await pool.query(
            `SELECT DISTINCT *
             FROM printing_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_prt, type]
          );

          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = priRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
        }
      }
      else if (last_operation === 'REFINISH') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM Refinishing_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in handwork for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }

  

        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_ref = headerRows[i].vch_no;


          // Execute query for 'EMB' last_operation using fetched vch_no and wType
          if (is_iss !== 1 || last_operation !== prName) {
          const [refRows] = await pool.query(
            `SELECT DISTINCT *
             FROM Refinishing_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_ref, type]
          );

          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = refRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
        }

      }
      else if (last_operation === 'STICH') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM stitching_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );


        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in stitching for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }

        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_stich = headerRows[i].vch_no;

          if (is_iss !== 1 || last_operation !== prName) {
            const [stichRows] = await pool.query(
              `SELECT DISTINCT *
             FROM stitching_rec_destination
             WHERE vch_no = ? AND type = ?`,
              [vch_no_stich, type]
            );

            const [logRows] = await pool.query(
              `SELECT design_no, type, process_name
               FROM log_tb
               WHERE process_name = ? AND is_delete = 0`,
              [prName]
            ); 
    
             // Filter out objects from hndRows that match the log_tb entries
             const filteredHndRows = stichRows.filter(row => {
              return !logRows.some(logRow => 
                logRow.design_no === row.design_no &&
                logRow.type === row.type &&
                logRow.process_name === prName
              );
            });
    
            resultArray.push(...filteredHndRows);
          }
        }


      }
      else if (last_operation === 'WASH') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM washing_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in handwork for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }



        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_wash = headerRows[i].vch_no;


          // Execute query for 'EMB' last_operation using fetched vch_no and wType
          if (is_iss !== 1 || last_operation !== prName) {
          const [washRows] = await pool.query(
            `SELECT DISTINCT *
             FROM washing_rec_destination
             WHERE vch_no = ? AND type = ?`,
            [vch_no_wash, type]
          );

          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = washRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
        }
      }
      else if (last_operation === 'SFG') {
        // Fetch vch_no from fusing_rec_header table
        const [headerRows] = await pool.query(
          `SELECT vch_no FROM sfg_rec_header WHERE estimate_cs_vch_no LIKE ? AND is_delete != 1`,
          [`%${esVch}%`]
        );

        if (headerRows.length === 0) {
          console.log(`No matching vch_no found in handwork for estimate_cs_vch_no = ${esVch}`);
          continue; // or handle as needed
        }

        

        for (let i = 0; i < headerRows.length; i++) {
          const vch_no_sfg = headerRows[i].vch_no;

          if (is_iss !== 1 || last_operation !== prName) {
          // Execute query for 'EMB' last_operation using fetched vch_no and wType
          const [sfgRows] = await pool.query(
            `SELECT DISTINCT *
             FROM sfg_rec_destination
             WHERE vch_no = ?`,
            [vch_no_sfg]
          );

          const [logRows] = await pool.query(
            `SELECT design_no, type, process_name
             FROM log_tb
             WHERE process_name = ? AND is_delete = 0`,
            [prName]
          ); 
  
           // Filter out objects from hndRows that match the log_tb entries
           const filteredHndRows = sfgRows.filter(row => {
            return !logRows.some(logRow => 
              logRow.design_no === row.design_no &&
              logRow.type === row.type &&
              logRow.process_name === prName
            );
          });
  
          resultArray.push(...filteredHndRows);
        }
        }
      }
    }
    const uniqueResultArray = filterDuplicates(resultArray);
    res.json(uniqueResultArray);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;