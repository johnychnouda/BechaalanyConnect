import DashboardLayout from "@/components/ui/dashboard-layout";
import React, { useState, useRef, useEffect } from "react";
import BackButton from "@/components/ui/back-button";
import { useAuth } from "@/context/AuthContext";
import { useGlobalContext } from "@/context/GlobalContext";
import { updateUserInfo, fetchCurrentUser } from "@/services/api.service";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

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

  const { isRefreshing } = useAuth();
  const { generalData, dashboardSettings } = useGlobalContext();
  const countries = generalData?.countries || [];
  const userTypes = generalData?.user_types || [];
  const { locale } = useLanguage();
  const router = useRouter();

  // Profile data state
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);


  // Form state for account info
  const [accountInfo, setAccountInfo] = useState({
    username: "",
    phone: "",
    country: "",
    userType: "",
    storeName: "",
    storeLocation: "",
  });

  // Original form values to track changes
  const [originalAccountInfo, setOriginalAccountInfo] = useState({
    username: "",
    phone: "",
    country: "",
    userType: "",
    storeName: "",
    storeLocation: "",
  });

  // Function to check if form has changes
  const hasFormChanges = () => {
    return JSON.stringify(accountInfo) !== JSON.stringify(originalAccountInfo);
  };

  // Fetch profile data directly from API on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const freshProfileData = await fetchCurrentUser(locale);
        setProfileData(freshProfileData);

        // Update form state with fresh data
        const formData = {
          username: freshProfileData.user.username || "",
          phone: freshProfileData.user.phone_number || "",
          country: freshProfileData.user.country || "",
          userType: freshProfileData.user.user_types?.id?.toString() || "",
          storeName: freshProfileData.user.business_name || "",
          storeLocation: freshProfileData.user.business_location || "",
        };

        setAccountInfo(formData);
        setOriginalAccountInfo(formData); // Set original values for change tracking

      } catch (error) {
        setProfileError(locale === 'en' ? 'Failed to load profile data. Please refresh the page.' : 'فشل تحميل بيانات الحساب. الرجاء تحديث الصفحة.');
        toast.error(locale === 'en' ? 'Failed to load profile data. Please refresh the page.' : 'فشل تحميل بيانات الحساب. الرجاء تحديث الصفحة.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [locale]); // Only depend on locale, fetch fresh data every time

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

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if there are any changes
    if (!hasFormChanges()) {
      toast.info(locale === 'en' ? 'No changes detected. Please modify the form before saving.' : 'لم يتم التعرف على أي تغييرات. الرجاء تعديل النموذج قبل الحفظ.');
      return;
    }

    const restructuredAccountInfo = {
      username: accountInfo.username,
      country: accountInfo.country,
      phone_number: accountInfo.phone.toString(),
      // is_business_user: accountInfo.userType === 'business',
      business_name: accountInfo.storeName,
      business_location: accountInfo.storeLocation,
      user_types_id: accountInfo.userType,
    }
    try {
      await updateUserInfo(locale, restructuredAccountInfo);

      // Fetch fresh profile data from API
      const freshProfileData = await fetchCurrentUser(locale);
      setProfileData(freshProfileData);

      // Update form state with fresh data
      const updatedFormData = {
        username: freshProfileData.user.username || "",
        phone: freshProfileData.user.phone_number || "",
        country: freshProfileData.user.country || "",
        userType: freshProfileData.user.user_types?.id?.toString() || "",
        storeName: freshProfileData.user.business_name || "",
        storeLocation: freshProfileData.user.business_location || "",
      };

      setAccountInfo(updatedFormData);
      setOriginalAccountInfo(updatedFormData); // Update original values after successful save

      toast.success(locale === 'en' ? 'Account data updated successfully!' : 'تم تحديث بيانات الحساب بنجاح!');

    } catch (error) {
      console.error("Error saving account info:", error);
      toast.error(locale === 'en' ? 'Failed to save account info. Please try again.' : 'فشل تحديث بيانات الحساب. الرجاء المحاولة مرة أخرى.');
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save password logic
    console.log("Changing password:", security);
    alert(locale === 'en' ? 'Password changed!' : 'تم تغيير كلمة المرور!');
    setShowSecurity(false);
  };

  const handleDiscard = () => {
    setSecurity({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowSecurity(false);
  };

  const handleResetForm = () => {
    setAccountInfo({ ...originalAccountInfo });
    toast.info(locale === 'en' ? 'Form reset to original values' : 'تم إعادة تعيين النموذج إلى القيم الأصلية');
  };



  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="w-fit">
          <BackButton label={generalData?.settings?.back_button_label} href="/account-dashboard" />
        </div>
        <div className="text-[#E73828] font-semibold font-['Roboto'] uppercase mb-8 mt-0 tracking-tight whitespace-nowrap text-[22px] xs:text-[26px] sm:text-[30px] md:text-[36px] lg:text-[40px] xl:text-[42px] leading-tight text-center sm:text-left">
          {dashboardSettings?.dashboard_page_settings?.account_settings_page_title}
        </div>
        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar (left) is handled by DashboardLayout */}
          <div className="flex-1 max-w-2xl">
            {/* Account Info Form */}
            <div className="relative">
              {(isRefreshing || isLoadingProfile) && (
                <div className="absolute inset-0 bg-white/70 dark:bg-black/70 z-10 flex items-center justify-center rounded-lg">
                  <div className="flex items-center gap-3 bg-white dark:bg-[#232323] px-6 py-3 rounded-full shadow-lg border border-[#E73828]/20">
                    <span className="text-[#E73828] font-semibold">
                      {isLoadingProfile ? 'Loading account data...' : 'Updating account data...'}
                    </span>
                  </div>
                </div>
              )}
              {profileError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 dark:text-red-400 font-medium">{profileError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleInfoSubmit} className="mb-12">
                <div className="text-[22px] font-semibold text-[#E73828] mb-6">{dashboardSettings?.dashboard_page_settings?.account_info_label}</div>
                <div className="mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.username_placeholder}</label>
                  <div className="flex flex-row items-center p-[12px_24px] mt-2 gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="username" value={accountInfo.username} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                  </div>
                </div>
                {/* <div className="mb-4">
                <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">Email</label>
                <div className="flex flex-row items-center p-[12px_24px] gap-1 w-full border border-[#E73828] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                  <input name="email" value={accountInfo.email} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" type="email" />
                </div>
              </div> */}
                {/* Phone Number */}
                <div className="flex flex-col items-start gap-1 w-full mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.phone_number_placeholder}</label>
                  <div className="flex flex-row rtl:flex-row-reverse rtl:justify-end items-center p-[12px_24px] mt-2 gap-2 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <div className="font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white select-none rtl:text-right">{locale == 'en' ? `+${phonePrefix}` : `${phonePrefix}+` || ''}</div>
                    <div className="max-w-[calc(100%-70px)]">
                      <input
                        name="phone"
                        value={accountInfo.phone}
                        onChange={handleInfoChange}
                        className="w-fit font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none rtl:text-right"
                        placeholder={generalData?.logging_page_settings?.phone_number_placeholder}
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>
                </div>
                {/* Country */}
                <div className="flex flex-col items-start gap-1 w-full mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.country_placeholder}</label>
                  <CustomDropdown
                    options={countries.map(country => ({
                      value: country.slug,
                      label: country.title
                    }))}
                    value={accountInfo.country}
                    onChange={(value) => handleDropdownChange('country', value)}
                    className="w-full mt-2"
                  />
                </div>
                {/* User Type */}
                <div className="flex flex-col items-start gap-1 w-full mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.user_type_placeholder}</label>
                  <CustomDropdown
                    options={userTypes.map(userType => ({
                      value: userType.id.toString(),
                      label: userType.title
                    }))}
                    value={accountInfo.userType.toString()}
                    onChange={(value) => handleDropdownChange('userType', value)}
                    className="w-full mt-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.store_name_placeholder}</label>
                  <div className="flex flex-row items-center p-[12px_24px] mt-2 gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="storeName" value={accountInfo.storeName} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="font-['Roboto'] font-semibold text-[16px] text-[#070707] dark:text-white">{generalData?.logging_page_settings?.store_location_placeholder}</label>
                  <div className="flex flex-row items-center p-[12px_24px] mt-2 gap-1 w-full border border-[#070707] dark:border-[#444] rounded-[50.5px] bg-white dark:bg-[#232323]">
                    <input name="storeLocation" value={accountInfo.storeLocation} onChange={handleInfoChange} className="w-full font-['Roboto'] font-normal text-[16px] text-[#070707] dark:text-white bg-transparent border-none outline-none" />
                  </div>
                </div>

                <div className="flex flex-row flex-nowrap w-full gap-4 overflow-x-auto mb-4">
                  <button
                    type="submit"
                    disabled={!hasFormChanges() || isRefreshing || isLoadingProfile}
                    className={`rounded-full py-3 font-bold text-lg transition-colors duration-200 min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0 whitespace-nowrap ${!hasFormChanges() || isRefreshing || isLoadingProfile
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-[#E73828] text-white hover:bg-white hover:text-[#E73828] hover:border hover:border-[#E73828]'
                      }`}
                    style={{ flexShrink: 1, maxWidth: '200px' }}
                    onClick={handleInfoSubmit}
                    title={!hasFormChanges() ? 'No changes to save' : ''}
                  >
                    {isRefreshing ? locale === 'en' ? 'SAVING...' : 'جاري التحديث...' : locale === 'en' ? 'SAVE CHANGES' : 'حفظ التغييرات'}
                  </button>

                  {hasFormChanges() && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      disabled={isRefreshing || isLoadingProfile}
                      className="border-2 border-[#E73828] text-[#E73828] rounded-full py-3 font-bold text-lg hover:bg-[#E73828] hover:text-white transition-colors duration-200 min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ flexShrink: 1, maxWidth: '200px' }}
                      title="Reset form to original values"
                    >
                      {locale === 'en' ? 'RESET' : 'إعادة تعيين'}
                    </button>
                  )}
                </div>

                <div className="flex flex-row items-center justify-between gap-2 flex-nowrap w-full overflow-x-auto mb-8" style={{ minWidth: 0 }}>
                  <button
                    type="button"
                    className="bg-[#E73828] text-white rounded-full px-6 py-2 font-bold whitespace-nowrap border border-[#E73828] hover:bg-white hover:text-[#E73828] hover:border-[#E73828] transition-colors duration-200 text-base min-[320px]:text-sm min-[320px]:px-3 min-[320px]:py-1.5 min-w-0"
                    style={{ flexShrink: 1, maxWidth: '200px' }}
                    onClick={() => setShowSecurity(true)}
                  >
                    {locale === 'en' ? 'CHANGE PASSWORD' : 'تغيير كلمة المرور'}
                  </button>
                </div>

                {/* Form status indicator */}
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {hasFormChanges() && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {locale === 'en' ? 'You have unsaved changes' : 'لديك تغييرات غير محفوظة'}
                    </div>
                  )}
                </div>

              </form>
            </div>
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