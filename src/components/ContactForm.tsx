'use client';

import { useState } from 'react';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    investmentAmount: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual form submission to your backend
      console.log('Contact form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      
      // Reset form after 3 seconds and close modal
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          investmentAmount: '',
          phone: ''
        });
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative' as const
    },
    header: {
      padding: '2rem 2rem 1rem 2rem',
      borderBottom: '1px solid #e5e7eb'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    },
    closeButton: {
      position: 'absolute' as const,
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6b7280',
      padding: '0.5rem'
    },
    body: {
      padding: '1rem 2rem 2rem 2rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      minHeight: '100px',
      resize: 'vertical' as const
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      backgroundColor: 'white'
    },
    buttonContainer: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem'
    },
    cancelButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#f3f4f6',
      color: '#111827',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    submitButton: {
      flex: 1,
      padding: '0.75rem',
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    successMessage: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: '#10b981'
    },
    successIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    successText: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827'
    },
    successSubtext: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginTop: '0.5rem'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        {isSubmitted ? (
          <div style={styles.successMessage}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successText}>Thank you for your interest!</div>
            <div style={styles.successSubtext}>
              We'll get back to you within 24 hours.
            </div>
          </div>
        ) : (
          <>
            <div style={styles.header}>
              <h2 style={styles.title}>Contact Us</h2>
              <p style={styles.subtitle}>
                Get in touch with our team to learn more about investment opportunities.
              </p>
            </div>

            <div style={styles.body}>
              <form onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="company">Company/Organization</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    style={styles.input}
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="investmentAmount">Potential Investment Amount</label>
                  <select
                    id="investmentAmount"
                    name="investmentAmount"
                    value={formData.investmentAmount}
                    onChange={handleInputChange}
                    style={styles.select}
                    disabled={isSubmitting}
                  >
                    <option value="">Please select</option>
                    <option value="0.1-1">0.1 - 1 BTC</option>
                    <option value="1-5">1 - 5 BTC</option>
                    <option value="5-10">5 - 10 BTC</option>
                    <option value="10-50">10 - 50 BTC</option>
                    <option value="50+">50+ BTC</option>
                    <option value="institutional">Institutional (100+ BTC)</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label} htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Tell us about your investment goals and any specific questions you have..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div style={styles.buttonContainer}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={onClose}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...styles.submitButton,
                      backgroundColor: isSubmitting ? '#9ca3af' : '#f97316',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isSubmitting}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.backgroundColor = '#ea580c';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.currentTarget.style.backgroundColor = '#f97316';
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 