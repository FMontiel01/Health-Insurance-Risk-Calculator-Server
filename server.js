'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5500';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Health Insurance API is running');
});

// 1. ping (wake-up)
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Server is awake' });
});

// 2. bp-category
function getBP(systolic, diastolic) {
  if (systolic > 180 || diastolic > 120) {
    return { category: "Hypertensive Crisis", risk : "critical"};
  }

  if (systolic >= 140 || diastolic >= 90) {
    return { category: "Hypertension Stage 2", risk : "high"}
  }

  if (
    (systolic >= 130 && systolic <= 139) ||
    (diastolic >= 80 && diastolic <= 89)
  ) {
    return {category: "Hypertension Stage 1", risk: "moderate" };
  }

  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {category: "Elevated", risk: "low"};
  }

  if (systolic < 120 && diastolic < 80) {
    return {category: "Normal", risk: "minimal"};
  }

  return { category: "Unknown", risk: "unknown"}
}

app.get("/getBP", (req, res) => {
  const systolic = parseInt(req.query.systolic, 10);
  const diastolic = parseInt(req.query.diastolic, 10);

  if(isNaN(systolic) || isNaN(diastolic)) {
    return res.status(400).json({
      error: "Provide systolic and diastolic as numbers"
    });
  }

  if (systolic <= 0 || diastolic <= 0) {
    return res.status(400).json({
      error: "Values must be positive numbers"
    });
  }
  
  const result = getBP(systolic, diastolic);
  res.json(result);
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});