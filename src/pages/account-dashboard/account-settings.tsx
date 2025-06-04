import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

const CustomDropdown: React.FC<{
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px] cursor-pointer hover:border-[#E73828] transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-1 font-['Roboto'] font-normal text-[16px] text-[#070707]">
          {selectedOption?.label || placeholder}
        </span>
        <span className="pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d={isOpen ? "M5 13L10 8L15 13" : "M5 8L10 13L15 8"}
              stroke="#E73828"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-[#070707] rounded-[25px] shadow-sm max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-6 py-3 cursor-pointer transition-colors duration-200 ${
                option.value === value 
                  ? "bg-[#E73828] text-white" 
                  : "hover:bg-[#E73828] hover:text-white"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="font-['Roboto'] font-normal text-[16px]">
                {option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AccountSettings() {
  // Account Info state
  const [accountInfo, setAccountInfo] = useState({
    username: "Charbel Bechaalany",
    email: "Charbelb@gmail.com",
    phone: "",
    country: "LEBANON",
    userType: "Wholesale",
    storeName: "Bechaalany Connect",
    storeLocation: "Jounieh Lebanon",
  });

  // Focus states for dropdowns
  const [focusedSelect, setFocusedSelect] = useState<string | null>(null);

  // Country code mapping
  const countryCodes: Record<string, string> = {
    LEBANON: "+961",
    JORDAN: "+962",
    "SAUDI ARABIA": "+966",
    EGYPT: "+20",
  };

  // Account Security state
  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide Account Security
  const [showSecurity, setShowSecurity] = useState(false);

  // Country options
  const countryOptions: DropdownOption[] = [
    { value: "LEBANON", label: "LEBANON" },
    { value: "JORDAN", label: "JORDAN" },
    { value: "SAUDI ARABIA", label: "SAUDI ARABIA" },
    { value: "EGYPT", label: "EGYPT" },
  ];

  const userTypeOptions: DropdownOption[] = [
    { value: "Wholesale", label: "Wholesale" },
    { value: "Wholesale API", label: "Wholesale API" },
    { value: "Reseller", label: "Reseller" },
  ];

  // Handlers
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save account info logic
    alert("Account info saved!");
  };
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save password logic
    alert("Password changed!");
    setShowSecurity(false);
  };
  const handleDiscard = () => {
    setSecurity({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowSecurity(false);
  };

  return (
    <DashboardLayout>
      <div className="text-[#E73828] text-[36px] font-semibold font-['Roboto'] leading-[42px] uppercase mb-8 mt-0 tracking-tight">ACCOUNT SETTINGS</div>
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar (left) is handled by DashboardLayout */}
        <div className="flex-1 max-w-2xl">
          {/* Account Info Form */}
          <form onSubmit={handleInfoSubmit} className="mb-12">
            <div className="text-[22px] font-semibold text-[#E73828] mb-6">Account Info</div>
            <div className="mb-4">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Username</label>
              <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                <input name="username" value={accountInfo.username} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" />
              </div>
            </div>
            <div className="mb-4">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Email</label>
              <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#E73828] rounded-[50.5px]">
                <input name="email" value={accountInfo.email} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" type="email" />
              </div>
            </div>
            {/* Phone Number */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Phone Number</label>
              <div className="flex flex-row items-center p-[12px_24px] gap-2 w-full border border-[#070707] rounded-[50.5px]">
                <span className="font-['Roboto'] font-normal text-[16px] text-[#070707] select-none">{countryCodes[accountInfo.country] || ''}</span>
                <input
                  name="phone"
                  value={accountInfo.phone}
                  onChange={handleInfoChange}
                  className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none"
                  placeholder="Phone Number"
                  style={{ direction: 'ltr' }}
                />
              </div>
            </div>
            {/* Country */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Country</label>
              <CustomDropdown
                options={countryOptions}
                value={accountInfo.country}
                onChange={(value) => handleInfoChange({ target: { name: 'country', value } } as any)}
                className="w-full"
              />
            </div>
            {/* User Type */}
            <div className="flex flex-col items-start gap-1 w-full">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">User Type</label>
              <CustomDropdown
                options={userTypeOptions}
                value={accountInfo.userType}
                onChange={(value) => handleInfoChange({ target: { name: 'userType', value } } as any)}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Store Name</label>
              <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                <input name="storeName" value={accountInfo.storeName} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" />
              </div>
            </div>
            <div className="mb-8">
              <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Store Location</label>
              <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                <input name="storeLocation" value={accountInfo.storeLocation} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between mb-8">
              <span className="text-[#E73828] font-semibold">Account Security</span>
              <button 
                type="button" 
                className="bg-[#E73828] text-white rounded-full px-6 py-2 font-bold hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200" 
                onClick={() => setShowSecurity(true)}
              >
                CHANGE PASSWORD
              </button>
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#E73828] text-white rounded-full py-3 font-bold text-lg hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200"
            >
              SAVE
            </button>
          </form>
          {showSecurity && (
            <form onSubmit={handleSecuritySubmit} id="security-section">
              <div className="text-[22px] font-semibold text-[#E73828] mb-6">Account Security</div>
              <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Old Password</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                  <input name="oldPassword" value={security.oldPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" type="password" placeholder="Old Password" />
                </div>
              </div>
              <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">New Password</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                  <input name="newPassword" value={security.newPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" type="password" placeholder="New Password" />
                </div>
              </div>
              <div className="mb-8">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707]">Confirm New Password</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] rounded-[50.5px]">
                  <input name="confirmPassword" value={security.confirmPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] bg-transparent border-none outline-none" type="password" placeholder="Confirm New Password" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  type="submit" 
                  className="w-full bg-[#E73828] text-white rounded-full py-3 font-bold text-lg hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200"
                >
                  SAVE PASSWORD
                </button>
                <button 
                  type="button" 
                  className="w-full border-2 border-[#E73828] text-[#E73828] rounded-full py-3 font-bold text-lg hover:bg-[#E73828] hover:text-white transition-colors duration-200" 
                  onClick={handleDiscard}
                >
                  DISCARD CHANGES
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 