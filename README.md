# Onchain Agent Powered by AgentKit

This project integrates [AgentKit](https://github.com/coinbase/agentkit) to provide AI-driven interactions with on-chain capabilities. It now supports both OpenAI and Llama models.

## Getting Started

First, install dependencies:

```sh
npm install
```

Then, configure your environment variables:

```sh
cp .env.local .env
```

Edit `.env` to add your API keys and configuration.

Run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the project.

## Paymaster Integration

This project now includes paymaster functionality for gas-sponsored transactions when creating agents on-chain. This means users don't need to pay gas fees when registering new agents.

To configure the paymaster:

1. Set the following environment variables in your `.env.local` file:

   ```
   NEXT_PUBLIC_USE_PAYMASTER=true
   NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
   NEXT_PUBLIC_SIGNER_PRIVATE_KEY=your_signer_private_key_here
   ```

2. Ensure you have the `permissionless` package installed:
   ```
   npm install permissionless --legacy-peer-deps
   ```

For more details, see [PAYMASTER_INTEGRATION.md](./PAYMASTER_INTEGRATION.md).

## Using Llama Models

This project supports using Llama models via [Ollama](https://ollama.com/). To use Llama models:

1. Install Ollama from [ollama.com](https://ollama.com/)
2. Pull the Llama model:
   ```
   ollama pull llama3
   ```
3. Run Ollama (it should run on http://localhost:11434 by default)
4. In the agent creation UI, select "Llama" as the model provider

If running Ollama on a different server or port, update the `OLLAMA_BASE_URL` in your `.env` file.

Available Llama models:

- llama3 (default)
- llama3:8b (8B parameters)
- llama3:70b (70B parameters)

## Configuring Your Agent

You can [modify your configuration](https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#usage) of the agent. By default, your agentkit configuration occurs in the `/api/agent/prepare-agentkit.ts` file, and agent instantiation occurs in the `/api/agent/create-agent.ts` file.

### 1. Select Your LLM Provider and Model

Choose between OpenAI's models or Llama models via Ollama.

### 2. Select Your Wallet Provider

AgentKit requires a **Wallet Provider** to interact with blockchain networks.

### 3. Select Your Action Providers

Action Providers define what your agent can do. You can use built-in providers or create your own.

---

## Next Steps

- Explore the AgentKit README: [AgentKit Documentation](https://github.com/coinbase/agentkit)
- Learn more about available Wallet Providers & Action Providers.
- Experiment with custom Action Providers for your specific use case.

---

## Learn More

- [Learn more about CDP](https://docs.cdp.coinbase.com/)
- [Learn more about AgentKit](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [Learn more about Next.js](https://nextjs.org/docs)
- [Learn more about Tailwind CSS](https://tailwindcss.com/docs)
- [Learn more about Ollama](https://ollama.com/)

---

## Contributing

Interested in contributing to AgentKit? Follow the contribution guide:

- [Contribution Guide](https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING.md)
- Join the discussion on [Discord](https://discord.gg/CDP)
