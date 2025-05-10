import { NextResponse } from "next/server";
import { createAgent } from "../create-agent";
import { AgentConfig } from "@/app/types/api";

/**
 * Handles incoming POST requests to create a new AgentKit-powered AI agent.
 * This function processes the agent configuration and creates a new agent instance.
 *
 * @function POST
 * @param {Request & { json: () => Promise<{ config: AgentConfig, overwrite?: boolean }> }} req - The incoming request object containing the agent configuration.
 * @returns {Promise<NextResponse>} JSON response indicating success or failure.
 */
export async function POST(
  req: Request & {
    json: () => Promise<{ config: AgentConfig; overwrite?: boolean }>;
  }
): Promise<NextResponse> {
  try {
    const { config, overwrite = false } = await req.json();
    console.log("config", config);

    // Validate required fields
    if (!config.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Agent name is required",
        },
        { status: 400 }
      );
    }

    // Create a new agent with the provided configuration
    await createAgent(config, overwrite);

    return NextResponse.json({
      success: true,
      message: "Agent created successfully",
      agentName: config.name,
    });
  } catch (error) {
    console.error("Error creating agent:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to create agent: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}
