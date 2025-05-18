# AI Agent Creator

A simple platform that lets you create AI agents capable of performing blockchain operations. Built with AgentKit by Coinbase.

## Overview

This platform allows you to:

- Create AI agents that can interact with blockchain
- Use different AI models (OpenAI or Llama)
- Perform blockchain operations without paying gas fees
- Customize your agent's capabilities

## Features

✨ **Free Agent Creation**

- Create blockchain-capable agents without gas fees
- Powered by paymaster integration

🤖 **AI Model Options**

- OpenAI models
- Llama models (via Ollama)

🔧 **Customizable Capabilities**

- Wallet operations
- Token transfers
- Price feeds
- And more!

## How It Works

1. **Connect Wallet**

   - Connect your Web3 wallet (like Coinbase Wallet)

2. **Create Agent**

   - Choose a name for your agent
   - Select AI model (OpenAI or Llama)
   - Pick capabilities you want
   - Add custom instructions

3. **Use Agent**
   - Your agent gets its own blockchain wallet
   - Start interacting with your agent
   - Perform blockchain operations

## Quick Start

1. **Install Dependencies**

   ```sh
   npm install
   ```

2. **Set Up Environment**

   ```sh
   cp .env.local .env
   ```

   Edit `.env` and add your API keys

3. **Start Development Server**
   ```sh
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Using Llama Models (Optional)

1. Install Ollama from [ollama.com](https://ollama.com/)
2. Get the model:
   ```sh
   ollama pull llama3
   ```
3. Run Ollama (uses http://localhost:11434)
4. Select "Llama" when creating your agent

## Environment Setup

Add these to your `.env.local`:

```
NEXT_PUBLIC_USE_PAYMASTER=true
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_SIGNER_PRIVATE_KEY=your_private_key
```

## Learn More

- [CDP Documentation](https://docs.cdp.coinbase.com/)
- [AgentKit Guide](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [Join Discord](https://discord.gg/CDP)
