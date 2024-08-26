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
  try {
    const { smokingIssContextUnitData, authKeyValue } = req.body;
    let embIssNoText = `SM/I/U${smokingIssContextUnitData.embUnitData[0].embUnitVal}/${smokingIssContextUnitData.lastEmbNo}/${smokingIssContextUnitData.financialYear}`;
    let unitNO = `SMOKING ISS-${smokingIssContextUnitData.embUnitData[0].embUnitVal}`;
// Filter values starting with 'EC'
const filteredValues = smokingIssContextUnitData.esVchNoVal.filter(value => value.startsWith('EC'));

// Convert the filtered values to a string
const filteredString = filteredValues.join(',');
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM smoking_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM smoking_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM smoking_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM smoking_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM smoking_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM smoking_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO smoking_iss_header (master_id, alter_id, vch_no, estimate_cs_vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, lot_no, size, unit_no, narration) VALUES (?,?, ?,?,?, ?, ?, ?,?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embIssNoText || "NA",
        (Array.isArray(smokingIssContextUnitData.esVchNoVal) ? smokingIssContextUnitData.esVchNoVal.join(',') : 'NA'),
          smokingIssContextUnitData.originalDate || "NA",
          smokingIssContextUnitData.jobberAddress.jobber_id || 'NA',
          smokingIssContextUnitData.jobberName || 'NA',
          (Array.isArray(smokingIssContextUnitData.designNoVal) ? smokingIssContextUnitData.designNoVal.join(',') : 'NA'),
          (Array.isArray(smokingIssContextUnitData.designIdVal) ? smokingIssContextUnitData.designIdVal.join(',') : 'NA'),
          (Array.isArray(smokingIssContextUnitData.lotNoVal) ? smokingIssContextUnitData.lotNoVal.join(',') : 'NA'),
          (Array.isArray(smokingIssContextUnitData.sizeVals) ? smokingIssContextUnitData.sizeVals.join(',') : 'NA'),
        unitNO || 'NA',
        smokingIssContextUnitData.embUnitData[0].narration || 'NA',

      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO smoking_iss_destination (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?,?, ?, ?, ?,?,?,?)";
      if (
        smokingIssContextUnitData.destinationTableData &&
        smokingIssContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < smokingIssContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embIssNoText || 'NA',
            smokingIssContextUnitData.originalDate,
            smokingIssContextUnitData.destinationTableData[i].itemName || 'NA',
            smokingIssContextUnitData.destinationTableData[i].designNo || 'NA',
            smokingIssContextUnitData.destinationTableData[i].designId || 'NA',
            smokingIssContextUnitData.destinationTableData[i].godown || 'NA',
            smokingIssContextUnitData.destinationTableData[i].size || 'NA',
            smokingIssContextUnitData.destinationTableData[i].lotNo || 'NA',
            smokingIssContextUnitData.destinationTableData[i].qty || 0,
            smokingIssContextUnitData.destinationTableData[i].rate || 0,
            smokingIssContextUnitData.destinationTableData[i].rate * smokingIssContextUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO smoking_iss_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          smokingIssContextUnitData.sourceTableData &&
          smokingIssContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < smokingIssContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embIssNoText || 'NA',
              smokingIssContextUnitData.originalDate,
              smokingIssContextUnitData.sourceTableData[i].itemName || 'NA',
              smokingIssContextUnitData.sourceTableData[i].designNo|| 'NA',
              smokingIssContextUnitData.sourceTableData[i].designId || 'NA',
              smokingIssContextUnitData.sourceTableData[i].godown || 'NA',
              smokingIssContextUnitData.sourceTableData[i].type || 'NA',
              smokingIssContextUnitData.sourceTableData[i].size || 'NA',
              smokingIssContextUnitData.sourceTableData[i].lotNo || 'NA',
              smokingIssContextUnitData.sourceTableData[i].qty || 0,
              smokingIssContextUnitData.sourceTableData[i].rate || 0,
              smokingIssContextUnitData.sourceTableData[i].rate * smokingIssContextUnitData.sourceTableData[i].qty || 0,
              smokingIssContextUnitData.sourceTableData[i].jwRate || 0,
              smokingIssContextUnitData.sourceTableData[i].qty * smokingIssContextUnitData.sourceTableData[i].jwRate || 0

  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        smokingIssContextUnitData.sourceTableData &&
        smokingIssContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < smokingIssContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            smokingIssContextUnitData.originalDate,
            smokingIssContextUnitData.sourceTableData[i].itemName || 'NA',
            smokingIssContextUnitData.sourceTableData[i].designNo || 'NA',
            smokingIssContextUnitData.sourceTableData[i].designId || 'NA',
            "SMOKING",
            smokingIssContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }


const updateSplitngHeaderQuery = `
UPDATE spliting_destination 
SET last_operation = 'SMOKE' , is_iss = 1
WHERE design_no = ? AND type = ?
`;

if (smokingIssContextUnitData.sourceTableData && smokingIssContextUnitData.sourceTableData.length) {
  for (let i = 0; i < smokingIssContextUnitData.sourceTableData.length; i++) {
    const { designNo, type } = smokingIssContextUnitData.sourceTableData[i];
    
    console.log('Processing designNo:', designNo, 'type:', type);
    
    for (let j = 0; j < smokingIssContextUnitData.splitingVchNo.length; j++) {
      const designNoVal = smokingIssContextUnitData.designNoVal[i];
      
      console.log('Updating designNoVal:', designNoVal, 'with type:', type);

      await connection.query(updateSplitngHeaderQuery, [
        designNo,
        type
      ]);
    }
  }
} else {
  console.error("sourceTableData is undefined or has an invalid length");
}


      // Commit transaction
      await connection.commit();

      // Release connection
      connection.release();

      res.status(200).send("Data stored successfully");
    } catch (error) {
      // Rollback transaction in case of error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
