import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true, 
    auth: {
      user: process.env.SUPPORT_EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  export const requestWithdrawalTokenEmail = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to,
      subject,
      text
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  export const transactionEmail = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to,
      subject,
      text
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  ////this function alone shouls be enough 
  export const activitiesEmail = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to,
      subject,
      text
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent to: ' + to + info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  