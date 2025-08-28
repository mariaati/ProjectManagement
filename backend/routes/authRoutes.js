const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authConfig = {
  accessTokenExpireTime: '1d',
  refreshTokenExpireTime: '30d',
};

// For demo: store refresh tokens in memory (You can store in DB for production)
let refreshTokens = [];

//  Register User
router.post('/register', async (req, res) => {
  const { name, username, password, role } = req.body;

  try {
    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin or student.' });
    }

    // Check if username exists
    const userExists = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, username, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, username, role`,
      [name, username, hashedPassword, role]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  Login User with cookies
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //  Generate Tokens
    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: authConfig.accessTokenExpireTime,
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: authConfig.refreshTokenExpireTime,
    });

    refreshTokens.push(refreshToken);

    //  Remove sensitive data
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    };

    //  Set HttpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'Strict',
    };

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.cookie('isLoggedIn', true, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful',
      userData,
      accessToken, //  Send access token in response
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
