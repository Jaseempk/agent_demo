// Declare global agents map at the top of the file
declare global {
  // eslint-disable-next-line no-var
  var agents: Map<
    string,
    {
      agent: ReturnType<typeof createReactAgent>;
      config: AgentConfig;
    }
  >;
}

// Initialize the global map if it doesn't exist
if (!global.agents) {
  global.agents = new Map();
}

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { prepareAgentkitAndWalletProvider } from "./prepare-agentkit";
import { AgentConfig } from "@/app/types/api";
import { createModel } from "@/app/utils/model-factory";

/**
 * Agent Configuration Guide
 *
 * This file handles the core configuration of your AI agent's behavior and capabilities.
 *
 * Key Steps to Customize Your Agent:
 *
 * 1. Select your LLM:
 *    - Modify the model factory to choose your preferred LLM
 *    - Configure model parameters like temperature and max tokens
 *
 * 2. Instantiate your Agent:
 *    - Pass the LLM, tools, and memory into `createReactAgent()`
 *    - Configure agent-specific parameters
 */

// Default config
const defaultConfig: AgentConfig = {
  name: "default",
  modelProvider: "openai",
  model: "gpt-4o-mini",
  instructions:
    "You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit.",
  actionProviders: ["weth", "pyth", "wallet", "erc20", "cdpApi"],
};

/**
 * Creates a new agent instance with the given configuration
 * This function handles the actual initialization of an agent with fresh LLM and tools
 */
async function initializeAgent(agentConfig: AgentConfig) {
  if (!agentConfig.ownerAddress) {
    throw new Error("Owner address is required for agent initialization");
  }

  const { agentkit, walletProvider } = await prepareAgentkitAndWalletProvider(
    agentConfig.name,
    agentConfig.ownerAddress,
    agentConfig.networkId || "base-sepolia"
  );

  console.log("Initializing agent with config:", {
    modelProvider: agentConfig.modelProvider,
    model: agentConfig.model,
  });

  // Initialize LLM with the requested model provider and model
  const llm = createModel(agentConfig.modelProvider, agentConfig.model);
  const tools = await getLangChainTools(agentkit);
  const memory = new MemorySaver();

  // Initialize Agent
  const canUseFaucet = walletProvider.getNetwork().networkId == "base-sepolia";
  const faucetMessage = `If you ever need funds, you can request them from the faucet.`;
  const cantUseFaucetMessage = `If you need funds, you can provide your wallet details and request funds from the user.`;

  return createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      ${agentConfig.instructions} You are 
      empowered to interact onchain using your tools. ${
        canUseFaucet ? faucetMessage : cantUseFaucetMessage
      }.
      Before executing your first action, get the wallet details to see what network 
      you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
      asks you to do something you can't do with your currently available tools, you must say so, and 
      encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
      docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
      restating your tools' descriptions unless it is explicitly requested.
      `,
  });
}

/**
 * Initializes and returns an instance of the AI agent.
 * If an agent with the given name exists, reinitializes it with the stored configuration.
 *
 * @function createAgent
 * @param {AgentConfig} config - Optional configuration for the agent
 * @param {boolean} overwrite - Whether to overwrite an existing agent with the same name
 * @returns {Promise<ReturnType<typeof createReactAgent>>} The initialized AI agent.
 *
 * @description Handles agent setup and reinitialization
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function createAgent(
  config: AgentConfig = defaultConfig,
  overwrite: boolean = false
): Promise<ReturnType<typeof createReactAgent>> {
  // Ensure config has all necessary fields
  const agentConfig = {
    ...defaultConfig,
    ...config,
    name: config.name || defaultConfig.name,
    modelProvider: config.modelProvider || defaultConfig.modelProvider,
    model: config.model || defaultConfig.model,
    instructions: config.instructions || defaultConfig.instructions,
    actionProviders: config.actionProviders?.length
      ? config.actionProviders
      : defaultConfig.actionProviders,
  };

  const name = agentConfig.name;
  console.log("Processing agent:", name);
  console.log("Has existing agent:", global.agents.has(name));
  console.log("Overwrite:", overwrite);

  try {
    // If agent exists and we're not overwriting
    if (!overwrite && global.agents.has(name)) {
      console.log("Found existing agent, reinitializing with stored config");
      const stored = global.agents.get(name)!;
      console.log("Using stored config:", stored.config);

      // Create a fresh agent instance with the stored configuration
      const agent = await initializeAgent(stored.config);

      // Update the stored agent while keeping the original config
      global.agents.set(name, { agent, config: stored.config });
      return agent;
    }

    // Create new agent
    console.log("Creating new agent with config:", agentConfig);
    const agent = await initializeAgent(agentConfig);

    // Store both agent and its config
    global.agents.set(name, { agent, config: agentConfig });
    console.log("Stored new agent with config in global store");
    return agent;
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
