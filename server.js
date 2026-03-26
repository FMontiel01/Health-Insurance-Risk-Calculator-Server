'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5500';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

