const fs = require("fs");
var path = require("path");
const ValidationError = require("../../utils/ValidationError");
const { ValidationMsgs } = require("../../utils/constants");
exports.getPrivacyPolicy = async function (req) {
    var filePath = path.join(
        __dirname,
        "../../",
        "/cms",
        "privacyPolicy.txt"
    );

    let pagecontent = "";
    if (fs.existsSync(filePath)) {
        pagecontent = fs.readFileSync(filePath, "utf8");
    }
    return pagecontent;
};

exports.getContactUs = async function (req) {
    var filePath = path.join(__dirname, "../../", "storage/cms", "contactUs.txt");

    let pagecontent = "";
    if (fs.existsSync(filePath)) {
        pagecontent = fs.readFileSync(filePath, "utf8");
    }
    return pagecontent;
};

exports.getTermsAndConditions = async function (req) {
    var filePath = path.join(
        __dirname,
        "../../",
        "storage/cms",
        "termsAndConditions.txt"
    );

    let pagecontent = "";
    if (fs.existsSync(filePath)) {
        pagecontent = fs.readFileSync(filePath, "utf8");
    }
    return pagecontent;
};

exports.editContactUs = async function (req, res) {
    try {
        var dir = path.join(__dirname, '../../', 'storage/cms')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var filePath = path.join(
            __dirname,
            "../../",
            "storage/cms",
            "contactUs.txt"
        );
        if (fs.existsSync(filePath)) {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        } else {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        }
    } catch (error) {
        throw new ValidationError(ValidationMsgs.SomethingWrong);
    }
};

exports.editPrivacyPolicy = async function (req, res) {
    try {
        var dir = path.join(__dirname, '../../', 'storage/cms')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var filePath = path.join(
            __dirname,
            "../../",
            "storage/cms",
            "privacyPolicy.txt"
        );
        if (fs.existsSync(filePath)) {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        } else {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        }
    } catch (error) {
        throw new error;
    }
};

exports.editTermsAndConditions = async function (req, res) {
    try {
        var dir = path.join(__dirname, '../../', 'storage/cms')
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var filePath = path.join(
            __dirname,
            "../../",
            "storage/cms",
            "termsAndConditions.txt"
        );

        if (fs.existsSync(filePath)) {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        } else {
            fs.writeFile(filePath, req.body.content, function (err) {
                if (err) throw err;
            });
        }
    } catch (error) {
        throw new error();
    }
};
