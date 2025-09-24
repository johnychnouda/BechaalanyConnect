import React, { useEffect, useState } from "react";
import SeoHead from "@/components/ui/SeoHead";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import BackButton from "@/components/ui/back-button";
import { ContactUsDataType } from "@/types/ContactPageData.type";
import { fetchContactUsData, submitContactForm } from "@/services/api.service";
import { useRouter } from "next/router";
import { useGlobalContext } from "@/context/GlobalContext";
import PageLoader from "@/components/ui/PageLoader";
import ContactForm from "@/components/contact-form/ContactForm";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setIsLoading(true);
    setError(null);

    fetchContactUsData(router.locale)
      .then((data) => {
        setContactUsData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setContactUsData(null);
        setError('Failed to load contact us data');
      })
      .finally(() => {
        setIsLoading(false);
      });
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
        message: data.message,
        lang: router.locale || 'en'
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
      <SeoHead seo={contactUsData?.seo} />

      {isLoading ? <PageLoader />
        :
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

                 <ContactForm 
                   contactUsData={contactUsData} 
                   errors={errors} 
                   register={register} 
                   handleSubmit={handleSubmit} 
                   onSubmit={onSubmit} 
                   setIsDropdownOpen={setIsDropdownOpen} 
                   isDropdownOpen={isDropdownOpen}
                   selectedSubject={selectedSubject}
                   subjects={subjects}
                   handleSubjectSelect={handleSubjectSelect}
                   submitSuccess={submitSuccess}
                   submitError={submitError}
                   isSubmitting={isSubmitting}
                 />
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
      }
    </>
  );
}
