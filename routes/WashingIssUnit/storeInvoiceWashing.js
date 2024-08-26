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
    const { washingIssContextUnitData, authKeyValue } = req.body;
    let embIssNoText = `WI/U${washingIssContextUnitData.embUnitData[0].embUnitVal}/${washingIssContextUnitData.lastEmbNo}/${washingIssContextUnitData.financialYear}`;
    let unitNO = `WASHING ISS -${washingIssContextUnitData.embUnitData[0].embUnitVal}`;
// Filter values starting with 'EC'
const filteredValues = washingIssContextUnitData.esVchNoVal.filter(value => value.startsWith('EC'));

// Convert the filtered values to a string
const filteredString = filteredValues.join(',');
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM washing_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM washing_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM washing_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM washing_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM washing_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM washing_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO washing_iss_header (master_id, alter_id, vch_no, estimate_cs_vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, lot_no, size, unit_no, narration) VALUES (?,?, ?,?, ?,?, ?, ?,?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embIssNoText || "NA",
        (Array.isArray(washingIssContextUnitData.esVchNoVal) ? washingIssContextUnitData.esVchNoVal.join(',') : 'NA'),
        washingIssContextUnitData.originalDate || "NA",
        washingIssContextUnitData.jobberAddress.jobber_id || 'NA',
        washingIssContextUnitData.jobberName || 'NA',
        (Array.isArray(washingIssContextUnitData.designNoVal) ? washingIssContextUnitData.designNoVal.join(',') : 'NA'),
        (Array.isArray(washingIssContextUnitData.designIdVal) ? washingIssContextUnitData.designIdVal.join(',') : 'NA'),
        (Array.isArray(washingIssContextUnitData.lotNoVal) ? washingIssContextUnitData.lotNoVal.join(',') : 'NA'),
        (Array.isArray(washingIssContextUnitData.sizeVals) ? washingIssContextUnitData.sizeVals.join(',') : 'NA'),
        unitNO || 'NA',
        washingIssContextUnitData.embUnitData[0].narration || 'NA',

      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO washing_iss_destination (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?,?, ?, ?, ?,?,?,?)";
      if (
        washingIssContextUnitData.destinationTableData &&
        washingIssContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < washingIssContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embIssNoText || 'NA',
            washingIssContextUnitData.originalDate,
            washingIssContextUnitData.destinationTableData[i].itemName || 'NA',
            washingIssContextUnitData.destinationTableData[i].designNo || 'NA',
            washingIssContextUnitData.destinationTableData[i].designId || 'NA',
            washingIssContextUnitData.destinationTableData[i].godown || 'NA',
            washingIssContextUnitData.destinationTableData[i].size || 'NA',
            washingIssContextUnitData.destinationTableData[i].lotNo || 'NA',
            washingIssContextUnitData.destinationTableData[i].qty || 0,
            washingIssContextUnitData.destinationTableData[i].rate || 0,
            washingIssContextUnitData.destinationTableData[i].rate * washingIssContextUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO washing_iss_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          washingIssContextUnitData.sourceTableData &&
          washingIssContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < washingIssContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embIssNoText || 'NA',
              washingIssContextUnitData.originalDate,
              washingIssContextUnitData.sourceTableData[i].itemName || 'NA',
              washingIssContextUnitData.sourceTableData[i].designNo|| 'NA',
              washingIssContextUnitData.sourceTableData[i].designId || 'NA',
              washingIssContextUnitData.sourceTableData[i].godown || 'NA',
              washingIssContextUnitData.sourceTableData[i].type || 'NA',
              washingIssContextUnitData.sourceTableData[i].size || 'NA',
              washingIssContextUnitData.sourceTableData[i].lotNo || 'NA',
              washingIssContextUnitData.sourceTableData[i].qty || 0,
              washingIssContextUnitData.sourceTableData[i].rate || 0,
              washingIssContextUnitData.sourceTableData[i].rate * washingIssContextUnitData.sourceTableData[i].qty || 0,
              washingIssContextUnitData.sourceTableData[i].jwRate || 0,
              washingIssContextUnitData.sourceTableData[i].qty * washingIssContextUnitData.sourceTableData[i].jwRate || 0

  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        washingIssContextUnitData.sourceTableData &&
        washingIssContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < washingIssContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            washingIssContextUnitData.originalDate,
            washingIssContextUnitData.sourceTableData[i].itemName || 'NA',
            washingIssContextUnitData.sourceTableData[i].designNo || 'NA',
            washingIssContextUnitData.sourceTableData[i].designId || 'NA',
            "WASH",
            washingIssContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }



const updateSplitngHeaderQuery = `
UPDATE spliting_destination 
SET last_operation = 'WASH' , is_iss = 1
WHERE design_no = ? AND type = ?
`;

if (washingIssContextUnitData.sourceTableData && washingIssContextUnitData.sourceTableData.length) {
  for (let i = 0; i < washingIssContextUnitData.sourceTableData.length; i++) {
    const { designNo, type } = washingIssContextUnitData.sourceTableData[i];
    
    console.log('Processing designNo:', designNo, 'type:', type);
    
    for (let j = 0; j < washingIssContextUnitData.splitingVchNo.length; j++) {
      const designNoVal = washingIssContextUnitData.designNoVal[i];
      
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
