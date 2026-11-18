// This file contains API endpoints for interacting with "org" collection in MongoDB database
const express = require('express');
const router = express.Router();
require('dotenv').config();

// importing data model schemas
const { orgs } = require('../models/models');
const httpError = require('../utils/httpError');

// API endpoint to get org - will use the environment variable as a "configuration" for the organization of the backend instance
router.get('/', (req, res, next) => {
  orgs.findOne({ _id: process.env.ORG_ID }, (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      return next(httpError(404, 'Organization not found'));
    } else {
      res.json(data.name);
    }
  });
});

module.exports = router;
