'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', checkMobile);
      }
    };
  }, []);

  const styles = {
    footer: {
      width: '100%',
      borderTop: '1px solid #e5e7eb',
      padding: isMobile ? '1rem 0' : '1.5rem 0',
      backgroundColor: '#f8f9fa'
    },
    content: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '0 1rem' : '0 1rem',
      display: 'flex',
      flexDirection: (isMobile ? 'column' : 'row') as 'column' | 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: isMobile ? '1rem' : '0'
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '1rem' : '1.5rem',
      order: isMobile ? 2 : 1
    },
    copyright: {
      color: '#6b7280',
      fontSize: '0.875rem',
      order: isMobile ? 1 : 2,
      textAlign: (isMobile ? 'center' : 'left') as 'center' | 'left'
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      order: isMobile ? 3 : 3
    },
    link: {
      color: '#6b7280',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s ease'
    },
    socialIcon: {
      cursor: 'pointer',
      transition: 'opacity 0.2s ease'
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <div style={styles.left}>
          <Link href="/privacy-policy" style={styles.link}>
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" style={styles.link}>
            Terms of Service
          </Link>
        </div>
        <div style={styles.copyright}>
          © 2025 BitSafe. All rights reserved.
        </div>
        <div style={styles.right}>
          <Link href="https://t.me/bitsafe" target="_blank" style={styles.link}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={styles.socialIcon}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785L24 5.58c.321-1.336-.541-1.836-1.335-1.863z"/>
            </svg>
          </Link>
          <Link href="https://twitter.com/bitsafe" target="_blank" style={styles.link}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={styles.socialIcon}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
} 