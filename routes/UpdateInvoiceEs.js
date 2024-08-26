const express = require('express');
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

// Middleware to parse JSON bodies
router.use(express.json());

router.post("/", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { accountingVoucherData, productPanelData, materialData, billingData, narationData } = req.body;
    const designNo = productPanelData.selectedValue;
    const naration = req.body.narationData;

    // Step 1: Retrieve vch_no and master_id
    const [headerRows] = await connection.query(
      "SELECT vch_no, master_id FROM Estimated_CS_header WHERE design_no = ?",
      [designNo]
    );
    if (headerRows.length === 0) {
      res.status(404).send('Design number not found');
      return;
    }
    const { vch_no, master_id } = headerRows[0];

    // Step 2: Delete rows from Estimated_CS_Item_Detail
    await connection.query(
      "DELETE FROM Estimated_CS_Item_Detail WHERE vch_no = ?",
      [vch_no]
    );

    await connection.query(
      "DELETE FROM Estimated_CS_JW_Detail WHERE vch_no = ?",
      [vch_no]
    );

    // Step 3: Update Estimated_CS_header
    const sqlUpdate = `
      UPDATE Estimated_CS_header
      SET vch_date = ?, size = ?, code =  ? ,unit_no = ? , total_quantity = ?, overHead_cost = ?, total_cost_unit = ?, Narration = ?
      WHERE design_no = ?
    `;
    const updateValues = [
      accountingVoucherData.selectedDate,
      productPanelData.itemSize,
      productPanelData.itemCode,
      accountingVoucherData.selecteditem_id,
      productPanelData.quantity,
      billingData.overHeadCost,
      billingData.totalCostPerUnit,
      naration,
      designNo
    ];
    await connection.query(sqlUpdate, updateValues);

    // Step 4: Transform and combine material data
    const { rowsData, accessoriesData, packingMaterialData } = materialData;
    const { rowsDataJob } = req.body.billingData;
    const { overHeadCost, totalCostPerUnit, freightCost, freightCostTwo, otherCost, otherCostTypeValue, freightTypeValue, freightTypeValueTwo } = req.body.billingData;

    var f1 = 0, f2 = 0, oc = 0;
    var is_other_charge = 0;
    let rowGap = rowsDataJob.some(data => !data.jobWork) ? 0 : rowsDataJob.length;


    if (freightCost > 0 || freightCostTwo > 0 || otherCost > 0) {
      is_other_charge = 1;
    }

    switch (true) {
      case (freightCost > 0):
        f1 = 1;
        if (freightCostTwo > 0) {
          f2 = 2;
          if (otherCost > 0) oc = 3;
        }
        break;
      case freightCostTwo > 0 && !freightCost > 0:
        f2 = 1;
        if (otherCost > 0) oc = 2;
        break;
      case otherCost > 0 && !freightCost > 0:
        if (freightCostTwo > 0) oc = 2;
        else oc = 1;
        break;
    }

    const transformAndAddGroup = (data, group) => {
      return data.map((item) => ({
        material: item.rawMaterials || item.accessories || item.packingMaterial,
        group,
        itemId: item.itemId,
        type: item.type,
        unit: item.unit,
        color: item.color,
        width: item.width,
        tolorance: item.tolorance,
        rate: item.rate,
        qty: item.qty,
        amt: item.amount,
      }));
    };

    const filteredRowsData = rowsData.filter((item) => item.rawMaterials);
    const filteredAccessoriesData = accessoriesData.filter((item) => item.accessories);
    const filteredPackingMaterialData = packingMaterialData.filter((item) => item.packingMaterial);

    const transformedRowsData = transformAndAddGroup(filteredRowsData, "Raw Material");
    const transformedAccessoriesData = transformAndAddGroup(filteredAccessoriesData, "Accessories");
    const transformedPackingMaterialData = transformAndAddGroup(filteredPackingMaterialData, "Packaging Material");

    const combinedData = [
      ...transformedRowsData,
      ...transformedAccessoriesData,
      ...transformedPackingMaterialData,
    ];

    const insertDetailQuery = `
      INSERT INTO Estimated_CS_Item_Detail 
      (master_id, vch_no, vch_date, item_id, raw_material, item_unit, group_type, type, color, width, tolorance, rate, qty, amt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const item of combinedData) {
      await connection.query(insertDetailQuery, [
        master_id,
        vch_no,
        accountingVoucherData.selectedDate || "N/A",
        item.itemId,
        item.material || "N/A",
        item.unit || 'N/A',
        item.group || "N/A",
        item.type || "N/A",
        item.color || "N/A",
        item.width || "N/A",
        item.tolorance || "N/A",
        item.rate || 0,
        item.qty || 0,
        item.amt || 0,
      ]);
    }


    // Insert job work data
    const insertJobWorkQuery = "INSERT INTO Estimated_CS_JW_Detail (master_id, vch_no, vch_date, jobber_id, jobber_name, jobwork_name, jobwork_name_id, type, amt, is_other_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    for (let i = 0; i < rowsDataJob.length; i++) {
      // Check if jobberName and jobWork are not empty
      await connection.query(insertJobWorkQuery, [
        // lastMasterIdJw + i + 1 || 0,
        master_id,
        vch_no,
        accountingVoucherData.selectedDate || "N/A",
        rowsDataJob[i].jobberNameId || 'N/A',
        rowsDataJob[i].jobberName || "N/A",
        rowsDataJob[i].jobWork || "N/A",
        rowsDataJob[i].jobworkNameId,
        rowsDataJob[i].jobType || "N/A",
        rowsDataJob[i].amount || 0,
        0,
      ]);

    }

      if(freightCost > 0){
        const insertJobWorkQuery = "INSERT INTO Estimated_CS_JW_Detail (master_id, vch_no, vch_date, jobber_id, jobber_name, jobwork_name, jobwork_name_id, type, amt, is_other_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        await connection.query(insertJobWorkQuery, [
          // lastMasterIdJw + rowGap + f1 || 0,
          master_id,
    vch_no,
    accountingVoucherData.selectedDate || "N/A",
          'N/A',
          "N/A",
          "freight Cost",
          "N/A",
          freightTypeValue || "N/A",
          freightCost || 0,
          1,
        ]);

      }

      if(freightCostTwo > 0){
        const insertJobWorkQuery = "INSERT INTO Estimated_CS_JW_Detail (master_id, vch_no, vch_date, jobber_id, jobber_name, jobwork_name, jobwork_name_id, type, amt, is_other_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        await connection.query(insertJobWorkQuery, [
          // lastMasterIdJw + rowGap + f2  || 0,
          master_id,
    vch_no,
    accountingVoucherData.selectedDate || "N/A",
          'N/A',
          "N/A",
          "freight Cost Two",
          'N/A',
          freightTypeValueTwo || "N/A",
          freightCostTwo || 0,
          1,
        ]);

      }

      if(otherCost > 0){
        const insertJobWorkQuery = "INSERT INTO Estimated_CS_JW_Detail (master_id, vch_no, vch_date, jobber_id, jobber_name, jobwork_name, jobwork_name_id, type, amt, is_other_charge) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        await connection.query(insertJobWorkQuery, [
          // lastMasterIdJw + rowGap + oc || 0,
          master_id,
    vch_no,
    accountingVoucherData.selectedDate || "N/A",
          'N/A',
          "N/A",
          "Other Cost",
          'N/A',
          otherCostTypeValue || "N/A",
          otherCost || 0,
          1,
        ]);

      }

    res.status(200).send('Data updated successfully');
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    connection.release();
  }
});

module.exports = router;
