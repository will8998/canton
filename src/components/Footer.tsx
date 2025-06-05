'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const styles = {
    footer: {
      width: '100%',
      borderTop: '1px solid #e5e7eb',
      padding: '1.5rem 0',
      backgroundColor: '#f8f9fa'
    },
    content: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    left: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem'
    },
    right: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    link: {
      color: '#6b7280',
      textDecoration: 'none',
      fontSize: '0.875rem',
      transition: 'color 0.2s ease'
    },
    copyright: {
      color: '#6b7280',
      fontSize: '0.875rem'
    },
    socialIcon: {
      cursor: 'pointer'
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
            <Image
              src="/telegram.svg"
              alt="Telegram"
              width={24}
              height={24}
              style={styles.socialIcon}
            />
          </Link>
          <Link href="https://twitter.com/bitsafe" target="_blank" style={styles.link}>
            <Image
              src="/x.svg"
              alt="X (Twitter)"
              width={24}
              height={24}
              style={styles.socialIcon}
            />
          </Link>
        </div>
      </div>
    </footer>
  );
} 