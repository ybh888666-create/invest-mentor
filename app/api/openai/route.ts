import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Create an OpenAI API client compatible with Manus API
const openai = new OpenAI({
  baseURL: "https://api.manus.im/v1",
  apiKey: "placeholder", // Manus reads the actual API key from the header
  defaultHeaders: {
    "API_KEY": process.env.MANUS_API_KEY || "", // Ensure this is set in your environment
  },
});

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the messages and other parameters from the body
  const { messages, experienceLevel, learningStyle } = await req.json();
  
  console.log("Messages received:", messages.length);
  console.log("User Context:", { experienceLevel, learningStyle });

  // Use the specified AI Mentor API (a039bbc6-80cf-4e14-805d-b455695345db)
  // Note: Based on Manus documentation, we use the model field to specify the agent/mentor ID
  const response = await openai.chat.completions.create({
    model: "a039bbc6-80cf-4e14-805d-b455695345db",
    messages: [
      {
        role: "system",
        content: `
You are InvestMentor, a professional investment education assistant. 
Your goal is to provide personalized guidance based on the user's profile.

USER PROFILE:
- Experience Level: ${experienceLevel}
- Learning Style: ${learningStyle}

ADAPTATION RULES:
1. If "simple": Use plain language and everyday analogies.
2. If "scenario": Use realistic investment examples and "what-if" cases.
3. If "terminology": Focus on precise definitions and technical context.

IMPORTANT:
- Do not provide specific financial advice or product recommendations.
- Keep responses structured and educational.
- Use plain text only, no markdown formatting (no asterisks, hashtags, etc.).
`
      },
      ...messages,
    ],
    stream: true,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
