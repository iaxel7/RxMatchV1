// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const axios = require('axios');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const { Translate } = require('@google-cloud/translate').v2;
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});
// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// Middleware to check if user is logged in
function ensureLoggedIn(req, res, next) {
  if (!req.cookies.userID) {
    return res.status(401).send('Not Logged In');
  }
  next();
}

// Google Translate setup
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if(!credentialsPath || ! fs.existsSync(credentialsPath)){
    console.error ('GOOGLE_APPLICATION_CREDENTIALS enviroment variable is not set or fle name does not exist');
    process.exit(1);
}
  
  const translate = new Translate({keyFilename: credentialsPath});
  // Route to handle translation request
  app.post('/translate', async (req, res) => {
    const { text, target } = req.body;
    console.log(`Received translation request for text: "${text}" to target language: "${target}"`);
    try {
      const [translation] = await translate.translate(text, target);
      console.log('Sending translated text:', translation);
      res.json({ translatedText: translation });
    } catch (error) {
      console.error('Error during translation:', error);
      res.status(500).send(error.toString());
    }
  });
// Route to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/HomePage-Diana/index.html'));
});
// Route to register a new user
app.post('/api/users/register', (req, res) => {
  const { username, password } = req.body;
  console.log('Register new user:', { username, password });
  pool.query('INSERT INTO Users (name, password) VALUES (?, ?)', [username, password], (err, results) => {
    if (err) {
      console.error("Database insert failed", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User registered successfully' });
  });
});
// Route to login an existing user
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  console.log("Logging in user:", { username, password });
  pool.query('SELECT * FROM Users WHERE name = ? AND password = ?', [username, password], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // If we get here, the user was found
    // Set a cookie to indicate successful login
    res.cookie("userId", results[0].id, { maxAge: 1000 * 60 * 60 * 24 }); // expires after 24 hours
    res.json({ message: "Logged in successfully", redirectUrl: '/match/match.html' });
  });
});
// Connecting to the database
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
  console.log('Database connected!');
  connection.release();
});
// Helper function to summarize adverse effects
const summarizeAdverseEffects = (text) => {
  if (!text) return 'No adverse effects information available';
  // Split the text into sentences and return the first sentence
  const sentences = text.split('. ');
  return sentences[0] + (sentences.length > 1 ? '.' : '');
};
// Route to search for medication based on illness
app.get('/api/medication/search', async (req, res) => {
  const { illness } = req.query;
  console.log('Received request to search medications for illness:', illness);
  try {
    const apiKey = process.env.FDA_API_KEY;
    console.log('Using FDA API Key:', apiKey); // Log the API key (ensure this is safe in your environment)
    const response = await axios.get(`https://api.fda.gov/drug/label.json?search=indications_and_usage:${illness}&api_key=${apiKey}`);
    console.log('FDA API response:', response.data);
    const medications = response.data.results.map(med => ({
      name: med.openfda.brand_name ? med.openfda.brand_name.join(', ') : (med.openfda.generic_name ? med.openfda.generic_name.join(', ') : 'Unknown'),
      usage: med.indications_and_usage ? med.indications_and_usage[0] : 'No usage information available',
      adverse_effects: summarizeAdverseEffects(med.adverse_reactions ? med.adverse_reactions[0] : '')
    }));
    res.json(medications);
  } catch (error) {
    console.error('Error fetching data from FDA API:', error);
    res.status(500).json({ error: error.message });
  }
});
// Route to handle contact form submission
app.post('/api/contact', (req, res) => {
  console.log('Received contact form submission:', req.body);
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'All fields are required' });
  }
  pool.query('INSERT INTO Contact_Form (name, email, message) VALUES (?, ?, ?)', [name, email, message], (err) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Contact form submitted successfully');
    res.status(201).json({ message: 'Contact form submitted successfully!' });
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
