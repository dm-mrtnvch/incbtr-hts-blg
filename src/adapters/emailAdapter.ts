import nodemailer, {SentMessageInfo} from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: 'idmvshn@gmail.com',
    pass: 'rwdlwwpxswcmyzoe'
  }
});

export class EmailAdapter {
  async sendEmailConfirmationMessage(email: string, confirmationCode: string): Promise<SentMessageInfo> {
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
    })

    return info
  }

  async recoverUserPassword(email: string, confirmationCode: string): Promise<SentMessageInfo> {
    const info = await transporter.sendMail({
      from: '"Incbtr ✉️" <idmvshn@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Incbtr app password recovery ", // Subject line
      html: `
         <h1>Password recovery</h1>
          <p>To finish password recovery please follow the link below:
            <a href="https://somesite.com/password-recovery?recoveryCode=${confirmationCode}">recovery password</a>
          </p>
        `
    })

    return info
  }
}

