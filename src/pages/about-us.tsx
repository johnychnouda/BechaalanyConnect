import React, { useEffect, useState } from "react";
import Head from "next/head";
import SeoHead from "@/components/ui/SeoHead";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import BackButton from "@/components/ui/back-button";
import { useGlobalContext } from "@/context/GlobalContext";
import { fetchAboutUsData } from "@/services/api.service";
import { useRouter } from "next/router";
import { AboutUsDataType } from "@/types/aboutData.type";
import ButtonLink from "@/components/ui/button-link";
import PageLoader from "@/components/ui/PageLoader";

export default function AboutUs() {
  const { generalData } = useGlobalContext();
  const router = useRouter();
  const [aboutUsData, setAboutUsData] = useState<AboutUsDataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.locale) return;
    setIsLoading(true);
    setError(null);

    fetchAboutUsData(router.locale)
      .then((data) => {
        setAboutUsData(data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setAboutUsData(null);
        setError('Failed to load about data');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router.locale]); 

  return (
    <>
      <SeoHead seo={aboutUsData?.seo} />
      {
        isLoading ? <PageLoader />
          :
          <div className="min-h-screen flex flex-col">
            {/* Main content */}
            <div className="flex-grow">
              <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
                <div className="mb-6">
                  <BackButton label={generalData?.settings.back_button_label || 'Back'} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Left column - Logo */}
                  <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Image
                        src={aboutUsData?.about_page_setting.full_path.image || ''}
                        alt="Bechaalany Connect"
                        width={300}
                        height={300}
                        className="mx-auto"
                        priority
                      />
                    </div>
                  </div>

                  {/* Right column - Content */}
                  <div className="flex flex-col">
                    {/* About Us Section */}
                    <div className="mb-10">
                      <h1 className="text-4xl font-bold text-[#E93323] mb-4">
                        {aboutUsData?.about_page_setting.title}
                      </h1>
                      <div className="text-gray-700 dark:text-white" dangerouslySetInnerHTML={{
                        __html: aboutUsData?.about_page_setting.description || ''
                      }}>
                      </div>
                    </div>

                    {/* Contact Us Section */}
                    <div className="mb-10">
                      <h2 className="text-4xl font-bold text-[#E93323] mb-4">{aboutUsData?.about_page_setting.contact_section_title}</h2>

                      {
                        aboutUsData?.contact_details.map((contact, index) => (
                          <div key={index} className="flex flex-col gap-2 mb-4">
                            <div>
                              {
                                contact.branch_name && (
                                  <span className="text-[12px] sm:text-[16px] md:text-[20px] font-bold break-all">{contact.branch_name}</span>
                                )
                              }
                            </div>
                            {
                              contact.phone_number && (
                                <div key={index}>
                                  <Link href={`tel:${contact.phone_number}`} target="_blank" className="flex items-center text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3 text-[#E93323] flex-shrink-0 rtl:rotate-y-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {
                                      router.locale === 'en' && (
                                        <span className="mr-0.5">+</span>
                                      )
                                    }
                                    <span className="text-right" dir="ltr">{contact.phone_number}</span>
                                    {
                                      router.locale === 'ar' && (
                                        <span className="ml-0.5">+</span>
                                      )
                                    }
                                  </Link>
                                </div>
                              )
                            }
                            {
                              contact.email && (
                                <div key={index}>
                                  <Link href={`mailto:${contact.email}`} target="_blank" className="flex items-center text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3 text-[#E93323] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>{contact.email}</span>
                                  </Link>
                                </div>
                              )
                            }
                            {

                              (contact.location_url && contact.address) && (
                                <div key={index}>
                                  <Link href={contact.location_url} target="_blank" className="flex items-center text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                                    <svg fill="#E93323" className="h-5 w-5 mr-3 rtl:mr-0 rtl:ml-3 text-[#E93323] flex-shrink-0" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                                      <g id="SVGRepo_iconCarrier">
                                        <path d="M16.114-0.011c-6.559 0-12.114 5.587-12.114 12.204 0 6.93 6.439 14.017 10.77 18.998 0.017 0.020 0.717 0.797 1.579 0.797h0.076c0.863 0 1.558-0.777 1.575-0.797 4.064-4.672 10-12.377 10-18.998 0-6.618-4.333-12.204-11.886-12.204zM16.515 29.849c-0.035 0.035-0.086 0.074-0.131 0.107-0.046-0.032-0.096-0.072-0.133-0.107l-0.523-0.602c-4.106-4.71-9.729-11.161-9.729-17.055 0-5.532 4.632-10.205 10.114-10.205 6.829 0 9.886 5.125 9.886 10.205 0 4.474-3.192 10.416-9.485 17.657zM16.035 6.044c-3.313 0-6 2.686-6 6s2.687 6 6 6 6-2.687 6-6-2.686-6-6-6zM16.035 16.044c-2.206 0-4.046-1.838-4.046-4.044s1.794-4 4-4c2.207 0 4 1.794 4 4 0.001 2.206-1.747 4.044-3.954 4.044z">
                                        </path>
                                      </g>
                                    </svg>
                                    <span>{contact.address}</span>
                                  </Link>
                                </div>
                              )
                            }
                          </div>

                        ))
                      }
                    </div>

                    {/* Follow Us Section */}
                    <div>
                      <h2 className="text-4xl font-bold text-[#E93323] mb-4">{aboutUsData?.about_page_setting.social_section_title}</h2>
                      <div className="flex gap-4">
                        {generalData?.social_links.map((social, index) => (
                          <ButtonLink target="_blank" href={social.url} key={index} className="hover:opacity-80 transition-opacity flex items-center p-0">
                            <div className="flex items-center w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-[25px] md:h-[25px]">
                              <Image src={social.full_path.about_icons} alt={social.title} width={25} height={25} />
                            </div>
                          </ButtonLink>
                        ))}
                      </div>
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
