import { ContactUsDataType } from '@/types/ContactPageData.type'
import React from 'react'
import { useRouter } from 'next/router'

interface ContactFormProps {
  contactUsData: ContactUsDataType | null;
  errors: any;
  register: any;
  handleSubmit: any;
  onSubmit: any;
  setIsDropdownOpen: (value: boolean) => void;
  isDropdownOpen: boolean;
  selectedSubject: string;
  subjects: string[] | undefined;
  handleSubjectSelect: (subject: string) => void;
  submitSuccess: boolean;
  submitError: string;
  isSubmitting: boolean;
}

function ContactForm({ 
  contactUsData, 
  errors, 
  register, 
  handleSubmit, 
  onSubmit, 
  setIsDropdownOpen, 
  isDropdownOpen,
  selectedSubject,
  subjects,
  handleSubjectSelect,
  submitSuccess,
  submitError,
  isSubmitting
}: ContactFormProps) {
    const router = useRouter();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <input
                    type="text"
                    placeholder={contactUsData?.contact_page_setting.name_label || ''}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400 ${errors.name
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                    {...register("name", {
                        required: router.locale === "ar" ? "يجب أن يكون لديك اسم" : "Name is required"
                    })}
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div>
                <input
                    type="email"
                    placeholder={contactUsData?.contact_page_setting.email_label || ''}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400 ${errors.email
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                    {...register("email", {
                        required: router.locale === "ar" ? "يجب أن يكون لديك بريد إلكتروني" : "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: router.locale === "ar" ? "يرجى إدخال عنوان بريد إلكتروني صالح" : "Please enter a valid email address"
                        }
                    })}
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <input
                    type="tel"
                    placeholder={contactUsData?.contact_page_setting.phone_label || ''}
                    className={`w-full rtl:text-right px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400
       ${errors.phone
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                    {...register("phone", {
                        required: router.locale === "ar" ? "يجب أن يكون لديك رقم هاتف" : "Phone number is required",
                        pattern: {
                            value: /^[\+]?[1-9][\d]{0,15}$/,
                            message: router.locale === "ar" ? "يرجى إدخال رقم هاتف صالح" : "Please enter a valid phone number"
                        }
                    })}
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.phone.message}
                    </p>
                )}
            </div>

            {/* Subject dropdown */}
            <div className="relative">
                <div
                    className={`w-full px-4 py-3 border rounded-lg flex justify-between items-center bg-white dark:bg-[#181818] ${errors.subject
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ cursor: 'default', color: '#E93323' }}
                >
                    <span className={`${selectedSubject ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                        {selectedSubject || contactUsData?.contact_page_setting.subject_label}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                <input
                    type="hidden"
                    {...register("subject", {
                        required: router.locale === "ar" ? "يرجى إختيار موضوع" : "Please select a subject"
                    })}
                />
                {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.subject.message}
                    </p>
                )}

                {isDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#232323] border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                        {subjects && subjects.map((item, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#181818] text-[#E93323] cursor-pointer"
                                onClick={() => handleSubjectSelect(item)}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <textarea
                    placeholder={contactUsData?.contact_page_setting.message_label || ''}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400 ${errors.message
                        ? 'border-red-500 dark:border-red-400'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                    {...register("message", {
                        required: router.locale === "ar" ? "يجب أن يكون لديك رسالة" : "Message is required",
                        minLength: {
                            value: 8,
                            message: router.locale === "ar" ? "يجب أن يكون لديك رسالة على الأقل 8 أحرف" : "Message must be at least 8 characters long"
                        }
                    })}
                ></textarea>
                {errors.message && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.message.message}
                    </p>
                )}
            </div>

            {/* Success Message */}
            {submitSuccess && (
                router.locale === 'en' ? (
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                        <p className="font-medium">Thank you for your message!</p>
                        <p className="text-sm">We have received your email and will get back to you soon.</p>
                    </div>
                ) : (
                    <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                        <p className="font-medium">شكرا لك على رسالتك!</p>
                        <p className="text-sm">لقد تم تسجيل رسالتك وسيتم الرد عليك قريبا.</p>
                    </div>
                )
            )}

            {/* Error Message */}
            {submitError && (
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                    <p className="text-sm">{submitError}</p>
                </div>
            )}

            {!submitSuccess && (
                <button
                    type="submit"
                    className="w-full bg-[#E93323] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#d62d1f] transform hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (router.locale === 'en' ? 'Submitting...' : 'جاري الإرسال...') : (contactUsData?.contact_page_setting.button_text || 'Submit')}
                </button>
            )}
        </form>
    )
}

export default ContactForm