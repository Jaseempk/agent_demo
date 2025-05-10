import { NextResponse } from "next/server";
import * as fs from "fs";

const WALLET_DATA_FILE = "wallet_data.txt";

export async function GET() {
  try {
    if (!fs.existsSync(WALLET_DATA_FILE)) {
      return NextResponse.json(
        {
          success: false,
          error: "No wallet data found",
        },
        { status: 404 }
      );
    }

    const walletData = JSON.parse(fs.readFileSync(WALLET_DATA_FILE, "utf8"));

    return NextResponse.json({
      success: true,
      smartWalletAddress: walletData.smartWalletAddress,
    });
  } catch (error) {
    console.error("Error reading wallet data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read wallet data",
      },
      { status: 500 }
    );
  }
}
