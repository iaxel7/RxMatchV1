
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file
// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON bodies and serve static files
app.use(bodyParser.json());
app.use(express.static('public'));
// Set up the MySQL database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
// Check the database connection
pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log('Database connected!');
    connection.release();
});
// Authentication middleware to protect routes
const authenticate = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied' });
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
// Route to handle user registration
app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    // Hash the password before saving it to the database
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: err.message });
        // Insert the new user into the Users table
        pool.query('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hash], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'User created!' });
        });
    });
});
// Route to handle user login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    // Find the user by username
    pool.query('SELECT * FROM Users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        const user = results[0];
        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, user.password, (err, match) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!match) return res.status(401).json({ message: 'Invalid credentials' });
            // Generate a JWT token
            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

//Route to search for medications related to a specified medication
app.get('/api/medication/related', authenticate, async (req, res) => {
    const { medication } = req.query;
    try {
        // Fetch related medication data from the FDA API
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:${medication}+OR+openfda.generic_name:${medication}&api_key=${process.env.FDA_API_KEY}`);
        // Extract related medication names from the API response
        const relatedMedications = response.data.results.map(med => med.openfda.brand_name || med.openfda.generic_name);
        res.json(relatedMedications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Route to search for medication based on illness
app.get('/api/medication/search', authenticate, async (req, res) => {
    const { illness } = req.query;
    try {
        // Fetch medication data from the FDA API
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=indications_and_usage:${illness}&api_key=${process.env.FDA_API_KEY}`);
        // Extract medication names from the API response
        const medications = response.data.results.map(med => med.openfda.brand_name || med.openfda.generic_name);
        res.json(medications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Route to save medication information for a user
app.post('/api/medication/save', authenticate, (req, res) => {
    const { medicationInfo } = req.body;
    // Insert the medication info into the Medrx table
    pool.query('INSERT INTO Medrx (medication_info) VALUES (?)', [medicationInfo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const medrxId = results.insertId;
        // Insert a new record into the History table with the medication ID
        pool.query('INSERT INTO Liked (medrx_id) VALUES (?)', [medrxId], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            const likedId = results.insertId;
            // Update the user's history ID in the Users table
            pool.query('UPDATE Users SET liked_id = ? WHERE id = ?', [liked_, req.user.id], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Medication saved!' });
            });
        });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});