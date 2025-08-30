import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

export const sendMail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: config.EMAIL_FROM,
    to,
    subject,
    html,
    text
  };
  return transporter.sendMail(mailOptions);
};

export default transporter;
