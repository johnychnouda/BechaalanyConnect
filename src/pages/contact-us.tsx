import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import BackButton from "@/components/ui/back-button";

export default function ContactUs() {
  const [subject, setSubject] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const subjects = [
    "Feedback",
    "Complaint",
    "Inquiry",
    "Technical Support",
    "Billing Issue",
    "Partnership Request",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
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
              <BackButton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left column - Form section */}
              <div className="bg-white dark:bg-[#232323] rounded-lg p-8 shadow-md dark:text-white">
                <h2 className="text-3xl font-bold text-[#E93323] mb-4">GET IN TOUCH</h2>
                <p className="mb-6 text-gray-700 dark:text-white">
                  If you have a complaint, concern, or just want to share your thoughts,
                  please fill out the form below. Our team will get back to you as soon as 
                  possible.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Phone Number/Email"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    />
                  </div>
                  
                  {/* Subject dropdown */}
                  <div className="relative">
                    <div 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg flex justify-between items-center bg-white dark:bg-[#181818]"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{ cursor: 'default', color: '#E93323' }}
                    >
                      <span className={`${subject ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                        {subject || "Subject"}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#232323] border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10">
                        {subjects.map((item, index) => (
                          <div 
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#181818] text-[#E93323] cursor-pointer"
                            onClick={() => {
                              setSubject(item);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <textarea
                      placeholder="Message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#E93323] bg-white dark:bg-[#181818] text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                      required
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-[#E93323] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#d62d1f] transform hover:scale-[1.02] transition-all duration-200 ease-in-out"
                  >
                    SUBMIT
                  </button>
                </form>
              </div>
              
              {/* Right column - Contact details and image */}
              <div className="bg-gray-100 dark:bg-[#232323] rounded-lg p-8 dark:text-white">
                <h2 className="text-3xl font-bold text-[#E93323] mb-6">CONTACT DETAILS</h2>
                
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="text-[#E93323] mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a href="tel:+96181708706" className="hover:text-[#E93323]">+961 81 708 706</a>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-[#E93323] mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href="mailto:Email@email.com" className="hover:text-[#E93323]">BechaalanyConnect@gmail.com</a>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-[#E93323] mb-4">FOLLOW US</h2>
                <div className="flex space-x-4 mb-8">
                  <Link href="https://instagram.com" className="text-[#E93323] hover:opacity-80">
                    <FaInstagram size={28} />
                  </Link>
                  <Link href="https://facebook.com" className="text-[#E93323] hover:opacity-80">
                    <FaFacebook size={28} />
                  </Link>
                  <Link href="https://tiktok.com" className="text-[#E93323] hover:opacity-80">
                    <FaTiktok size={28} />
                  </Link>
                </div>
                
                {/* Customer service image */}
                <div className="mt-8">
                  <Image
                    src="/customer-service.png" 
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
        
        {/* No need to explicitly include Footer component here */}
        {/* It will be rendered through your app's layout structure */}
      </div>
    </>
  );
}
