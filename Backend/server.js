// server.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const llmRoutes = require('./routes/llmRoutes');

const app = express();

// Middleware
app.use(helmet()); // Security middleware
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // HTTP request logging
app.use(express.json()); // Parse JSON bodies

// Use LLM routes
app.use('/api/llm', llmRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});