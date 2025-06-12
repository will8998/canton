'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import ContactForm from './ContactForm';
import AnnouncementTicker from './AnnouncementTicker';

export default function Navbar() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <nav className="nav-container">
        <div className="nav-content">
          <div className="nav-left">
            <Link href="/" className="nav-logo">
              <Image
                src="/logo.svg"
                alt="BitSafe Logo"
                width={120}
                height={32}
                priority
              />
            </Link>
          </div>
          
          <div className="nav-right">
            <button 
              className="connect-button"
              onClick={() => setIsContactModalOpen(true)}
            >
              Contact Us
            </button>
          </div>
        </div>
      </nav>
      <AnnouncementTicker />

      <ContactForm 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}