const { ApiResponseCode } = require("./constants");
const Util = require("./util");

class AppSettingError extends Error {

    constructor(message, isMaintenance = true) {
        super(message);
        this.name = "AppSettingsError";
        this.responseCode = isMaintenance ? ApiResponseCode.UnderMaintenance : ApiResponseCode.ForceUpdate;
    }
}
module.exports = AppSettingError