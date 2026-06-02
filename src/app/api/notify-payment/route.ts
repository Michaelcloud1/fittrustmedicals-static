import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create transporter with fallback for both env naming conventions
const getTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USERNAME;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASSWORD;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, phoneNumber, totalAmount, items } = await request.json();

    console.log('========== ORDER PLACEMENT NOTIFICATION ==========');
    console.log('Order ID:', orderId);
    console.log('Customer Name:', customerName);
    console.log('Customer Email:', customerEmail);
    console.log('Phone:', phoneNumber);
    console.log('Amount:', totalAmount);
    console.log('Items:', items.length);
    console.log('==================================================');

    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USERNAME;
    const transporter = getTransporter();

    // Generate items table HTML
    const itemsHtml = (items || []).map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatNaira(item.price)}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatNaira(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    // ============================================
    // EMAIL 1: TO CUSTOMER - Order Received (Awaiting Verification)
    // ============================================
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Order Received - Fittrust Medicals</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Fittrust Medicals</h1>
            <p style="color: #dbeafe; margin: 10px 0 0;">Healthcare Supplies</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #1f2937;">Thank You for Your Order, ${customerName}!</h2>
            <p>We have received your payment notification for <strong>Order #${orderId}</strong>.</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${formatNaira(totalAmount)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">⏳ Awaiting Verification</span></p>
            </div>
            
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; overflow: hidden;">
              <h3 style="margin: 0; padding: 15px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Items Ordered</h3>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px; text-align: left;">Product</th>
                      <th style="padding: 12px; text-align: center;">Qty</th>
                      <th style="padding: 12px; text-align: right;">Unit Price</th>
                      <th style="padding: 12px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                  <tfoot>
                    <tr style="background: #f9fafb;">
                      <td colspan="3" style="padding: 15px; text-align: right;"><strong>Grand Total:</strong></td>
                      <td style="padding: 15px; text-align: right;"><strong>${formatNaira(totalAmount)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0 0 10px 0;"><strong>📌 Next Steps:</strong></p>
              <p style="margin: 5px 0;">1. Our admin will verify your payment</p>
              <p style="margin: 5px 0;">2. You will receive a confirmation email once verified</p>
              <p style="margin: 5px 0;">3. Your order will be processed for delivery</p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">🏦 Bank Transfer Details</h3>
              <p style="margin: 5px 0;"><strong>Bank:</strong> GTBank</p>
              <p style="margin: 5px 0;"><strong>Account Name:</strong> Fittrust Medicals</p>
              <p style="margin: 5px 0;"><strong>Account Number:</strong> 0123456789</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ${formatNaira(totalAmount)}</p>
              <p style="margin: 5px 0;"><strong>Reference:</strong> Use ${orderId} as reference</p>
            </div>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Thank you for shopping with Fittrust Medicals!</p>
            <p>Questions? Contact: support@fittrustmedicals.com</p>
            <p>© ${new Date().getFullYear()} Fittrust Medicals. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ============================================
    // EMAIL 2: TO ADMIN - New Order Notification
    // ============================================
    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Order - Admin Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">💰 New Payment Notification</h1>
          </div>
          
          <div style="padding: 25px;">
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 15px 0; color: #1e3a8a;">Customer Information</h3>
              <p style="margin: 8px 0;"><strong>Name:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
              <p style="margin: 8px 0;"><strong>Order ID:</strong> ${orderId}</p>
              <p style="margin: 8px 0;"><strong>Amount:</strong> <span style="color: #10b981; font-size: 18px;">${formatNaira(totalAmount)}</span></p>
            </div>
            
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
              <h3 style="margin: 0; padding: 15px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">Items Ordered</h3>
              <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #f3f4f6;">
                      <th style="padding: 12px; text-align: left;">Product</th>
                      <th style="padding: 12px; text-align: center;">Qty</th>
                      <th style="padding: 12px; text-align: right;">Price</th>
                      <th style="padding: 12px; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>
              </div>
            </div>
            
            <p><strong>Status:</strong> <span style="color: #f59e0b;">⏳ Payment made, awaiting verification</span></p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Order in Admin →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to CUSTOMER
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${emailUser}>`,
      to: customerEmail,
      subject: `✅ Order Received - ${orderId}`,
      html: customerHtml,
    });
    console.log('✅ Customer order notification sent to:', customerEmail);

    // Send email to ADMIN
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${emailUser}>`,
      to: process.env.ADMIN_EMAIL || 'fittrustsurgical56@gmail.com',
      subject: `💰 New Order Payment - ${orderId}`,
      html: adminHtml,
    });
    console.log('✅ Admin notification sent');

    return NextResponse.json({ 
      success: true, 
      message: 'Order notifications sent to customer and admin' 
    });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send notification' 
    }, { status: 500 });
  }
}