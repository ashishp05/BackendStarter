const Mustache = require('mustache')
const { NotificationType } = require("../../../utils/constants");

exports.NotificationMessageGenerator = (function () {
    function K() { }
    K.AwayFromLocation = {
        type: NotificationType.GeoLocation,
        generate: function (studentName, className) {
            return {
                type: this.type,
                message: Mustache.render('{{studentName}} from {{className}} has removed phone from the box/locker', { studentName, className }),
                title: 'Student has removed phone from the box/locker',
            }
        }
    }
    return K;
}())