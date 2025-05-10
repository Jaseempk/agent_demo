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
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

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
  networkId?: string,
  actionProviderNames?: string[]
): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
}> {
  try {
    let walletData: WalletData | null = null;
    let privateKey: Hex | null = null;

    // Read existing wallet data if available
    if (fs.existsSync(WALLET_DATA_FILE)) {
      try {
        walletData = JSON.parse(
          fs.readFileSync(WALLET_DATA_FILE, "utf8")
        ) as WalletData;
        privateKey = walletData.privateKey;
      } catch (error) {
        console.error("Error reading wallet data:", error);
        // Continue without wallet data
      }
    }

    if (!privateKey) {
      if (walletData?.smartWalletAddress) {
        throw new Error(
          `Smart wallet found but no private key provided. Either provide the private key, or delete ${WALLET_DATA_FILE} and try again.`
        );
      }
      privateKey = (process.env.PRIVATE_KEY || generatePrivateKey()) as Hex;
    }

    const signer = privateKeyToAccount(privateKey);

    // Initialize WalletProvider: https://docs.cdp.coinbase.com/agentkit/docs/wallet-management
    const walletProvider = await SmartWalletProvider.configureWithWallet({
      networkId: networkId || process.env.NETWORK_ID || "base-sepolia",
      signer,
      smartWalletAddress: walletData?.smartWalletAddress,
      paymasterUrl: undefined, // Sponsor transactions: https://docs.cdp.coinbase.com/paymaster/docs/welcome
    });

    // Create action providers based on user selection
    const getActionProviders = (): ActionProvider[] => {
      // Default to all providers if none specified
      const providerNames = actionProviderNames || [
        "weth",
        "pyth",
        "wallet",
        "erc20",
        "cdpApi",
      ];
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
    const smartWalletAddress = await walletProvider.getAddress();
    fs.writeFileSync(
      WALLET_DATA_FILE,
      JSON.stringify({
        privateKey,
        smartWalletAddress,
      } as WalletData)
    );

    return { agentkit, walletProvider };
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
}
