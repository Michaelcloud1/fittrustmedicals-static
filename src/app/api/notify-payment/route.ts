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

    console.log('========== EMAIL NOTIFICATION ==========');
    console.log('Order ID:', orderId);
    console.log('Customer Name:', customerName);
    console.log('Customer Email:', customerEmail);
    console.log('Amount:', totalAmount);
    console.log('========================================');

    // ============================================
    // 1. EMAIL TO CUSTOMER
    // ============================================
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #2c7da0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">FitTrust Medicals</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Thank You for Your Payment, ${customerName}!</h2>
          <p>We have received your payment notification for <strong>Order #${orderId}</strong>.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #e67e22;">Awaiting Verification</span></p>
          </div>
          <p>Our admin will verify your payment and send you a confirmation email shortly.</p>
          <p>You will receive another email once your payment is confirmed.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">FitTrust Medicals – Your trusted health partner</p>
        </div>
      </div>
    `;

    // ============================================
    // 2. EMAIL TO ADMIN
    // ============================================
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #2c7da0; padding: 20px; text-align: center;">
          <h1 style="color: white;">💰 Payment Notification</h1>
        </div>
        <div style="padding: 20px;">
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> Payment made, awaiting verification</p>
          <hr />
          <p>Please log in to the admin dashboard to verify this payment.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="background: #2c7da0; color: white; padding: 10px 20px; text-decoration: none;">View Orders</a></p>
        </div>
      </div>
    `;

    // Send email to CUSTOMER
    try {
      await transporter.sendMail({
        from: `"FitTrust Medicals" <${process.env.GMAIL_USERNAME}>`,
        to: customerEmail,
        subject: `✅ Payment Received - Order ${orderId}`,
        html: customerHtml,
      });
      console.log('✅ Customer email sent to:', customerEmail);
    } catch (customerError) {
      console.error('❌ Failed to send customer email:', customerError);
    }

    // Send email to ADMIN
    try {
      await transporter.sendMail({
        from: `"FitTrust Medicals" <${process.env.GMAIL_USERNAME}>`,
        to: process.env.ADMIN_EMAIL || 'fittrustsurgical56@gmail.com',
        subject: `💰 Payment Notification - ${orderId}`,
        html: adminHtml,
      });
      console.log('✅ Admin email sent to:', process.env.ADMIN_EMAIL);
    } catch (adminError) {
      console.error('❌ Failed to send admin email:', adminError);
    }

    console.log('========================================');

    return NextResponse.json({ 
      success: true, 
      message: 'Notifications sent to customer and admin' 
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notification' 
    }, { status: 500 });
  }
}