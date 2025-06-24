'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function DisclosurePage() {
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
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '2rem 1rem' : '4rem 2rem',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginTop: '2rem',
      marginBottom: '2rem'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '3rem',
      paddingBottom: '2rem',
      borderBottom: '2px solid #f97316'
    },
    title: {
      fontSize: isMobile ? '2rem' : '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem'
    },
    issuer: {
      fontSize: '1.125rem',
      color: '#6b7280',
      marginBottom: '0.5rem'
    },
    registered: {
      fontSize: '1rem',
      color: '#6b7280'
    },
    section: {
      marginBottom: '2.5rem'
    },
    sectionTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#f97316',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    sectionContent: {
      fontSize: '1rem',
      lineHeight: '1.7',
      color: '#374151'
    },
    emphasis: {
      fontWeight: '600',
      color: '#111827'
    },
    warning: {
      backgroundColor: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1rem'
    },
    warningText: {
      fontSize: '0.875rem',
      color: '#92400e',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Disclosures</h1>
          <div style={styles.issuer}>Issued by: DLC (BVI) Holdings Ltd</div>
          <div style={styles.registered}>Registered in: British Virgin Islands (BVI)</div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Technology Provider Only</h2>
          <p style={styles.sectionContent}>
            DLC (BVI) Holdings Ltd ("<span style={styles.emphasis}>DLC</span>") is a British Virgin Islands-based technology provider. We offer a software platform that facilitates access to certain hedge fund investment opportunities. <span style={styles.emphasis}>DLC does not manage, sponsor, operate, or advise any investment funds and is not engaged in any investment activity on behalf of users.</span>
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>2. No Investment Advice</h2>
          <p style={styles.sectionContent}>
            DLC does not provide investment advice, recommendations, legal or tax guidance, or financial planning services. All content and features of the platform are for informational and operational purposes only. <span style={styles.emphasis}>Users are solely responsible for making their own investment decisions</span> and should seek professional advice where appropriate.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>3. No Fiduciary Relationship</h2>
          <p style={styles.sectionContent}>
            The use of DLC's platform does not create a fiduciary relationship between the user and DLC. We do not act as an agent, advisor, or trustee. DLC does not have any obligation to act in the best interest of any user and accepts no liability for the investment decisions made by users of the platform.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Regulatory Status in the BVI</h2>
          <p style={styles.sectionContent}>
            DLC is incorporated and operates under the laws of the British Virgin Islands. <span style={styles.emphasis}>DLC is not regulated by the British Virgin Islands Financial Services Commission (FSC)</span> as a financial services business under the BVI Securities and Investment Business Act, 2010 (as amended). DLC is not licensed as a broker-dealer, investment adviser, or fund manager.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>5. No Offer or Solicitation</h2>
          <p style={styles.sectionContent}>
            The information provided on the platform does not constitute an offer to sell, a solicitation to buy, or a recommendation for any securities or investment products. Investment opportunities made accessible through DLC's technology are provided by independent third parties and not by DLC.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Eligibility of U.S. Persons</h2>
          <p style={styles.sectionContent}>
            Under Regulation S of the U.S. Securities Act of 1933, <span style={styles.emphasis}>the investment opportunities available via the DLC platform are not available to "U.S. persons."</span> DLC has implemented reasonable Know-Your-Customer (KYC) procedures and compliance measures to prevent access by ineligible participants. However, DLC disclaims all liability for any misclassification, misrepresentation, or fraudulent self-certification made by a user. <span style={styles.emphasis}>It is the sole responsibility of the user to comply with local laws and eligibility requirements.</span>
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>7. Investment Risk Acknowledgment</h2>
          <p style={styles.sectionContent}>
            <span style={styles.emphasis}>Investing in hedge funds and similar private offerings entails substantial risks, including the potential for complete loss of capital.</span> Such investments are typically illiquid, complex, and suitable only for sophisticated or professional investors. Users are encouraged to seek independent legal, tax, and financial advice before investing.
          </p>
          <div style={styles.warning}>
            <p style={styles.warningText}>
              ⚠️ High Risk Investment: You may lose all of your invested capital.
            </p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>8. No Guarantee or Warranty of Results</h2>
          <p style={styles.sectionContent}>
            DLC makes no guarantees regarding the accuracy, completeness, or performance of any third-party investment featured on its platform. <span style={styles.emphasis}>Past performance is not indicative of future results.</span> DLC provides no warranty or assurance of any investment outcome.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>9. No Liability for Investment Loss</h2>
          <p style={styles.sectionContent}>
            <span style={styles.emphasis}>DLC shall not be held liable for any financial losses, damages, or claims resulting from the use of the platform or participation in any third-party investment.</span> All investment decisions are made at the user's own risk.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>10. Third-Party Offerings</h2>
          <p style={styles.sectionContent}>
            All hedge fund investment opportunities accessible through the DLC platform are offered solely by unaffiliated third-party issuers or managers. DLC does not endorse or verify the strategies, practices, or disclosures of any third-party offering. Information provided on the platform is based on data supplied by the fund managers and has not been independently verified by DLC.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>11. Platform Content Provided "As-Is"</h2>
          <p style={styles.sectionContent}>
            All content, information, and tools provided via the DLC platform are made available "as-is" without warranty of any kind, express or implied. DLC disclaims all warranties including, without limitation, any warranties of merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </div>
      </div>
    </div>
  );
} 