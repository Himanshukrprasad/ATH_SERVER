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
    const { finalCostingUnitData } = req.body;
   

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      //Fetch the last master_id value
      const getLastMasterIdheaderQuery =
        "SELECT master_id FROM fc_header ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdheaderResult] = await connection.query(
        getLastMasterIdheaderQuery
      );
      const lastMasterIdheader = lastMasterIdheaderResult[0]?.master_id || 0;

      

      const getLastMasterIddestinationQuery =
        "SELECT master_id FROM fc_fabric_detail ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIddestinationResult] = await connection.query(
        getLastMasterIddestinationQuery
      );
      const lastMasterIddestination =
        lastMasterIddestinationResult[0]?.master_id || 0;

      const getLastMasterIdsourceQuery =
        "SELECT master_id FROM fc_process_detail ORDER BY master_id DESC LIMIT 1";
      const [lastMasterIdsourceResult] = await connection.query(
        getLastMasterIdsourceQuery
      );
      const lastMasterIdsource = lastMasterIdsourceResult[0]?.master_id || 0;


      const getLastalterIdheaderQuery =
        "SELECT alter_id FROM fc_header ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdheaderResult] = await connection.query(
        getLastalterIdheaderQuery
      );
      const lastalterIdheader = lastalterIdheaderResult[0]?.alter_id || 0;


      const getLastalterIdDestinationQuery =
        "SELECT alter_id FROM fc_fabric_detail ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdDestinationResult] = await connection.query(
        getLastalterIdDestinationQuery
      );
      const lastalterIdDestination =
        lastalterIdDestinationResult[0]?.alter_id || 0;

      const getLastalterIdSourceQuery =
        "SELECT alter_id FROM fc_process_detail ORDER BY master_id DESC LIMIT 1";
      const [lastalterIdSourceResult] = await connection.query(
        getLastalterIdSourceQuery
      );
      const lastalterIdSource = lastalterIdSourceResult[0]?.alter_id || 0;

      // Insert header data
      const insertHeaderQuery =
        "INSERT INTO fc_header (master_id, alter_id,vch_date, vch_no, design_no, design_id, lot_no, size, item_name, qty, cutting_date, unit_no, freight_one_type, freight_one_val, freight_two_type, freight_two_val, packing_mat, accessory, overhead_chg, other_chg, narration) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
     
      await connection.query(insertHeaderQuery, [
        lastMasterIdheader + 1 || 0,
        lastalterIdheader + 1 || 0,
        finalCostingUnitData.originalDate,
        finalCostingUnitData.lastVchNo,
        finalCostingUnitData.headerData.design_no || 'NA',
        finalCostingUnitData.headerData.design_id || 'NA',
        finalCostingUnitData.headerData.lot_no || 'NA',
        finalCostingUnitData.headerData.size || 'NA',
        finalCostingUnitData.itemName || 'NA',
        finalCostingUnitData.headerData.actual_qty || 'NA',
        finalCostingUnitData.headerData.vch_date || 'NA',
        finalCostingUnitData.headerData.unit_no || 'NA',
        finalCostingUnitData.headerData.freight_one_type || 'NA',
        finalCostingUnitData.headerData.freight_one_val || 'NA',
        finalCostingUnitData.headerData.freight_two_type || 'NA',
        finalCostingUnitData.headerData.freight_two_val || 'NA',
        finalCostingUnitData.esTableData.Packaging || 'NA',
        finalCostingUnitData.esTableData.Accessories || 'NA',
        finalCostingUnitData.esTableData.Overhead || 'NA',
        finalCostingUnitData.esTableData.Other || 'NA',
        finalCostingUnitData.narration || 'NA'
      ]);

      
      // Insert destination data
      const insertDestinationQuery =
        "INSERT INTO fc_fabric_detail (master_id, alter_id,  vch_date, vch_no, fabric_name, fabric_id, type, width, rate, qty, amt) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
      if (
        finalCostingUnitData.cuttingTableData &&
        finalCostingUnitData.cuttingTableData.length
      ) {
        for (let i = 0; i < finalCostingUnitData.cuttingTableData.length; i++) {
          await connection.query(insertDestinationQuery, [
            // lastMasterIddestination + 1 + i || 0,
            lastMasterIdheader + 1 || 0,
            lastalterIdDestination + 1 + i || 0,
            finalCostingUnitData.originalDate,
            finalCostingUnitData.lastVchNo,
            finalCostingUnitData.cuttingTableData[i].item_name || 'NA',
            finalCostingUnitData.cuttingTableData[i].item_id || 'NA',
            finalCostingUnitData.cuttingTableData[i].type || 'NA',
            finalCostingUnitData.cuttingTableData[i].size || 'NA',
            finalCostingUnitData.cuttingTableData[i].rate || 'NA',
            finalCostingUnitData.cuttingTableData[i].qty || 'NA',
            finalCostingUnitData.cuttingTableData[i].amt || 'NA'
          ]);
        }
      } else {
        console.error("Data is undefined or has an invalid length");
      }

      // Insert source data
      const insertSourceQuery =
      "INSERT INTO fc_process_detail  (master_id, alter_id, vch_date, vch_no, process_name, type, jobber_name, jobber_id, rate_per_unit) VALUES (?,?,?,?,?,?,?,?,?)";
    if (
      finalCostingUnitData.processTableData &&
      finalCostingUnitData.processTableData.length
    ) {
      for (let i = 0; i < finalCostingUnitData.processTableData.length; i++) {
        const processName =
          finalCostingUnitData.processTableData[i].table || "NA";
    
        // Translate table names into readable process names
        const readableProcessName =
          processName.includes("emb")
            ? "Embroidery"
            : processName.includes("fus")
            ? "Fusing"
            : processName.includes("cutt")
            ? "Cutting"
            : processName.includes("hand")
            ? "Handwork"
            : processName.includes("pleat")
            ? "Pleating"
            : processName.includes("print")
            ? "Printing"
            : processName.includes("stitch")
            ? "Stitching"
            : processName.includes("refinish")
            ? "Refinishing"
            : processName.includes("iron")
            ? "Ironing"
            : processName.includes("smoke")
            ? "Smoking"
            : processName.includes("wash")
            ? "Washing"
            : processName;
    
        await connection.query(insertSourceQuery, [
          // lastMasterIdsource + 1 + i || 0,
          lastMasterIdheader + 1 || 0,
          lastalterIdSource + 1 + i || 0,
          finalCostingUnitData.originalDate,
          finalCostingUnitData.lastVchNo,
          readableProcessName,
          finalCostingUnitData.processTableData[i].types || "NA",
          finalCostingUnitData.processTableData[i].jobber_name || "NA",
          finalCostingUnitData.processTableData[i].jobber_id || "NA",
          finalCostingUnitData.processTableData[i].total_jw_rate || "NA"
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
  -    connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error storing data:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
