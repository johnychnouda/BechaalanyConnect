import React from "react";
import Modal from "@/components/ui/modal";
import { WhatsappWhiteIcon } from "@/assets/icons/whatsapp-white.icon";

interface JoinWhatsappModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelUrl: string;
}

const JoinWhatsappModal: React.FC<JoinWhatsappModalProps> = ({ isOpen, onClose, channelUrl }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-3xl font-extrabold text-[#E73828] text-center mb-1 tracking-tight">JOIN CHANNEL</h2>
      <p className="text-center text-black text-base mb-6">
        Join Our WhatsApp Community to Stay Updated with the Latest Offers on Our Website!
      </p>
      <a
        href={channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-[#5FD568] text-white font-bold py-3 rounded-full mt-2 hover:bg-[#4ecb5f] transition-colors duration-200 text-lg"
      >
        <WhatsappWhiteIcon /> WHATSAPP CHANNEL
      </a>
    </Modal>
  );
};

export default JoinWhatsappModal; 