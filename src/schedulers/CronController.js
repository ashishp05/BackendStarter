const path = require('path');
const { TableFields, CalenderDayStatusTypes, PunchStatusTypes, AllStatus, ActivationStatusTypes, NotificationType } = require('../utils/constants')
const Util = require('../utils/util')
const Email = require("../emails/email");
const PDFCreator = require("../utils/pdfCreator")


/**
* ---------------------------------------------
* Here all functions will be called on cron
* ---------------------------------------------
*/

/**
* ----------------------------------------------------
* This cron will create all not deleted students logs
* on daily basis
* ----------------------------------------------------
*/

//Adding more one day because
//Suppose I have to execute this function at 2024-06-26T00:10:00.087Z
//new Date() = 2024-06-25T23:10:00.087Z
//So 00:10 is equivalent to 23:10 UTC

exports.logsCreator = async () => {
    try {
        const listSchool = await SchoolService.listSchools().withId().execute()
        const schoolRecords = listSchool.records
        if (!schoolRecords.length) return

        let todayDateTime = new Date()
        todayDateTime.setDate(todayDateTime.getDate() + 1)

        const utcOffset = process.env.UTC_OFFSET || 330
        const localDate = Util.getDateTimeByUTCOffset(utcOffset)
        let todayDate = Util.removeTime(localDate)
        const day = localDate.getDay()

        for (let i = 0; i < schoolRecords.length; i++) {
            const schoolId = schoolRecords[i][TableFields.ID]

            const timing = await SchoolTimingService.getTimingBySchoolAndDay(schoolId, day).execute()

            let timingNotAdded = false
            let shiftStartTime = ''
            let shiftEndTime = ''
            let bufferStartTime = ''
            let bufferEndTime = ''

            if (!timing) {
                timingNotAdded = true
            }
            else {
                shiftStartTime = timing[TableFields.startTime]
                shiftEndTime = timing[TableFields.endTime]
                bufferStartTime = timing[TableFields.bufferStartTime]
                bufferEndTime = timing[TableFields.bufferEndTime]
            }

            //Holiday and Sunday Logic
            const holidayRecord = await HolidayService.getHolidayBySchoolAndDate(schoolId, todayDate).withId().execute()
            const isTodayHoliday = holidayRecord || timingNotAdded

            const students = await StudentService.listStudents({ reference: schoolId }).withName().withRegNumber().withGrade().withImage().execute()
            const studentsRecords = students.records
            if (!studentsRecords.length) continue

            let logs = []
            for (let i = 0; i < studentsRecords.length; i++) {
                const studentId = studentsRecords[i][TableFields.ID]
                const firstName = studentsRecords[i][TableFields.firstName]
                const lastName = studentsRecords[i][TableFields.lastName]
                const regNumber = studentsRecords[i][TableFields.regNumber]
                const grade = studentsRecords[i][TableFields.grade]
                const image = studentsRecords[i][TableFields.image]
                let calenderDayStatus = CalenderDayStatusTypes.Working
                let status = AllStatus.NotClockIn

                const todaysLog = await LogService.getStudentLogs(studentId, schoolId, todayDate).withId().execute()
                if (todaysLog) continue

                //Set calenderDayStatus based on Leave and Holiday
                if (isTodayHoliday) {
                    calenderDayStatus = CalenderDayStatusTypes.Holiday
                    status = AllStatus.Holiday
                }
                else {
                    const leave = await LeaveService.getLeaveByDate(studentId, schoolId, todayDate, todayDate).withId().execute()
                    if (leave) {
                        calenderDayStatus = CalenderDayStatusTypes.Leave
                        status = AllStatus.Leave
                    }
                }

                const logsRecord = {
                    [TableFields.school]: schoolId,
                    [TableFields.student]: studentId,
                    [TableFields.date]: todayDate,
                    [TableFields.status]: status,
                    [TableFields.calenderDayStatus]: calenderDayStatus,
                    [TableFields.currentPunchStatus]: PunchStatusTypes.NotClockIn,
                    [TableFields.shiftStartTime]: shiftStartTime,
                    [TableFields.shiftEndTime]: shiftEndTime,
                    [TableFields.bufferStartTime]: bufferStartTime,
                    [TableFields.bufferEndTime]: bufferEndTime,
                    [TableFields.studentInfo]: {
                        [TableFields.firstName]: firstName,
                        [TableFields.lastName]: lastName,
                        [TableFields.fullName]: firstName + " " + lastName,
                        [TableFields.regNumber]: regNumber,
                        [TableFields.grade]: grade[TableFields.name_],
                        [TableFields.gradeReference]: grade[TableFields.reference],
                        [TableFields.image]: image
                    },
                    [TableFields._createdAt]: localDate
                }
                logs.push(logsRecord)

                if (calenderDayStatus == CalenderDayStatusTypes.Working) {
                    await StudentService.workingDayUpdater(studentId)
                }
            }

            await LogService.insertMany(logs)
            await SchoolService.commonFlagReset(schoolId, false)
            console.log('executed')
        }
    } catch (error) {
        console.log(error)
    }
}

/**
* ----------------------------------------------------------
* This cron will do clock out a student if not
* And find average of phone away hours of student and school
* -----------------------------------------------------------
*/
exports.averageCreator = async () => {
    try {
        const listSchool = await SchoolService.listSchools({ state: ActivationStatusTypes.Active }).withId().execute()
        const schoolRecords = listSchool.records || []
        if (!schoolRecords.length) return

        let todayDateTime = new Date()
        let todayDate = Util.removeTime(todayDateTime)

        for (let i = 0; i < schoolRecords.length; i++) {
            const schoolId = schoolRecords[i][TableFields.ID]

            const students = await StudentService.listStudents({ reference: schoolId }).withAnalytics().withWorkingDays().execute()
            const studentsRecords = students.records
            if (!studentsRecords.length) continue

            let totalStudents = 0
            let totalAvgPhoneAwayHours = 0

            for (let i = 0; i < studentsRecords.length; i++) {
                const studentId = studentsRecords[i][TableFields.ID]
                const totalWorkingDays = studentsRecords[i][TableFields.totalWorkingDays]
                const avgPhoneAwayHours = studentsRecords[i][TableFields.avgPhoneAwayHours]

                const todaysLog = await LogService.getStudentLogs(studentId, schoolId, todayDate).basicInfoForAverageCreator().withTimeEntries().withShift().execute()
                if (!todaysLog) continue

                //If Student missed clock out punch
                let effectivePhoneAwayHours = todaysLog[TableFields.effectivePhoneAwayHours]
                if (todaysLog[TableFields.currentPunchStatus] == PunchStatusTypes.ClockIn) {
                    //Do Manual Clock Out Here
                    const timeEntries = todaysLog[TableFields.timeEntries] || []
                    if (!timeEntries.length) continue //This is for crash scenario

                    const lastEntry = timeEntries.pop()
                    const clockInTime = lastEntry[TableFields.time]
                    const totalDuration = Util.getTimeDuration(clockInTime, todayDateTime)
                    effectivePhoneAwayHours += totalDuration

                    const otherReason = await ClockOutReasonService.getOtherReason().withBasicInfo().execute()

                    const validInOutPairs = {
                        [TableFields.inTime]: lastEntry[TableFields.time],
                        [TableFields.outTime]: todayDateTime,
                        [TableFields.totalDuration]: totalDuration
                    }

                    const timeEntry = {
                        [TableFields.time]: todayDateTime,
                        [TableFields.message]: otherReason[TableFields.message],
                        [TableFields.messageType]: otherReason[TableFields.messageType],
                        [TableFields.punchStatus]: PunchStatusTypes.ClockOut
                    }

                    await LogService.addClockOutTimeEntry(todaysLog[TableFields.ID], validInOutPairs, timeEntry, PunchStatusTypes.ClockOut)
                    await LogService.addLastClockOut(todaysLog[TableFields.ID], todayDateTime)
                }

                //If student is on Holiday or On Leave then will not affect in avg
                if (todaysLog[TableFields.calenderDayStatus] == CalenderDayStatusTypes.Working) {
                    //Student's Working day but not came to school
                    //reset streak to 0
                    if (todaysLog[TableFields.currentPunchStatus] == PunchStatusTypes.NotClockIn) {
                        //flag true for reset to zero
                        await StudentService.updateStreaksCount(studentId, true)
                    } else {
                        //student counter for who is came to school
                        totalStudents += 1
                    }

                    const finalAvgPhoneAwayHours = averageFinder(totalWorkingDays, avgPhoneAwayHours, effectivePhoneAwayHours)
                    await StudentService.updateAverageHours(studentId, finalAvgPhoneAwayHours)

                    totalAvgPhoneAwayHours += finalAvgPhoneAwayHours
                }
            }

            //update avg for school
            if (totalStudents > 0 && totalAvgPhoneAwayHours > 0) {
                let finalSchoolAverage = totalAvgPhoneAwayHours / totalStudents
                finalSchoolAverage = Util.round(finalSchoolAverage, 2)
                await SchoolService.updateAverageHours(schoolId, finalSchoolAverage)
            }
        }

        console.log('Average creator executed')
    } catch (error) {
        console.log(error)
    }
}

/**
* ----------------------------------------------------------
* This cron will sent SMS is student is not came to school or
* still in school and buffer time also over
* -----------------------------------------------------------
*/
exports.smsSender = async () => {
    try {
        if (!Twilio.isSMSEnabled()) {
            return
        }
        const listSchool = await SchoolService.listSchools({ state: ActivationStatusTypes.Active }).withId().execute()
        const schoolRecords = listSchool.records
        if (!schoolRecords.length) return

        let todayDateTime = new Date()
        let todayDate = Util.removeTime(todayDateTime)

        for (let i = 0; i < schoolRecords.length; i++) {
            const schoolId = schoolRecords[i][TableFields.ID]

            const students = await StudentService.listStudents({ reference: schoolId }).withName().withParents().withGrade().withDeviceId().withSmsFlag().execute()
            const studentsRecords = students.records
            if (!studentsRecords.length) continue

            for (let i = 0; i < studentsRecords.length; i++) {
                const studentId = studentsRecords[i][TableFields.ID]
                const fullName = studentsRecords[i][TableFields.fullName]
                const parents = studentsRecords[i][TableFields.parents]
                const grade = studentsRecords[i][TableFields.grade]
                const enableSmsToParents = studentsRecords[i][TableFields.enableSmsToParents]

                if (!studentsRecords[i][TableFields.deviceId]) continue
                if (!enableSmsToParents) continue

                const todaysLog = await LogService.getStudentLogs(studentId, schoolId, todayDate).basicInfoForSmsSender().withTimeEntries().withShift().execute()
                if (!todaysLog) continue
                if (todaysLog[TableFields.calenderDayStatus] != CalenderDayStatusTypes.Working) continue

                const utcOffset = process.env.UTC_OFFSET || 330
                const localDate = Util.getDateTimeByUTCOffset(utcOffset)

                if (!todaysLog[TableFields.timeEntries].length && todaysLog[TableFields.currentPunchStatus] == PunchStatusTypes.NotClockIn) {
                    //Add Morning SMS config
                    if (todaysLog[TableFields.isSentShiftStart]) continue

                    let parsedShiftTime = Util.parseTimeString(todaysLog[TableFields.shiftStartTime])
                    let shiftStartTimeWithThirtyMins = Util.getDateTimeByUTCOffset(0, parsedShiftTime)
                    shiftStartTimeWithThirtyMins.setMinutes(shiftStartTimeWithThirtyMins.getMinutes() + 30);
                    if (localDate > shiftStartTimeWithThirtyMins) {
                        //SEND SMS
                        const className = grade[TableFields.name_]
                        await Twilio.sendNotCheckedInSMS(parents, fullName, className)
                        await LogService.updateShiftStartSmsFlag(todaysLog[TableFields.ID], schoolId, studentId)
                    }
                }

                if (todaysLog[TableFields.isSentShiftEnd]) continue

                const parsedBufferEndTime = Util.parseTimeString(todaysLog[TableFields.bufferEndTime])
                const bufferEndTimeInUtc = Util.getDateTimeByUTCOffset(0, parsedBufferEndTime)
                if (localDate < bufferEndTimeInUtc) continue

                if (todaysLog[TableFields.timeEntries].length && todaysLog[TableFields.currentPunchStatus] == PunchStatusTypes.ClockIn) {
                    //SEND SMS
                    await Twilio.sendNotCheckedOutSMS(parents, fullName)
                    await LogService.updateShiftEndSmsFlag(todaysLog[TableFields.ID], schoolId, studentId)
                }
            }
        }
        console.log('SMS sender executed')
    } catch (error) {
        console.log(error)
    }
}

/** 
* ----------------------------------------------------------
* This cron will remove all the notification of previous
* month
* -----------------------------------------------------------
*/
exports.notificationRemover = async () => {
    try {
        const listSchool = await SchoolService.listSchools().withUnReadCounts().execute()
        const schoolRecords = listSchool.records || []
        if (!schoolRecords.length) return

        for (let i = 0; i < schoolRecords.length; i++) {
            const schoolId = schoolRecords[i][TableFields.ID]
            await NotificationService.deleteNotifications(schoolId)
        }
        console.log('Notification remover executed')
    } catch (error) {
        console.log(error)
    }
}

/**
* ----------------------------------------------------------
* This cron will sent Email to school admin if student is not came to school
* -----------------------------------------------------------
*/
exports.emailSender = async () => {
    const listSchool = await SchoolService.listSchools({ state: ActivationStatusTypes.Active }).withEmail().withEmailFlag().withClockInGrace().execute()
    const schoolRecords = listSchool.records
    if (!schoolRecords.length) return

    let todayDateTime = new Date()
    let todayDate = Util.removeTime(todayDateTime)

    for (let i = 0; i < schoolRecords.length; i++) {
        const schoolId = schoolRecords[i][TableFields.ID]
        const email = schoolRecords[i][TableFields.email]
        const notClockedInEmailSent = schoolRecords[i][TableFields.notClockedInEmailSent]
        const clockInGrace = listSchool[TableFields.clockInGrace] || 30

        if (notClockedInEmailSent) continue

        const students = await StudentService.listStudents({ reference: schoolId }).withName().withGrade().execute()
        const studentsRecords = students.records
        if (!studentsRecords.length) continue

        const studentData = []
        for (let i = 0; i < studentsRecords.length; i++) {
            const studentId = studentsRecords[i][TableFields.ID]
            const fullName = studentsRecords[i][TableFields.fullName]
            const grade = studentsRecords[i][TableFields.grade]

            const todaysLog = await LogService.getStudentLogs(studentId, schoolId, todayDate).withStates().withTimeEntries().withShift().execute()
            if (!todaysLog) continue
            if (todaysLog[TableFields.calenderDayStatus] != CalenderDayStatusTypes.Working) continue

            const utcOffset = process.env.UTC_OFFSET || 330
            const localDate = Util.getDateTimeByUTCOffset(utcOffset)

            if (!todaysLog[TableFields.timeEntries].length && todaysLog[TableFields.currentPunchStatus] == PunchStatusTypes.NotClockIn) {
                //Add Email config

                let parsedShiftTime = Util.parseTimeString(todaysLog[TableFields.shiftStartTime])
                let shiftStartTimeWithThirtyMins = Util.getDateTimeByUTCOffset(0, parsedShiftTime)
                shiftStartTimeWithThirtyMins.setMinutes(shiftStartTimeWithThirtyMins.getMinutes() + clockInGrace);
                if (localDate > shiftStartTimeWithThirtyMins) {
                    //SEND Email Data
                    const className = grade[TableFields.name_]
                    studentData.push({
                        reference: grade[TableFields.reference],
                        className,
                        fullName
                    })
                }
            }
        }

        if (studentData.length) {
            const groupedData = studentData.reduce((acc, { reference, className, fullName }) => {
                let classGroup = acc.find((group) => group.className === className);
                if (!classGroup) {
                    classGroup = { className, students: [] };
                    acc.push(classGroup);
                }

                if (fullName) {
                    classGroup.students.push({ fullName });
                }
                return acc;
            }, []);

            if (groupedData.length) {
                Email.sendNotClockedInStudentsEmail(email, groupedData)
                await SchoolService.updateNotClockedInEmailFlag(schoolId, true)

                const { records: staffMembers } = await StaffService.list({ reference: schoolId }).withEmail().execute()
                for (const staffMember of staffMembers) {
                    Email.sendNotClockedInStudentsEmail(staffMember[TableFields.email], groupedData)
                }
            }
        }
    }
    console.log('Email sender executed')
}

/**
* ----------------------------------------------------------
* This cron will sent Email to school admin for report of
* Student checked out after one hour of school completion 
* -----------------------------------------------------------
*/
exports.checkedOutReportSender = async () => {
    const listSchool = await SchoolService.listSchools({ state: ActivationStatusTypes.Active }).withEmail().withEmailFlag().execute()
    const schoolRecords = listSchool.records
    if (!schoolRecords.length) return

    const utcOffset = process.env.UTC_OFFSET || 330
    const localDate = Util.getDateTimeByUTCOffset(utcOffset)
    const day = localDate.getDay()

    const emailSendTimer = process.env.STUDENT_EMAIL_REPORT_TIMER || 60

    try {
        for (let i = 0; i < schoolRecords.length; i++) {
            const schoolId = schoolRecords[i][TableFields.ID]
            const email = schoolRecords[i][TableFields.email]
            const clockedOutReportEmailSent = schoolRecords[i][TableFields.clockedOutReportEmailSent]

            if (clockedOutReportEmailSent) continue

            const timing = await SchoolTimingService.getTimingBySchoolAndDay(schoolId, day).execute()
            if (!timing) continue

            let parsedShiftTime = Util.parseTimeString(timing[TableFields.endTime])
            let shiftEndTimeWithGivenMins = Util.getDateTimeByUTCOffset(0, parsedShiftTime)

            shiftEndTimeWithGivenMins.setMinutes(shiftEndTimeWithGivenMins.getMinutes() + Number(emailSendTimer));
            if (localDate < shiftEndTimeWithGivenMins) continue

            const studentsLogs = await LogService.listStudentsLogs({ school: schoolId }).projectionForReport().withStates().execute()
            const records = studentsLogs.records
            if (!records.length) continue

            const notifications = await NotificationService.list(schoolId, { date: localDate }).withProjectionForList().execute()
            const notificationRecords = notifications.records

            const studentNotificationIdInfoMap = notificationRecords.reduce((p, c) => {
                const studentId = c[TableFields.student] + "";
                if (!p[studentId]) {
                    p[studentId] = { timeEntries: [] };
                }
                p[studentId].timeEntries.push({
                    isAwayFromBox: true,
                    punchStatus: 2,
                    message: 'Phone removed without permission',
                    time: c[TableFields._createdAt]
                });
                return p
            }, {})

            const studentData = []
            records.forEach(a => {
                if (a[TableFields.calenderDayStatus] == CalenderDayStatusTypes.Working && a[TableFields.timeEntries].length) {
                    let timeEntries = undefined
                    if (studentNotificationIdInfoMap[a[TableFields.student] + ""]) {
                        const studentNotifications = studentNotificationIdInfoMap[a[TableFields.student] + ""][TableFields.timeEntries]
                        timeEntries = [...a[TableFields.timeEntries], ...studentNotifications]
                    } else {
                        timeEntries = a[TableFields.timeEntries]
                    }
                    studentData.push({
                        reference: a[TableFields.studentInfo][TableFields.gradeReference],
                        className: a[TableFields.studentInfo][TableFields.grade],
                        fullName: a[TableFields.studentInfo][TableFields.fullName],
                        timeEntries: timeEntries
                    })
                }
            })

            if (!studentData.length) {
                //Case: curr time is more than shift end with 1 hour and no
                //student were found in clockout entries
                await SchoolService.clockedOutReportEmailSent(schoolId, true)
                continue
            }

            const groupedData = studentData.reduce((acc, { reference, className, fullName, timeEntries }) => {
                let classGroup = acc.find((group) => group.className === className);
                if (!classGroup) {
                    classGroup = { className, students: [] };
                    acc.push(classGroup);
                }

                if (fullName && timeEntries.length) {
                    classGroup.students.push({ fullName, timeEntries });
                }
                return acc;
            }, []);

            if (!groupedData.length) continue

            //PDF-Contents:
            const headerStack = [
                {
                    image: path.join(__dirname, '../assets/images/logo.png'),
                },
            ];

            let contents = [
                PDFCreator.getHeaderWithLogo(headerStack),
                ...PDFCreator.getTitleHeader('Report for students checked out & Away from box',
                    null, null,
                    Util.formatToDdMmYyyyWithTime(new Date(), -utcOffset))
            ]

            contents.push(PDFCreator.getTwoLineBreak())

            contents.push(PDFCreator.getTableLayout2(
                [
                    { text: "Student Name", style: 'tableHeader3' },
                    { text: "Date & Time", style: 'tableHeader3' },
                    { text: "Reason", style: 'tableHeader3' },
                ],
                groupedData.flatMap(classInfoObj => {
                    const rows = [];
                    if (classInfoObj.students.length) {
                        rows.push([
                            {
                                table: {
                                    body: [
                                        [
                                            '',
                                            {
                                                text: [
                                                    { text: classInfoObj.className, style: "tableData3", bold: true, fontSize: 14, alignment: 'left' }
                                                ]
                                            }
                                        ]
                                    ]
                                },
                                layout: PDFCreator.getTableCenterLayout({
                                    defaultBorder: false
                                }),
                                fillColor: '#F3F3F3',
                                colSpan: 3
                            },
                            {},
                            {}
                        ]);

                        // Process each student
                        classInfoObj.students.forEach(studentObj => {
                            const studentName = studentObj[TableFields.fullName];
                            const timeEntries = studentObj.timeEntries || [];
                            timeEntries.sort((a, b) => a.time - b.time)

                            // Filter for punchStatus: 2 entries
                            const filteredEntries = timeEntries.filter(entry => entry.punchStatus === 2);

                            // Add a row for each valid time entry
                            filteredEntries.forEach(entry => {
                                const isAwayFromBox = entry.isAwayFromBox && entry.isAwayFromBox == true
                                rows.push([
                                    { text: studentName, style: "tableData3", alignment: 'center', rowSpan: filteredEntries.length },
                                    { text: Util.formatToDdMmYyyyWithTime(entry.time, -utcOffset), style: "tableData3", alignment: 'center' },
                                    { text: entry[TableFields.message] || 'N/A', style: isAwayFromBox ? "tableData4" : "tableData3", alignment: 'center' }
                                ]);
                            });
                        });
                    }
                    return rows;
                }),
                {
                    widths: ['34%', '33%', '33%'] // Adjust column widths
                }
            ));

            const fileBuffer = await PDFCreator.generatePDFBuffer(contents)
            Email.sentClockOutStudentReport(email, fileBuffer)
            await SchoolService.clockedOutReportEmailSent(schoolId, true)

            const { records: staffMembers } = await StaffService.list({ reference: schoolId }).withEmail().execute()
            for (const staffMember of staffMembers) {
                Email.sentClockOutStudentReport(staffMember[TableFields.email], fileBuffer)
            }
        }
        console.log('Report sender executed')
    } catch (error) {
        console.log(error)
    }
}

function averageFinder(totalWorkingDays = 1, avgHours = 0, todaysHours = 0) {
    const totalAverageHours = (totalWorkingDays - 1) * avgHours
    const finalAverage = (totalAverageHours + todaysHours) / totalWorkingDays
    return Util.round(finalAverage, 2)
}