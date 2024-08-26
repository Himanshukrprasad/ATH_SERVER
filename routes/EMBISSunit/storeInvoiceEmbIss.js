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
    const { embIssUnitData, authKeyValue } = req.body;

    let embIssNoText = `EI/U${embIssUnitData.embUnitData[0].embUnitVal}/${embIssUnitData.lastEmbNo}/${embIssUnitData.financialYear}`;
    // Filter values starting with 'EC'
    const filteredValues = embIssUnitData.esVchNoVal.filter(value => value.startsWith('EC'));
    const unitNoVal = `EMBROIDERY ISS-0${embIssUnitData.embUnitData[0].embUnitVal || 1}`;
    // Convert the filtered values to a string
    const filteredString = filteredValues.join(',');
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM emb_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      //################################################ PART 1 HIMAN

      const getLogLastMasterIdheaderQuery =
        "SELECT master_id FROM log_tb ORDER BY sl_no DESC LIMIT 1";
      const [LoglastMasterIdheaderResult] = await connection.query(
        getLogLastMasterIdheaderQuery
      );
      const LoglastMasterIdheader = LoglastMasterIdheaderResult[0]?.master_id || 0;

      //############################################################



      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM emb_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM emb_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM emb_iss_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM emb_iss_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM emb_iss_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO emb_iss_header (master_id, alter_id, vch_no, estimate_cs_vch_no, vch_date, jobber_id, jobber_name, design_no,design_id, lot_no, size, unit_no, narration) VALUES (?,?, ?,?,?, ?, ?, ?,?, ?, ?, ?, ?)";
      await connection.query(insertHeaderQuery, [
        (lastMasterIdheader + 1) || 0,
        (lastalterIdheader + 1) || 0,
        embIssNoText || "NA",
        (Array.isArray(embIssUnitData.esVchNoVal) ? embIssUnitData.esVchNoVal.join(',') : 'NA'),
        embIssUnitData.originalDate || "NA",
        embIssUnitData.jobberAddress.jobber_id || 'NA',
        embIssUnitData.jobberName || 'NA',
        (Array.isArray(embIssUnitData.designNoVal) ? embIssUnitData.designNoVal.join(',') : 'NA'),
        (Array.isArray(embIssUnitData.designIdVal) ? embIssUnitData.designIdVal.join(',') : 'NA'),
        (Array.isArray(embIssUnitData.lotNoVal) ? embIssUnitData.lotNoVal.join(',') : 'NA'),
        (Array.isArray(embIssUnitData.sizeVals) ? embIssUnitData.sizeVals.join(',') : 'NA'),
        unitNoVal || 'NA',
        embIssUnitData.embUnitData[0].narration || 'NA',
      ]);


      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO emb_iss_destination (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?, ?,?, ?, ?, ?,?,?,?)";
      if (
        embIssUnitData.destinationTableData &&
        embIssUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < embIssUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embIssNoText || 'NA',
            embIssUnitData.originalDate,
            embIssUnitData.destinationTableData[i].itemName || 'NA',
            embIssUnitData.destinationTableData[i].designNo || 'NA',
            embIssUnitData.destinationTableData[i].designId || 'NA',
            embIssUnitData.destinationTableData[i].godown || 'NA',
            embIssUnitData.destinationTableData[i].size || 'NA',
            embIssUnitData.destinationTableData[i].lotNo || 'NA',
            embIssUnitData.destinationTableData[i].qty || 0,
            embIssUnitData.destinationTableData[i].rate || 0,
            embIssUnitData.destinationTableData[i].rate * embIssUnitData.destinationTableData[i].qty || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO emb_iss_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      if (
        embIssUnitData.sourceTableData &&
        embIssUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < embIssUnitData.sourceTableData.length; i++) {
          await connection.query(insertSourceQuery, [
            // lastMasterIdsource + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdSource + 1 + i || 0,
            embIssNoText || 'NA',
            embIssUnitData.originalDate,
            embIssUnitData.sourceTableData[i].itemName || 'NA',
            embIssUnitData.sourceTableData[i].designNo || 'NA',
            embIssUnitData.sourceTableData[i].designId || 'NA',
            embIssUnitData.sourceTableData[i].godown || 'NA',
            embIssUnitData.sourceTableData[i].type || 'NA',
            embIssUnitData.sourceTableData[i].size || 'NA',
            embIssUnitData.sourceTableData[i].lotNo || 'NA',
            embIssUnitData.sourceTableData[i].qty || 0,
            embIssUnitData.sourceTableData[i].rate || 0,
            embIssUnitData.sourceTableData[i].rate * embIssUnitData.sourceTableData[i].qty || 0,
            embIssUnitData.sourceTableData[i].jwRate || 0,
            embIssUnitData.sourceTableData[i].qty * embIssUnitData.sourceTableData[i].jwRate || 0


          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

     // ################################ PART 2 HIMAN
      const insertLog_tb =
        "INSERT INTO log_tb (master_id, issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?,?)";
      if (
        embIssUnitData.sourceTableData &&
        embIssUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < embIssUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            LoglastMasterIdheader + 1 || 0,
            embIssUnitData.originalDate,
            embIssUnitData.sourceTableData[i].itemName || 'NA',
            embIssUnitData.sourceTableData[i].designNo || 'NA',
            embIssUnitData.sourceTableData[i].designId || 'NA',
            "EMB",
            embIssUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }
    // #######################################

      const updateSplitngHeaderQuery = `
        UPDATE spliting_destination 
        SET last_operation = 'EMB', is_iss = 1
        WHERE design_no = ? AND type = ?
        `;


      if (embIssUnitData.sourceTableData && embIssUnitData.sourceTableData.length) {
        for (let i = 0; i < embIssUnitData.sourceTableData.length; i++) {
          const { designNo, type } = embIssUnitData.sourceTableData[i];


          for (let j = 0; j < embIssUnitData.splitingVchNo.length; j++) {

            const designNoVal = embIssUnitData.designNoVal[j];

           

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
      -    connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
