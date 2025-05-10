export type AgentRequest = {
  userMessage: string;
  agentName?: string;
};

export type AgentResponse = { response?: string; error?: string };

export type ModelProvider = "openai" | "llama";

export type AgentConfig = {
  name: string;
  modelProvider: ModelProvider;
  model: string;
  instructions: string;
  actionProviders: string[];
  networkId?: string;
};
