const express = require('express');
const pool = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

//  Get current user
router.get('/personal/me', authMiddleware, async (req, res) => {
    try {
        const { id } = req.user;

        const result = await pool.query(
            'SELECT id, name, username, role FROM users WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Current user fetched successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/logout', async (req, res) => {
    try {
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 0,
        });

        res.cookie('isLoggedIn', '', {
            httpOnly: false, // Client-side access is allowed for UI handling
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 0,
        });

        return res.status(200).send({
            status: 'success',
            message: 'Successfully logged out',
        });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error while logging out',
        });
    }
});

module.exports = router;
