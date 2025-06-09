import { useContract, useContractWrite } from "@thirdweb-dev/react";
import toast from "react-hot-toast";
import { NFT_COLLECTION, MARKETPLACE } from "@/const/contracts";
import toastStyle from "@/util/toastConfig";

export default function ApprovalButton() {
  const { contract: nftContract } = useContract(NFT_COLLECTION);

  const {
    mutate: approveOperator,
    isLoading,
  } = useContractWrite(nftContract, "setApprovalForAll");

  const handleApprove = () => {
    if (!nftContract) {
      toast.error("NFT Contract not loaded", { id: "approve" });
      return;
    }

    toast.loading("Approving...", {
      id: "approve",
      style: toastStyle,
      position: "bottom-center",
    });

    approveOperator(
      {
        args: [MARKETPLACE, true],
      },
      {
        onSuccess: () => {
          toast.success("Approval successful.", {
            id: "approve",
            style: toastStyle,
            position: "bottom-center",
          });
        },
        onError: () => {
          toast.error("Approval Failed!", {
            id: "approve",
            style: toastStyle,
            position: "bottom-center",
          });
        },
      }
    );
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isLoading}
      className="btn btn-primary"
    >
      {isLoading ? "Approving..." : "Approve"}
    </button>
  );
}
