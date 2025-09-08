const { TableFields, NotificationType } = require("../../../utils/constants");
const { NotificationMessageGenerator } = require("./NotificationMessageGenerator");
const School = require("../../models/school");
const Notification = require("../../models/notification");
const Util = require("../../../utils/util");
const { MongoUtil } = require("../../mongoose");

function createNotificationObject(schoolId, studentId, message, notificationType, metadata = "", title = "") {
    let notificationObject = {
        [TableFields.school]: schoolId,
        [TableFields.student]: studentId,
        [TableFields.message]: message,
        [TableFields.type]: notificationType
    }
    if (metadata) {
        notificationObject[TableFields.metadata] = metadata
    }
    if (title) {
        notificationObject[TableFields.title] = title
    }
    return notificationObject
}

class NotificationService {
    static list = (school, filter = {}) => {
        return new ProjectionBuilder(async function () {
            let limit = filter.limit || 0;
            let skip = filter.skip || 0;
            let sortKey = filter.sortKey || TableFields._createdAt;
            let sortOrder = filter.sortOrder || -1;
            let needCount = Util.parseBoolean(filter.needCount);
            let date = filter.date || null

            const qry = {
                [TableFields.school]: MongoUtil.toObjectId(school),
            }

            if (date) {
                date = Util.removeTime(date)
                qry[TableFields.date] = date
            }

            let populateFields = this.populate
            let projectionFields = {
                ...this
            }
            delete projectionFields.populate

            return await Promise.all([
                needCount ? Notification.countDocuments(qry) : undefined,
                Notification.find(qry, projectionFields).limit(parseInt(limit)).skip(parseInt(skip)).sort({ [sortKey]: parseInt(sortOrder) }).populate(populateFields)
            ]).then(([total, records]) => ({ total, records }))
        })
    }

    static markAllNotificationsAsRead = async (school) => {
        await School.updateOne({
            [TableFields.ID]: school
        }, {
            [TableFields.unreadCounts]: 0
        })
    }

    static insertNotificationUnreadReadFlag = async (schoolId, notificationType) => {
        await School.findByIdAndUpdate(schoolId, {
            $addToSet: { [TableFields.unreadItems]: { $each: [-2, notificationType] } } // -2 for Notification Tab
        })
    }

    static updateUnreadCount = async (schoolId) => {
        await School.findByIdAndUpdate(schoolId, {
            $inc: {
                [TableFields.unreadCounts]: 1,
            }
        })
    }

    static onStudentIsAwayFromBox = async (record, date = new Date(), accuracy = 1, distance = 0) => {
        const studentId = record[TableFields.ID]
        const schoolId = record[TableFields.associatedSchool][TableFields.reference]
        const name = record[TableFields.fullName]
        const className = record[TableFields.grade][TableFields.name_]
        const msg = NotificationMessageGenerator.AwayFromLocation.generate(name, className)

        this.updateUnreadCount(schoolId)
        const notificationObject = new Notification({
            [TableFields.school]: schoolId,
            [TableFields.student]: studentId,
            [TableFields.type]: msg.type,
            [TableFields.title]: msg.title,
            [TableFields.message]: msg.message,
            [TableFields.date]: date,
            [TableFields.accuracy]: accuracy,
            [TableFields.distance]: distance,

        })
        await notificationObject.save()
    }

    static deleteNotifications = async (schoolId) => {
        await Notification.deleteMany({
            [TableFields.school]: schoolId,
            [TableFields.type]: NotificationType.GeoLocation
        })
        await this.markAllNotificationsAsRead(schoolId)
    }
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {}
        }
        this.withId = () => {
            projection[TableFields.ID] = 1
            return this
        }
        this.withProjectionForList = () => {
            projection[TableFields.ID] = 1
            projection[TableFields.title] = 1
            projection[TableFields.message] = 1
            projection[TableFields.student] = 1
            projection[TableFields._createdAt] = 1
            projection[TableFields.accuracy] = 1
            projection[TableFields.distance] = 1
            return this
        }
        const putInPopulate = (path, selection, model, deepPopulateObj) => {
            if (projection.populate[path]) {
                let existingRecord = projection.populate[path];
                existingRecord.select += " " + selection
                projection.populate[path] = existingRecord
            } else {
                projection.populate[path] = { path: path, select: selection, model, populate: deepPopulateObj }
            }
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

module.exports = NotificationService