const moment = require('moment');
const {
    ResponseFields,
    PremiumTypes,
    ContentTypes,
    OrganizationTypes
} = require('../utils/constants')
const fs = require("fs")

var DecimalPrecision4 = (function () {
    if (Math.trunc === undefined) {
        Math.trunc = function (v) {
            return v < 0 ? Math.ceil(v) : Math.floor(v);
        };
    }
    var powers = [
        1e0, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7,
        1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15,
        1e16, 1e17, 1e18, 1e19, 1e20, 1e21, 1e22
    ];
    var intpow10 = function (power) {
        if (power < 0 || power > 22) {
            return Math.pow(10, power);
        }
        return powers[power];
    };
    var toPrecision = function (num, significantDigits) {
        // Return early for ±0, NaN and Infinity.
        if (!num || !Number.isFinite(num))
            return num;
        // Compute shift of the decimal point (sf - leftSidedDigits).
        var shift = significantDigits - 1 - Math.floor(Math.log10(Math.abs(num)));
        // Return if rounding to the same or higher precision.
        var decimalPlaces = 0;
        for (var p = 1; num != Math.round(num * p) / p; p *= 10) decimalPlaces++;
        if (shift >= decimalPlaces)
            return num;
        // Round to "shift" fractional digits
        var scale = intpow10(Math.abs(shift));
        return shift > 0 ?
            Math.round(num * scale) / scale :
            Math.round(num / scale) * scale;
    };
    // Eliminate binary floating-point inaccuracies.
    var stripError = function (num) {
        if (Number.isInteger(num))
            return num;
        return toPrecision(num, 15);
    };
    var decimalAdjust = function myself(type, num, decimalPlaces) {
        if (type === 'round' && num < 0)
            return -myself(type, -num, decimalPlaces);
        var p = intpow10(decimalPlaces || 0);
        var n = stripError(num * p);
        return Math[type](n) / p;
    };
    return {
        // Decimal round (half away from zero)
        round: function (num, decimalPlaces) {
            return decimalAdjust('round', num, decimalPlaces);
        },
        // Decimal ceil
        ceil: function (num, decimalPlaces) {
            return decimalAdjust('ceil', num, decimalPlaces);
        },
        // Decimal floor
        floor: function (num, decimalPlaces) {
            return decimalAdjust('floor', num, decimalPlaces);
        },
        // Decimal trunc
        trunc: function (num, decimalPlaces) {
            return decimalAdjust('trunc', num, decimalPlaces);
        },
        // Format using fixed-point notation
        toFixed: function (num, decimalPlaces) {
            return decimalAdjust('round', num, decimalPlaces).toFixed(decimalPlaces);
        }
    };
})();

const Util = class {
    static isImageFile(fileOriginalName) {
        return ((fileOriginalName.toLocaleLowerCase().match(/\.(jpg|jpeg|jpe|jif|jfif|jfi|png|bmp|webp|tiff|tif|dib|svg|svgz|xlsx)$/) == undefined) ? false : true)
    }
    static isExcelFile(fileOriginalName) {
        return ((fileOriginalName.toLocaleLowerCase().match(/\.(xlsx|xls)$/) == undefined) ? false : true)
    }
    static getErrorMessage(mongooseException) {
        try {
            const mainJSONKeys = Object.keys(mongooseException.errors);
            if (mongooseException.errors[mainJSONKeys[0]].errors) {
                const jsonKeys = Object.keys(mongooseException.errors[mainJSONKeys[0]].errors);
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].errors[jsonKeys[0]].properties.message
                }
            } else {
                return {
                    error: mongooseException.errors[mainJSONKeys[0]].message
                }
            }
        } catch (e) {
            return {
                error: mongooseException.message
            }
        }
    }

    static getErrorMessageFromString(message) {
        return {
            error: message
        };
    }

    static getBaseURL() {
        let baseURL = process.env.HOST
        if (Util.useProductionSettings() == false) {
            baseURL += ":" + process.env.PORT
        }
        return baseURL
    }

    static useProductionSettings() {
        return Util.parseBoolean(process.env.isProd)
    }

    static parseBoolean(b) {
        return (b + "").toLowerCase() == 'true'
    }

    static generateRandomFileName(filename) {
        var ext = filename.split('.').pop()
        var random = Math.floor(Math.random() * 9000000000000000)
        let timestamp = new Date().getTime().toString();
        filename = timestamp + "_" + random + '.' + ext;
        return filename
    }

    static tokenMaxAge() {
        return new Date('2099-12-31')
    }

    static removeTime(dateObj) {
        if (!dateObj) {
            return
        }
        let year = dateObj.getUTCFullYear();
        let month = dateObj.getUTCMonth() + 1;
        let dt = dateObj.getUTCDate();
        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }
        return year + '-' + month + '-' + dt
    }
    
    static isDateToday(date = new Date(), todayDate = new Date()) {
        const dateToCheck = new Date(date);
        const today = new Date(todayDate);

        const isToday = dateToCheck.getFullYear() === today.getFullYear() &&
            dateToCheck.getMonth() === today.getMonth() &&
            dateToCheck.getDate() === today.getDate();
        return isToday
    }

    static isTodayInRange(date1 = new Date(), date2 = new Date(), todayDate = new Date()) {
        const startDate = new Date(date1)
        const endDate = new Date(date2)
        const today = new Date(todayDate);

        const conditionFirst = startDate.getFullYear() <= today.getFullYear() &&
            startDate.getMonth() <= today.getMonth() &&
            startDate.getDate() <= today.getDate();

        const conditionSecond = endDate.getFullYear() >= today.getFullYear() &&
            endDate.getMonth() >= today.getMonth() &&
            endDate.getDate() >= today.getDate();

        return conditionFirst && conditionSecond
    }

    static getTodaysDateWithoutTime() {
        return new Date(Util.removeTime(new Date()));
    }

    static generateRandomPassword(length, includeAlphabets = false) {
        var result = '';
        var characters = ""
        if (includeAlphabets) {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        } else {
            characters = '0123456789';
        }
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static addZero = (i) => {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    };

    static getSystemDateUTC = (d) => {
        let currentDate = new Date(new Date().toUTCString());
        return (
            currentDate.getFullYear() +
            "-" +
            this.addZero(currentDate.getMonth() + 1) +
            "-" +
            this.addZero(currentDate.getDate())
        );
    };

    static getSystemDateTimeUTC = () => {
        return new Date(new Date().toUTCString());
    };

    static getDateTimeMST = () => {
        return new Date(new Date().toLocaleString('en-US', {
            timeZone: 'America/Denver'
        }));
    };

    static getCurrentUTCTime = () => {
        const now = new Date().getUTCMilliseconds();
        dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
    };

    static msToTime(duration) {
        console.log(duration)
        var minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;

        return hours + ":" + minutes;
    }

    static getFileContent(filePath) {
        let content = ''
        if (fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath)
        }
        return content
    }

    static getContentTypeString(ContentType) {
        switch (ContentType) {
            case ContentTypes.Meditation:
                return 'Meditations';
            case ContentTypes.Affirmation:
                return 'Affirmations';
            case ContentTypes.Articles:
                return 'Articles';
            default:
                return '';
        }
    }

    static getOrganizationTypeString(OrganizationType) {
        switch (OrganizationType) {
            case OrganizationTypes.FamilyAndFriends:
                return 'Family And Friends';
            case OrganizationTypes.MyCommunity:
                return 'My Community';
            case OrganizationTypes.Organizations:
                return 'Organizations';
            case OrganizationTypes.SpecialGuest:
                return 'Special Guest';
            default:
                return '';
        }
    }

    static getPremiumTypeString(PremiumType) {
        switch (PremiumType) {
            case PremiumTypes.Premium:
                return 'Premium';
            case PremiumTypes.Free:
                return 'Free';
            default:
                return '';
        }
    }
    static populateMissingDates = (dataObject, startDate, endDate) => {
        dataObject = dataObject.map((val) => {
            return { ...val, createdAt: moment(val.createdAt).format("YYYY-MM-DD") }
        })
        let startMonth = parseInt(moment(startDate).format("MM"))
        let endMonth = parseInt(moment(endDate).format("MM"))
        let startYear = parseInt(moment(endDate).format("YYYY"))
        let endYear = parseInt(moment(endDate).format("YYYY"))
        // console.log(startMonth,endMonth)
        if (startMonth === endMonth) {
            const allDates = Array.from(new Set(dataObject.map((entry) => moment(entry.createdAt).format("YYYY-MM-DD"))))
            // Get the unique months from the dataObject
            const uniqueMonths = Array.from(new Set(allDates.map((date) => moment(date).format("YYYY-MM-DD").toString().slice(0, 7))))
            // console.log(parseInt(moment(endDate).format("D")))

            // Populate missing dates for each month in the dataObject with zeros
            uniqueMonths.forEach((month) => {
                const monthDates = allDates.filter((date) => moment(date.toString().startsWith(month)).format("YYYY-MM-DD"))
                // for (let i = parseInt(moment(startDate).format("D")); i <= parseInt(moment(endDate).format("D")); i++) {
                //     const day = i < 10 ? `0${i}` : `${i}`
                //     const date = `${startYear}-${startMonth}-${day}`
                //     console.log("monthDates",monthDates,"date",date)
                //     if (!monthDates.includes(date)) {
                //     dataObject.push({createdAt: date,emojiId:0,title:""})
                //     }
                // }
                for (let i = parseInt(moment(startDate).format("D")); i <= parseInt(moment(endDate).format("D")); i++) {
                    const day = i < 10 ? `0${i}` : `${i}`;
                    const date = `${startYear}-${startMonth}-${day}`;

                    if (!monthDates.includes(moment(date).format("YYYY-MM-DD"))) {
                        dataObject.push({ createdAt: date, emojiId: 0, title: "" });
                    }
                }
            })
        } else {
            const monthEnd = moment(startDate).endOf('month').format("YYYY-MM-DD");
            const monthStart = moment(endDate).startOf('month').format("YYYY-MM-DD");
            // console.log("monthEnd",monthEnd,"monthStart",monthStart)

            const allDates = Array.from(new Set(dataObject.map((entry) => moment(entry.createdAt).format("YYYY-MM-DD"))))
            // Get the unique months from the dataObject
            const uniqueMonths = Array.from(new Set(allDates.map((date) => moment(date).format("YYYY-MM-DD").toString().slice(0, 7))))
            // console.log(parseInt(moment(endDate).format("D")))

            // Populate missing dates for each month in the dataObject with zeros
            uniqueMonths.forEach((month) => {
                const monthDates = allDates.filter((date) => date.toString().startsWith(month))
                // for (let i = parseInt(moment(startDate).format("D")); i <= parseInt(moment(monthEnd).format("D")); i++) {
                //     const day = i < 10 ? `0${i}` : `${i}`
                //     const month = startMonth < 10 ? `0${startMonth}` : `${startMonth}`

                //     const date = `${startYear}-${month}-${day}`
                //     // console.log(`${month}-${day}`)
                //     // console.log(date)
                //     if (!monthDates.includes(date)) {
                //         dataObject.push({createdAt: date,emojiId:0,title:""})
                //         }
                // }
                for (let i = parseInt(moment(startDate).format("D")); i <= parseInt(moment(monthEnd).format("D")); i++) {
                    const day = i < 10 ? `0${i}` : `${i}`;
                    const month = startMonth < 10 ? `0${startMonth}` : `${startMonth}`;
                    const date = `${startYear}-${month}-${day}`;

                    if (!monthDates.includes(moment(date).format("YYYY-MM-DD"))) {
                        dataObject.push({ createdAt: date, emojiId: 0, title: "" });
                    }
                }
            })
            uniqueMonths.forEach((month) => {
                const monthDates = allDates.filter((date) => date.toString().startsWith(month))
                // console.log("dataObject",monthDates)

                // for (let i = parseInt(moment(monthStart).format("D")); i <= parseInt(moment(endDate).format("D")); i++) {
                //     const day = i < 10 ? `0${i}` : `${i}`
                //     const month = endMonth < 10 ? `0${endMonth}` : `${endMonth}`
                //     const date = `${endYear}-${month}-${day}`

                //     if (!monthDates.includes(date.toString())) {
                //         dataObject.push({createdAt: date,emojiId:0,title:""})
                //         }
                // }
                for (let i = parseInt(moment(monthStart).format("D")); i <= parseInt(moment(endDate).format("D")); i++) {
                    const day = i < 10 ? `0${i}` : `${i}`;
                    const month = endMonth < 10 ? `0${endMonth}` : `${endMonth}`;
                    const date = `${endYear}-${month}-${day}`;

                    if (!monthDates.includes(moment(date).format("YYYY-MM-DD"))) {
                        dataObject.push({ createdAt: date, emojiId: 0, title: "" });
                    }
                }
            })
            // console.log("dataObject",dataObject)

            // uniqueMonths.forEach((month) => {
            //     const monthDates = allDates.filter((date) => moment(date.toString().startsWith(month)).format("YYYY-MM-DD"));
            //     for (let i = 1; i <= moment(month + '-01').daysInMonth(); i++) {
            //         const day = i < 10 ? `0${i}` : `${i}`;
            //         const date = `${month}-${day}`;
            //         if (!monthDates.includes(date)) {
            //             dataObject.push({ createdAt: date, emojiId: 0, title: "" });
            //         }
            //     }
            // });
        }


        // Sort dataObject based on dates
        return dataObject
    }
    static escapeRegex(textStr = "") {
        return textStr.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    static wrapWithRegexQry(textStr = "") {
        return new RegExp(Util.escapeRegex(textStr))
    }
    static isValidMobileNumber(v) {
        return v.length >= 9 && v.length <= 12;
    }
    static trimLeadingZeros(stringValue) {
        if (stringValue) {
            try {
                stringValue = stringValue.replace(/^0+/, "");
            } catch (error) {
                throw error;
            }
        }
        return stringValue;
    }
    static getTimeDuration(clockInTime = new Date(), clockOutTime = new Date()) {
        const durationInMilliseconds = clockOutTime - clockInTime; // Difference in milliseconds
        const durationInHours = durationInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
        return this.round(durationInHours, 1)
    }

    static getTimeDurationInHoursAndMinutes(totalDuration) {
        const hours = Math.floor(totalDuration);
        const minutes = Math.round((totalDuration - hours) * 60);
        return `${hours}h ${minutes}m`;
    }

    static parseTimeString(timeString = "12:00") {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setUTCHours(hours, minutes, 0, 0);
        return date;
    }

    static round(value, decimals = 2) {
        return DecimalPrecision4.round(value, decimals)
    }

    static getDayDifference(dateOne = new Date(), dateSecond = new Date()) {
        const startDate = new Date(dateOne);
        const endDate = new Date(dateSecond);
        const timeDifference = endDate - startDate;

        // Convert the time difference from milliseconds to days and add 1 to include both start and end dates
        const totalDays = timeDifference / (1000 * 60 * 60 * 24) + 1;
        return totalDays
    }

    static getDateByUTCOffset = (date, utcOffset = 0, startDate = true) => {
        let mDate = new Date(date)
        if (startDate) {
            mDate.setUTCHours(0, 0, 0, 0)
        } else {
            mDate.setUTCHours(23, 59, 59, 999)
        }
        mDate.setTime(mDate.getTime() + utcOffset * 60 * 1000);
        return mDate
    }

    static getDateTimeByUTCOffset = (utcOffset = 0, date) => {
        let mDate = new Date()
        if (date) {
            mDate = date
        }
        mDate.setTime(mDate.getTime() + utcOffset * 60 * 1000);
        return mDate
    }

    static generateGrNumber(length, includeAlphabets = false) {
        var result = '';
        var characters = ""
        if (includeAlphabets) {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        } else {
            characters = '0123456789';
        }
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    static adjustTime(startTime, endTime) {
        // Convert startTime to a Date object
        let start = new Date(`1970-01-01T${startTime}:00`);
        // Subtract 30 minutes
        start.setMinutes(start.getMinutes() - 30);

        // Convert endTime to a Date object
        let end = new Date(`1970-01-01T${endTime}:00`);
        // Add 30 Minutes
        end.setMinutes(end.getMinutes() + 30);

        // Format the times back to 'HH:MM' format
        const adjustedStartTime = start.toTimeString().slice(0, 5);
        const adjustedEndTime = end.toTimeString().slice(0, 5);

        return {
            startTime: adjustedStartTime,
            endTime: adjustedEndTime
        };
    }

    static padValue(value, padCount = 4, padSymbol = "0") {
        return String(value).padStart(padCount, padSymbol);
    }

    static formatToDdMmYyyyWithTime(dateObj, utcOffset = 0) {
        if (utcOffset) {
            utcOffset = parseInt(utcOffset)
        } else {
            utcOffset = 0
        }
        return moment(dateObj).utcOffset(-utcOffset).format('DD/MM/YYYY, hh:mm A')//01/01/2021 00:00 AM
    }

    static formatDateWithDdMmmYyyy() {
        return moment().format('DD-MMM-YYYY');
    }

    static degToRad = (deg) => (deg * Math.PI) / 180;
    static getEarthRadius = () => 6371000; // Radius of the Earth in meters
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const dLat = Util.degToRad(lat2 - lat1);
        const dLon = Util.degToRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Util.degToRad(lat1)) * Math.cos(Util.degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = Util.getEarthRadius() * c; // Distance in meters
        return distance
    }
}
module.exports = Util