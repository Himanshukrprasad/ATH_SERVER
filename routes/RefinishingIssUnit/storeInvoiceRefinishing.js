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
    const { refinishingIssContextUnitData, authKeyValue } = req.body;
    let embIssNoText = `RE/I/U${refinishingIssContextUnitData.embUnitData[0].embUnitVal}/${refinishingIssContextUnitData.lastEmbNo}/${refinishingIssContextUnitData.financialYear}`;
    let unitNO = `REFINISHING ISS -${refinishingIssContextUnitData.embUnitData[0].embUnitVal}`;
// Filter values starting with 'EC'
const filteredValues = refinishingIssContextUnitData.esVchNoVal.filter(value => value.startsWith('EC'));

// Convert the filtered values to a string
const filteredString = filteredValues.join(',');
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM Refinishing_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM Refinishing_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM Refinishing_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM Refinishing_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM Refinishing_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM Refinishing_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO Refinishing_iss_header (master_id, alter_id, vch_no, estimate_cs_vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, lot_no, size, unit_no, narration) VALUES (?,?, ?,?, ?,?, ?, ?,?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embIssNoText || "NA",
        (Array.isArray(refinishingIssContextUnitData.esVchNoVal) ? refinishingIssContextUnitData.esVchNoVal.join(',') : 'NA'),
          refinishingIssContextUnitData.originalDate || "NA",
          refinishingIssContextUnitData.jobberAddress.jobber_id || 'NA',
          refinishingIssContextUnitData.jobberName || 'NA',
          (Array.isArray(refinishingIssContextUnitData.designNoVal) ? refinishingIssContextUnitData.designNoVal.join(',') : 'NA'),
          (Array.isArray(refinishingIssContextUnitData.designIdVal) ? refinishingIssContextUnitData.designIdVal.join(',') : 'NA'),
          (Array.isArray(refinishingIssContextUnitData.lotNoVal) ? refinishingIssContextUnitData.lotNoVal.join(',') : 'NA'),
          (Array.isArray(refinishingIssContextUnitData.sizeVals) ? refinishingIssContextUnitData.sizeVals.join(',') : 'NA'),
        unitNO || 'NA',
        refinishingIssContextUnitData.embUnitData[0].narration || 'NA',

      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO Refinishing_iss_destination (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?, ?,?, ?, ?,?,?,?)";
      if (
        refinishingIssContextUnitData.destinationTableData &&
        refinishingIssContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < refinishingIssContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embIssNoText || 'NA',
            refinishingIssContextUnitData.originalDate,
            refinishingIssContextUnitData.destinationTableData[i].itemName || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].designNo || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].designId || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].godown || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].size || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].lotNo || 'NA',
            refinishingIssContextUnitData.destinationTableData[i].qty || 0,
            refinishingIssContextUnitData.destinationTableData[i].rate || 0,
            refinishingIssContextUnitData.destinationTableData[i].rate * refinishingIssContextUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO Refinishing_iss_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          refinishingIssContextUnitData.sourceTableData &&
          refinishingIssContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < refinishingIssContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embIssNoText || 'NA',
              refinishingIssContextUnitData.originalDate,
              refinishingIssContextUnitData.sourceTableData[i].itemName || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].designNo|| 'NA',
              refinishingIssContextUnitData.sourceTableData[i].designId || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].godown || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].type || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].size || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].lotNo || 'NA',
              refinishingIssContextUnitData.sourceTableData[i].qty || 0,
              refinishingIssContextUnitData.sourceTableData[i].rate || 0,
              refinishingIssContextUnitData.sourceTableData[i].rate * refinishingIssContextUnitData.sourceTableData[i].qty || 0,
              refinishingIssContextUnitData.sourceTableData[i].jwRate || 0,
              refinishingIssContextUnitData.sourceTableData[i].qty * refinishingIssContextUnitData.sourceTableData[i].jwRate || 0

  
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        refinishingIssContextUnitData.sourceTableData &&
        refinishingIssContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < refinishingIssContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            refinishingIssContextUnitData.originalDate,
            refinishingIssContextUnitData.sourceTableData[i].itemName || 'NA',
            refinishingIssContextUnitData.sourceTableData[i].designNo || 'NA',
            refinishingIssContextUnitData.sourceTableData[i].designId || 'NA',
            "REFINISH",
            refinishingIssContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }



const updateSplitngHeaderQuery = `
UPDATE spliting_destination 
SET last_operation = 'REFINISH' , is_iss = 1
WHERE design_no = ? AND type = ?
`;

if (refinishingIssContextUnitData.sourceTableData && refinishingIssContextUnitData.sourceTableData.length) {
  for (let i = 0; i < refinishingIssContextUnitData.sourceTableData.length; i++) {
    const { designNo, type } = refinishingIssContextUnitData.sourceTableData[i];
    
    console.log('Processing designNo:', designNo, 'type:', type);
    
    for (let j = 0; j < refinishingIssContextUnitData.splitingVchNo.length; j++) {
      const designNoVal = refinishingIssContextUnitData.designNoVal[i];
      
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
