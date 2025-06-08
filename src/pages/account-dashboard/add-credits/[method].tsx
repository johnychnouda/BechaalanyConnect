import DashboardLayout from "@/components/ui/dashboard-layout";
import { useRouter } from "next/router";
import React, { useState } from "react";

type MethodConfig = {
  title: string;
  numberLabel: string;
  numberValue: string;
  valueLabel: string;
  sendLabel: string;
  screenshotLabel: string;
  extra?: React.ReactNode;
};

const methodConfigs: Record<string, MethodConfig> = {
  omt: {
    title: "OMT",
    numberLabel: "OMT Number",
    numberValue: "+961 81 708 706",
    valueLabel: "Value",
    sendLabel: "Value to be sent",
    screenshotLabel: "OMT transfer screenshot",
  },
  whish: {
    title: "WHISH",
    numberLabel: "Whish Number",
    numberValue: "+961 81 708 706",
    valueLabel: "Value",
    sendLabel: "Value to be sent",
    screenshotLabel: "Whish transfer screenshot",
  },
  usdt: {
    title: "USDT",
    numberLabel: "Wallet Number",
    numberValue: "sskkffrr5fd545ffefer5566dd4e4",
    valueLabel: "Value",
    sendLabel: "Value to be sent",
    screenshotLabel: "OMT transfer screenshot",
    extra: <div className="text-[#8E8E8E] text-[16px] mb-2">USDT TRC20</div>,
  },
};

export default function AddCreditMethod() {
  const router = useRouter();
  const { method } = router.query;
  const config = methodConfigs[method as string];
  const [value, setValue] = useState("20 $");
  const [sendValue, setSendValue] = useState("20 $");
  const [screenshot, setScreenshot] = useState("");

  if (!config) return null;

  // Copy handler for number
  const handleCopy = () => {
    navigator.clipboard.writeText(config.numberValue);
    alert('Copied!');
  };

  // Attach handler placeholder
  const handleAttach = () => {
    alert('Attach clicked!');
  };

  return (
    <DashboardLayout>
      <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">ADD CREDITS</div>
      <div className="flex flex-col items-start p-0 gap-[32px] w-[578px] mx-auto" style={{position: 'relative', top: '0', left: '0'}}>
        <div className="w-[115px] h-[42px] font-['Roboto'] font-semibold text-[36px] leading-[42px] uppercase text-[#E73828]">{config.title}</div>
        <form className="flex flex-col items-start p-0 gap-[24px] w-[578px]">
          {/* Number Row */}
          <div className="flex flex-row items-center p-0 gap-[12px] w-[578px] h-[44px]">
            <label className="w-[106px] h-[19px] font-['Roboto'] font-semibold text-[16px] leading-[19px] text-[#070707] dark:text-white">{config.numberLabel}</label>
            <div className="flex flex-row justify-between items-center px-[24px] py-[12px] gap-[10px] w-[460px] h-[44px] border border-[rgba(7,7,7,0.2)] rounded-[50.5px] bg-white">
              <span className="w-[120px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#070707]">{config.numberValue}</span>
              <button type="button" className="w-[20px] h-[20px] flex items-center justify-center" title="Copy" onClick={handleCopy}>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="5" y="5" width="10" height="10" rx="2" stroke="#E73828" strokeWidth="2"/><rect x="8" y="2" width="10" height="10" rx="2" stroke="#E73828" strokeWidth="2"/></svg>
              </button>
            </div>
          </div>
          {config.extra}
          {/* Value Row */}
          <div className="flex flex-col items-start p-0 gap-[4px] w-[578px] h-[66px]">
            <label className="w-[41px] h-[19px] font-['Roboto'] font-semibold text-[16px] leading-[19px] text-[#070707] dark:text-white">{config.valueLabel}</label>
            <div className="flex flex-row items-center px-[24px] py-[12px] gap-[4px] w-[578px] h-[43px] border border-[#070707] rounded-[50.5px] bg-white">
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-[18px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#070707] bg-transparent border-none outline-none flex-1"
                style={{minWidth: '0'}}
              />
              <span className="w-[9px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#E73828]">$</span>
            </div>
          </div>
          {/* Value to be sent Row */}
          <div className="flex flex-row items-center p-0 gap-[12px] w-[578px] h-[43px]">
            <label className="w-[116px] h-[19px] font-['Roboto'] font-semibold text-[16px] leading-[19px] text-[#070707] dark:text-white">{config.sendLabel}</label>
            <div className="flex flex-row items-center px-[24px] py-[12px] gap-[10px] w-[450px] h-[43px] border border-[rgba(7,7,7,0.2)] rounded-[50.5px] bg-white">
              <input
                type="text"
                value={sendValue}
                onChange={e => setSendValue(e.target.value)}
                className="w-[18px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#070707] bg-transparent border-none outline-none flex-1"
                style={{minWidth: '0'}}
              />
              <span className="w-[9px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#E73828]">$</span>
            </div>
          </div>
          {/* Screenshot Row */}
          <div className="flex flex-col items-start p-0 gap-[4px] w-[578px] h-[67px]">
            <label className="w-[82px] h-[19px] font-['Roboto'] font-semibold text-[16px] leading-[19px] text-[#070707] dark:text-white">Screenshot</label>
            <div className="flex flex-row justify-between items-center px-[24px] py-[12px] gap-[4px] w-[578px] h-[44px] border border-[#070707] rounded-[50.5px] bg-white">
              <input
                type="text"
                value={screenshot}
                onChange={e => setScreenshot(e.target.value)}
                placeholder={config.screenshotLabel}
                className="w-[187px] h-[19px] font-['Roboto'] font-normal text-[16px] leading-[19px] text-[#070707] bg-transparent border-none outline-none flex-1"
                style={{minWidth: '0'}}
              />
              <button type="button" className="w-[20px] h-[20px] flex items-center justify-center" title="Attach" onClick={handleAttach}>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                  <path d="M15 3.75L15 15.625C15 16.2305 14.8861 16.7969 14.6582 17.3242C14.4303 17.8516 14.1178 18.3138 13.7207 18.7109C13.3236 19.1081 12.8613 19.4206 12.334 19.6484C11.8066 19.8763 11.237 19.9935 10.625 20C10.0195 20 9.45313 19.8861 8.92578 19.6582C8.39844 19.4303 7.9362 19.1178 7.53906 18.7207C7.14193 18.3236 6.82943 17.8613 6.60156 17.334C6.3737 16.8066 6.25651 16.237 6.25 15.625L6.25 3.125C6.25 2.69531 6.33138 2.29167 6.49414 1.91406C6.6569 1.53646 6.88151 1.20768 7.16797 0.927734C7.45443 0.647786 7.78646 0.423177 8.16406 0.253906C8.54167 0.0846354 8.94531 0 9.375 0C9.80469 0 10.2083 0.0813802 10.5859 0.244141C10.9635 0.406901 11.2923 0.63151 11.5723 0.917969C11.8522 1.20443 12.0768 1.53646 12.2461 1.91406C12.4154 2.29167 12.5 2.69531 12.5 3.125L12.5 15.625C12.5 15.8854 12.4512 16.1296 12.3535 16.3574C12.2559 16.5853 12.1224 16.7839 11.9531 16.9531C11.7839 17.1224 11.5853 17.2559 11.3574 17.3535C11.1296 17.4512 10.8854 17.5 10.625 17.5C10.3646 17.5 10.1204 17.4512 9.89258 17.3535C9.66471 17.2559 9.46615 17.1224 9.29688 16.9531C9.1276 16.7839 8.99414 16.5853 8.89648 16.3574C8.79883 16.1296 8.75 15.8854 8.75 15.625L8.75 5L10 5L10 15.625C10 15.7943 10.0618 15.9408 10.1855 16.0645C10.3092 16.1882 10.4557 16.25 10.625 16.25C10.7943 16.25 10.9408 16.1882 11.0645 16.0645C11.1882 15.9408 11.25 15.7943 11.25 15.625L11.25 3.125C11.25 2.86458 11.2012 2.62044 11.1035 2.39258C11.0059 2.16471 10.8724 1.96615 10.7031 1.79687C10.5339 1.6276 10.3353 1.49414 10.1074 1.39648C9.87956 1.29883 9.63542 1.25 9.375 1.25C9.11458 1.25 8.87044 1.29883 8.64258 1.39648C8.41471 1.49414 8.21615 1.6276 8.04688 1.79687C7.8776 1.96615 7.74414 2.16471 7.64648 2.39258C7.54883 2.62044 7.5 2.86458 7.5 3.125L7.5 15.625C7.5 16.0547 7.58138 16.4583 7.74414 16.8359C7.9069 17.2135 8.13151 17.5423 8.41797 17.8223C8.70443 18.1022 9.03646 18.3268 9.41406 18.4961C9.79167 18.6654 10.1953 18.75 10.625 18.75C11.0547 18.75 11.4583 18.6686 11.8359 18.5059C12.2135 18.3431 12.5423 18.1185 12.8223 17.832C13.1022 17.5456 13.3268 17.2135 13.4961 16.8359C13.6654 16.4583 13.75 16.0547 13.75 15.625L13.75 3.75H15Z" fill="#E73828"/>
                </svg>
              </button>
            </div>
          </div>
          {/* Request Button */}
          <div className="flex flex-row justify-center items-center w-full mt-8">
            <div className="flex flex-row justify-center items-center px-[24px] py-[8px] gap-[10px] w-[200px] h-[43px] bg-[#E73828] rounded-[50.5px] hover:bg-white hover:border hover:border-[#E73828] transition-all duration-200 group">
              <button type="submit" className="w-[70px] h-[19px] font-['Roboto'] font-bold text-[16px] leading-[19px] text-white uppercase bg-transparent border-none outline-none group-hover:text-[#E73828] transition-colors duration-200">REQUEST</button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
} 