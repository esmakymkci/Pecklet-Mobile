interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

interface ChatbotResponse {
  text: string;
}

import { Platform } from 'react-native';

// Get the appropriate base URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4111';
  }

  // For mobile devices, we need to use the computer's IP address
  // You can find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
  // Replace this with your actual IP address
  // TODO: Update this IP address to match your computer's IP
  const COMPUTER_IP = '192.168.162.145'; // ⚠️ CHANGE THIS TO YOUR COMPUTER'S IP ADDRESS
  return `http://${COMPUTER_IP}:4111`;
};

export const sendChatMessage = async (message: string): Promise<string> => {
  try {
    console.log('Sending message to chatbot:', message);

    const baseUrl = getBaseUrl();
    const endpoint = `${baseUrl}/api/agents/weatherAgent/generate`;

    console.log('Using endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      }),
    });

    console.log('Chatbot response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatbotResponse = await response.json();
    console.log('Chatbot response data:', data);

    return data.text || 'Sorry, I could not process your message.';
  } catch (error) {
    console.error('Chatbot API error:', error);

    // Return a helpful fallback message with platform-specific instructions
    const platformInstructions = Platform.OS === 'web'
      ? 'localhost:4111'
      : 'your computer\'s IP address (currently set to 192.168.1.100)';

    return `I'm having trouble connecting to the language assistant service right now.

This could be because:
• The chatbot service at ${platformInstructions} is not running
• There's a network connectivity issue
• The API endpoint is temporarily unavailable
${Platform.OS !== 'web' ? '• Your computer\'s IP address may have changed (update it in chatbot-service.ts)' : ''}

Please check that your chatbot service is running and try again. In the meantime, you can still use other features of the app like quizzes and word lists!`;
  }
};

export type { ChatMessage };
