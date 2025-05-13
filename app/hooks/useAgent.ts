import { useState, useEffect, useCallback } from "react";
import { AgentRequest, AgentResponse } from "../types/api";

// WebSocket connection state
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

/**
 * Establishes a WebSocket connection to the agent backend
 */
function establishWebSocketConnection(agentName: string) {
  if (ws?.readyState === WebSocket.OPEN) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/api/agent/ws?agentName=${agentName}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WebSocket connection established");
    reconnectAttempts = 0;
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed");
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        establishWebSocketConnection(agentName);
      }, RECONNECT_DELAY);
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return ws;
}

/**
 * Fallback HTTP request when WebSocket is not available
 */
async function fallbackToHttp(
  userMessage: string,
  agentName: string
): Promise<string | null> {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage, agentName } as AgentRequest),
  });

  const data = (await response.json()) as AgentResponse;
  return data.response ?? data.error ?? null;
}

/**
 * Sends a user message to the AgentKit backend API and retrieves the agent's response.
 *
 * @async
 * @function messageAgent
 * @param {string} userMessage - The message sent by the user.
 * @param {string} agentName - The name of the agent to use.
 * @returns {Promise<string | null>} The agent's response message or `null` if an error occurs.
 *
 * @throws {Error} Logs an error if the request fails.
 */
async function messageAgent(
  userMessage: string,
  agentName: string = "default"
): Promise<string | null> {
  try {
    // Try WebSocket first if available
    if (ws?.readyState === WebSocket.OPEN) {
      return new Promise((resolve) => {
        const messageId = Date.now().toString();

        const handleResponse = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.id === messageId) {
              ws?.removeEventListener("message", handleResponse);
              resolve(data.response ?? data.error ?? null);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws?.addEventListener("message", handleResponse);

        ws?.send(
          JSON.stringify({
            id: messageId,
            type: "message",
            userMessage,
            agentName,
          })
        );

        // Fallback to HTTP after timeout
        setTimeout(() => {
          ws?.removeEventListener("message", handleResponse);
          fallbackToHttp(userMessage, agentName).then(resolve);
        }, 5000);
      });
    }

    // Fallback to HTTP
    return await fallbackToHttp(userMessage, agentName);
  } catch (error) {
    console.error("Error communicating with agent:", error);
    return null;
  }
}

/**
 *
 * This hook manages interactions with the AI agent by making REST calls to the backend.
 * It also stores the local conversation state, tracking messages sent by the user and
 * responses from the agent.
 *
 * #### How It Works
 * - `sendMessage(input)` sends a message to `/api/agent` and updates state.
 * - `messages` stores the chat history.
 * - `isThinking` tracks whether the agent is processing a response.
 *
 * #### See Also
 * - The API logic in `/api/agent.ts`
 *
 * @param {string} agentName - Optional name of the agent to use, defaults to "default"
 * @returns {object} An object containing:
 * - `messages`: The conversation history.
 * - `sendMessage`: A function to send a new message.
 * - `isThinking`: Boolean indicating if the agent is processing a response.
 * - `setActiveAgent`: Function to change the active agent.
 */
export function useAgent(initialAgentName: string = "default") {
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "agent" }[]
  >([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgent, setActiveAgent] = useState(initialAgentName);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = establishWebSocketConnection(activeAgent);

    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [activeAgent]);

  /**
   * Sends a user message, updates local state, and retrieves the agent's response.
   *
   * @param {string} input - The message from the user.
   */
  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setIsThinking(true);
      setConnectionStatus("connecting");

      try {
        const responseMessage = await messageAgent(input, activeAgent);

        if (responseMessage) {
          setMessages((prev) => [
            ...prev,
            { text: responseMessage, sender: "agent" },
          ]);
          setConnectionStatus("connected");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setConnectionStatus("disconnected");
      } finally {
        setIsThinking(false);
      }
    },
    [activeAgent]
  );

  /**
   * Changes the active agent and clears the chat history.
   *
   * @param {string} agentName - The name of the agent to switch to.
   */
  const switchAgent = useCallback((agentName: string) => {
    setActiveAgent(agentName);
    setMessages([]);
    setConnectionStatus("connecting");

    // Re-establish WebSocket connection for new agent
    if (ws?.readyState === WebSocket.OPEN) {
      ws.close();
    }
    establishWebSocketConnection(agentName);
  }, []);

  return {
    messages,
    sendMessage,
    isThinking,
    activeAgent,
    switchAgent,
    connectionStatus,
  };
}
