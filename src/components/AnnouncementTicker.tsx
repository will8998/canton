'use client';

import { useEffect, useState } from 'react';

export default function AnnouncementTicker() {
  const styles = {
    ticker: {
      width: '100%',
      backgroundColor: '#FF5733',
      color: 'white',
      padding: '6px 0',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    content: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'ticker 20s linear infinite',
      whiteSpace: 'nowrap' as const,
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.ticker}>
      <div style={styles.content}>
        BitSafe dApp launching soon—connect with our team to explore real yield strategies.
      </div>
    </div>
  );
} 