const nodemailer = require("nodemailer");

// send email using nodemail
const sendEmail = async (options) => {
  // create resuable trasporter object using the default SMTP trasnport
  const trasporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // send email with defined transport object
  let message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html:options.html
  };

  const info = await trasporter.sendMail(message);

  console.log(`Message sent : %s`, info.messageId);
  console.log("Preview URL : %s", nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
