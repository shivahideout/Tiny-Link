import express from "express";
import dotenv from "dotenv";
import linksRouter from "./routes/links.js";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(express.json());

// API routes
app.use("/api/links", linksRouter);

// Health routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// SHORT URL REDIRECT (MUST BE ABOVE STATIC)
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query("SELECT url FROM links WHERE code = $1", [
      code,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).send("Not Found");
    }

    // Update clicks
    await pool.query(
      `UPDATE links
       SET clicks = clicks + 1,
           last_clicked = NOW()
       WHERE code = $1`,
      [code]
    );

    res.redirect(result.rows[0].url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// Static files LAST
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
