const express = require("express");
const router = express.Router();
const mysql = require("mysql2/promise");
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

router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { process, updateVchNo, tableData } = req.body;
   
    let header = '';
    let source = '';
    let destination = '';
    let vchPref = '';
    let unitPref = '';

    let designNo = '';
    let updateVchNoVal = updateVchNo;
    
    if(process === 'IRNREC'){
      designNo = tableData.embRecUnitData[0].designNo;
    } else 
    {
    designNo = tableData.designNoVal.join(',');
    }
    

    switch (process) {
      case 'EMBREC':
        header = 'emb_rec_header';
        source = 'emb_rec_source';
        destination = 'emb_rec_destination';
        vchPref = 'ER';
        unitPref = 'EMBROIDERY REC-0'
        break;

      case 'FUSREC':
        header = 'fus_rec_header';
        source = 'fus_rec_source';
        destination = 'fus_rec_destination';
        vchPref = 'FR';
        unitPref = 'FUSING REC -'
        break;

      case 'HNDREC':
        header = 'handwork_rec_header';
        source = 'handwork_rec_destination';
        destination = 'handwork_rec_source';
        vchPref = 'HR';
        unitPref = 'HANDWORK REC -'
        break;

      case 'WASREC':
        header = 'washing_rec_header';
        source = 'washing_rec_source';
        destination = 'washing_rec_destination';
        vchPref = 'WR';
        unitPref = 'WASHING REC-'
        break;

      case 'STIREC':
        header = 'stitching_rec_header';
        source = 'stitching_rec_source';
        destination = 'stitching_rec_destination';
        vchPref = 'SR';
        unitPref = 'STITCHING REC -'
        break;

      case 'RFGREC':
        header = 'Refinishing_rec_header';
        source = 'Refinishing_rec_source';
        destination = 'Refinishing_rec_destination';
        vchPref = 'RE/R';
        unitPref = 'REFINISHING REC-'
        break;

      case 'PRTREC':
        header = 'printing_rec_header';
        source = 'printing_rec_source';
        destination = 'printing_rec_destination';
        vchPref = 'PR/R';
        unitPref = 'PRINTING REC-'
        break;

      case 'PLEREC':
        header = 'pleating_rec_header';
        source = 'pleating_rec_source';
        destination = 'pleating_rec_destination';
        vchPref = 'PL/R';
        unitPref = 'PLEATING REC -'
        break;

      case 'SMOREC':
        header = 'smoking_rec_header';
        source = 'smoking_rec_source';
        destination = 'smoking_rec_destination';
        vchPref = 'SM/R';
        unitPref = 'SMOKING REC-'
        break;

      case 'IRNREC':
        header = 'iron_rec_header';
        source = 'iron_rec_source';
        destination = 'iron_rec_destination';
        vchPref = 'I/R';
        unitPref = 'IRONING REC-'
        break;
    }

    let embRecNoText = `${vchPref}/U${tableData.embRecUnitData[0].embRecUnitVal}/${tableData.lastEmbRecNo}/${tableData.financialYear}`;
    // Step 1: Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      `SELECT vch_no, master_id FROM ${header} WHERE vch_no = ?`,
      [updateVchNoVal]
    );
    if (headerRows.length === 0) {
      res.status(404).send('Design number not found');
      return;
    }
    const { vch_no, master_id } = headerRows[0];

    // Step 2: Delete rows from source and destination tables
    await connection.query(`DELETE FROM ${source} WHERE vch_no = ?`, [updateVchNoVal]);
    await connection.query(`DELETE FROM ${destination} WHERE vch_no = ?`, [updateVchNoVal]);

    // Step 3: Update header table
    const sqlUpdate = `
      UPDATE ${header}
      SET vch_no = ? , vch_date = ?, unit_no = ?, narration = ?
      WHERE vch_no = ?
    `;

    const unitNoVal = `${unitPref}${tableData.embRecUnitData[0].embRecUnitVal || 1}`;
    const updateValues = [
      embRecNoText || 'NA',
      tableData.originalDate || "NA",
      unitNoVal || 'NA',
      tableData.embRecUnitData[0].narration || 'NA',
      updateVchNoVal,
    ];
    await connection.query(sqlUpdate, updateValues);


    // Start transaction
    await connection.beginTransaction();

    try {
      // Fetch the last master_id and alter_id values
      const [lastMasterIdResult] = await connection.query(`SELECT MAX(master_id) AS master_id FROM ${header}`);
      const lastMasterId = lastMasterIdResult[0].master_id || 0;

      const [lastAlterIdSourceResult] = await connection.query(`SELECT MAX(alter_id) AS alter_id FROM ${source}`);
      const lastAlterIdSource = lastAlterIdSourceResult[0].alter_id || 0;

      const [lastAlterIdDestinationResult] = await connection.query(`SELECT MAX(alter_id) AS alter_id FROM ${destination}`);
      const lastAlterIdDestination = lastAlterIdDestinationResult[0].alter_id || 0;

      // Insert destination data
      const insertDestinationQuery = `
        INSERT INTO ${source} (master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, size, lot_no, quantity, rate, amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      if (tableData.destinationTableData && tableData.destinationTableData.length) {
        for (let i = 0; i < tableData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            master_id + 1 || 0,
            lastAlterIdDestination + 1 + i || 0,
            embRecNoText || 'NA',
            tableData.originalDate,
            tableData.destinationTableData[i].itemName || 'NA',
            tableData.destinationTableData[i].designNo || 'NA',
            tableData.destinationTableData[i].designId || 'NA',
            tableData.destinationTableData[i].godown || 'NA',
            tableData.destinationTableData[i].size || 'NA',
            tableData.destinationTableData[i].lotNo || 'NA',
            tableData.destinationTableData[i].qty || 0,
            tableData.destinationTableData[i].rate || 0,
            tableData.destinationTableData[i].rate * tableData.destinationTableData[i].qty || 0,
          ]);
        }
      } else {
        console.error("Destination data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery = `
        INSERT INTO ${destination}(master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, type, size, lot_no, quantity, rate, amt, jw_rate, jw_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      if (tableData.sourceTableData && tableData.sourceTableData.length) {
        for (let i = 0; i < tableData.sourceTableData.length; i++) {
          await connection.query(insertSourceQuery, [
            master_id || 'NA',
            lastAlterIdSource + 1 + i || 0,
            embRecNoText || 'NA',
            tableData.originalDate,
            tableData.sourceTableData[i].itemName || 'NA',
            tableData.sourceTableData[i].designNo || 'NA',
            tableData.sourceTableData[i].designId || 'NA',
            tableData.sourceTableData[i].godown || 'NA',
            tableData.sourceTableData[i].type || 'NA',
            tableData.sourceTableData[i].size || 'NA',
            tableData.sourceTableData[i].lotNo || 'NA',
            tableData.sourceTableData[i].qty || 0,
            tableData.sourceTableData[i].rate || 0,
            tableData.sourceTableData[i].rate * tableData.sourceTableData[i].qty || 0,
            tableData.sourceTableData[i].jwRate || 0,
            tableData.sourceTableData[i].qty * tableData.sourceTableData[i].jwRate || 0,
          ]);
        }
      } else {
        console.error("Source data is undefined or has an invalid length");
      }

      // Commit transaction
      await connection.commit();

      res.status(200).send("Data stored successfully");
    } catch (error) {
      // Rollback transaction in case of error
      await connection.rollback();
      throw error;
    } finally {
      // Release connection
      connection.release();
    }
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


module.exports = router;
