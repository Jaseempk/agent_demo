import { AgentRequest, AgentResponse } from "@/app/types/api";
import { NextResponse } from "next/server";
import { createAgent } from "./create-agent";
/**
 * Handles incoming POST requests to interact with the AgentKit-powered AI agent.
 * This function processes user messages and streams responses from the agent.
 *
 * @function POST
 * @param {Request & { json: () => Promise<AgentRequest> }} req - The incoming request object containing the user message.
 * @returns {Promise<NextResponse<AgentResponse>>} JSON response containing the AI-generated reply or an error message.
 *
 * @description Uses an existing agent or creates a new one if needed, then processes the message.
 *
 * @example
 * const response = await fetch("/api/agent", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ userMessage: input, agentName: "my-agent" }),
 * });
 */
export async function POST(
  req: Request & { json: () => Promise<AgentRequest> }
): Promise<NextResponse<AgentResponse>> {
  try {
    // 1. Extract user message and agent name from the request body
    const { userMessage, agentName = "default" } = await req.json();

    if (!userMessage) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 }
      );
    }

    // Check if we have an existing agent
    const existingAgent = global.agents.get(agentName);
    let agent;

    if (existingAgent) {
      console.log("existingAgent", existingAgent);
      // Use existing agent and its stored configuration
      console.log("Using existing agent with config:", existingAgent.config);
      agent = existingAgent.agent;

      // Log the stored configuration
      console.log("mooodeel", existingAgent.config.model);
      console.log("modelProvider", existingAgent.config.modelProvider);
      console.log("agentName", existingAgent.config.name);
    } else {
      // Create new agent with default configuration
      console.log("Creating new agent with default configuration");
      agent = await createAgent(
        {
          name: agentName,
          modelProvider: "openai",
          model: "gpt-4o-mini",
          instructions:
            "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit.",
          actionProviders: ["weth", "pyth", "wallet", "erc20", "cdpApi"],
        },
        false
      );
    }

    console.log("userMessage", userMessage);
    console.log("----------------------------------------------------");

    console.log("aaagentt", agent);

    // 3. Start streaming the agent's response
    const stream = await agent.stream(
      {
        messages: [{ content: userMessage, role: "user" }],
      },
      {
        configurable: {
          thread_id: `${agentName}-${Date.now()}`, // Unique thread ID for each conversation
        },
      }
    );

    // 4. Process the streamed response chunks into a single message
    let agentResponse = "";
    try {
      for await (const chunk of stream) {
        if ("agent" in chunk && chunk.agent?.messages?.[0]?.content) {
          agentResponse += chunk.agent.messages[0].content;
        }
      }
    } catch (streamError) {
      console.error("Error processing stream:", streamError);
      return NextResponse.json(
        { error: "Error processing agent response stream" },
        { status: 500 }
      );
    }

    // 5. Return the final response
    return NextResponse.json({ response: agentResponse });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process message";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
