import nodemailer from 'nodemailer';

/**
 * Send Email (Simulated for learning)
 * In a real app, you would use an SMTP server like SendGrid, Mailgun, or Gmail.
 */
const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to: ${options.email}`);
  } catch (error: any) {
    console.error(`❌ Error sending email: ${error.message}`);
    // Log to console as fallback during development
    console.log('--- FALLBACK LOG (Email failed to send) ---');
    console.log(`📧 TO: ${options.email}`);
    console.log(`📝 SUBJECT: ${options.subject}`);
    console.log(`🔢 MESSAGE: ${options.message}`);
    console.log('-------------------------------------------');
  }
};

export default sendEmail;
