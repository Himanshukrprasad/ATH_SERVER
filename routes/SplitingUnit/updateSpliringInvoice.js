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


router.use(express.json());

router.post("/", async (req, res) => {
  let connection;
  try {
    // Get connection and begin transaction
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const { splitingCompData, designIdData, authKeyValue } = req.body;

    const listLength = splitingCompData.destinationTableData.length;
    const calValues = new Array(listLength);
    const splitUnit = `SPLIT-${splitingCompData.splitUnitNo}`;

    // Calculate and assign values to calValues array
    for (let i = 0; i < listLength; i++) {
      const item = splitingCompData.destinationTableData[i];
      let calculatedValue = (
        Number(item.rate) +
        (Number(splitingCompData.cuttingFreightVal?.cutting_charges ?? 0) *
          Number(splitingCompData.actualQty)) /
        listLength
      ).toFixed(2);

      // Adjust calculated value based on type
      if (item.type.toLowerCase() === "top") {
        calculatedValue = (
          (Number(calculatedValue) + (Number(splitingCompData.headerData[0]?.freight_one_val || 0) * Number(splitingCompData.actualQty))) /
          Number(splitingCompData.actualQty)
        ).toFixed(2);
      } else if (item.type.toLowerCase() === "pant") {
        calculatedValue = (
          (Number(calculatedValue) + (Number(splitingCompData.headerData[0]?.freight_two_val || 0) * Number(splitingCompData.actualQty))) /
          Number(splitingCompData.actualQty)
        ).toFixed(2);
      } else {
        calculatedValue = (Number(calculatedValue) / Number(splitingCompData.actualQty)).toFixed(2);
      }

      calValues[i] = calculatedValue;
    }

    const { designNo } = splitingCompData.splitingValues[0];

    // Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      "SELECT vch_no, master_id, lot_no FROM spliting_header WHERE design_no = ?",
      [designNo]
    );

    const [destinationRow] = await connection.query(
      "SELECT sl_no FROM spliting_destination WHERE design_no = ? ORDER BY sl_no ASC LIMIT 1",
      [designNo]
    );
  
    const firstSlNo = destinationRow.length ? destinationRow[0].sl_no : null;

    if (headerRows.length === 0) {
      throw new Error('Design number not found');
    }

    const { vch_no, master_id , lot_no} = headerRows[0];

    // Update spliting_header
    const sqlUpdate = `
      UPDATE spliting_header
      SET vch_no = ? , vch_date = ?, unit_no = ?, narration = ?
      WHERE design_no = ?
    `;
    const updateValues = [
      splitingCompData.splitNoText,
      splitingCompData.originalDate || "NA",
      splitUnit || "NA",
      splitingCompData.narration || "NA",
      designNo
    ];
    await connection.query(sqlUpdate, updateValues);

    // Update spliting_source
    const sqlSourceUpdate = `
      UPDATE spliting_source
      SET vch_no = ? , vch_date = ?
      WHERE design_no = ?
    `;
    const updateSourceValues = [
      splitingCompData.splitNoText,
      splitingCompData.originalDate || "NA",
      designNo
    ];
    await connection.query(sqlSourceUpdate, updateSourceValues);

    // Update spliting_destination
    const updateDestinationQuery = `
      UPDATE spliting_destination 
      SET vch_no = ? ,
          vch_date = ?, 
          item_name = ?, 
          type = ?,
          godown = ? ,
          lot_no = ?
      WHERE design_no = ? AND sl_no = ?
    `;

    if (splitingCompData.destinationTableData && splitingCompData.destinationTableData.length) {
      for (let i = 0; i < splitingCompData.destinationTableData.length; i++) {
        const item = splitingCompData.destinationTableData[i];
        await connection.query(updateDestinationQuery, [
          splitingCompData.splitNoText,
          splitingCompData.originalDate,
          item.itemName || "NA",
          item.type || 'NA',
          item.godown || "NA",
          
          lot_no || 'NA',
          designNo,
          firstSlNo + i,
        ]);
      }
    } else {
      throw new Error("Data is undefined or has an invalid length");
    }

    // Commit transaction
    await connection.commit();

    res.status(200).send('Data updated successfully');
  } catch (error) {
    // Rollback transaction if there's an error
    if (connection) await connection.rollback();
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Ensure connection is released in the finally block
    if (connection) connection.release();
  }
});


module.exports = router;