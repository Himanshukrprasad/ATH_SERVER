const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2");
require('dotenv').config();

const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

router.post("/", (req, res) => {
  const { vchNo } = req.body;

  if (!vchNo) {
    return res.status(400).json({ error: "vchNo is required" });
  }

  const queries = {
    accessories: `SELECT SUM(amt) AS sum_amt FROM Estimated_CS_Item_Detail WHERE group_type = 'Accessories' AND vch_no = ?`,
    packaging: `SELECT SUM(amt) AS sum_amt FROM Estimated_CS_Item_Detail WHERE group_type = 'Packaging Material' AND vch_no = ?`,
    otherCost: `SELECT amt FROM Estimated_CS_JW_Detail WHERE vch_no = ? AND jobwork_name = 'other cost'`,
    overhead: `SELECT overhead_cost FROM Estimated_CS_header WHERE vch_no = ?`,
    freight: `SELECT freight_one_type, freight_one_val, freight_two_type, freight_two_val FROM cutting_header WHERE estimate_cs_vch_no = ?`
  };

  const results = {};

  pool.query(queries.accessories, [vchNo], (error, accessoriesResults) => {
    if (error) {
      console.error("Error fetching Accessories:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    results.Accessories = accessoriesResults[0]?.sum_amt || 0;

    pool.query(queries.packaging, [vchNo], (error, packagingResults) => {
      if (error) {
        console.error("Error fetching Packaging Material:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      results.Packaging = packagingResults[0]?.sum_amt || 0;

      pool.query(queries.otherCost, [vchNo], (error, otherCostResults) => {
        if (error) {
          console.error("Error fetching Other Cost:", error);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        results["Other"] = otherCostResults[0]?.amt || 0;

        pool.query(queries.overhead, [vchNo], (error, overheadResults) => {
          if (error) {
            console.error("Error fetching Overhead Cost:", error);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          results["Overhead"] = overheadResults[0]?.overhead_cost || 0;

          pool.query(queries.freight, [vchNo], (error, freightResults) => {
            if (error) {
              console.error("Error fetching Freight Costs:", error);
              return res.status(500).json({ error: "Internal Server Error" });
            }

            results["Freight_One_Type"] = freightResults[0]?.freight_one_type || '';
            results["Freight_One_Value"] = freightResults[0]?.freight_one_val || 0;
            results["Freight_Two_Type"] = freightResults[0]?.freight_two_type || '';
            results["Freight_Two_Value"] = freightResults[0]?.freight_two_val || 0;

            res.json(results);
          });
        });
      });
    });
  });
});

module.exports = router;
