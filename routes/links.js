import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Utility to generate random code
function generateCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET ALL LINKS (Dashboard)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT code, url, clicks, last_clicked FROM links ORDER BY last_clicked DESC NULLS LAST"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// CREATE LINK
router.post("/", async (req, res) => {
  try {
    let { url, customCode } = req.body;
    let code = customCode || generateCode(6);

    if (!url) return res.status(400).json({ error: "URL is required" });

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    const exists = await pool.query("SELECT 1 FROM links WHERE code=$1", [code]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: "Code already exists" });
    }

    await pool.query("INSERT INTO links (code, url) VALUES ($1, $2)", [
      code,
      url,
    ]);

    res.status(201).json({ code, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// REDIRECT
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      "SELECT url FROM links WHERE code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "URL not found" });
    }

    const targetUrl = result.rows[0].url;

    await pool.query(
      `UPDATE links
       SET clicks = clicks + 1, last_clicked = NOW()
       WHERE code = $1`,
      [code]
    );

    return res.redirect(targetUrl);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});



export default router;
