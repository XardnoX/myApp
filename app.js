const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const path = require('path'); 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection 
const connection = mysql.createConnection({
  host: 'sql6.webzdarma.cz',
  user: 'databasepokl4563',
  password: 'databasepokl4563',
  database: 'Databasepokladna.1',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
 
const frontendBuildPath = path.join('D:/projekty/ionic/myApp/www');
app.use(express.static(frontendBuildPath));

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// API Route: Fetch widgets by class
app.get('/widgets', (req, res) => {
  const userClass = req.query.class;

  if (!userClass) {
    return res.status(400).send('Class parameter is missing');
  }

  const query = 'SELECT * FROM widget WHERE class = ?';
  connection.query(query, [userClass], (error, results) => {
    if (error) {
      return res.status(500).send('Server error: ' + error.message);
    }

    if (results.length > 0) {
      return res.json(results);
    } else {
      return res.status(404).send('No widgets found for this class');
    }
  });
});

// Route fallback: Redirect to index.html for Angular routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err.message);
    }
  });
});

// Start the backend server
const PORT = 8100;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
