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
    let updateVchNoVal = updateVchNo;
    let vchNoFormatChange = false;
    let isIron = false;
    let  embIssNoText ;
      let  vchNoFormat = '';
    const designNo = tableData.designNoVal.join(',');

    switch (process) {
      case 'EMBISS':
        header = 'emb_iss_header';
        source = 'emb_iss_source';
        destination = 'emb_iss_destination';
        vchPref = 'EI';
        unitPref = 'EMBROIDERY ISS-0'
        break;

      case 'FUSISS':
        header = 'fus_iss_header';
        source = 'fus_iss_source';
        destination = 'fus_iss_destination';
        vchPref = 'FI';
        vchNoFormatChange = true;
        vchNoFormat = 'lastFSNNo'
        unitPref = 'FUSING ISS -'
        break;

      case 'HNDISS':
        header = 'handwork_iss_header';
        source = 'handwork_iss_source';
        destination = 'handwork_iss_destination';
        vchPref = 'HI';
        unitPref = 'HANDWORK ISS -'
        break;

      case 'WASISS':
        header = 'washing_iss_header';
        source = 'washing_iss_source';
        destination = 'washing_iss_destination';
        vchPref = 'WI';
        unitPref = 'WASHING ISS -'
        break;

      case 'STIISS':
        header = 'stitching_iss_header';
        source = 'stitching_iss_source';
        destination = 'stitching_iss_destination';
         vchPref =  'SI'
        unitPref = 'STITCHING ISS -'
        break;

      case 'RFGISS':
        header = 'Refinishing_iss_header';
        source = 'Refinishing_iss_source';
        destination = 'Refinishing_iss_destination';
        vchPref =  'RE/I'
        unitPref = 'REFINISHING ISS -'
        break;

      case 'PRTISS':
        header = 'printing_iss_header';
        source = 'printing_iss_source';
        destination = 'printing_iss_destination';
         vchPref =  'PR/I'
        unitPref = 'PRINTING ISS-'
        break;

      case 'PLEISS':
        header = 'pleating_iss_header';
        source = 'pleating_iss_source';
         vchPref =  'PL/I'
        destination = 'pleating_iss_destination';
        unitPref = 'PLEATING ISS -'
        break;

      case 'SMOISS':
        header = 'smoking_iss_header';
        source = 'smoking_iss_source';
        destination = 'smoking_iss_destination';
         vchPref =  'SM/I'
        unitPref = 'SMOKING ISS-'
        break;

      case 'IRNISS':
        header = 'iron_iss_header';
        source = 'iron_iss_source';
        destination = 'iron_iss_destination';
        isIron = true;
        vchPref = 'I/I';
        unitPref = 'IRONING ISS-'
        break;
    }
    if(vchNoFormatChange){
     embIssNoText = `${vchPref}/U${tableData.embUnitData[0].embUnitVal}/${tableData.lastFSNNo}/${tableData.financialYear}`;
    }
    else {
     embIssNoText = `${vchPref}/U${tableData.embUnitData[0].embUnitVal}/${tableData.lastEmbNo}/${tableData.financialYear}`;
    }
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
    await connection.query(`DELETE FROM ${source} WHERE vch_no = ?`, [vch_no]);
    await connection.query(`DELETE FROM ${destination} WHERE vch_no = ?`, [vch_no]);

    // Step 3: Update header table
    const sqlUpdate = `
      UPDATE ${header}
      SET vch_no = ? , vch_date = ?, jobber_id = ?, jobber_name = ?, unit_no = ?, narration = ?
      WHERE vch_no = ?
    `;

    const unitNoVal = `${unitPref}${tableData.embUnitData[0].embUnitVal || 1}`;
   
    const updateValues = [
      embIssNoText || 'NA',
      tableData.originalDate || "NA",
      tableData.jobberAddress.jobber_id || 'NA',
      tableData.jobberName || 'NA',
      unitNoVal || 'NA',
      tableData.embUnitData[0].narration || 'NA',
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
        INSERT INTO ${destination} (master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, size, lot_no, quantity, rate, amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      if (tableData.destinationTableData && tableData.destinationTableData.length) {
        for (let i = 0; i < tableData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            master_id + 1 || 0,
            lastAlterIdDestination + 1 + i || 0,
            embIssNoText  || 'NA',
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

      if(isIron){
      // Insert source data
      const insertSourceQuery = `
        INSERT INTO ${source}(master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, type, size, lot_no, quantity, rate, amt, jw_rate, jw_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      if (tableData.sourceTableData && tableData.sourceTableData.length) {
        for (let i = 0; i < tableData.sourceTableData.length; i++) {
          await connection.query(insertSourceQuery, [
            master_id || 'NA',
            lastAlterIdSource + 1 + i || 0,
            embIssNoText || 'NA',
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
            tableData.sourceTableData[i].jwRate[0].amt || 0,
            tableData.sourceTableData[i].qty * tableData.sourceTableData[i].jwRate[0].amt || 0,
          ]);
        }
      } else {
        console.error("Source data is undefined or has an invalid length");
      }
      }
      else {
      // Insert source data
      const insertSourceQuery = `
        INSERT INTO ${source}(master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown, type, size, lot_no, quantity, rate, amt, jw_rate, jw_amt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      if (tableData.sourceTableData && tableData.sourceTableData.length) {
        for (let i = 0; i < tableData.sourceTableData.length; i++) {
          await connection.query(insertSourceQuery, [
            master_id || 'NA',
            lastAlterIdSource + 1 + i || 0,
            embIssNoText || 'NA',
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
