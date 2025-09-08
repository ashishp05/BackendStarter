const Handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const { GeneralMessages } = require("../utils/constants");
const path = require("path");
const fs = require("fs");
const Util = require("../utils/util");
const customViewsDirPath = path.join(__dirname, "../templates");
const logoUrl = Util.getBaseURL() + '/static_files/images/logo.png'

class BulkEmail {
    constructor(maxBatchSize = 10) {
        this.queue = [];
        this.maxBatchSize = maxBatchSize;
        this.transporter = this.getTransportInfo();
    }

    getTransportInfo() {
        return nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: 587,
            secure: false, // true for 465, false for other ports
            pool: true,
            auth: {
                user: process.env.SMTP_USER, //smtpUsername
                pass: process.env.SMTP_PASS, //smtpPassword
            },
            maxMessages: Infinity,
            maxConnections: 5,
        }, {
            from: `${process.env.SMTP_SENDER_NAME} <${process.env.SMTP_SENDER_EMAIL}>`
        });
    }

    addEmail(emailId, grade, templateName) {
        this.queue.push({ emailId, grade, templateName });
    }

    async emailQueue() {
        let totalEmails = this.queue.length;

        let batchSize = Math.min(this.maxBatchSize, totalEmails);

        for (let i = 0; i < totalEmails; i += batchSize) {
            let batch = this.queue.slice(i, i + batchSize);
            await Promise.all(batch.map((item) => this.sendEmail(item)));
            await this.delay(10000);
        }
        console.log("Finished processing all emails ", totalEmails);

        this.queue = [];
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async sendEmail({ emailId, grade, templateName }) {
        let templatePath = path.join(__dirname, "..", "templates", templateName);
        let emailTemplate = fs.readFileSync(templatePath).toString();
        let template = Handlebars.compile(emailTemplate);

        let data = {
            email: emailId,
            grade,
            androidLink: process.env.ANDROID_URL,
            iosLink: process.env.IOS_URL,
            logoUrl
        };
        let htmlContent = template(data);

        let mailOptions = {
            to: emailId,
            subject: GeneralMessages.invitationEmailSubject,
            html: htmlContent,
        };

        if (process.env.disableEmail == true || process.env.disableEmail == "true") {
            return;
        }
        try {
            await this.transporter.sendMail(mailOptions);
            console.log("Email sent successfully to: ", emailId);
        } catch (error) {
            console.error(`Failed to send email to ${emailId}:`, error);
        }
    }
}
module.exports = BulkEmail;