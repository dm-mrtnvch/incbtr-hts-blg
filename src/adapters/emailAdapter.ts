import nodemailer from "nodemailer";
import {v4 as uuidv4} from 'uuid';

export const emailAdapter = {
  async sendEmailConfirmationMessage (email: string) {
    const confirmationCode = uuidv4()

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
      html: " <h1>Thank for your registration</h1>\n" +
        " <p>To finish registration please follow the link below:\n" +
        "     <a href={`https://somesite.com/confirm-email?code=${confirmationCode}`}>complete registration</a>\n" +
        " </p>\n", // html body
    });

    return info
  },
}
