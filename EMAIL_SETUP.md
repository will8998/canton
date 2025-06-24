# Email Integration Setup Guide

This guide explains how to set up email functionality for the BitSafe application using Resend.

## Overview

All contact forms in the application now send emails to `marketing@dlc.link` using the Resend API. This includes:

- Main contact form (accessible from navbar and vault pages)
- Any support inquiries from KYC/verification pages

## Setup Instructions

### 1. Get Resend API Key

1. Sign up for a Resend account at [https://resend.com](https://resend.com)
2. Go to the API Keys section in your dashboard
3. Create a new API key with send permissions
4. Copy the API key (it starts with `re_`)

### 2. Configure Environment Variables

1. Copy `env.config.example` to `.env.local`:
   ```bash
   cp env.config.example .env.local
   ```

2. Update the following variables in `.env.local`:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   CONTACT_EMAIL=marketing@dlc.link
   ```

### 3. Domain Configuration (Production)

For production deployment, you'll need to:

1. Add your domain to Resend (e.g., `dlc.link`)
2. Update the "from" address in the API route:
   ```typescript
   // In src/app/api/send-email/route.ts
   from: 'BitSafe Contact Form <noreply@dlc.link>',
   ```

### 4. Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to any page with a contact form
3. Fill out and submit the form
4. Check that the email is received at `marketing@dlc.link`

## API Endpoint

The email functionality is handled by the `/api/send-email` endpoint:

- **Method**: POST
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Example Corp",
    "investmentAmount": "1-5",
    "message": "I'm interested in learning more about your vaults."
  }
  ```

## Forms That Use Email Integration

1. **Contact Form** (`src/components/ContactForm.tsx`)
   - Accessible from navbar "Contact Us" button
   - Accessible from vault detail pages CTA buttons
   - Sends comprehensive contact information to marketing team

2. **Support Links** (`src/app/kyc/page.tsx`)
   - KYC help section links to `marketing@dlc.link`

## Email Template

The emails sent include:
- Professional HTML formatting with BitSafe branding
- All form data organized in sections
- Clear contact information for follow-up
- Plain text fallback for email clients that don't support HTML

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**
   - Check that `RESEND_API_KEY` is set correctly in `.env.local`
   - Verify the API key has send permissions
   - Check Resend dashboard for error logs

2. **Emails not being received**
   - Check spam/junk folders
   - Verify the recipient email address is correct
   - Check Resend dashboard for delivery status

3. **Domain authentication issues (Production)**
   - Ensure your domain is verified in Resend
   - Check DNS records are properly configured
   - Update the "from" address to use your verified domain

### Development vs Production

- **Development**: Uses the Resend API key directly, emails may have "via resend.com" in headers
- **Production**: Should use a verified domain for better deliverability and professional appearance

## Security Considerations

- Never commit the actual API key to version control
- Use environment variables for all sensitive configuration
- Consider rate limiting on the API endpoint for production use
- Validate and sanitize all form inputs before sending emails

## Support

If you encounter issues with the email integration, check:
1. Resend dashboard for API usage and errors
2. Browser developer tools for client-side errors
3. Server logs for API endpoint errors
4. Network tab to verify requests are being made correctly 