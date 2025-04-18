import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function getRoadmapFromGemini(topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Give me a step-by-step roadmap for: ${topic}. Format it as a numbered list.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  const steps = response
    .split('\n')
    .filter(line => /^\d+[). \t]/.test(line)) // No backslash before )
    .map(line =>
        line
          .replace(/^\d+[). \t]/, '')   // remove the numbering
          .replace(/^\*\*(.*?)\*\*$/, '$1')  // remove surrounding ** if present
          .trim()
      ); // No backslash before )

  return steps;
}
