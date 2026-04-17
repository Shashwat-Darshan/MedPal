// ai_speed_test.js
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY;

const prompt = 'what is red and doctors are afraid from it  ?';

async function testGemini() {
  if (!GEMINI_API_KEY) return { error: 'No VITE_GEMINI_API_KEY set.' };
  const start = Date.now();
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const modelName = "gemini-2.5-pro";
    console.log('[Gemini] Model:', modelName);
    console.log('[Gemini] Prompt:', prompt);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { time: Date.now() - start, text };
  } catch (e) {
    return { error: e.message };
  }
}

async function testGroq() {
  if (!GROQ_API_KEY) return { error: 'No VITE_GROQ_API_KEY set.' };
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const models = ['llama3-70b-8192', 'llama3-8b-8192'];
  for (const model of models) {
    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 256,
      top_p: 0.8,
      stream: false
    };
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || JSON.stringify(data);
      // Check for rate/capacity error
      if (data.error && (data.error.message?.includes('rate limit') || data.error.message?.includes('capacity'))) {
        console.log(`[Groq] Model ${model} failed due to rate/capacity. Trying next model...`);
        continue;
      }
      return { time: Date.now() - start, text };
    } catch (e) {
      // If network or other error, try next model
      console.log(`[Groq] Model ${model} failed with error:`, e.message);
      continue;
    }
  }
  return { error: 'All Groq models failed or rate/capacity exceeded.' };
}

async function testAllProviders() {
  const results = [];

  // Gemini
  if (!GEMINI_API_KEY) {
    results.push({ provider: 'gemini', error: 'No VITE_GEMINI_API_KEY set.' });
  } else {
    const start = Date.now();
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const modelName = "gemini-2.5-pro";
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      results.push({ provider: 'gemini', time: Date.now() - start, text });
    } catch (e) {
      results.push({ provider: 'gemini', error: e.message });
    }
  }

  // Groq models
  const groqModels = ['llama3-70b-8192', 'llama3-8b-8192'];
  for (const model of groqModels) {
    if (!GROQ_API_KEY) {
      results.push({ provider: `groq (${model})`, error: 'No VITE_GROQ_API_KEY set.' });
      continue;
    }
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 256,
      top_p: 0.8,
      stream: false
    };
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || JSON.stringify(data);
      results.push({ provider: `groq (${model})`, time: Date.now() - start, text });
    } catch (e) {
      results.push({ provider: `groq (${model})`, error: e.message });
    }
  }

  // Print summary
  console.log('\n--- AI Provider Speed Test Results ---');
  for (const r of results) {
    if (r.error) {
      console.log(`${r.provider}: ERROR: ${r.error}`);
    } else {
      console.log(`${r.provider}: Time: ${r.time}ms | Response: ${r.text.slice(0, 200)}`);
    }
  }
}

(async () => {
  await testAllProviders();
})();
