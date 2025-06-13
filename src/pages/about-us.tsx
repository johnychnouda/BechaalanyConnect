import React from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import BackButton from "@/components/ui/back-button";

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us - Bechaalany Connect</title>
        <meta name="description" content="Learn about Bechaalany Connect" />
      </Head>

      {/* Use a flex container for content */}
      <div className="min-h-screen flex flex-col">
        {/* Main content */}
        <div className="flex-grow">
          <div className="container mx-auto py-12 px-4 md:px-6 lg:px-8">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left column - Logo */}
              <div className="bg-gray-200 rounded-lg p-8 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Image
                    src="/bechaalany-connect-logo.png"
                    alt="Bechaalany Connect Logo"
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
                  <h1 className="text-4xl font-bold text-[#E93323] mb-4">ABOUT US</h1>
                  <p className="text-gray-700 dark:text-white">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                    nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>

                {/* Contact Us Section */}
                <div className="mb-10">
                  <h2 className="text-4xl font-bold text-[#E93323] mb-4">CONTACT US</h2>
                  
                  <div className="mb-3">
                    <Link href="tel:+96181708706" className="block text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#E93323]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      +961 81 708 706
                    </Link>
                  </div>
                  
                  <div>
                    <Link href="mailto:BechalanyConnect@gmail.com" className="block text-[12px] sm:text-[16px] md:text-[18px] font-medium break-all hover:text-[#E93323]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-[#E93323]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      BechalanyConnect@gmail.com
                    </Link>
                  </div>
                </div>

                {/* Follow Us Section */}
                <div>
                  <h2 className="text-4xl font-bold text-[#E93323] mb-4">FOLLOW US</h2>
                  <div className="flex space-x-4">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
