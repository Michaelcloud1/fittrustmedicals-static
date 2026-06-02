import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, customerName, orderNumber, total, items, orderDate } = await request.json();

    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USERNAME;
    const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_PASSWORD;

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

    // Generate items HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatNaira(item.price)}</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatNaira(item.quantity * item.price)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Confirmation - Fittrust Medicals</title>
        <style>
          @media print {
            .no-print { display: none; }
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .receipt-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .receipt-content {
            padding: 30px;
          }
          .receipt-footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          .order-details {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .btn-print {
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div class="receipt-container">
          <div class="receipt-header">
            <h1 style="margin: 0;">✅ PAYMENT CONFIRMED!</h1>
            <p style="margin: 10px 0 0;">Fittrust Medicals</p>
          </div>
          
          <div class="receipt-content">
            <h2 style="color: #1f2937;">Dear ${customerName},</h2>
            <p>Your payment has been confirmed! Thank you for your order.</p>
            
            <div class="order-details">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> Bank Transfer</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #10b981;">✓ Confirmed</span></p>
            </div>
            
            <h3 style="margin: 20px 0 10px;">Receipt / Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left;">Item</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Price</th>
                  <th style="padding: 12px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr style="background: #f9fafb;">
                  <td colspan="3" style="padding: 15px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 15px; text-align: right;">${formatNaira(total)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 10px; text-align: right;">Free</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total Paid:</strong></td>
                  <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>${formatNaira(total)}</strong></td>
                </tr>
              </tfoot>
            </table>
            
            <div class="no-print" style="text-align: center; margin: 30px 0 20px;">
              <button onclick="window.print()" class="btn-print">🖨️ Print / Save as PDF</button>
            </div>
          </div>
          
          <div class="receipt-footer">
            <p>Thank you for shopping with Fittrust Medicals!</p>
            <p>Questions? Contact: support@fittrustmedicals.com</p>
            <p>© ${new Date().getFullYear()} Fittrust Medicals</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to customer
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${emailUser}>`,
      to: to,
      subject: `✅ PAYMENT CONFIRMED! - Order #${orderNumber}`,
      html: emailHtml,
    });

    // Send notification to admin
    await transporter.sendMail({
      from: `"Fittrust Medicals" <${emailUser}>`,
      to: process.env.ADMIN_EMAIL || 'fittrustsurgical56@gmail.com',
      subject: `Payment Confirmed - Order #${orderNumber}`,
      html: `
        <h2>✅ Payment Confirmed!</h2>
        <p><strong>Order #${orderNumber}</strong> has been paid by ${customerName} (${to})</p>
        <p><strong>Total Amount:</strong> ${formatNaira(total)}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <hr>
        <p>View the order in <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders">admin dashboard</a>.</p>
      `,
    });

    return NextResponse.json({ success: true, message: 'Payment confirmation receipt sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send receipt email' },
      { status: 500 }
    );
  }
}