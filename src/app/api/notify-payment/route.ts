import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    const { orderId, customerName, customerEmail, phoneNumber, totalAmount, items } = await request.json();

    console.log('========== EMAIL NOTIFICATION ==========');
    console.log('Order ID:', orderId);
    console.log('Customer Name:', customerName);
    console.log('Customer Email:', customerEmail);
    console.log('Phone:', phoneNumber);
    console.log('Amount:', totalAmount);
    console.log('Items:', items);
    console.log('========================================');

    // Generate items table HTML
    const itemsHtml = (items || []).map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₦{(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    // ============================================
    // 1. EMAIL TO CUSTOMER (Rich Content)
    // ============================================
    const customerHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2c7da0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">FitTrust Medicals</h1>
          <p style="color: #e0f0f5; margin: 5px 0 0;">Payment Notification Received</p>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #2c7da0;">Thank You for Your Payment, ${customerName}!</h2>
          <p>We have received your payment notification for <strong>Order #${orderId}</strong>.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #2c7da0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: #e67e22;">Awaiting Verification</span></p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px; color: #2c7da0;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #2c7da0; color: white;">
                  <th style="padding: 8px; text-align: left;">Product</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Unit Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #eee;">
                  <td colspan="3" style="padding: 10px; text-align: right;"><strong>Grand Total:</strong></td>
                  <td style="padding: 10px; text-align: right;"><strong>₦${totalAmount.toLocaleString()}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <p>Our admin will verify your payment and send you a confirmation email shortly.</p>
          <p>You will receive another email once your payment is confirmed.</p>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">FitTrust Medicals – Your trusted health partner</p>
        </div>
        
        <div style="background: #eee; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>Need help? Contact us: fittrustsurgical56@gmail.com</p>
        </div>
      </div>
    `;

    // ============================================
    // 2. EMAIL TO ADMIN (Rich Content with Customer Details)
    // ============================================
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #2c7da0; padding: 20px; text-align: center;">
          <h1 style="color: white;">💰 Payment Notification</h1>
        </div>
        
        <div style="padding: 20px;">
          <h3 style="color: #2c7da0;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 5px; width: 120px;"><strong>Name:</strong></td>
              <td style="padding: 5px;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Email:</strong></td>
              <td style="padding: 5px;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Phone:</strong></td>
              <td style="padding: 5px;">${phoneNumber || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Order ID:</strong></td>
              <td style="padding: 5px;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Amount:</strong></td>
              <td style="padding: 5px;"><strong>₦${totalAmount.toLocaleString()}</strong></td>
            </tr>
          </table>
          
          <h3 style="color: #2c7da0;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #2c7da0; color: white;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Unit Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="background: #f0f0f0;">
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>₦${totalAmount.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <p><strong>Status:</strong> Payment made, awaiting verification</p>
          <hr />
          <p>Please log in to the admin dashboard to verify this payment.</p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="background: #2c7da0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Orders</a></p>
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