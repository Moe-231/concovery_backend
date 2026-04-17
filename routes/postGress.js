import express from "express";
const router = express.Router();
import pool from "../db.js";

router.get("/sportsFilter", async (req, res) => {
  console.log("Api Req Made to sportsFilter Route");
  const sportsType = req.query.sportsType;
  console.log("Sports Type is: ", sportsType)
  try {
    const query = `
        SELECT ag.age_group_label, cs.sex, cs.measure_value 
        FROM concussion_statistic cs
        JOIN sport s ON s.sport_id = cs.sport_id
        JOIN age_group ag ON ag.age_group_id = cs.age_group_id
        WHERE s.sport_name = $1
        AND cs.measure_type = 'hospitalisation_count'
        AND cs.statistic_year = '2023-24'
        and cs.sex != 'Persons';
    `;

    const result = await pool.query(query, [sportsType]);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No Data Found for the give UV" });
    }
  } catch (error) {
    console.log("Error in sportsFilter API", error);
    res.status(500).send("Server Error");
  }
});

router.get("/ageFilter", async (req, res) => {
  console.log("Api Req Made to ageFilter Route");
  const ageGroup = req.query.ageGroup;
  try {
    const query = `
    SELECT ag.age_group_label  , cs.sex, cs.measure_value 
    FROM concussion_statistic cs
    JOIN sport s ON s.sport_id = cs.sport_id
    JOIN age_group ag ON ag.age_group_id = cs.age_group_id
    WHERE ag.age_group_label = $1
    AND cs.measure_type = 'hospitalisation_count'
    AND cs.statistic_year = '2023-24'
    and cs.sex != 'Persons';
    `
    const result = await pool.query(query, [ageGroup]);
    if (result.rows.length) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No Data Found for the give ageGroup" });
    }
  } catch (error) {
    console.log("Error in ageFilter API", error);
    res.status(500).send("Server Error");
  }
});

router.get("/trendAnalysis", async (req, res) => {
  console.log("Api Req Made to trendAnalysis Route");
  const ageGroup = req.query.ageGroup;
  try {
    const query1 = `
    SELECT
    cs.statistic_year,
    split_part(cs.statistic_year, '-', 1)::int AS year_start,
    cs.sex,
    cs.measure_value::numeric AS hospitalisation_count
FROM concussion_statistic cs
WHERE cs.sport_id = 36
  AND cs.age_group_id = 7
  AND cs.measure_type = 'hospitalisation_count'
  AND cs.sex IN ('Male')
  AND cs.measure_value IS NOT NULL
  AND cs.measure_value::text <> 'NaN'
ORDER BY year_start ASC;
    `
    const query2 = `
    SELECT
    cs.statistic_year,
    split_part(cs.statistic_year, '-', 1)::int AS year_start,
    cs.sex,
    cs.measure_value::numeric AS hospitalisation_count
FROM concussion_statistic cs
WHERE cs.sport_id = 36
  AND cs.age_group_id = 7
  AND cs.measure_type = 'hospitalisation_count'
  AND cs.sex IN ('Female')
  AND cs.measure_value IS NOT NULL
  AND cs.measure_value::text <> 'NaN'
ORDER BY year_start ASC;
    `
    const result1 = await pool.query(query1);
    const result2 = await pool.query(query2);
    if (result1.rows.length > 0 && result2.rows.length > 0) {
      res.status(200).json({
        MaleTrendAnalysis: result1,
        FemaleTrendAnalysis: result2
      });
    } else {
      res.status(404).json({ message: "No Data Found" });
    }
  } catch (error) {
    console.log("Error in trendAnalysis API", error);
    res.status(500).send("Server Error");
  }
});

router.get("/sportComparison", async (req, res) => {
  console.log("Api Req Made to sportComparison Route");
  try {
    const query = `
    SELECT
    s.sport_id,
    s.sport_name,
    s.sport_category,
    MAX(CASE WHEN cs.measure_type = 'hospitalisation_count' THEN cs.measure_value::numeric END) AS hospitalisation_count,
    MAX(CASE WHEN cs.measure_type = 'participation_estimate' THEN cs.measure_value::numeric END) AS participation_estimate,
    MAX(CASE WHEN cs.measure_type = 'rate_per_100000' THEN cs.measure_value::numeric END) AS rate_per_100000
FROM concussion_statistic cs
JOIN sport s
    ON cs.sport_id = s.sport_id
WHERE cs.statistic_year = '2023-24'
  AND cs.age_group_id = 7
  AND cs.sex = 'Persons'
  AND s.sport_id <> 36
  AND cs.measure_type IN ('hospitalisation_count', 'participation_estimate', 'rate_per_100000')
  AND cs.measure_value IS NOT NULL
  AND cs.measure_value::text <> 'NaN'
GROUP BY s.sport_id, s.sport_name, s.sport_category
HAVING COUNT(*) FILTER (WHERE cs.measure_type = 'rate_per_100000') > 0
   AND COUNT(*) FILTER (WHERE cs.measure_type = 'participation_estimate') > 0
ORDER BY rate_per_100000 DESC, s.sport_name ASC;

    `
    const result = await pool.query(query);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: "No Data Found" });
    }
  } catch (error) {
    console.log("Error in sportComparison API", error);
    res.status(500).send("Server Error");
  }
});

router.get("/fetchdropdownsdata", async (req, res) => {
  console.log("Api Req Made to testController Route");
  try {
    const query1 = `
        SELECT age_group_label FROM age_group;
        `;
    const query2 = `
        SELECT sport_name FROM sport;
        `;
    const result1 = await pool.query(query1);
    const result2 = await pool.query(query2);
    if (result1.rows.length > 0 && result2.rows.length > 0) {
      res.status(200).json({
        age_group_results: result1,
        sports_result: result2,
      });
    } else {
      res.status(404).json({ message: "No Data Found" });
    }
  } catch (error) {
    console.log("Error in fetchcategories API", error);
    res.status(500).send("Server Error");
  }
});

export default router;
