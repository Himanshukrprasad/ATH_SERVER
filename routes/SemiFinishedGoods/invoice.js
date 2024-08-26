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
    const { semiFinishedGoodsContextUnitData, authKeyValue } = req.body;
    let embIssNoText = `SFG/U${semiFinishedGoodsContextUnitData.embUnitData[0].embUnitVal}/${semiFinishedGoodsContextUnitData.lastEmbNo}/${semiFinishedGoodsContextUnitData.financialYear}`;
    let unitNO = `SEMI FINISHED GOODS -${semiFinishedGoodsContextUnitData.embUnitData[0].embUnitVal}`
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM sfg_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;



      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM sfg_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM sfg_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM sfg_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM sfg_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM sfg_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO sfg_header (master_id, alter_id, vch_no, vch_date, estimate_cs_vch_no, design_no, design_id, lot_no, unit_no, narration) VALUES (?,?,?,?,?,?,?,?,?,?)";

      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embIssNoText || "NA",
        semiFinishedGoodsContextUnitData.originalDate || "NA",
        (Array.isArray(semiFinishedGoodsContextUnitData.esVchNoVal) ? semiFinishedGoodsContextUnitData.esVchNoVal.join(',') : 'NA'),
        (Array.isArray(semiFinishedGoodsContextUnitData.designNoVal) ? semiFinishedGoodsContextUnitData.designNoVal.join(',') : 'NA'),
        (Array.isArray(semiFinishedGoodsContextUnitData.designIdVal) ? semiFinishedGoodsContextUnitData.designIdVal.join(',') : 'NA'),
        (Array.isArray(semiFinishedGoodsContextUnitData.lotNoVal) ? semiFinishedGoodsContextUnitData.lotNoVal.join(',') : 'NA' ),
        semiFinishedGoodsContextUnitData.embUnitData[0].embUnitVal || 'NA',
        semiFinishedGoodsContextUnitData.embUnitData[0].narration || 'NA',

      ]);


      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO sfg_destination (master_id, alter_id, vch_no, vch_date, item_name,  design_id, design_no, godown, size,lot_no,quantity,rate, amt) VALUES (?,?,?, ?,?, ?, ?, ?, ?, ?,?,?,?)";
      if (
        semiFinishedGoodsContextUnitData.destinationTableData2 &&
        semiFinishedGoodsContextUnitData.destinationTableData2.length
      ) {
        for (let i = 0; i < semiFinishedGoodsContextUnitData.destinationTableData2.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embIssNoText || 'NA',
            semiFinishedGoodsContextUnitData.originalDate,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_id || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].design_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].godownName || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].size || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].lot_no || 'NA',
            semiFinishedGoodsContextUnitData.destinationTableData2[i].quantity || 0,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].rate || 0,
            semiFinishedGoodsContextUnitData.destinationTableData2[i].rate * semiFinishedGoodsContextUnitData.destinationTableData2[i].quantity || 0,
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO sfg_source  (master_id, alter_id, vch_no, vch_date, item_name, design_no, design_id, godown,size,lot_no,quantity,rate, amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";
      if (
        semiFinishedGoodsContextUnitData.sourceTableData &&
        semiFinishedGoodsContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < semiFinishedGoodsContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertSourceQuery, [
            // lastMasterIdsource + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdSource + 1 + i || 0,
            embIssNoText || 'NA',
            semiFinishedGoodsContextUnitData.originalDate,
            semiFinishedGoodsContextUnitData.sourceTableData[i].item_name || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].design_no || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].design_id || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].godown || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].size || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].lot_no || 'NA',
            semiFinishedGoodsContextUnitData.sourceTableData[i].quantity || 0,
            semiFinishedGoodsContextUnitData.sourceTableData[i].rate || 0,
            semiFinishedGoodsContextUnitData.sourceTableData[i].rate * semiFinishedGoodsContextUnitData.sourceTableData[i].quantity || 0,

          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      const insertLog_tb =
      "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
    if (
      semiFinishedGoodsContextUnitData.sourceTableData &&
      semiFinishedGoodsContextUnitData.sourceTableData.length
    ) {
      for (let i = 0; i < semiFinishedGoodsContextUnitData.sourceTableData.length; i++) {
        await connection.query(insertLog_tb, [
          
          semiFinishedGoodsContextUnitData.originalDate,
          semiFinishedGoodsContextUnitData.sourceTableData[i].item_name || 'NA',
          semiFinishedGoodsContextUnitData.sourceTableData[i].design_no || 'NA',
          semiFinishedGoodsContextUnitData.sourceTableData[i].design_id || 'NA',
          "SFG",
          semiFinishedGoodsContextUnitData.sourceTableData[i].type || 'NA',
          authKeyValue.user_id || 'NA',
          authKeyValue.username || 'NA',
        ]);
      }
    } else {
      console.error("Data is undefined or has an invalid length");
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
