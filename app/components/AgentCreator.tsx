"use client";

import { useState, useEffect } from "react";
import { AgentConfig, ModelProvider } from "../types/api";
import { getAvailableModels } from "../utils/model-factory";
import { useAccount } from "wagmi";
import { useArcaContract } from "../hooks/useArcaContract";
import { ConnectKitButton } from "connectkit";
import { useSession, signIn } from "next-auth/react";
import { config } from "../providers";
import { getAccount } from "@wagmi/core";

export default function AgentCreator() {
  const { data: session } = useSession();
  const { isConnected } = useAccount();
  const { createAgent: createAgentOnChain } = useArcaContract();

  const [isCreating, setIsCreating] = useState(false);
  const [configg, setConfig] = useState<AgentConfig>({
    name: "",
    modelProvider: "openai",
    model: "gpt-4o-mini",
    instructions: "",
    actionProviders: ["wallet", "erc20"],
  });
  const [overwrite, setOverwrite] = useState(false);
  const [message, setMessage] = useState("");
  const [availableModels, setAvailableModels] = useState(
    getAvailableModels("openai")
  );

  const account = getAccount(config);

  // Update available models when provider changes
  useEffect(() => {
    setAvailableModels(getAvailableModels(configg.modelProvider));

    // Set first model of the selected provider as default
    const models = getAvailableModels(configg.modelProvider);
    if (models.length > 0 && !models.find((m) => m.id === configg.model)) {
      setConfig({
        ...configg,
        model: models[0].id,
      });
    }
  }, [configg.modelProvider]);

  const handleCreateAgent = async () => {
    if (!configg.name.trim()) {
      setMessage("Agent name is required");
      return;
    }

    if (!isConnected) {
      setMessage("Please connect your wallet first");
      return;
    }

    if (!session?.user?.address) {
      await signIn("credentials", {
        address: account.address,
        redirect: false,
      });
      return;
    }

    setIsCreating(true);
    setMessage("");

    try {
      // First create the agent in the backend
      const response = await fetch("/api/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            ...configg,
            ownerAddress: session.user.address,
            networkId: "base-sepolia",
          },
          overwrite,
        }),
      });

      const data = await response.json();
      console.log("daata:", data);

      if (data.success) {
        // Get the agent's smart wallet address
        const walletResponse = await fetch(
          `/api/agent/wallet?agentName=${encodeURIComponent(configg.name)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const walletData = await walletResponse.json();

        console.log("Wallet data:", walletData);
        console.log(
          "walletData.smartWalletAddress",
          walletData.wallet.smartWalletAddress
        );

        if (!walletData.wallet.smartWalletAddress) {
          throw new Error("Failed to get agent's smart wallet address");
        }

        // Then create the agent on-chain using the smart wallet address
        try {
          const txHash = await createAgentOnChain(
            configg.name,
            walletData.wallet.smartWalletAddress, // Use the agent's smart wallet address
            0 // Initial reputation score
          );

          setMessage(`Agent created successfully! Transaction hash: ${txHash}`);

          // Add message about paymaster if enabled
          if (process.env.NEXT_PUBLIC_USE_PAYMASTER === "true") {
            setMessage(
              (prevMessage) => `${prevMessage} (Gas sponsored by paymaster)`
            );
          }

          // Store the agent name in localStorage
          try {
            const storedAgents = localStorage.getItem("availableAgents");
            const agentList: string[] = storedAgents
              ? JSON.parse(storedAgents)
              : [];

            if (!agentList.includes(configg.name)) {
              agentList.push(configg.name);
              localStorage.setItem(
                "availableAgents",
                JSON.stringify(agentList)
              );
            }
          } catch (e) {
            console.error("Error storing agent in localStorage:", e);
          }

          // Clear form after successful creation
          setConfig({
            ...configg,
            name: "",
            instructions: "",
          });
          setOverwrite(false);
        } catch (error) {
          console.error("On-chain agent creation error:", error);
          setMessage("Failed to create agent on-chain. Please try again.");
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error: unknown) {
      console.error("Agent creation error:", error);
      setMessage("Failed to create agent. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleModelProviderChange = (provider: ModelProvider) => {
    setConfig({
      ...configg,
      modelProvider: provider,
      // Reset model selection when changing providers
      model: getAvailableModels(provider)[0]?.id || "",
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create New Agent</h2>
        <ConnectKitButton />
      </div>

      <div className="space-y-4">
        {!isConnected && (
          <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
            Please connect your wallet to create an agent
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            value={configg.name}
            onChange={(e) => setConfig({ ...configg, name: e.target.value })}
            placeholder="my-agent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the unique identifier for your agent. Agents with the same
            name will be reused unless overwrite is checked.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Model Provider
          </label>
          <div className="flex space-x-4 mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={configg.modelProvider === "openai"}
                onChange={() => handleModelProviderChange("openai")}
                name="modelProvider"
              />
              <span>OpenAI</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={configg.modelProvider === "llama"}
                onChange={() => handleModelProviderChange("llama")}
                name="modelProvider"
              />
              <span>Llama (via Ollama)</span>
            </label>
          </div>

          {configg.modelProvider === "llama" && (
            <p className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mb-2">
              Note: Using Llama models requires running Ollama locally or
              configuring OLLAMA_BASE_URL in your environment variables.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
            value={configg.model}
            onChange={(e) => setConfig({ ...configg, model: e.target.value })}
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Instructions</label>
          <textarea
            className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600 h-24"
            value={configg.instructions}
            onChange={(e) =>
              setConfig({ ...configg, instructions: e.target.value })
            }
            placeholder="You are a helpful agent that can interact with blockchain..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Action Providers
          </label>
          <div className="flex flex-wrap gap-2">
            {["wallet", "erc20", "weth", "pyth", "cdpApi"].map((provider) => (
              <label key={provider} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configg.actionProviders.includes(provider)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig({
                        ...configg,
                        actionProviders: [...configg.actionProviders, provider],
                      });
                    } else {
                      setConfig({
                        ...configg,
                        actionProviders: configg.actionProviders.filter(
                          (p) => p !== provider
                        ),
                      });
                    }
                  }}
                />
                <span>{provider}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="mr-2"
          />
          <label
            htmlFor="overwrite"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Overwrite if agent with this name already exists
          </label>
        </div>

        <button
          onClick={handleCreateAgent}
          disabled={isCreating || !configg.name}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            isCreating || !configg.name
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-[#0052FF] hover:bg-[#003ECF] text-white shadow-md"
          }`}
        >
          {isCreating ? "Creating..." : "Create Agent"}
        </button>

        {message && (
          <div
            className={`p-2 rounded ${
              message.includes("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
