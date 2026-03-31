'use strict';

const { Resend } = require('resend');

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

// The email address registered with Resend (required for testing without a domain)
const ADMIN_EMAIL = 'ramireddylokeshreddy@gmail.com'; 

/**
 * Sends a stylized HTML booking confirmation email to the user.
 * It also sends a BCC to the admin for instant notification.
 * 
 * @param {Object} payload 
 * @param {string} payload.userEmail - The email of the user who booked
 * @param {string} payload.userName - The full name of the user
 * @param {string} payload.pgName - The name of the PG property
 * @param {string} payload.bookingId - The Supabase booking ID
 * @param {string} payload.status - Current booking status
 */
async function sendBookingConfirmation({ userEmail, userName, pgName, bookingId, status }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is missing. Email skipped.');
    return null;
  }

  // Fallbacks
  const safeName = userName || 'Valued Guest';
  const safeStatus = (status || 'pending').toUpperCase();

  // Premium, aesthetic HTML template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f7f6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; }
        .content p { font-size: 16px; line-height: 1.6; color: #4b5563; }
        .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 30px 0; }
        .details-box h3 { margin-top: 0; color: #1e293b; font-size: 18px; }
        .detail-item { margin-bottom: 10px; font-size: 15px; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
        .detail-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .status-badge { background: #fef08a; color: #854d0e; padding: 4px 12px; border-radius: 999px; font-weight: 600; font-size: 13px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
        .footer a { color: #2563eb; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${safeName}</strong>,</p>
          <p>Great news! Your booking request for <strong>${pgName}</strong> has been received by our property managers. We are currently processing the details.</p>
          
          <div class="details-box">
            <h3>Booking Details</h3>
            <div class="detail-item">
              <strong>Property:</strong> <span>${pgName}</span>
            </div>
            <div class="detail-item">
              <strong>Booking ID:</strong> <span>${bookingId.split('-')[0].toUpperCase()}</span>
            </div>
            <div class="detail-item">
              <strong>Status:</strong> <span class="status-badge">${safeStatus}</span>
            </div>
          </div>
          
          <p>If you have any questions or need to make changes to your booking, please reach out to our support team.</p>
          <p>Thank you for choosing us!<br/><strong>The PG Admin Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const data = await resend.emails.send({
      from: 'PG Admin <onboarding@resend.dev>', // Default Resend test email
      to: [userEmail, ADMIN_EMAIL], // Sending to both so Admin always gets the copy
      subject: `Booking Received: ${pgName}`,
      html: htmlTemplate,
    });
    
    console.log(`✅ Confirmation email sent for booking ${bookingId}`);
    return data;
  } catch (error) {
    // If the user's email is rejected because the domain isn't verified in Resend yet,
    // we catch the error here so the API doesn't crash throwing 500s.
    console.error(`⚠️ Resend email failed (Booking: ${bookingId}):`, error.message);
    return null;
  }
}

module.exports = { sendBookingConfirmation };
