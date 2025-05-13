import { useAccount } from "wagmi";
import { useCapabilities } from "wagmi/experimental";
import { useMemo } from "react";

export function usePaymasterCapabilities() {
  const account = useAccount();
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  });

  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {};
    const capabilitiesForChain = availableCapabilities[account.chainId];

    if (
      capabilitiesForChain?.["paymasterService"] &&
      capabilitiesForChain["paymasterService"].supported
    ) {
      return {
        paymasterService: {
          url: process.env.NEXT_PUBLIC_RPC_URL,
        },
      };
    }
    return {};
  }, [availableCapabilities, account.chainId]);

  return capabilities;
}
