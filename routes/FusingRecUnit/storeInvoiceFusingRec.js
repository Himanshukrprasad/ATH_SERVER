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
    const { fusingRecContextUnitData, authKeyValue } = req.body;
    let embRecNoText = `FR/U${fusingRecContextUnitData.embRecUnitData[0].embRecUnitVal}/${fusingRecContextUnitData.lastEmbRecNo}/${fusingRecContextUnitData.financialYear}`;
    
    let unitNo = `FUSING REC -${fusingRecContextUnitData.embRecUnitData[0].embRecUnitVal}`;
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM fus_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM fus_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM fus_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM fus_rec_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM fus_rec_destination ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM fus_rec_source ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO fus_rec_header (master_id, alter_id, vch_no, vch_date, jobber_id, jobber_name, design_no, design_id, unit_no, narration, is_designNo_recived,estimate_cs_vch_no) VALUES (?,?, ?,?, ?,?, ?, ?, ?, ?, ?, ?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        embRecNoText || "NA",
        fusingRecContextUnitData.originalDate || "NA",
        fusingRecContextUnitData.jobberAddress.jobber_id || 'NA',
        fusingRecContextUnitData.embRecUnitData[0].jobberName || 'NA',
        (Array.isArray(fusingRecContextUnitData.designNoVal) ? fusingRecContextUnitData.designNoVal.join(',') : 'NA'),
        (Array.isArray(fusingRecContextUnitData.designIdVal) ? fusingRecContextUnitData.designIdVal.join(',') : 'NA'),
        unitNo || 'NA',
        fusingRecContextUnitData.embRecUnitData[0].narration || 'NA',
        fusingRecContextUnitData.embRecUnitData[0].jobWorkStatus || 'NA',
        fusingRecContextUnitData.esVchNoVal || 'NA'
      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO fus_rec_source(master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown, size,lot_no,quantity,rate, amt) VALUES (?,?, ?,?, ?,?, ?, ?, ?, ?,?,?,?)";
      if (
        fusingRecContextUnitData.destinationTableData &&
        fusingRecContextUnitData.destinationTableData.length
      ) {
        for (let i = 0; i < fusingRecContextUnitData.destinationTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            embRecNoText || 'NA',
            fusingRecContextUnitData.originalDate,
            fusingRecContextUnitData.destinationTableData[i].itemName || 'NA',
            fusingRecContextUnitData.destinationTableData[i].designNo || 'NA',
            fusingRecContextUnitData.destinationTableData[i].designId || 'NA',
            fusingRecContextUnitData.destinationTableData[i].godown || 'NA',
            fusingRecContextUnitData.destinationTableData[i].size || 'NA',
            fusingRecContextUnitData.destinationTableData[i].lotNo || 'NA',
            fusingRecContextUnitData.destinationTableData[i].qty || 0,
            fusingRecContextUnitData.destinationTableData[i].rate || 0,
            fusingRecContextUnitData.destinationTableData[i].rate * fusingRecContextUnitData.destinationTableData[i].qty || 0,
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
        "INSERT INTO fus_rec_destination  (master_id, alter_id, vch_no, vch_date, item_name, design_no,design_id, godown,type, size,lot_no,quantity,rate, amt,jw_rate, jw_amt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        if (
          fusingRecContextUnitData.sourceTableData &&
          fusingRecContextUnitData.sourceTableData.length
        ) {
          for (let i = 0; i < fusingRecContextUnitData.sourceTableData.length; i++) {
            await connection.query(insertSourceQuery, [
              // lastMasterIdsource + 1 + i || 0,
              lastMasterIdheader + 1 || 0,
              lastalterIdSource + 1 + i || 0,
              embRecNoText || 'NA',
              fusingRecContextUnitData.originalDate,
              fusingRecContextUnitData.sourceTableData[i].itemName || 'NA',
              fusingRecContextUnitData.sourceTableData[i].designNo || 'NA',
              fusingRecContextUnitData.sourceTableData[i].designId || 'NA',
              fusingRecContextUnitData.sourceTableData[i].godown || 'NA',
              fusingRecContextUnitData.sourceTableData[i].type || 'NA',
              fusingRecContextUnitData.sourceTableData[i].size || 'NA',
              fusingRecContextUnitData.sourceTableData[i].lotNo || 'NA',
              fusingRecContextUnitData.sourceTableData[i].qty || 0,
              fusingRecContextUnitData.sourceTableData[i].rate + fusingRecContextUnitData.sourceTableData[i].jwRate || 0,
              (fusingRecContextUnitData.sourceTableData[i].rate + fusingRecContextUnitData.sourceTableData[i].jwRate) * fusingRecContextUnitData.sourceTableData[i].qty || 0,
              fusingRecContextUnitData.sourceTableData[i].jwRate || 0,
              fusingRecContextUnitData.sourceTableData[i].jwRate * fusingRecContextUnitData.sourceTableData[i].qty || 0
            ]);
          }
        } else {
          console.error("Data is undefined or has an invalid length");
        }

        const insertLog_tb =
        "INSERT INTO log_tb (issue_date_time, item_name, design_no, design_id, process_name, type, user_id, user_name) VALUES (?,?,?,?,?,?,?,?)";
      if (
        fusingRecContextUnitData.sourceTableData &&
        fusingRecContextUnitData.sourceTableData.length
      ) {
        for (let i = 0; i < fusingRecContextUnitData.sourceTableData.length; i++) {
          await connection.query(insertLog_tb, [
            
            fusingRecContextUnitData.originalDate,
            fusingRecContextUnitData.sourceTableData[i].itemName || 'NA',
            fusingRecContextUnitData.sourceTableData[i].designNo || 'NA',
            fusingRecContextUnitData.sourceTableData[i].designId || 'NA',
            "FUS REC",
            fusingRecContextUnitData.sourceTableData[i].type || 'NA',
            authKeyValue.user_id || 'NA',
            authKeyValue.username || 'NA',
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }


        const updateSplitngHeaderQuery = `
        UPDATE fus_iss_source 
        SET is_rec = 1
        WHERE design_no = ? AND type = ?
        `;


      if (fusingRecContextUnitData.sourceTableData && fusingRecContextUnitData.sourceTableData.length) {
        for (let i = 0; i < fusingRecContextUnitData.sourceTableData.length; i++) {
          const { designNo, type } = fusingRecContextUnitData.sourceTableData[i];

          console.log('Processing designNo:', designNo, 'type:', type);

          for (let j = 0; j < fusingRecContextUnitData.sourceTableData.length; j++) {

            const designNoVal = fusingRecContextUnitData.sourceTableData[j].designNo;

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
