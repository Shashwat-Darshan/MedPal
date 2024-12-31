// server.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');

const llmRoutes = require('./routes/llmRoutes');



const app = express();
app.use(express.json());

// Use LLM routes
app.use('/api/llm', llmRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});