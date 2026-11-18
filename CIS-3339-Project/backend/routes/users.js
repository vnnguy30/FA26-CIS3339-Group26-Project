// This file contains all API endpoints for interacting with the "users" collection in the MongoDB database
const express = require('express');
const router = express.Router();
// import bcrypt for comparing password to hashed password
const bcrypt = require('bcrypt');
// import JWT (JSON Web Token) to create a web token to the user after a successful login - allows user to make API calls
const jwt = require('jsonwebtoken');

// import users data model schema
const { users } = require('../models/models');
const httpError = require('../utils/httpError');

const org = process.env.ORG_ID;

// API endpoint to handle login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await users.findOne({ username: username, org: org });
    if (!user) {
      return next(httpError(401, 'Invalid username or password'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(httpError(401, 'Invalid username or password'));
    }

    const payload = {
      name: user.username,
      role: user.role
    };

    // token expires in 30 days. This is not best security practice but still demonstrates how JWT work
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
