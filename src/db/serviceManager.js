const { TableNames } = require("../utils/constants");
const allServices = [
    [TableNames.School, require("./services/SchoolService").deleteMyReferences],
    [TableNames.Student, require("./services/StudentService").deleteMyReferences],
    [TableNames.Leave, require("./services/LeaveService").deleteMyReferences],
    [TableNames.Logs, require("./services/LogService").deleteMyReferences],
    [TableNames.Holidays, require("./services/HolidayService").deleteMyReferences],
];

const   mCascadeDelete = async function (tableName, ...deletedRecordIds) {
    deletedRecordIds = deletedRecordIds.filter((a) => a != undefined);

    if (deletedRecordIds.length > 0) {
        if (this.ignoreSelfCall) {
            allServices.forEach(async (a) => {
                if (a[0] != tableName) {
                    try {
                        await a[1](mCascadeDelete, tableName, ...deletedRecordIds);
                    } catch (e) {
                        console.log("CascadeDelete Error (1) ", "(" + a[0] + ")", e);
                        throw e;
                    }
                }
            });
        } else {
            allServices.forEach(async (a) => {
                try {
                    await a[1](mCascadeDelete, tableName, ...deletedRecordIds);
                } catch (e) {
                    console.log("CascadeDelete Error (2) ", "(" + a[0] + ")", e);
                    throw e;
                }
            });
        }
    }
};
exports.cascadeDelete = mCascadeDelete;
