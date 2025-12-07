// api/analyze.js (Vercel Serverless Function)

// 1. Import the Anthropic SDK
import { Anthropic } from "@anthropic-ai/sdk";

// 2. SECURE: This initializes Anthropic using the key hidden in Vercel's environment variables.
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 3. Define the consistent prompt for Claude
const ANALYSIS_PROMPT = `Analyze this trading chart image. Provide a structured analysis with:

1. TREND DIRECTION: (Bullish/Bearish/Ranging)
2. SWING HIGHS & LOWS: Identify key levels
3. FAIR VALUE GAPS: Any imbalances detected?
4. BREAK OF STRUCTURE: Has structure been broken?
5. BIAS: (Long/Short/Neutral)
6. ENTRY ZONE: Suggested entry price/zone
7. STOP LOSS: Suggested SL level
8. TAKE PROFIT: Suggested TP level(s)
9. CONFIDENCE: (High/Medium/Low)
10. NOTES: Any additional observations

Be concise and actionable. Focus on ICT concepts and price action.`;


// 4. The main handler function for the Vercel endpoint
export default async function handler(req, res) {
  // Ensure only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Expects the image data from the client
  const { imageData } = req.body;

  if (!imageData || !imageData.base64 || !imageData.type) {
    return res.status(400).json({ error: 'Invalid image data provided.' });
  }

  try {
    // 5. Call the Anthropic API securely
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Or the model you prefer
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          // Pass the image content
          {
            type: "image",
            source: {
              type: "base64",
              media_type: imageData.type,
              data: imageData.base64
            }
          },
          // Pass the text prompt
          { type: "text", text: ANALYSIS_PROMPT }
        ]
      }]
    });

    // 6. Extract the analysis text
    const analysis = response.content[0].text;
    
    // 7. Send only the analysis back to the front-end (key remains secret)
    res.status(200).json({ analysis });

  } catch (error) {
    console.error("Anthropic API Error:", error);
    res.status(500).json({ error: "Failed to perform AI analysis. Check Vercel logs." });
  }
}