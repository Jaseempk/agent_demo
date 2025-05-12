import * as fs from "fs";
import { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { SmartWalletProvider } from "@coinbase/agentkit";

interface AgentWallet {
  agentName: string;
  privateKey: Hex;
  smartWalletAddress: Address;
  ownerAddress: Address; // The address of the user who created the agent
  createdAt: number;
  lastUsed: number;
  networkId: string;
}

class WalletManager {
  private static instance: WalletManager;
  private readonly WALLET_DATA_DIR = "wallet_data";
  private readonly WALLET_MAP_FILE = `${this.WALLET_DATA_DIR}/wallet_map.json`;

  private constructor() {
    if (!fs.existsSync(this.WALLET_DATA_DIR)) {
      fs.mkdirSync(this.WALLET_DATA_DIR);
    }
  }

  public static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  private getWalletFilePath(agentName: string): string {
    return `${this.WALLET_DATA_DIR}/${agentName}_wallet.json`;
  }

  private async loadWalletMap(): Promise<Record<string, AgentWallet>> {
    if (!fs.existsSync(this.WALLET_MAP_FILE)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(this.WALLET_MAP_FILE, "utf8"));
  }

  private async saveWalletMap(
    walletMap: Record<string, AgentWallet>
  ): Promise<void> {
    fs.writeFileSync(this.WALLET_MAP_FILE, JSON.stringify(walletMap, null, 2));
  }

  public async createAgentWallet(
    agentName: string,
    ownerAddress: Address,
    networkId: string
  ): Promise<AgentWallet> {
    const walletMap = await this.loadWalletMap();
    console.log("heeey");

    // Check if agent already has a wallet
    if (walletMap[agentName]) {
      throw new Error(`Wallet already exists for agent ${agentName}`);
    }

    // Generate new wallet
    const privateKey = generatePrivateKey() as Hex;
    const signer = privateKeyToAccount(privateKey);

    console.log("hello");
    // Initialize smart wallet
    const walletProvider = await SmartWalletProvider.configureWithWallet({
      networkId: "base-sepolia",
      signer,
      cdpApiKeyName: process.env.CDP_API_KEY_NAME,
      cdpApiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
      smartWalletAddress: "0x",
    });

    console.log("veendamathum");
    const smartWalletAddress = walletProvider.getAddress() as Address;

    // Create wallet data
    const walletData: AgentWallet = {
      agentName,
      privateKey,
      smartWalletAddress,
      ownerAddress,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      networkId,
    };

    // Save wallet data
    fs.writeFileSync(
      this.getWalletFilePath(agentName),
      JSON.stringify(walletData, null, 2)
    );

    // Update wallet map
    walletMap[agentName] = walletData;
    await this.saveWalletMap(walletMap);

    return walletData;
  }

  public async getAgentWallet(
    agentName: string,
    requesterAddress: Address
  ): Promise<AgentWallet> {
    const walletMap = await this.loadWalletMap();
    const walletData = walletMap[agentName];

    if (!walletData) {
      throw new Error(`No wallet found for agent ${agentName}`);
    }

    // Check access control
    if (
      walletData.ownerAddress.toLowerCase() !== requesterAddress.toLowerCase()
    ) {
      throw new Error("Unauthorized access to agent wallet");
    }

    // Update last used timestamp
    walletData.lastUsed = Date.now();
    await this.saveWalletMap(walletMap);

    return walletData;
  }

  public async listAgentWallets(ownerAddress: Address): Promise<AgentWallet[]> {
    const walletMap = await this.loadWalletMap();
    return Object.values(walletMap).filter(
      (wallet) =>
        wallet.ownerAddress.toLowerCase() === ownerAddress.toLowerCase()
    );
  }
}

export const walletManager = WalletManager.getInstance();
