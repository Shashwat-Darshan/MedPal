const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { handleLLMRequest } = require('../utils/llmHandler');

// Read system instructions from the JSON file in the 'utils' directory
const routesConfigPath = path.join(__dirname, '../utils/routesConfig.json');
console.log('Loading system instructions from:', routesConfigPath);
const systemInstructions = JSON.parse(fs.readFileSync(routesConfigPath, 'utf8'));

// Generic route handler function
const createLLMRoute = (routeName, systemInstruction, paramsHandler) => async (req, res) => {
  console.log(`Received request for route: /${routeName}`);
  console.log(`Request Body: ${JSON.stringify(req.body)}`);

  try {
    // Extract parameters using the paramsHandler function
    const params = paramsHandler(req.body);
    console.log(`Extracted parameters for ${routeName}:`, params);

    // Send request to LLM and get the response
    console.log(`Sending request to handleLLMRequest with parameters:`, params);
    const response = await handleLLMRequest(systemInstruction, ...params);
    
    console.log('Response from handleLLMRequest:', response);

    // Send the response back to the client
    res.json({ response });
  } catch (error) {
    console.error('Error handling LLM request:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Define how to extract parameters from the request body for each route
const paramsHandlers = {
  cdsHelper: (body) => [body.transcript],
  clinicalNote: (body) => [body.transcript, body.input],
  cdsHelperddx: (body) => [body.transcript],
  cdsHelperQA: (body) => [body.transcript],
  PatientInstruction: (body) => [body.history, body.input, body.doc_summary],
};

// Create routes using the dynamic system instructions
console.log('Creating routes based on system instructions...');
Object.entries(systemInstructions).forEach(([route, { systemInstruction, message }]) => {
  console.log(`Creating route /${route} `);

  // Update the route handler for each route with the correct systemInstruction and params handler
  router.post(`/${route}`, createLLMRoute(route, systemInstruction, paramsHandlers[route]));
});

console.log('All routes created successfully.');

module.exports = router;
