const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const SibTransport = require('nodemailer-sendinblue-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sumin Shakya <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
   
    if (process.env.NODE_ENV.trim() === 'production') {
      console.log('hahaha', process.env.NODE_ENV);
      return nodemailer.createTransport({
        service: 'SendinBlue',
        auth: {
          user: 'suminshakya@gmail.com',
          // 	SMTP KEY VALUE == pass
          pass: 'KGncD4ryVOQ178Ra' 
        },
      });
      /* return nodemailer.createTransport(
        new SibTransport({
          user: 'suminshakya@gmail.com',
          pass:'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'
        })
      ); */
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST.trim(),
      port: process.env.EMAIL_PORT.trim(),
      auth: {
        user: process.env.EMAIL_USERNAME.trim(),
        pass: process.env.EMAIL_PASSWORD.trim(),
      },
    });
  }

  //Send actual email
  async send(template, subject) {
    // Render HTML based template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      text: htmlToText.fromString(html),
    };

    // Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!!!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password reset token valid for only 10 min'
    );
  }
};
