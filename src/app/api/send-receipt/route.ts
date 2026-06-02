import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, customerName, orderNumber, total, items, orderDate } = await request.json();

    // Create email transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Generate items HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">₦{(item.quantity * item.price).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Confirmation - Fittrust Medicals</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          
          <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0;">Fittrust Medicals</h1>
            <p style="color: #666; margin: 5px 0 0;">Healthcare Supplies</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; color: #555;">Your payment has been confirmed! Thank you for your order.</p>
            <p style="font-size: 14px; color: #555;">Please find your receipt below:</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> Bank Transfer</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; margin-bottom: 20px; padding-top: 10px; border-top: 2px solid #ddd;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₦${total.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Shipping:</strong> Free</p>
            <p style="font-size: 18px; margin: 10px 0 0;"><strong>Total Paid:</strong> ₦${total.toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Thank you for shopping with Fittrust Medicals!</p>
            <p style="font-size: 12px; color: #999;">For questions, contact: <a href="mailto:support@fittrustmedicals.com">support@fittrustmedicals.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Payment Confirmed - Order #${orderNumber}`,
      html: emailHtml,
    });

    // Also send notification to admin
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Payment Confirmed - Order #${orderNumber}`,
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Order #${orderNumber} has been paid by ${customerName} (${to})</p>
        <p><strong>Total Amount:</strong> ₦${total.toLocaleString()}</p>
        <p>View the order in admin dashboard.</p>
      `,
    });

    return NextResponse.json({ success: true, message: 'Receipt sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send receipt email' },
      { status: 500 }
    );
  }
}