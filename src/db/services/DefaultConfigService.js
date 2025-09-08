const { DefaultConfigTypes, TableFields, ReasonType } = require("../../utils/constants");
const Util = require("../../utils/util");
const { StudentAppSettings, ClockOutReason, DeviceMovement } = require("../models/defaultConfiguration");
const { MongoUtil } = require("../mongoose");

class StudentAppSettingsService {

    static updateStudentAppSettings = (reqBody = {}, lean = false) => {
        return new AppSettingsProjectionBuilder(async function () {
            let populateFields = this.populate
            let projectionFields = {
                ...this
            }
            delete projectionFields.populate
            return await StudentAppSettings.findOneAndUpdate({
                [TableFields.type]: DefaultConfigTypes.StudentAppSettings
            }, {
                [TableFields.androidVersion]: reqBody[TableFields.androidVersion],
                [TableFields.iOSVersion]: reqBody[TableFields.iOSVersion],
                [TableFields.androidForceUpdate]: reqBody[TableFields.androidForceUpdate],
                [TableFields.iOSForceUpdate]: reqBody[TableFields.iOSForceUpdate],
                [TableFields.androidUnderMaintenance]: reqBody[TableFields.androidUnderMaintenance],
                [TableFields.iOSUnderMaintenance]: reqBody[TableFields.iOSUnderMaintenance],
            }, {
                runValidators: true,
                upsert: true,
                projection: projectionFields,
                new: true
            }).lean(lean).populate(populateFields)
        })
    }

    static getStudentAppSettings = (lean = false) => {
        return new AppSettingsProjectionBuilder(async function () {
            let populateFields = this.populate
            let projectionFields = {
                ...this
            }
            delete projectionFields.populate
            return await StudentAppSettings.findOne({
                [TableFields.type]: DefaultConfigTypes.StudentAppSettings
            }, projectionFields).lean(lean).populate(populateFields);
        })
    }

}

class ClockOutReasonService {
    static seedClockOutReasons = async () => {
        let fs = require("fs");
        let path = require("path");
        let filePath = path.join(__dirname, "../", "seeders", "clockout_reasons.json");
        let content = "";
        if (fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath, "utf-8");
        }

        content = JSON.parse(content)
        return await ClockOutReason.insertMany(content)
    }

    static list = (filter = {}) => {
        return new ClockOutReasonProjectionBuilder(async function () {
            let limit = filter.limit || 0;
            let skip = filter.skip || 0;
            let sortKey = filter.sortKey || TableFields.messageType;
            let sortOrder = filter.sortOrder || 1;
            let needCount = Util.parseBoolean(filter.needCount);

            const searchQuery = {}
            return await Promise.all([
                needCount ? ClockOutReason.countDocuments(searchQuery) : undefined,
                ClockOutReason.find(searchQuery, this)
                    .limit(parseInt(limit))
                    .skip(parseInt(skip))
                    .sort({ [sortKey]: parseInt(sortOrder) }),
            ]).then(([total, records]) => ({ total, records }));
        })
    }

    static getReasonById = (recordId) => {
        return new ClockOutReasonProjectionBuilder(async function () {
            return await ClockOutReason.findById(MongoUtil.toObjectId(recordId), this)
        })
    }

    static getOtherReason = () => {
        return new ClockOutReasonProjectionBuilder(async function () {
            return await ClockOutReason.findOne({
                [TableFields.messageType]: ReasonType.Other
            }, this)
        })
    }

    static update = async (recordId, updatedFields = {}) => {
        await ClockOutReason.findByIdAndUpdate(MongoUtil.toObjectId(recordId), {
            [TableFields.message]: updatedFields.message,
            [TableFields.messageType]: updatedFields.messageType
        })
    }

    static delete = async (recordId) => {
        await ClockOutReason.findByIdAndDelete(MongoUtil.toObjectId(recordId))
    }

    static getAnyReason = () => {
        return new ClockOutReasonProjectionBuilder(async function () {
            return await ClockOutReason.findOne({}, this)
        })
    }

    static addReason = async (recordObj) => {
        const recordToSave = new ClockOutReason(recordObj)
        await recordToSave.save()
    }
}

class DeviceMovementService {

    static updateDeviceMovementSettings = (reqBody = {}, lean = false) => {
        return new DeviceProjectionBuilder(async function () {
            let populateFields = this.populate
            let projectionFields = {
                ...this
            }
            delete projectionFields.populate
            return await DeviceMovement.findOneAndUpdate({
                [TableFields.type]: DefaultConfigTypes.DeviceMovements
            }, {
                [TableFields.duration]: reqBody[TableFields.duration],
                [TableFields.androidSpeed]: reqBody[TableFields.androidSpeed],
                [TableFields.iosSpeed]: reqBody[TableFields.iosSpeed],
            }, {
                runValidators: true,
                upsert: true,
                projection: projectionFields,
                new: true
            }).lean(lean).populate(populateFields)
        })
    }

    static getDeviceMovementSettings = (lean = false) => {
        return new DeviceProjectionBuilder(async function () {
            let populateFields = this.populate
            let projectionFields = {
                ...this
            }
            delete projectionFields.populate
            return await DeviceMovement.findOne({
                [TableFields.type]: DefaultConfigTypes.DeviceMovements
            }, projectionFields).lean(lean).populate(populateFields);
        })
    }
}

const AppSettingsProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {}
        }
        this.withId = () => {
            projection[TableFields.ID] = 1
            return this
        }
        this.withAndroid = () => {
            projection[TableFields.androidForceUpdate] = 1
            projection[TableFields.androidUnderMaintenance] = 1
            projection[TableFields.androidVersion] = 1
            return this
        }
        this.withIOS = () => {
            projection[TableFields.iOSVersion] = 1
            projection[TableFields.iOSForceUpdate] = 1
            projection[TableFields.iOSUnderMaintenance] = 1
            return this
        }
        this.execute = async () => {
            if (Object.keys(projection.populate) == 0) {
                delete projection.populate
            } else {
                projection.populate = Object.values(projection.populate)
            }
            return await methodToExecute.call(projection)
        }
    }
}

const ClockOutReasonProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {}
        }
        this.withId = () => {
            projection[TableFields.ID] = 1
            return this
        }
        this.withBasicInfo = () => {
            projection[TableFields.messageType] = 1
            projection[TableFields.message] = 1
            return this
        }
        this.withMessage = () => {
            projection[TableFields.message] = 1
            return this
        }
        this.withMessageType = () => {
            projection[TableFields.messageType] = 1
            return this
        }
        this.execute = async () => {
            if (Object.keys(projection.populate) == 0) {
                delete projection.populate
            } else {
                projection.populate = Object.values(projection.populate)
            }
            return await methodToExecute.call(projection)
        }
    }
}

const DeviceProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {}
        }
        this.withId = () => {
            projection[TableFields.ID] = 1
            return this
        }
        this.execute = async () => {
            if (Object.keys(projection.populate) == 0) {
                delete projection.populate
            } else {
                projection.populate = Object.values(projection.populate)
            }
            return await methodToExecute.call(projection)
        }
    }
}

module.exports = { StudentAppSettingsService, ClockOutReasonService, DeviceMovementService }