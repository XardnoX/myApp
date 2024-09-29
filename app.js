const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

// Use CORS middleware to allow communication between frontend and backend
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// MySQL connection (replace with your actual MySQL credentials)
const connection = mysql.createConnection({
  host: 'sql6.webzdarma.cz',
  user: 'databasepokl4563',
  password: 'databasepokl4563',
  database: 'Databasepokladna.1'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route to fetch widgets by class
app.get('/widgets', (req, res) => {
  const userClass = req.query.class;  // Get the class from the query parameter
  
  if (!userClass) {
    return res.status(400).send('Class parameter is missing');
  }

  // Query to fetch widgets based on class
  const query = 'SELECT * FROM widget WHERE class = ?';
  connection.query(query, [userClass], (error, results) => {
    if (error) {
      return res.status(500).send('Server error: ' + error.message);
    }

    if (results.length > 0) {
      return res.json(results);  // Return the widgets in JSON format
    } else {
      return res.status(404).send('No widgets found for this class');
    }
  });
});

// Start the backend server
const PORT = 3306;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://pma6.webzdarma.cz:${PORT}`);
});
