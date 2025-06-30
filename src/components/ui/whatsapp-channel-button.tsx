import { useHomepageContext } from '@/context/HomepageContext';
import React from 'react';

interface WhatsAppChannelButtonProps {
  href: string;
  className?: string;
}

const WhatsAppChannelButton: React.FC<WhatsAppChannelButtonProps> = ({ href, className = '' }) => {
  const { homepageData } = useHomepageContext();
  const whatsappChannelButtonText = homepageData?.homepageSettings.whatsapp_channel_button_text;
  return (
    <a
      href={href}
      className={`max-w-max whatsapp-channel-btn cursor-pointer text-app-white bg-app-whatsapp-green p-2 px-6 text-center rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:bg-white hover:text-app-whatsapp-green border-2 border-transparent hover:border-app-whatsapp-green group ${className}`}
      style={{ minWidth: 0 }}
    >
      <div className="whatsapp-icon-wrapper w-6 h-6 flex items-center justify-center">
        <svg className="whatsapp-icon-svg" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14.875 3.09155C14.1109 2.31997 13.2009 1.70819 12.198 1.29185C11.195 0.875514 10.1193 0.662951 9.03337 0.666549C4.48337 0.666549 0.775041 4.37488 0.775041 8.92488C0.775041 10.3832 1.15837 11.7999 1.87504 13.0499L0.708374 17.3332L5.08337 16.1832C6.29171 16.8416 7.65004 17.1915 9.03337 17.1915C13.5834 17.1915 17.2917 13.4832 17.2917 8.93322C17.2917 6.72488 16.4334 4.64988 14.875 3.09155ZM9.03337 15.7915C7.80004 15.7915 6.59171 15.4582 5.53337 14.8332L5.28337 14.6832L2.68337 15.3665L3.37504 12.8332L3.20837 12.5749C2.523 11.4808 2.15914 10.2159 2.15837 8.92488C2.15837 5.14155 5.24171 2.05822 9.02504 2.05822C10.8584 2.05822 12.5834 2.77488 13.875 4.07488C14.5147 4.71144 15.0216 5.46867 15.3664 6.30266C15.7111 7.13664 15.8869 8.03079 15.8834 8.93322C15.9 12.7165 12.8167 15.7915 9.03337 15.7915ZM12.8 10.6582C12.5917 10.5582 11.575 10.0582 11.3917 9.98322C11.2 9.91655 11.0667 9.88322 10.925 10.0832C10.7834 10.2915 10.3917 10.7582 10.275 10.8916C10.1584 11.0332 10.0334 11.0499 9.82504 10.9415C9.61671 10.8415 8.95004 10.6166 8.16671 9.91655C7.55004 9.36655 7.14171 8.69155 7.01671 8.48322C6.90004 8.27488 7.00004 8.16655 7.10837 8.05822C7.20004 7.96655 7.31671 7.81655 7.41671 7.69988C7.51671 7.58322 7.55837 7.49155 7.62504 7.35822C7.69171 7.21655 7.65837 7.09988 7.60837 6.99988C7.55837 6.89988 7.14171 5.88322 6.97504 5.46655C6.80837 5.06655 6.63337 5.11655 6.50837 5.10822H6.10837C5.96671 5.10822 5.75004 5.15822 5.55837 5.36655C5.37504 5.57488 4.84171 6.07488 4.84171 7.09155C4.84171 8.10822 5.58337 9.09155 5.68337 9.22488C5.78337 9.36655 7.14171 11.4499 9.20837 12.3415C9.70004 12.5582 10.0834 12.6832 10.3834 12.7749C10.875 12.9332 11.325 12.9082 11.6834 12.8582C12.0834 12.7999 12.9084 12.3582 13.075 11.8749C13.25 11.3915 13.25 10.9832 13.1917 10.8916C13.1334 10.7999 13.0084 10.7582 12.8 10.6582Z"
            className="transition-colors duration-200 fill-white group-hover:fill-app-whatsapp-green whatsapp-icon-path"
          />
        </svg>
      </div>
      <p className="font-semibold whatsapp-channel-text">{whatsappChannelButtonText}</p>
    </a>
  );
};

export default WhatsAppChannelButton; 