import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS,
    },
  });