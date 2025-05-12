import {
  AgentKit,
  cdpApiActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  SmartWalletProvider,
  walletActionProvider,
  WalletProvider,
  wethActionProvider,
  ActionProvider,
} from "@coinbase/agentkit";
import * as fs from "fs";
import { Address, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { walletManager } from "@/app/utils/wallet-manager";

/**
 * AgentKit Integration Route
 *
 * This file is your gateway to integrating AgentKit with your product.
 * It defines the core capabilities of your agent through WalletProvider
 * and ActionProvider configuration.
 *
 * Key Components:
 * 1. WalletProvider Setup:
 *    - Configures the blockchain wallet integration
 *    - Learn more: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#evm-wallet-providers
 *
 * 2. ActionProviders Setup:
 *    - Defines the specific actions your agent can perform
 *    - Choose from built-in providers or create custom ones:
 *      - Built-in: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#action-providers
 *      - Custom: https://github.com/coinbase/agentkit/tree/main/typescript/agentkit#creating-an-action-provider
 *
 * # Next Steps:
 * - Explore the AgentKit README: https://github.com/coinbase/agentkit
 * - Experiment with different LLM configurations
 * - Fine-tune agent parameters for your use case
 *
 * ## Want to contribute?
 * Join us in shaping AgentKit! Check out the contribution guide:
 * - https://github.com/coinbase/agentkit/blob/main/CONTRIBUTING.md
 * - https://discord.gg/CDP
 */

// Configure a file to persist the agent's Smart Wallet + Private Key data
const WALLET_DATA_FILE = "wallet_data.txt";

type WalletData = {
  privateKey: Hex;
  smartWalletAddress: Address;
};

/**
 * Prepares the AgentKit and WalletProvider.
 *
 * @function prepareAgentkitAndWalletProvider
 * @param {string} networkId - Optional network ID to use
 * @param {string[]} actionProviderNames - Optional list of action provider names to use
 * @returns {Promise<{ agentkit: AgentKit, walletProvider: WalletProvider }>} The initialized AI agent.
 *
 * @description Handles agent setup
 *
 * @throws {Error} If the agent initialization fails.
 */
export async function prepareAgentkitAndWalletProvider(
  agentName: string,
  ownerAddress: Address,
  networkId: string
): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
  smartWalletAddress: Address;
}> {
  try {
    console.log("Preparing AgentKit and WalletProvider...");
    // Get or create wallet for the agent
    const wallet = await walletManager
      .getAgentWallet(agentName, ownerAddress)
      .catch(async () => {
        // If wallet doesn't exist, create a new one
        return await walletManager.createAgentWallet(
          agentName,
          ownerAddress,
          networkId
        );
      });

    console.log("Wallet created:", wallet);

    // Initialize wallet provider with the agent's wallet
    const signer = privateKeyToAccount(wallet.privateKey);
    const walletProvider = await SmartWalletProvider.configureWithWallet({
      networkId,
      signer,
      paymasterUrl: undefined,
    });

    // Create action providers based on user selection
    const getActionProviders = (): ActionProvider[] => {
      // Default to all providers if none specified
      const providerNames = ["weth", "pyth", "wallet", "erc20", "cdpApi"];
      const providers: ActionProvider[] = [];

      if (providerNames.includes("weth")) {
        providers.push(wethActionProvider());
      }

      if (providerNames.includes("pyth")) {
        providers.push(pythActionProvider());
      }

      if (providerNames.includes("wallet")) {
        providers.push(walletActionProvider());
      }

      if (providerNames.includes("erc20")) {
        providers.push(erc20ActionProvider());
      }

      if (providerNames.includes("cdpApi")) {
        providers.push(
          cdpApiActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
          })
        );
      }

      // Ensure at least one provider is available
      if (providers.length === 0) {
        console.warn(
          "No action providers specified. Adding wallet provider as default."
        );
        providers.push(walletActionProvider());
      }

      return providers;
    };

    // Initialize AgentKit: https://docs.cdp.coinbase.com/agentkit/docs/agent-actions
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: getActionProviders(),
    });

    // Save wallet data
    const smartWalletAddress = walletProvider.getAddress();
    fs.writeFileSync(
      WALLET_DATA_FILE,
      JSON.stringify({
        privateKey: wallet.privateKey,
        smartWalletAddress,
      } as WalletData)
    );

    return {
      agentkit,
      walletProvider,
      smartWalletAddress: smartWalletAddress as `0x${string}`,
    };
  } catch (error) {
    console.error("Error preparing AgentKit:", error);
    throw error;
  }
}
