import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import BackButton from "@/components/ui/back-button";
import { ContactUsDataType } from "@/types/ContactPageData.type";
import { fetchContactUsData, submitContactForm } from "@/services/api.service";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactUs() {
  const { generalData } = useGlobalContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contactUsData, setContactUsData] = useState<ContactUsDataType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    },
    mode: "onBlur"
  });

  const selectedSubject = watch("subject");

  useEffect(() => {
    if (!router.locale) return;
    fetchContactUsData(router.locale).then(setContactUsData);
  }, [router.locale]);

  const subjects = contactUsData?.contact_form_subjects.map((subject) => subject.title);

  const handleSubjectSelect = (selectedSubject: string) => {
    setValue("subject", selectedSubject);
    setIsDropdownOpen(false);
  };

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await submitContactForm({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message
      });

      setSubmitSuccess(true);
      reset();
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setSubmitError(error.response.data.error);
      } else {
        setSubmitError("An error occurred while submitting the form. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us - Bechaalany Connect</title>
        <meta name="description" content="Contact Bechaalany Connect" />
      </Head>

      {/* Use a flex container for content - just like in about-us.tsx */}
      <div className="min-h-screen flex flex-col">
        {/* Main content - with flex-grow to push footer down */}
        <div className="flex-grow">
          <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
            <div className="mb-6">
              <BackButton label={generalData?.settings.back_button_label || ''} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left column - Form section */}
              <div className="bg-white dark:bg-[#232323] rounded-lg p-8 shadow-md dark:text-white">
                <h2 className="text-3xl font-bold text-[#E93323] mb-4">
                  {contactUsData?.contact_page_setting.title}
                </h2>
                <div className="text-gray-700 dark:text-white mb-6" dangerouslySetInnerHTML={{
                  __html: contactUsData?.contact_page_setting.description || ''
                }}>
                </div>

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
                        required: "Name is required"
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
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address"
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
                        required: "Phone number is required",
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: "Please enter a valid phone number"
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
                        required: "Please select a subject"
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
                        required: "Message is required",
                        minLength: {
                          value: 8,
                          message: "Message must be at least 8 characters long"
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

                  {!submitSuccess && !submitError && (
                    <button
                      type="submit"
                      className="w-full bg-[#E93323] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#d62d1f] transform hover:scale-[1.02] transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (router.locale === 'en' ? 'Submitting...' : 'جاري الإرسال...') : (contactUsData?.contact_page_setting.button_text || 'Submit')}
                    </button>
                  )}
                </form>
              </div>

              {/* Right column - Contact details and image */}
              <div className="bg-gray-100 dark:bg-[#232323] rounded-lg p-8 dark:text-white">
                <h2 className="text-3xl font-bold text-[#E93323] mb-6">{contactUsData?.contact_page_setting.contact_title || 'Contact Details'}</h2>

                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="text-[#E93323] mr-3 rtl:mr-0 rtl:ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rtl:rotate-y-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>

                    <a href={`tel:+${contactUsData?.contact_details.phone_number}`} className="block text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                      <span className="mr-0.5">
                        {router.locale === 'en' && '+'}
                      </span>
                      <span className="text-right" dir="ltr">
                        {contactUsData?.contact_details.phone_number}
                      </span>
                      <span>
                        {router.locale === 'ar' && '+'}
                      </span>
                    </a>
                  </div>

                  <div className="flex items-center">
                    <div className="text-[#E93323] mr-3 rtl:mr-0 rtl:ml-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href={`mailto:${contactUsData?.contact_details.email}`} className="block text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                      {contactUsData?.contact_details.email}
                    </a>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-[#E93323] mb-4">{contactUsData?.contact_page_setting.follow_us_title || 'Follow Us'}</h2>
                <div className="flex gap-4 mb-8">
                  {generalData?.social_links.map((social, index) => (
                    <Link href={social.url} target="_blank" key={index} className="text-[#E93323] hover:opacity-80">
                      <Image src={social.full_path.about_icons} alt={social.title} width={25} height={25} />
                    </Link>
                  ))}
                </div>

                {/* Customer service image */}
                <div className="mt-8 mx-auto flex justify-center">
                  <Image
                    src={contactUsData?.contact_page_setting.full_path.image || ''}
                    alt="Customer Service"
                    width={500}
                    height={400}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
