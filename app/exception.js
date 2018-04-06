const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const util = require('util');

const auth = {
    auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
    }
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

module.exports = {
    email: (exception) => {

        let html = `<h2>Exception in Stem Stellar API</h2>${exception}`

        // Most probably a stellar exception
        if (exception.message && exception.data) {
            html = `
                <h2>Exception in Stem Stellar API</h2>
                <p>${JSON.stringify(util.inspect(exception.message))}</p><br>
                <p>${JSON.stringify(util.inspect(exception.data))}</p>
            `
        }

        nodemailerMailgun.sendMail({
            from: process.env.MAIL_FROM_ADDRESS,
            to: process.env.MAIL_TO_ADDRESS,
            subject: 'Stem Stellar Exception',
            html: html,
        },
        function (err, info) {
            if (err) {
                console.log(err);
            }
        });
    }
}