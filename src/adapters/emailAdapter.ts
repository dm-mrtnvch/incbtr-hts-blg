import nodemailer from "nodemailer";

export const emailAdapter = {
  async sendEmailConfirmationMessage (email: string) {
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
        "     <a href='https://somesite.com/confirm-email?code=your_confirmation_code'>complete registration</a>\n" +
        " </p>\n", // html body
    });

    return info
  }
}
