const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) Create a transporter
  // Gmail transporter - it is only good for private purposes
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD
  //     }
  //     // Activate in gmail "less secure app" option
  //   });
  // Gmail transporter - it is only good for private purposes
  //
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in gmail "less secure app" option
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Jacob <jacob@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: true
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
