// src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const complaintRoutes = require('./routes/complaint.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/complaints', complaintRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on port ${port}`));
