const Handlebars = require("handlebars");
const { GeneralMessages } = require("../utils/constants");
const path = require("path");
const fs = require("fs");
const customViewsDirPath = path.join(__dirname, "../templates");
const nodemailer = require("nodemailer");
const Util = require("../utils/util");
const logoUrl = Util.getBaseURL() + '/static_files/images/logo.png'

exports.sendForgotPasswordEmail = async (emailId, resetLink) => {
    const resetPasswordTemplate = fs.readFileSync(path.join(customViewsDirPath, "admin", "forgot_password.hbs")).toString();
    let data = {
        resetLink: resetLink,
        logoUrl
    };
    const template = Handlebars.compile(resetPasswordTemplate);
    try {
        await sendEmail(emailId, GeneralMessages.forgotPasswordEmailSubject, template(data));
    } catch (e) {
        console.log(e);
    }
};

exports.sendSchoolInvitationEmail = async (name, emailId, password, loginLink) => {
    const invitationTemplate = fs
        .readFileSync(path.join(customViewsDirPath, "school", "school_invitation.hbs"))
        .toString();

    let data = {
        name: name,
        password: password,
        email: emailId,
        loginLink,
        logoUrl
    };
    const template = Handlebars.compile(invitationTemplate);
    try {
        await sendEmail(emailId, GeneralMessages.invitationEmailSubject, template(data));
    } catch (e) {
        console.log(e);
    }
};

exports.sendSchoolForgotPasswordEmail = async (name, emailId, resetLink) => {
    const resetPasswordTemplate = fs.readFileSync(path.join(customViewsDirPath, "school", "forgot_password.hbs")).toString();
    let data = {
        name: name,
        resetLink: resetLink,
        logoUrl
    };
    const template = Handlebars.compile(resetPasswordTemplate);
    try {
        await sendEmail(emailId, GeneralMessages.forgotPasswordEmailSubject, template(data));
    } catch (e) {
        console.log(e);
    }
}

exports.sendStudentInvitationEmail = async (email, grade) => {
    const invitationTemplate = fs
        .readFileSync(path.join(customViewsDirPath, "student", "student_invitation.hbs"))
        .toString();
    let data = {
        email,
        grade,
        androidLink: process.env.ANDROID_URL,
        iosLink: process.env.IOS_URL,
        logoUrl
    };
    const template = Handlebars.compile(invitationTemplate);
    try {
        await sendEmail(email, GeneralMessages.invitationEmailSubject, template(data));
    } catch (e) {
        console.log(e);
    }
}

exports.sendOtp = async (email, name, otp) => {
    const studentLoginTemplate = fs
        .readFileSync(path.join(customViewsDirPath, "student", "student_login_otp.hbs"))
        .toString();
    const data = {
        name, otp, logoUrl
    };
    const template = Handlebars.compile(studentLoginTemplate);
    try {
        await sendEmail(email, GeneralMessages.studentLoginEmailSubject, template(data));
    } catch (e) {
        console.log(e);
    }
}

exports.sendNotClockedInStudentsEmail = async (email, records) => {
    const studentLoginTemplate = fs
        .readFileSync(path.join(customViewsDirPath, "school", "not_clockedin_students.hbs"))
        .toString();
    const template = Handlebars.compile(studentLoginTemplate);
    try {
        await sendEmail(email, GeneralMessages.studentNotClockedEmailSubject, template({ records, logoUrl }));
    } catch (e) {
        console.log(e);
    }
}

exports.sentClockOutStudentReport = async (email, fileBuffer) => {
    const studentLoginTemplate = fs
        .readFileSync(path.join(customViewsDirPath, "school", "students_clocked_out_report.hbs"))
        .toString();
    const template = Handlebars.compile(studentLoginTemplate);
    try {
        const date = Util.formatDateWithDdMmmYyyy()
        const attachments = [
            {
                filename: `Students_Report_${date}.pdf`,
                content: fileBuffer,
                contentType: "application/pdf",
            }
        ]
        const data = { date, logoUrl }
        const subject = GeneralMessages.clockedOutReport + " | " + date
        await sendEmail(email, subject, template(data), attachments);
    } catch (e) {
        console.log(e);
    }
}

function createHyperLinkTag(title, url) {
    return `<a href="${url}">${title}</a>`;
}

async function sendEmail(receiverEmail, subject, htmlBodyContents, attachments = []) {
    let transporter = getTransportInfo();
    let mailOptions = {
        to: receiverEmail,
        subject: subject,
        html: htmlBodyContents,
        attachments
    };
    if (process.env.disableEmail == true || process.env.disableEmail == "true") {
        return;
    }
    await transporter.sendMail(mailOptions);
}

function getTransportInfo() {
    return nodemailer.createTransport({
        host: process.env.SMTP_SERVER,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER, //smtpUsername
            pass: process.env.SMTP_PASS, //smtpPassword
        },
    }, {
        from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_SENDER_EMAIL}>`
    });
}
