const nodemailer = require('nodemailer');

/**
 * Send Email (Simulated for learning)
 * In a real app, you would use an SMTP server like SendGrid, Mailgun, or Gmail.
 */
const sendEmail = async (options) => {
    // 1) Create a transporter
    // For now, we just log to console to make it easy for you to see!

    console.log('-----------------------------------');
    console.log(`📧 SENDING EMAIL TO: ${options.email}`);
    console.log(`📝 SUBJECT: ${options.subject}`);
    console.log(`🔢 MESSAGE: ${options.message}`);
    console.log('-----------------------------------');

    // If you wanted to use a real testing service like Mailtrap:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: 'Node Project <hello@nodeproject.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
  
    await transporter.sendMail(mailOptions);
    */
};

module.exports = sendEmail;
