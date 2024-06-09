const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
        user: 'neftgbopro@mail.ru',
        pass: 'fdjRXSDGtqZtktjdujqb'
    }
});

module.exports = transporter;