import { NextRequest, NextResponse } from "next/server";
import { walletManager } from "@/app/utils/wallet-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentName = searchParams.get("agentName");

    if (!agentName) {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      );
    }

    const wallet = await walletManager.getAgentWallet(
      agentName,
      session.user.address as `0x${string}`
    );

    return NextResponse.json({ wallet });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get agent wallet";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentName, networkId } = await req.json();

    if (!agentName || !networkId) {
      return NextResponse.json(
        { error: "Agent name and network ID are required" },
        { status: 400 }
      );
    }

    const wallet = await walletManager.createAgentWallet(
      agentName,
      session.user.address as `0x${string}`,
      networkId
    );

    return NextResponse.json({ wallet });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create agent wallet";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
