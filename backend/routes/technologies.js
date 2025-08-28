const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// GET all technologies
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM technologies ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET one technology
router.get("/getOne/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM technologies WHERE id=$1", [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Technology not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// CREATE technology
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await pool.query(
            "INSERT INTO technologies (name, description) VALUES ($1, $2) RETURNING *",
            [name, description || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE technology
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        const result = await pool.query(
            "UPDATE technologies SET name=$1, description=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
            [name, description || null, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Technology not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE technology
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM technologies WHERE id=$1 RETURNING *", [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Technology not found" });
        }
        res.json({ message: "Technology deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
