//lllmHandler.js
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

console.log('Initializing Google Generative AI client...');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const baseGenerationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            response: {
                type: "string"
            }
        }
    },
};

async function handleLLMRequest(systemInstruction, message) {
    console.log('Handling LLM request...');
    console.log(`System Instruction: as follows`);
    console.log(`Message: ${message}`);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction,
    });

    console.log('Starting chat session with base generation config...');
    const chatSession = model.startChat({ generationConfig: baseGenerationConfig });
    try {
        console.log('Sending message to model...');
        const result = await chatSession.sendMessage(message);

        // Log the raw response from the model
        console.log('Received response from model:', result.response.text());

        // Attempt to parse the response if it's a string
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(result.response.text());
        } catch (parseError) {
            console.error('Error parsing response JSON:', parseError.message);
            parsedResponse = result.response.text(); // Return the raw response if parsing fails
        }

        // Return the parsed or raw response
        return parsedResponse;
    } catch (error) {
        console.error('Error with the LLM request:', error);
        throw new Error('Failed to generate a response from the LLM');
    }
}

module.exports = { handleLLMRequest };
