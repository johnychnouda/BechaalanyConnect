import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useRef, useEffect } from "react";
import BackButton from "@/components/ui/back-button";
import { useAuth } from "@/context/AuthContext";
import { useGlobalContext } from "@/context/GlobalContext";

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
        className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] cursor-pointer hover:border-[#E73828] transition-colors duration-200 bg-white dark:bg-[#232323]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex-1 font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white">
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
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#232323] border border-[#070707] dark:border-[#444] rounded-[25px] shadow-sm max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-6 py-3 cursor-pointer transition-colors duration-200 ${option.value === value
                ? "bg-[#E73828] text-white"
                : "hover:bg-[#E73828] hover:text-white dark:hover:bg-[#E73828] dark:hover:text-white"
                } dark:text-white`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="font-['Roboto'] font-normal text-[16px] dark:text-white">
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

  const { user } = useAuth();
  const { generalData } = useGlobalContext();
  const countries = generalData?.countries || [];
  const userTypes = generalData?.user_types || [];

  // Form state for account info
  const [accountInfo, setAccountInfo] = useState({
    username: user?.name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    country: user?.country || "",
    userType: user?.user_types?.title || "",
    storeName: user?.business_name || "",
    storeLocation: user?.business_location || "",
  });

  // Update form state when user data changes
  useEffect(() => {
    if (user) {
      setAccountInfo({
        username: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        country: user.country || "",
        userType: user.user_types?.title || "",
        storeName: user.business_name || "",
        storeLocation: user.business_location || "",
      });
    }
  }, [user]);

  const country = accountInfo.country as keyof typeof countries;
  const phonePrefix = countries.find(c => c.slug === country)?.code || "+";


  // Account Security state
  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide Account Security
  const [showSecurity, setShowSecurity] = useState(false);

  // Handlers
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    setAccountInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save account info logic
    console.log("Saving account info:", accountInfo);
    alert("Account info saved!");
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save password logic
    console.log("Changing password:", security);
    alert("Password changed!");
    setShowSecurity(false);
  };

  const handleDiscard = () => {
    setSecurity({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowSecurity(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] font-semibold font-['Roboto'] uppercase mb-8 mt-0 tracking-tight whitespace-nowrap text-[22px] xs:text-[26px] sm:text-[30px] md:text-[36px] lg:text-[40px] xl:text-[42px] leading-tight text-center sm:text-left">
          ACCOUNT SETTINGS
        </div>
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar (left) is handled by DashboardLayout */}
          <div className="flex-1 max-w-2xl">
            {/* Account Info Form */}
            <form onSubmit={handleInfoSubmit} className="mb-12">
              <div className="text-[22px] font-semibold text-[#E73828] mb-6">Account Info</div>
              <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Username</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <input name="username" value={accountInfo.username} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                </div>
              </div>
              <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Email</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#E73828] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <input name="email" value={accountInfo.email} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" type="email" />
                </div>
              </div>
              {/* Phone Number */}
              <div className="flex flex-col items-start gap-1 w-full">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Phone Number</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-2 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <span className="font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white select-none">{phonePrefix || ''}</span>
                  <input
                    name="phone"
                    value={accountInfo.phone}
                    onChange={handleInfoChange}
                    className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none"
                    placeholder="Phone Number"
                    style={{ direction: 'ltr' }}
                  />
                </div>
              </div>
              {/* Country */}
              <div className="flex flex-col items-start gap-1 w-full">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Country</label>
                <CustomDropdown
                  options={countries.map(country => ({
                    value: country.slug,
                    label: country.title
                  }))}
                  value={accountInfo.country}
                  onChange={(value) => handleDropdownChange('country', value)}
                  className="w-full"
                />
              </div>
              {/* User Type */}
              <div className="flex flex-col items-start gap-1 w-full">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">User Type</label>
                <CustomDropdown
                  options={userTypes.map(userType => ({
                    value: userType.title,
                    label: userType.title
                  }))}
                  value={accountInfo.userType}
                  onChange={(value) => handleDropdownChange('userType', value)}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Store Name</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <input name="storeName" value={accountInfo.storeName} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                </div>
              </div>
              <div className="mb-8">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Store Location</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <input name="storeLocation" value={accountInfo.storeLocation} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                </div>
              </div>
              <div className="flex flex-row items-center justify-between gap-2 flex-nowrap w-full overflow-x-auto mb-8" style={{ minWidth: 0 }}>
                <span className="text-[#E73828] font-semibold whitespace-nowrap min-w-0">
                  Account Security
                </span>
                <button
                  type="button"
                  className="bg-[#E73828] text-white rounded-full px-6 py-2 font-bold whitespace-nowrap hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200 text-base min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0"
                  style={{ flexShrink: 1, maxWidth: '200px' }}
                  onClick={() => setShowSecurity(true)}
                >
                  CHANGE PASSWORD
                </button>
              </div>
              <div className="flex flex-row flex-nowrap w-full gap-4 overflow-x-auto mb-4">
                <button
                  type="submit"
                  className="bg-[#E73828] text-white rounded-full py-3 font-bold text-lg hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200 min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0 whitespace-nowrap"
                  style={{ flexShrink: 1, maxWidth: '200px' }}
                >
                  SAVE
                </button>
              </div>
            </form>
            {showSecurity && (
              <form onSubmit={handleSecuritySubmit} id="security-section">
                <div className="text-[22px] font-semibold text-[#E73828] mb-6">Account Security</div>
                <div className="mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Old Password</label>
                  <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="oldPassword" value={security.oldPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" type="password" placeholder="Old Password" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">New Password</label>
                  <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="newPassword" value={security.newPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" type="password" placeholder="New Password" />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Confirm New Password</label>
                  <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="confirmPassword" value={security.confirmPassword} onChange={handleSecurityChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" type="password" placeholder="Confirm New Password" />
                  </div>
                </div>
                <div className="flex flex-row flex-nowrap w-full gap-4 overflow-x-auto">
                  <button
                    type="submit"
                    className="bg-[#E73828] text-white rounded-full py-3 font-bold text-lg hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828] transition-colors duration-200 min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0 whitespace-nowrap"
                    style={{ flexShrink: 1, maxWidth: '200px' }}
                  >
                    SAVE PASSWORD
                  </button>
                  <button
                    type="button"
                    className="border-2 border-[#E73828] text-[#E73828] rounded-full py-3 font-bold text-lg hover:bg-[#E73828] hover:text-white transition-colors duration-200 min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0 whitespace-nowrap"
                    style={{ flexShrink: 1, maxWidth: '200px' }}
                    onClick={handleDiscard}
                  >
                    DISCARD CHANGES
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 