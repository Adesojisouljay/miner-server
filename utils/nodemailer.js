import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS,
    },
  });

  export const requestWithdrawalTokenEmail = async (to, subject, text) => {
    const mailOptions = {
      from: process.env.OUTLOOK_USER,
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
      from: process.env.OUTLOOK_USER,
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
      from: process.env.OUTLOOK_USER,
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
  