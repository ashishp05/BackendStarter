const nodemailer = require("nodemailer");
const hbs = require("hbs");
const path = require("path");
const customViewsDirPath = path.join(__dirname, "../../views");

exports.inviteHR = async (email, name, password) => {
    let template = await hbs.renderFile(
        path.join(customViewsDirPath, "email", "hr_invite.hbs"),
        {
            email: email,
            name: name,
            password: password,
        }
    );
    await sendEmail(email, "Onward: Organization Invitation", template);
};

exports.SendForgotPasswordEmail = async (email, name, resetLink, code) => {
    //   let template = await hbs.renderFile(
    //     path.join(customViewsDirPath, "email", "forgot-password.hbs"),
    //     {
    //       email: email,
    //       name: name,
    //       resetLink: resetLink,
    //     }
    //   );
    await sendEmail(email, "forget password email");
};

exports.SendAccountRegistrationdEmail = async (
    email,
    name,
    phone,
    organisationName
) => {
    let template = await hbs.renderFile(
        path.join(customViewsDirPath, "email", "account-register.hbs"),
        {
            email: email,
            name: name,
            phoneNumber: phone,
            organisationName: organisationName,
        }
    );
    await sendEmail(email, "Onward: Account Registration", template);
};

async function sendEmail(
    receiverEmail,
    subject,
    htmlBodyContents,
    fromAddress = ""
) {
    let transporter = getTransportInfo();
    let mailOptions = {
        from: fromAddress,
        to: receiverEmail,
        subject: subject,
        html: htmlBodyContents,
    };
    if (process.env.disableEmail == true || process.env.disableEmail == "true") {
        return;
    }
    await transporter.sendMail(mailOptions);
}

function getTransportInfo() {
    return nodemailer.createTransport({
        // service: "joho",
        host: "smtp-mail.outlook.com",
        port: 587,
        secureConnection: true, // true for 465, false for other ports
        auth: {
            user: "info@divineyouwellness.com", //smtpUsername
            pass: "imsodevine24", //smtpPassword
        },
    });
}
