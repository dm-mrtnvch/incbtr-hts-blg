import nodemailer from "nodemailer";
import {v4 as uuidv4} from 'uuid';

export const emailAdapter = {
  async sendEmailConfirmationMessage(email: string, confirmationCode: string) {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: 'idmvshn@gmail.com',
        pass: 'rwdlwwpxswcmyzoe'
      }
    });

    const info = await transporter.sendMail({
      from: '"Incbtr ✉️" <idmvshn@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Incbtr app registration ", // Subject line
      html: `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
          <a href="https://somesite.com/confirm-email?code=${confirmationCode}">complete registration</a>
        </p>
      `
    });
    return info
  },
}
