const { InterfaceTypes, ValidationMsgs, TableFields } = require("../../utils/constants");
const { StudentAppSettingsService, ClockOutReasonService, DeviceMovementService } = require("../../db/services/DefaultConfigService");
const ValidationError = require("../../utils/ValidationError");
const Util = require("../../utils/util");

exports.updateAppSettings = async (req) => {
    let interface = req.body.interface;
    if (interface == InterfaceTypes.Student.StudentApp) {
        return await StudentAppSettingsService.updateStudentAppSettings(req.body).execute();
    } else {
        throw new ValidationError(ValidationMsgs.ParametersError);
    }
};

exports.getAppSettings = async (req) => {
    const interfaceType = req.query.interface;

    let record;
    if (interfaceType == InterfaceTypes.Student.StudentApp) {
        record = await StudentAppSettingsService.getStudentAppSettings().withAndroid().withIOS().execute();
        if (!record) {
            record = await StudentAppSettingsService.updateStudentAppSettings().withAndroid().withIOS().execute();
        }
    } else {
        throw new ValidationError(ValidationMsgs.ParametersError);
    }

    return record;
};

exports.seedClockOutReasons = async (req) => {
    const reason = await ClockOutReasonService.getAnyReason().withId().execute()
    if (reason) {
        throw new ValidationError(ValidationMsgs.ParameterError)
    }
    await ClockOutReasonService.seedClockOutReasons()
}

exports.getClockOutReasons = async (req) => {
    return await ClockOutReasonService.list(req.query).withBasicInfo().execute()
}

exports.updateClockOutReasons = async (req) => {
    const recordId = req.params[TableFields.ID]
    const { message, messageType } = req.body
    if (!message || !messageType) {
        throw new ValidationError(ValidationMsgs.ParameterError)
    }
    const record = await ClockOutReasonService.getReasonById(recordId).withMessageType().execute()
    if (!record) {
        throw new ValidationError(ValidationMsgs.ClockoutReasonNotFound)
    }
    if (record[TableFields.messageType] != messageType) {
        throw new ValidationError(ValidationMsgs.ParameterError)
    }
    const updatedFields = { message, messageType }
    await ClockOutReasonService.update(recordId, updatedFields)
}

exports.deleteClockOutReasons = async (req) => {
    const recordId = req.params[TableFields.ID]
    await ClockOutReasonService.delete(recordId)
}

exports.addClockedOutReason = async (req) => {
    if (!Util.parseBoolean(req.headers.dbuser)) {
        throw new ValidationError(ValidationMsgs.NotAllowed)
    }
    const { message, messageType } = req.body
    if (!message || !messageType) {
        throw new ValidationError(ValidationMsgs.ParameterError)
    }
    await ClockOutReasonService.addReason({ message, messageType })
}

exports.updateDeviceMovement = async (req) => {
    return await DeviceMovementService.updateDeviceMovementSettings(req.body).execute();
}

exports.getDeviceMovement = async (req) => {
    return await DeviceMovementService.getDeviceMovementSettings().execute();
}