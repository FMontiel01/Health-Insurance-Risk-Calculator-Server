'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5500';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// 1. ping (wake-up)
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server is awake' });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
