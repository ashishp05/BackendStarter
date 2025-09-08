const { TableNames, TableFields, DefaultConfigTypes, ReasonType } = require("../../utils/constants");
const mongoose = require("mongoose");

const studentAppSettingsSchema = new mongoose.Schema({
    _id: false,
    [TableFields.iOSVersion]: {
        type: String,
        trim: true,
    },
    [TableFields.androidVersion]: {
        type: String,
        trim: true,
    },
    [TableFields.iOSUnderMaintenance]: {
        type: Boolean,
        default: false,
    },
    [TableFields.androidUnderMaintenance]: {
        type: Boolean,
        default: false,
    },
    [TableFields.iOSForceUpdate]: {
        type: Boolean,
        default: false,
    },
    [TableFields.androidForceUpdate]: {
        type: Boolean,
        default: false,
    },
});

const clockOutReasonSchema = new mongoose.Schema({
    [TableFields.messageType]: {
        type: Number,
        enum: Object.values(ReasonType)
    },
    [TableFields.message]: {
        type: String
    }
})

const deviceMovementSchema = new mongoose.Schema({
    [TableFields.duration]: {
        type: Number,
    },
    [TableFields.androidSpeed]: {
        type: Number,
    },
    [TableFields.iosSpeed]: {
        type: Number,
    },
})

const defaultConfigSchema = new mongoose.Schema(
    {},
    {
        timestamps: true,
        discriminatorKey: TableFields.type,
    }
);

defaultConfigSchema.index({ [TableFields.type]: 1 });

const DefaultConfigRoot = mongoose.model(TableNames.DefaultConfiguration, defaultConfigSchema);
const StudentAppSettings = DefaultConfigRoot.discriminator(
    DefaultConfigTypes.StudentAppSettings,
    studentAppSettingsSchema
);

const ClockOutReason = DefaultConfigRoot.discriminator(DefaultConfigTypes.ClockOutReasons, clockOutReasonSchema)
const DeviceMovement = DefaultConfigRoot.discriminator(DefaultConfigTypes.DeviceMovements, deviceMovementSchema)

module.exports = {
    DefaultConfigRoot,
    StudentAppSettings,
    ClockOutReason,
    DeviceMovement
};
