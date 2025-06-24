import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export async function POST(request: NextRequest) {
  try {
    // Check if API key is properly configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy_key') {
      return NextResponse.json(
        { error: 'Email service is not configured. Please check environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, email, company, message, investmentAmount, phone } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and message are required' },
        { status: 400 }
      );
    }

    // Send email to marketing@dlc.link
    const { data, error } = await resend.emails.send({
      from: 'BitSafe Contact Form <noreply@dlc.link>',
      to: ['marketing@dlc.link'],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">Contact Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company/Organization:</strong> ${company}</p>` : ''}
            ${investmentAmount ? `<p><strong>Potential Investment Amount:</strong> ${investmentAmount}</p>` : ''}
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              This email was sent from the BitSafe contact form. Please respond directly to the customer's email address: ${email}
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Information:
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company/Organization: ${company}` : ''}
${investmentAmount ? `Potential Investment Amount: ${investmentAmount}` : ''}

Message:
${message}

Please respond directly to: ${email}
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email sent successfully', data },
      { status: 200 }
    );

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 