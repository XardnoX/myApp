const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
initializeApp({
  credential: applicationDefault(),
});
const db = getFirestore();

console.log('Connected to Firestore database');

// Serve static files (for Angular app build)
const frontendBuildPath = path.join(__dirname, 'www'); // Use relative path for flexibility
app.use(express.static(frontendBuildPath));

// API Route: Fetch widgets by class
app.get('/widgets', async (req, res) => {
  const userClass = req.query.class;

  if (!userClass) {
    return res.status(400).send('Class parameter is missing');
  }

  try {
    const widgetsRef = db.collection('widgets');
    const querySnapshot = await widgetsRef.where('class', '==', userClass).get();

    if (querySnapshot.empty) {
      return res.status(404).send('No widgets found for this class');
    }

    const widgets = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(widgets);
  } catch (error) {
    console.error('Error fetching widgets:', error);
    return res.status(500).send('Server error: ' + error.message);
  }
});

// API Route: Fetch payment info for widgets by userId and widgetId
app.get('/payments', async (req, res) => {
  const userId = req.query.userId;
  const widgetId = req.query.widgetId;

  if (!userId || !widgetId) {
    return res.status(400).send('userId and widgetId parameters are required');
  }

  try {
    const paymentsRef = db.collection('user_has_widget');
    const querySnapshot = await paymentsRef
      .where('user_id', '==', db.doc(`user/${userId}`))
      .where('widget_id', '==', db.doc(`widget/${widgetId}`))
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send('No payment info found for this user and widget');
    }

    const payments = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json(payments);
  } catch (error) {
    console.error('Error fetching payment info:', error);
    return res.status(500).send('Server error: ' + error.message);
  }
});

// Route fallback: Redirect to index.html for Angular routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error loading index.html:', err);
      res.status(500).send('Error loading index.html');
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});