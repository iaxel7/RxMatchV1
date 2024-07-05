// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const axios = require('axios');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//middleware to check if user logged in ------ 
function ensureLoggedIn (req, res, next){
    if(!req.cookie.userID){
        return res.status(401).send('Not Logged In');
    }
    next ();
};


//route to register new user ---- 
app.post('/api/users/register', (req,res) => {
    const { username, password } = req.body;
    console.log('Register new user:', {username, password });

    pool.query('INSERT INTO Users (name, password) VALUES (?,?)', [username, password], (err,results)  => {
        if (err) {
            console.error("database insert failed", err );
            return res.status(500).json({ error:err.message });
        } 
        res.json({ message: 'User registered succesfully'});
    
    });
});

// route to login a existing user --------
app.post('/api/users/login', (req,res) => {
    const { username, password } = req.body;
    console.log("Logging in user:", { username, password });

    pool.query('SELECT * FROM Users WHERE name = ? AND password = ?', [username,password], (err, results) => {
        if (err) {
            console.error('Database query failed:', err);
            return res.status(500).json({ error: 'Internal server error', details: err.message });
        }
        if(results.length === 0){
            return res.status(401).json({ error: "Invalid username or password" });
        }
        
        // If we get here, the user was found
        // Set a cookie to indicate successful login 
        res.cookie("userId", results[0].id, { maxAge: 1000 * 60 * 60 * 24 }); // expires after 24 hours 
        res.json({ message: "Logged in successfully" });
    });
});
//connecting to database
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


// Route to save medication information for a user
app.post('/api/medication/save', (req, res) => {
    const { name, usage, adverseEffects } = req.body;
    console.log('Received request to save medication:', { name, usage, adverseEffects });
    pool.query('INSERT INTO Medrx (medication_info) VALUES (?)', [JSON.stringify({ name, usage, adverseEffects })], (err, results) => {
        if (err) {
            console.error('Database insert failed:', err);
            return res.status(500).json({ error: err.message });
        }
        const medrxId = results.insertId;
        pool.query('INSERT INTO Liked (medrx_id) VALUES (?)', [medrxId], (err, results) => {
            if (err) {
                console.error('Database insert into Liked failed:', err);
                return res.status(500).json({ error: err.message });
            }
            const likedId = results.insertId;
            pool.query('UPDATE Users SET liked_id = ? WHERE id = ?', [likedId, 1], (err) => { // Assuming user ID is 1 for now
                if (err) {
                    console.error('Database update failed:', err);
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Medication saved!' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
