import React from "react";
import Modal from "@/components/ui/modal";

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOkay?: () => void;
}

const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({ isOpen, onClose, onOkay }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">PENDING APPROVAL</h2>
      <p className="text-center text-black text-base mb-6">
        Thank you for registering! Your account is currently under review. You will receive an email notification once it is approved by the admin.
      </p>
      <button
        type="button"
        onClick={onOkay || onClose}
        className="w-full bg-[#E73828] text-white font-bold py-3 rounded-full mt-2 hover:bg-white hover:text-[#E73828] border border-[#E73828] transition-colors duration-200 text-lg"
      >
        OKAY
      </button>
    </Modal>
  );
};

export default PendingApprovalModal; 