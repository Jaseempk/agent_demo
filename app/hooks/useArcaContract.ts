import { config } from "../providers";
import { writeContract, readContract, simulateContract } from "wagmi/actions";
import { arcaCoreABI, ARCA_CORE_ADDRESS } from "../config/contracts";
import { Address } from "viem";

export function useArcaContract() {
  const createAgent = async (
    agentName: string,
    agentAddress: Address,
    reputationScore: number
  ) => {
    try {
      // First simulate the transaction
      const { request } = await simulateContract(config, {
        abi: arcaCoreABI,
        address: ARCA_CORE_ADDRESS,
        functionName: "createAgent",
        args: [agentName, agentAddress, Number(reputationScore)],
      });

      // If simulation succeeds, execute the transaction
      const hash = await writeContract(config, request);
      return hash;
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
