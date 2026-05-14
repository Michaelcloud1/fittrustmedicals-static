import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, totalAmount } = await request.json();

    console.log('Received notification request:', { orderId, customerName, customerEmail, totalAmount });

    // Email to Admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #2c7da0;">💰 Payment Notification</h2>
        <p><strong>Customer:</strong> ${customerName}</p>
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
        <p><strong>Status:</strong> Payment made, awaiting verification</p>
        <hr />
        <p>Please log in to the admin dashboard to verify this payment and update the order status.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard" style="background: #2c7da0; color: white; padding: 10px 20px; text-decoration: none;">View Dashboard</a></p>
      </div>
    `;

    await transporter.sendMail({
      from: `"FitTrust Medicals" <${process.env.GMAIL_USERNAME}>`,
      to: process.env.ADMIN_EMAIL || 'fittrustsurgical56@gmail.com',
      subject: `💰 Payment Notification - ${orderId}`,
      html: adminHtml,
    });

    console.log('Admin email sent successfully');

    return NextResponse.json({ success: true, message: 'Admin notified' });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
  }
}