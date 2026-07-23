export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  context_used?: string;
}

export const sendChatMessage = async (
  question: string,
  history: ChatMessage[],
  modelProvider: string
): Promise<ChatResponse> => {
  const apiUrl = import.meta.env.VITE_API_CHATBOT_URL;

  if (!apiUrl) {
    throw new Error("Missing VITE_API_CHATBOT_URL in environment variables.");
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        question,
        history,
        model_provider: modelProvider.toLowerCase().replace(/\s+/g, ""),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: ChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error communicating with AI Chatbot API:", error);
    throw error;
  }
};
