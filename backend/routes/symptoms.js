const express = require('express');
const router = express.Router();

// AI Symptom Checker — pure heuristic engine (no external API)
// Maps symptom clusters to disease predictions with urgency levels

const SYMPTOM_DB = {
  fever: { diseases: ['Influenza', 'Typhoid', 'Dengue', 'COVID-19', 'Malaria'], urgency: 'medium' },
  headache: { diseases: ['Migraine', 'Tension Headache', 'Sinusitis', 'Hypertension'], urgency: 'low' },
  cough: { diseases: ['Common Cold', 'Influenza', 'Bronchitis', 'COVID-19', 'Pneumonia'], urgency: 'medium' },
  'sore throat': { diseases: ['Pharyngitis', 'Tonsillitis', 'Common Cold', 'Strep Throat'], urgency: 'low' },
  'body ache': { diseases: ['Influenza', 'Dengue', 'Malaria', 'Fibromyalgia'], urgency: 'medium' },
  fatigue: { diseases: ['Anemia', 'Hypothyroidism', 'Depression', 'Chronic Fatigue Syndrome', 'Diabetes'], urgency: 'low' },
  nausea: { diseases: ['Gastritis', 'Food Poisoning', 'Pregnancy', 'Migraine', 'Hepatitis'], urgency: 'medium' },
  vomiting: { diseases: ['Food Poisoning', 'Gastroenteritis', 'Appendicitis'], urgency: 'high' },
  diarrhea: { diseases: ['Gastroenteritis', 'Food Poisoning', 'Irritable Bowel Syndrome', 'Typhoid'], urgency: 'medium' },
  'stomach pain': { diseases: ['Gastritis', 'Appendicitis', 'Gastroenteritis', 'Peptic Ulcer'], urgency: 'medium' },
  'chest pain': { diseases: ['Angina', 'Heart Attack', 'Pneumonia', 'Pleuritis', 'GERD'], urgency: 'critical' },
  'shortness of breath': { diseases: ['Asthma', 'Pneumonia', 'Pulmonary Embolism', 'Heart Failure'], urgency: 'critical' },
  rash: { diseases: ['Allergic Reaction', 'Eczema', 'Dengue', 'Chickenpox', 'Measles'], urgency: 'medium' },
  dizziness: { diseases: ['Vertigo', 'Anemia', 'Hypertension', 'Dehydration', 'Hypoglycemia'], urgency: 'medium' },
  anxiety: { diseases: ['Generalized Anxiety Disorder', 'Panic Disorder', 'PTSD'], urgency: 'low' },
  insomnia: { diseases: ['Insomnia', 'Depression', 'Anxiety Disorder', 'Sleep Apnea'], urgency: 'low' },
  depression: { diseases: ['Major Depressive Disorder', 'Bipolar Disorder', 'Hypothyroidism'], urgency: 'medium' },
  'joint pain': { diseases: ['Arthritis', 'Gout', 'Lupus', 'Dengue'], urgency: 'medium' },
  'back pain': { diseases: ['Muscle Strain', 'Herniated Disc', 'Kidney Infection', 'Spondylosis'], urgency: 'low' },
  'eye pain': { diseases: ['Conjunctivitis', 'Glaucoma', 'Migraines', 'Uveitis'], urgency: 'medium' },
  runny_nose: { diseases: ['Common Cold', 'Allergic Rhinitis', 'Sinusitis', 'Influenza'], urgency: 'low' },
  congestion: { diseases: ['Sinusitis', 'Allergic Rhinitis', 'Common Cold'], urgency: 'low' },
  weakness: { diseases: ['Anemia', 'Diabetes', 'Influenza', 'Dehydration'], urgency: 'medium' },
  swelling: { diseases: ['Edema', 'Allergic Reaction', 'DVT', 'Lymphedema'], urgency: 'high' }
};

const PRECAUTIONS = {
  critical: [
    'Seek immediate medical attention or call emergency services',
    'Do not delay — go to the nearest emergency room',
    'Avoid any strenuous activity',
    'If you experience loss of consciousness, have someone call emergency services immediately'
  ],
  high: [
    'Consult a doctor within the next few hours',
    'Do not self-medicate',
    'Rest and avoid physical exertion',
    'Monitor your symptoms closely and seek help if they worsen'
  ],
  medium: [
    'Book an appointment with a campus doctor',
    'Stay hydrated and rest',
    'Avoid crowded places if you have infectious symptoms',
    'Monitor your temperature if you have a fever',
    'Take over-the-counter medication only as directed'
  ],
  low: [
    'Rest and stay hydrated',
    'You can use over-the-counter remedies',
    'Monitor your symptoms over the next 24-48 hours',
    'Book an appointment if symptoms persist beyond 3 days'
  ]
};

const URGENCY_PRIORITY = { critical: 4, high: 3, medium: 2, low: 1 };

router.post('/analyze', async (req, res) => {
  try {
    const { symptoms, additionalInfo } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one symptom' });
    }

    // Normalize symptoms to lowercase
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

    // Collect all disease candidates with frequency count
    const diseaseMap = {};
    let maxUrgency = 'low';

    for (const symptom of normalizedSymptoms) {
      // Try exact match first, then partial match
      let entry = SYMPTOM_DB[symptom];
      if (!entry) {
        const key = Object.keys(SYMPTOM_DB).find(k => symptom.includes(k) || k.includes(symptom));
        entry = key ? SYMPTOM_DB[key] : null;
      }
      if (entry) {
        // Update urgency to highest seen
        if (URGENCY_PRIORITY[entry.urgency] > URGENCY_PRIORITY[maxUrgency]) {
          maxUrgency = entry.urgency;
        }
        for (const disease of entry.diseases) {
          diseaseMap[disease] = (diseaseMap[disease] || 0) + 1;
        }
      }
    }

    // Sort diseases by frequency (most likely first), take top 4
    const predictions = Object.entries(diseaseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count], i) => ({
        disease: name,
        confidence: Math.min(95, Math.round(((count / normalizedSymptoms.length) * 100) * (1 - i * 0.15))),
        isTopMatch: i === 0
      }));

    // If no matches found
    if (predictions.length === 0) {
      return res.json({
        predictions: [{ disease: 'Unspecified Condition', confidence: 50, isTopMatch: true }],
        urgency: 'low',
        urgencyLabel: 'Low Priority',
        precautions: PRECAUTIONS.low,
        recommendation: 'Please book an appointment with a campus doctor for a proper diagnosis.',
        matchedSymptoms: normalizedSymptoms
      });
    }

    const urgencyLabel = {
      critical: 'CRITICAL — Immediate Care Required',
      high: 'High Priority — See Doctor Today',
      medium: 'Medium Priority — Schedule Appointment',
      low: 'Low Priority — Monitor & Rest'
    }[maxUrgency];

    res.json({
      predictions,
      urgency: maxUrgency,
      urgencyLabel,
      precautions: PRECAUTIONS[maxUrgency],
      recommendation: maxUrgency === 'critical' || maxUrgency === 'high'
        ? 'Please seek immediate medical attention. Book an emergency appointment now.'
        : 'Consider booking an appointment with a campus physician for proper evaluation.',
      matchedSymptoms: normalizedSymptoms,
      disclaimer: 'This is an AI-assisted heuristic analysis. It is not a medical diagnosis. Always consult a qualified physician.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET list of available symptoms for autocomplete
router.get('/symptoms-list', (req, res) => {
  res.json(Object.keys(SYMPTOM_DB));
});

module.exports = router;
