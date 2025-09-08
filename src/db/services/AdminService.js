const { TableFields, ValidationMsgs, UserTypes } = require("../../utils/constants");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");
const Admin = require("../models/admin");

class AdminService {
    static findByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne({ email }, this);
        });
    };

    static saveAuthToken = async (userId, token) => {
        await Admin.updateOne(
            {
                [TableFields.ID]: userId,
            },
                {
                    $push: {
                        [TableFields.tokens]: { [TableFields.token]: token },
                    },
                }
        );
    };

    static getUserById = (userId) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne({ [TableFields.ID]: userId }, this);
        });
    };

    static existsWithEmail = async (email, exceptionId) => {
        return await Admin.exists({
            [TableFields.email]: email,
            ...(exceptionId
                ? {
                    [TableFields.ID]: { $ne: exceptionId },
                }
                : {}),
        });
    };

    static insertUserRecord = async (reqBody) => {
        let email = reqBody[TableFields.email];
        email = (email + "").trim().toLocaleLowerCase();
        const password = reqBody[TableFields.password];

        if (!email) throw new ValidationError(ValidationMsgs.EmailEmpty);
        if (!password) throw new ValidationError(ValidationMsgs.PasswordEmpty);

        if (await AdminService.existsWithEmail(email))
            throw new ValidationError(ValidationMsgs.DuplicateEmail);

        const user = new Admin(reqBody);
        user[TableFields.approved] = true;
        user[TableFields.userType] = UserTypes.Admin;
        if (!user.isValidPassword(password)) {
            throw new ValidationError(ValidationMsgs.PasswordInvalid);
        }
        try {
            await user.save();
            return user;
        } catch (error) {
            if (error.code == 11000) {
                //Mongoose duplicate email error
                throw new ValidationError(ValidationMsgs.DuplicateEmail);
            }
            throw error;
        }
    };

    static getUserById = (userId) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne({ [TableFields.ID]: userId }, this);
        });
    };

    static getUserByEmail = (email) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne({ [TableFields.email]: email }, this);
        });
    };

    static getUserByIdAndToken = (userId, token) => {
        return new ProjectionBuilder(async function () {
            return await Admin.findOne(
                {
                    [TableFields.ID]: userId,
                    [TableFields.tokens + "." + TableFields.token]: token,
                },
                this
            );
        });
    };

    static removeAuth = async (adminId, authToken) => {
        await Admin.updateOne(
            {
                [TableFields.ID]: adminId,
            },
            {
                $pull: {
                    [TableFields.tokens]: { [TableFields.token]: authToken },
                },
            }
        );
    };

    static generateOTPCode = () => {
        return Util.generateRandomPassword(4);
    };

    static getResetPasswordToken = async (email) => {
        let user = await AdminService.findByEmail(email)
            .withId()
            .withBasicInfo()
            .withPasswordResetToken()
            .execute();
        if (!user) throw new ValidationError(ValidationMsgs.AccountNotRegistered);
        if (!user[TableFields.active])
            throw new ValidationError(ValidationMsgs.UnableToForgotPassword);

        let code;
        if (!user[TableFields.passwordResetToken]) {
            code = AdminService.generateOTPCode();
            user[TableFields.passwordResetToken] = code;
            await user.save();
        } else code = user[TableFields.passwordResetToken];

        return {
            code,
            email: user[TableFields.email],
            name: user[TableFields.name_],
        };
    };

    static saveResetToken = async (user, token) => {
        user[TableFields.passwordResetToken] = token;
        await user.save();
    };

    static resetPassword = async (resetToken, newPassword) => {
        let user = await Admin.findOne({
            passwordResetToken: resetToken,
        });

        if (!user) throw new ValidationError(ValidationMsgs.InvalidToken);

        if (!user[TableFields.active])
            throw new ValidationError(ValidationMsgs.UnableToForgotPassword);

        if (!user.isValidPassword(newPassword))
            throw new ValidationError(ValidationMsgs.PasswordInvalid);

        if (user[TableFields.passwordResetToken] == resetToken) {
            user[TableFields.password] = newPassword;
            user[TableFields.passwordResetToken] = "";
            user[TableFields.tokens] = [];
            return await user.save();
        } else throw new ValidationError(ValidationMsgs.InvalidToken);
    };

    static updatePassword = async (userObj, newPassword, token) => {
        userObj[TableFields.password] = newPassword;
        await userObj.save();
    };

    static deleteMyReferences = async (tableName, deleteRecordIds) => {
        let recordsList = [];
        let projection = { [TableFields.ID]: 1 };

        switch (tableName) {
            case TableNames.Admin:
                recordsList = await Admin.find(
                    {
                        [TableFields.ID]: { $in: deleteRecordIds },
                    },
                    projection
                );
                break;
            default:
                break;
        }

        if (recordsList.length) {
            let ids = [];
            recordsList.forEach((a) => {
                ids.push(a[TableFields.ID]);
            });

            await Admin.deleteMany({
                [TableFields.ID]: { $in: ids },
            });
        }
    };

    static updatePasswordAndInsertLatestToken = async (userObj, newPassword, token) => {
        userObj[TableFields.tokens] = [{ [TableFields.token]: token }];
        userObj[TableFields.password] = newPassword;// It will be hashed by Schema methods (pre hook 'save')
        await userObj.save();
    }
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {};
        this.withBasicInfo = () => {
            projection[TableFields.name_] = 1;
            projection[TableFields.ID] = 1;
            projection[TableFields.email] = 1;
            projection[TableFields.userType] = 1;
            projection[TableFields.active] = 1;
            return this;
        };
        this.withPassword = () => {
            projection[TableFields.password] = 1;
            return this;
        };
        this.withEmail = () => {
            projection[TableFields.email] = 1;
            return this;
        };
        this.withUserType = () => {
            projection[TableFields.userType] = 1;
            return this;
        };
        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };
        this.withApproved = () => {
            projection[TableFields.approved] = 1;
            return this;
        };
        this.withName = () => {
            projection[TableFields.name_] = 1;
            return this;
        };
        this.withPasswordResetToken = () => {
            projection[TableFields.passwordResetToken] = 1;
            return this;
        };

        this.execute = async () => {
            return await methodToExecute.call(projection);
        };
    }
};

module.exports = AdminService;
