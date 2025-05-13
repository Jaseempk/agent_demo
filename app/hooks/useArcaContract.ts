import { config } from "../providers";
import { writeContract, readContract, simulateContract } from "wagmi/actions";
import { arcaCoreABI, ARCA_CORE_ADDRESS } from "../config/contracts";
import { Address } from "viem";
import { useWriteContracts } from "wagmi/experimental";
import { usePaymasterCapabilities } from "./usePaymasterCapabilities";

export function useArcaContract() {
  const capabilities = usePaymasterCapabilities();
  const { writeContracts } = useWriteContracts({
    mutation: {
      onSuccess: (data) => {
        console.log("Transaction successful:", data);
      },
    },
  });

  const createAgent = async (
    agentName: string,
    agentAddress: Address,
    reputationScore: number
  ) => {
    try {
      // Check if we should use paymaster
      const usePaymaster = process.env.NEXT_PUBLIC_USE_PAYMASTER === "true";

      if (usePaymaster) {
        // Use paymaster implementation
        console.log("Using paymaster for transaction");

        await writeContracts({
          contracts: [
            {
              address: ARCA_CORE_ADDRESS,
              abi: arcaCoreABI,
              functionName: "createAgent",
              args: [agentName, agentAddress, reputationScore],
            },
          ],
          capabilities, // This includes the paymaster service configuration
        });

        // Note: The transaction hash will be available in the onSuccess callback
        return "Transaction submitted successfully";
      } else {
        // Use original implementation without paymaster
        console.log("Using standard transaction (no paymaster)");

        const { request } = await simulateContract(config, {
          abi: arcaCoreABI,
          address: ARCA_CORE_ADDRESS,
          functionName: "createAgent",
          args: [agentName, agentAddress, reputationScore],
        });

        const hash = await writeContract(config, request);
        return hash;
      }
    } catch (error) {
      console.error("Error creating agent on-chain:", error);
      throw error;
    }
  };

  const getAgentDetails = async (agentAddress: Address) => {
    try {
      const result = await readContract(config, {
        abi: arcaCoreABI,
        address: ARCA_CORE_ADDRESS,
        functionName: "addressToAgent",
        args: [agentAddress],
      });
      return result;
    } catch (error) {
      console.error("Error reading agent details:", error);
      throw error;
    }
  };

  return {
    createAgent,
    getAgentDetails,
  };
}
