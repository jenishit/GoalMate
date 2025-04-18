import axios from 'axios';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
console.log("API KEY:", process.env.REACT_APP_OPENAI_API_KEY);

export async function getRoadmapFromOpenAI(topic, maxRetries = 5, initialDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Using a less expensive model
          messages: [
            {
              role: 'user',
              content: `Give me a step-by-step roadmap for: ${topic}. Format it as a numbered list.`,
            },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      
      const message = response.data.choices[0].message.content;
      const steps = message
        .split('\n')
        .filter((line) => line.match(/^\d+\./))
        .map((line) => line.replace(/^\d+\.\s*/, '').trim());
      
      return steps;
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Calculate delay for this specific attempt
        const currentDelay = initialDelay * Math.pow(2, attempt);
        
        console.log(`Rate limited. Attempt ${attempt + 1}/${maxRetries}. Waiting ${currentDelay}ms before retry.`);
        
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        
        // Continue to next iteration - the delay calculation happens fresh each time
      } else {
        // For other errors, don't retry
        throw error;
      }
    }
  }
  
  throw new Error('Maximum retry attempts reached. Please try again later.');
}
