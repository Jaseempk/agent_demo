import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ModelProvider } from "../types/api";

// Configuration for Ollama/Llama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

// OpenAI models
const OPENAI_MODELS = [
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gpt-4o", name: "GPT-4o" },
];

// Llama models
const LLAMA_MODELS = [
  { id: "llama3", name: "Llama 3" },
  { id: "llama3:8b", name: "Llama 3 (8B)" },
  { id: "llama3:70b", name: "Llama 3 (70B)" },
];

/**
 * Get available models for a given provider
 */
export function getAvailableModels(provider: ModelProvider) {
  return provider === "openai" ? OPENAI_MODELS : LLAMA_MODELS;
}

/**
 * Creates the appropriate chat model based on the specified provider and model
 *
 * @param provider The model provider (openai or llama)
 * @param model The specific model to use
 * @returns A LangChain chat model instance
 */
export function createModel(
  provider: ModelProvider,
  model: string
): BaseChatModel {
  console.log(`Creating ${provider} model: ${model}`);

  if (provider === "openai") {
    return new ChatOpenAI({
      model: model,
      temperature: 0,
      openAIApiKey:
        process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
        process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
  } else {
    // Use Ollama for Llama models
    return new ChatOllama({
      baseUrl: OLLAMA_BASE_URL,
      model: model,
      temperature: 0,
    });
  }
}
