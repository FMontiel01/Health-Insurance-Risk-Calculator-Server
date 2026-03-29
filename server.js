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

// Body Mass Index Calculator
app.get('/api/bmi', (req, res) => {
    // For GET requests, data comes from req.query
    const weight = parseFloat(req.query.weightLbs);
    const feet = parseFloat(req.query.heightFeet);
    const inches = parseFloat(req.query.heightInches);
    
    console.log('BMI calculation for:', weight, 'lbs,', feet, 'ft', inches, 'in');
    
    // Make sure we have all the numbers
    if (isNaN(weight) || isNaN(feet) || isNaN(inches)) {
        return res.status(400).json({ 
            error: 'Please provide weightLbs, heightFeet, and heightInches as numbers'
        });
    }
    
    // Check if numbers make sense
    if (weight <= 0) {
        return res.status(400).json({ error: 'Weight must be more than 0' });
    }
    
    if (feet < 0 || inches < 0) {
        return res.status(400).json({ error: 'Height cannot be negative' });
    }
    
    if (feet === 0 && inches === 0) {
        return res.status(400).json({ error: 'Height must be greater than 0' });
    }
    
    // Calculate total height in inches
    const totalInches = (feet * 12) + inches;
    
    // Convert to metric 
    const weightKg = weight * 0.453592;
    const heightM = totalInches * 0.0254;
    
    // Calculate BMI
    const bmiValue = weightKg / (heightM * heightM);
    const bmi = Math.round(bmiValue * 10) / 10;
    
    // Figure out the category and points 
    let category;
    let points;
    
    if (bmi >= 30) {
        category = 'obese';
        points = 75;
    } else if (bmi >= 25) {
        category = 'overweight';
        points = 30;
    } else if (bmi >= 18.5) {
        category = 'normal';
        points = 0;
    } else {
        category = 'underweight';
        points = 0;
    }
    
    // Send back the result
    res.json({
        bmi: bmi,
        category: category,
        points: points
    });
    
    console.log('Result:', bmi, '-', category, '-', points, 'points');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


