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
  console.log('API called: GET /api/ping');
  res.json({ message: 'Server is awake' });
  console.log('API response sent: Server is awake')
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

app.get("/api/bp-category", (req, res) => {
  console.log('API called GET /api/bp-category', req.query);

  const systolic = parseInt(req.query.systolic, 10);
  const diastolic = parseInt(req.query.diastolic, 10);

  if(isNaN(systolic) || isNaN(diastolic)) {
    console.log('API response error: invalid systolic or diastolic');
    return res.status(400).json({
      error: "Provide systolic and diastolic as numbers"
    });
  }

  if (systolic <= 0 || diastolic <= 0) {
    console.log('API response error: non-positive values');
    return res.status(400).json({
      error: "Values must be positive numbers"
    });
  }
  
  const result = getBP(systolic, diastolic);
  console.log('API response sent:', result);
  res.json(result);
});

// Body Mass Index Calculator
app.get('/api/bmi', (req, res) => {
    // For GET requests, data comes from req.query
    const weight = parseFloat(req.query.weightLbs);
    const feet = parseFloat(req.query.heightFeet);
    const inches = parseFloat(req.query.heightInches);
    
    console.log('API called GET /api/bmi', req.query);
    
    // Make sure we have all the numbers
    if (isNaN(weight) || isNaN(feet) || isNaN(inches)) {
      console.log('API response error: missing or invalid BMI inputs');
      return res.status(400).json({ 
        error: 'Please provide weightLbs, heightFeet, and heightInches as numbers'
      });
    }
    
    // Check if numbers make sense
    if (weight <= 0) {
      console.log('API response error: invalid weight');
      return res.status(400).json({ error: 'Weight must be more than 0' });
    }
    
    if (feet < 0 || inches < 0) {
      console.log('API response error: negative height');
      return res.status(400).json({ error: 'Height cannot be negative' });
    }
    
    if (feet === 0 && inches === 0) {
      console.log('API response error: zero height');
      return res.status(400).json({ error: 'Height must be greater than 0' });
    }

    if (inches >= 12) {
      console.log('API response error: inches must be less than 12');
      return res.status(400).json({ error: 'heightInches must be between 0 and 11' });
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
        category = 'Obese';
        points = 75;
    } else if (bmi >= 25) {
        category = 'Overweight';
        points = 30;
    } else if (bmi >= 18.5) {
        category = 'Normal';
        points = 0;
    } else {
        category = 'Underweight';
        points = 0;
    }
    
    // Send back the result
    const result = {bmi, category, points };
    console.log('API response sent:', result);
    res.json(result);
    
});

// 4. risk-category
function getAgePoints(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

function getBMIPoints(bmi) {
  const value = bmi.toLowerCase();

  if (value === 'normal') return 0;
  if (value === 'overweight') return 30;
  if (value === 'obese') return 75;

  return null;
}

function getBPPoints(bp) {
  const value = bp.toLowerCase();

  if (value === "normal") return 0;
  if (value === "elevated") return 15;
  if (value === "hypertension stage 1" || value === "stage 1") return 30;
  if (value === "hypertension stage 2" || value === "stage 2") return 75;
  if (value === "hypertensive crisis" || value === "crisis") return 100;

  return null;
}

function getFamilyDiseasePoints(hasDisease) {
  return hasDisease ? 10 : 0;
}

function getRiskCategory(totalPoints) {
  if (totalPoints <= 20) return "low risk";
  if (totalPoints <= 50) return "moderate risk";
  if (totalPoints <= 75) return "high risk";
  return "uninsurable";
}

app.get("/api/risk-category", (req, res) => {
  console.log("API called GET /api/risk-category", req.query);

  const age = parseInt(req.query.age, 10);
  const bmi = req.query.bmi;
  const bp = req.query.bp;

  const diabetes = req.query.diabetes;
  const cancer = req.query.cancer;
  const alzheimers = req.query.alzheimers;

  if (isNaN(age) || !bmi || !bp) {
    console.log("API response error: missing required inputs");
    return res.status(400).json({
      error: "Provide age, bmi, and bp"
    });
  }

  if (age < 0) {
    console.log("API response error: invalid age");
    return res.status(400).json({
      error: "Age must be 0 or greater"
    });
  }

  const bmiPoints = getBMIPoints(bmi);
  const bpPoints = getBPPoints(bp);

  if (bmiPoints === null) {
    console.log("API response error: invalid bmi category");
    return res.status(400).json({
      error: "BMI must be normal, overweight, or obese"
    });
  }

  if (bpPoints === null) {
    console.log("API response error: invalid blood pressure category");
    return res.status(400).json({
      error: "BP must be normal, elevated, stage 1, stage 2, or crisis"
    });
  }

  const hasDiabetes = String(diabetes).toLowerCase() === "yes";
  const hasCancer = String(cancer).toLowerCase() === "yes";
  const hasAlzheimers = String(alzheimers).toLowerCase() === "yes";

  const agePoints = getAgePoints(age);
  const diabetesPoints = getFamilyDiseasePoints(hasDiabetes);
  const cancerPoints = getFamilyDiseasePoints(hasCancer);
  const alzheimersPoints = getFamilyDiseasePoints(hasAlzheimers);

  const totalPoints =
    agePoints +
    bmiPoints +
    bpPoints +
    diabetesPoints +
    cancerPoints +
    alzheimersPoints;

  const riskCategory = getRiskCategory(totalPoints);

  const result = {
    agePoints,
    bmiPoints,
    bpPoints,
    diabetesPoints,
    cancerPoints,
    alzheimersPoints,
    totalPoints,
    riskCategory
  };

  console.log("API response sent:", result);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


