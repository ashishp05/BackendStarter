const AdminService = require("../../db/services/AdminService");

const { InterfaceTypes, TableFields, ValidationMsgs } = require("../../utils/constants");
const Util = require("../../utils/util");
const Email = require("../../emails/email");
const ValidationError = require("../../utils/ValidationError");

exports.addAdminUser = async (req) => {
    if (!Util.parseBoolean(req.headers.dbuser)) {
        throw new ValidationError(ValidationMsgs.NotAllowed)
    }
    await AdminService.insertUserRecord(req.body);

    let email = req.body[TableFields.email];
    email = (email + "").trim().toLowerCase();
    let user = await AdminService.findByEmail(email)
        .withPassword()
        .withUserType()
        .withBasicInfo()
        .execute();

        const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
        await AdminService.saveAuthToken(user[TableFields.ID], token);

    return { user, token };
};

exports.login = async (req) => {
    let email = req.body[TableFields.email];
    if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
    email = (email + "").trim().toLowerCase();

    const password = req.body[TableFields.password];
    if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

    let user = await AdminService.findByEmail(email)
        .withPassword()
        .withUserType()
        .withBasicInfo()
        .execute();
    if (user && (await user.isValidAuth(password)) && user[TableFields.active]) {
        const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);
        await AdminService.saveAuthToken(user[TableFields.ID], token);
        return { user, token }
    } else throw new ValidationError(ValidationMsgs.UnableToLogin);
};

exports.logout = async (req) => {
    const headerToken = req.header("Authorization").replace("Bearer ", "");
    await AdminService.removeAuth(req.user[TableFields.ID], headerToken);
};

exports.forgotPassword = async (req) => {
    let providedEmail = req.body[TableFields.email];
    providedEmail = (providedEmail + "").trim().toLowerCase();

    if (!providedEmail) throw new ValidationError(ValidationMsgs.EmailEmpty);

    let user = await AdminService.findByEmail(providedEmail)
        .withBasicInfo()
        .execute();

    if (!user) {
        throw new ValidationError(ValidationMsgs.AccountNotRegisteredWithEmail)
    }

    const token = user.createAuthToken(InterfaceTypes.Admin.AdminWeb);

    await AdminService.saveResetToken(user, token);

    const resetLink = `${process.env.SUPER_ADMIN_RESET_PASS_URL}?token=${token}`
    Email.sendForgotPasswordEmail(providedEmail, resetLink);
};

exports.resetPassword = async (req) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken) throw new ValidationError(ValidationMsgs.ResetToken);
    if (!newPassword) throw new ValidationError(ValidationMsgs.NewPasswordEmpty);
    if (newPassword !== confirmPassword) {
        throw new ValidationError(ValidationMsgs.ConfirmPasswordNotMatched)
    }

    await AdminService.resetPassword(resetToken, newPassword);
};

exports.changePassword = async (req) => {
    let { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        throw new ValidationError(ValidationMsgs.ParametersError);

    let user = await AdminService.getUserById(req.user[TableFields.ID])
        .withPassword()
        .withId()
        .execute();

    if (user && (await user.isValidAuth(oldPassword))) {
        if (!user.isValidPassword(newPassword))
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        const token = user.createAuthToken();
        await AdminService.updatePasswordAndInsertLatestToken(user, newPassword, token);
        return { token }
    } else throw new ValidationError(ValidationMsgs.OldPasswordIncorrect);
};

exports.dashboardCounts = async (req) => {
    let totalSchool = 0
    let totalBoxes = 0
    let avgPhoneAwayHours = 0

    const listSchool = await SchoolService.listSchools().withSuperAdminDashboardCounts().execute()
    if (listSchool && listSchool.records.length) {
        listSchool.records.map(a => {
            totalSchool += 1
            totalBoxes += a[TableFields.boxCount]
            avgPhoneAwayHours += a[TableFields.avgPhoneAwayHours]
        })
    }
    avgPhoneAwayHours = Util.round(avgPhoneAwayHours, 2)
    const avgPhoneAwayHoursInHHMM = Util.getTimeDurationInHoursAndMinutes(avgPhoneAwayHours)
    return { totalSchool, totalBoxes, avgPhoneAwayHours, avgPhoneAwayHoursInHHMM }
}

async function createAndStoreAuthToken(userObj) {
    const token = userObj.createAuthToken(InterfaceTypes.Admin.AdminWeb);
    await AdminService.saveAuthToken(userObj[TableFields.ID], token);
    return token;
}
