// routes/projects.js
const express = require("express");
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csvParser = require("csv-parser");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===== Multer config for file uploads =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/projects"); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// =======================
// GET all projects (with filters)
// =======================
router.get("/", async (req, res) => {
    const { faculty, name, year, track, technology, search } = req.query;
    try {
        let query = `
        SELECT p.*, 
               json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) AS technologies,
               jsonb_build_object('id', f.id, 'name', f.name, 'description', f.description) AS faculty,
               COALESCE(AVG(r.rating), 0) AS average_rating
        FROM projects p
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        LEFT JOIN faculties f ON p.faculty_id = f.id
        LEFT JOIN project_ratings r ON p.id = r.project_id
        WHERE 1=1
      `;
        const values = [];

        if (faculty) {
            values.push(faculty);
            query += ` AND p.faculty_id = $${values.length}`;
        }
        if (name) {
            values.push(`%${name}%`);
            query += ` AND p.title ILIKE $${values.length}`;
        }
        if (year) {
            values.push(year);
            query += ` AND p.submission_year = $${values.length}`;
        }
        if (track) {
            values.push(track);
            query += ` AND p.study_track = $${values.length}`;
        }
        if (technology) {
            values.push(technology);
            query += ` AND t.name ILIKE $${values.length}`;
        }
        if (search) {
            values.push(`%${search}%`);
            query += ` AND (p.title ILIKE $${values.length} OR p.description ILIKE $${values.length})`;
        }

        query += ` 
        GROUP BY p.id, f.id
        ORDER BY p.created_at DESC
      `;

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// GET one project
// =======================
router.get("/getOne/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
        SELECT p.*, 
               f.id AS faculty_id,
               f.name AS faculty_name,
               f.description AS faculty_description,
               json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL) AS technologies
        FROM projects p
        LEFT JOIN faculties f ON p.faculty_id = f.id
        LEFT JOIN project_technologies pt ON p.id = pt.project_id
        LEFT JOIN technologies t ON pt.technology_id = t.id
        WHERE p.id = $1
        GROUP BY p.id, f.id, f.name, f.description
      `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Build faculty object inside project
        const row = result.rows[0];
        const project = {
            ...row,
            faculty: {
                id: row.faculty_id,
                name: row.faculty_name,
                description: row.faculty_description,
            },
        };

        // Remove redundant top-level faculty fields
        delete project.faculty_id;
        delete project.faculty_name;
        delete project.faculty_description;

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// =======================
// CREATE project
// =======================
router.post("/create", authMiddleware, upload.array("media", 10), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Validate files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one media file is required." });
        }

        // Validate number of files (redundant if multer limits already, but double-check)
        if (req.files.length > 10) {
            return res.status(400).json({ message: "Maximum 10 media files allowed." });
        }

        // Optional: Validate file types/extensions (example: allow only images/videos)
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi"];
        for (const file of req.files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({ message: `File type not allowed: ${file.originalname}` });
            }
        }

        // Destructure fields from body
        const {
            title,
            main_topic,
            description,
            submission_year,
            study_track,
            faculty_id,
            github_link,
            live_link,
            youtube_link,
            document_link,
            technologies, // array or comma-separated string
        } = req.body;

        // Collect uploaded filenames
        const mediaFiles = req.files.map((file) => file.filename);

        // Insert project record
        const projectResult = await client.query(
            `INSERT INTO projects
        (title, main_topic, description, submission_year, study_track, faculty_id, github_link, live_link, youtube_link, document_link, media)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *`,
            [
                title,
                main_topic || null,
                description || null,
                submission_year || null,
                study_track || null,
                faculty_id || null,
                github_link || null,
                live_link || null,
                youtube_link || null,
                document_link || null,
                JSON.stringify(mediaFiles),
            ]
        );

        const projectId = projectResult.rows[0].id;

        if (technologies) {
            const techArray = Array.isArray(technologies)
                ? technologies
                : technologies.split(",").map((t) => t.trim());

            for (const techId of techArray) {
                await client.query(
                    "INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)",
                    [projectId, techId]
                );
            }
        }

        await client.query("COMMIT");
        res.status(201).json(projectResult.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});


// =======================
// UPDATE project
// =======================
router.put("/update/:id", authMiddleware, upload.array("media", 10), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { id } = req.params;
        const {
            title,
            main_topic,
            description,
            submission_year,
            study_track,
            faculty_id,
            github_link,
            live_link,
            youtube_link,
            document_link,
            technologies,
        } = req.body;

        // Get existing media JSON from DB to preserve if no new files uploaded
        const existingRes = await client.query("SELECT media FROM projects WHERE id=$1", [id]);
        if (existingRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Project not found" });
        }
        let existingMedia = existingRes.rows[0].media || [];

        // Check if new media files uploaded
        let mediaFiles;
        if (req.files && req.files.length > 0) {
            mediaFiles = req.files.map((file) => file.filename);
        } else {
            mediaFiles = existingMedia; // keep existing media if no new files
        }

        // Update project with new or existing media
        const result = await client.query(
            `UPDATE projects SET
          title=$1, main_topic=$2, description=$3, submission_year=$4, study_track=$5,
          faculty_id=$6, github_link=$7, live_link=$8, youtube_link=$9, document_link=$10,
          media=$11, updated_at=NOW()
        WHERE id=$12 RETURNING *`,
            [
                title,
                main_topic || null,
                description || null,
                submission_year || null,
                study_track || null,
                faculty_id || null,
                github_link || null,
                live_link || null,
                youtube_link || null,
                document_link || null,
                JSON.stringify(mediaFiles),
                id,
            ]
        );

        // Update technologies many-to-many
        if (technologies) {
            await client.query("DELETE FROM project_technologies WHERE project_id=$1", [id]);
            const techArray = Array.isArray(technologies)
                ? technologies
                : technologies.split(",").map((t) => t.trim());

            for (const techId of techArray) {
                await client.query(
                    "INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)",
                    [id, techId]
                );
            }
        }

        await client.query("COMMIT");
        res.json(result.rows[0]);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});


// =======================
// DELETE project
// =======================
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM projects WHERE id=$1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/import-csv", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
    }

    const filePath = path.resolve(req.file.path);

    const results = [];

    // Parse CSV file
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => {
            // data is an object representing a row in CSV
            results.push(data);
        })
        .on("end", async () => {
            const client = await pool.connect();

            try {
                await client.query("BEGIN");

                for (const row of results) {
                    let techArray = [];
                    if (row.technologies) {
                        techArray = row.technologies.split(",").map((t) => t.trim());
                    }

                    const mediaFiles = [];

                    const projectInsert = await client.query(
                        `INSERT INTO projects
                (title, main_topic, description, submission_year, study_track, faculty_id, github_link, live_link, youtube_link, document_link)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                RETURNING id`,
                        [
                            row.title,
                            row.main_topic || null,
                            row.description || null,
                            row.submission_year ? parseInt(row.submission_year, 10) : null,
                            row.study_track || null,
                            row.faculty_id || null,
                            row.github_link || null,
                            row.live_link || null,
                            row.youtube_link || null,
                            row.document_link || null,
                            // JSON.stringify(mediaFiles),
                        ]
                    );

                    // const projectId = projectInsert.rows[0].id;

                    // // Insert project_technologies
                    // for (const techId of techArray) {
                    //     await client.query(
                    //         `INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)`,
                    //         [projectId, techId]
                    //     );
                    // }
                }

                await client.query("COMMIT");

                // Delete uploaded CSV after processing
                fs.unlinkSync(filePath);

                return res.status(201).json({ message: "CSV imported successfully" });
            } catch (err) {
                await client.query("ROLLBACK");
                fs.unlinkSync(filePath);
                console.error(err);
                return res.status(500).json({ message: "Server error during import" });
            } finally {
                client.release();
            }
        })
        .on("error", (err) => {
            fs.unlinkSync(filePath);
            console.error(err);
            return res.status(500).json({ message: "Failed to parse CSV file" });
        });
});

// Create or update a rating
// POST /ratings
router.post("/ratings", async (req, res) => {
    const { projectId, userId, rating, description } = req.body;

    // Basic validation
    if (!projectId || !userId || rating == null)
        return res.status(400).json({ message: "projectId, userId and rating are required" });

    if (typeof rating !== "number" || rating < 1 || rating > 5)
        return res.status(400).json({ message: "Rating must be between 1 and 5" });

    try {
        const query = `
        INSERT INTO project_ratings (project_id, user_id, rating, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (project_id, user_id) DO NOTHING
        RETURNING *;
      `;

        const result = await pool.query(query, [projectId, userId, rating, description]);

        if (result.rowCount === 0) {
            // Already rated by this user for this project
            return res.status(409).json({ message: "User has already rated this project" });
        }

        // New rating inserted
        res.json({ message: "Rating saved", rating: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/ratings", async (req, res) => {
    const { projectId, userId } = req.query;
    if (!projectId || !userId) return res.status(400).json({ message: "Missing projectId or userId" });

    try {
        const result = await pool.query(
            "SELECT rating FROM project_ratings WHERE project_id = $1 AND user_id = $2",
            [projectId, userId]
        );
        if (result.rows.length === 0) {
            return res.json({ rating: null }); // No rating yet
        }
        res.json({ rating: result.rows[0].rating });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
