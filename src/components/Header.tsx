import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            Bechaal
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/categories" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 rounded">
              Categories
            </Link>
            <Link href="/about-us" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 rounded">
              About Us
            </Link>
            <Link href="/contact-us" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-2 py-1 rounded">
              Contact Us
            </Link>
          </nav>

          {/* Desktop right section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Notification bell */}
            <button className="notification" tabIndex={0} aria-label="Notifications">
              <div className="bell-container">
                <div className="bell"></div>
              </div>
            </button>
            {/* Account link */}
            <Link href="/account-dashboard" className="cursor-pointer transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
              <svg width="22" height="22" viewBox="0 0 17 20" fill="none" className="text-app-red group-hover:text-white">
                {/* SVG paths here */}
              </svg>
            </Link>
            {/* Balance */}
            <span className="font-bold text-[18px] text-app-red cursor-pointer">
              <span className="filter blur-[4px]">50.00</span>
              <span className="ml-1">$</span>
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden w-full flex flex-col items-center border-t pt-4 pb-2 bg-white dark:bg-gray-900">
            {/* Mobile right section: notifications, account, balance */}
            <div className="flex items-center gap-4 mb-4">
              {/* Notification bell */}
              <button className="notification" tabIndex={0} aria-label="Notifications">
                <div className="bell-container">
                  <div className="bell"></div>
                </div>
              </button>
              {/* Account link */}
              <Link href="/account-dashboard" className="cursor-pointer transition-all duration-200 hover:bg-app-red p-2 rounded-full group">
                <svg width="22" height="22" viewBox="0 0 17 20" fill="none" className="text-app-red group-hover:text-white">
                  {/* SVG paths here */}
                </svg>
              </Link>
              {/* Balance */}
              <span className="font-bold text-[18px] text-app-red cursor-pointer">
                <span className="filter blur-[4px]">50.00</span>
                <span className="ml-1">$</span>
              </span>
            </div>
            {/* Navigation links */}
            <div className="flex flex-row items-center justify-center space-x-6 w-full mt-2">
              <Link
                href="/categories"
                className="flex-1 text-center text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-red font-semibold py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/about-us"
                className="flex-1 text-center text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-red font-semibold py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact-us"
                className="flex-1 text-center text-gray-700 dark:text-gray-200 hover:text-app-red dark:hover:text-app-red font-semibold py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 