const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Allow only the frontend to access the backend
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true, // allows cookies/auth headers
}));

app.use(express.json());

const routes = require('./routes');
app.use('/', routes);

module.exports = app;
