import { useContract, useContractWrite } from "@thirdweb-dev/react";
import toast from "react-hot-toast";
import { NFT_COLLECTION, MARKETPLACE } from "@/const/contracts";
import toastStyle from "@/util/toastConfig";

export default function ApprovalButton() {
  // Get the contract instance
  const { contract: nftContract } = useContract(NFT_COLLECTION);

  // Prepare the write function for setApprovalForAll
  const {
    mutate: approveOperator,
    isLoading,
    error,
  } = useContractWrite(
    nftContract,
    "setApprovalForAll" // call the contract method directly
  );

  const handleApprove = () => {
    if (!nftContract) {
      toast.error("NFT Contract not loaded", { id: "approve" });
      return;
    }

    // Show loading toast before starting transaction
    toast.loading("Approving...", {
      id: "approve",
      style: toastStyle,
      position: "bottom-center",
    });

    approveOperator(
      {
        args: [MARKETPLACE, true], // operator address and approved flag
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
