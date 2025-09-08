const UserTypes = (function () {
    function UserTypes() { }
    UserTypes.Admin = 1;
    UserTypes.School = 2;
    UserTypes.Student = 3;
    UserTypes.StaffMember = 4;
    return UserTypes;
})();

const Platforms = (function () {
    function Platforms() { }
    Platforms.Admin = 1;
    Platforms.School = 2;
    Platforms.Student = 3;
    return Platforms;
})();

const InterfaceTypes = (function () {
    function InterfaceType() { }
    InterfaceType.Admin = {
        AdminWeb: "i1",
    };
    InterfaceType.School = {
        SchoolWeb: "i2",
    };
    InterfaceType.Student = {
        StudentApp: "i3",
    };
    return InterfaceType;
})();

const ValidationMsgs = (function () {
    function ValidationMsgs(item) { }
    ValidationMsgs.InvalidAuthToken = "Invalid Auth token.";
    ValidationMsgs.ParametersError = "Invalid parameters.";
    ValidationMsgs.RecordNotFound = "Record not found!";
    ValidationMsgs.AccountAlreadyExists =
        "Registration has already been completed.";
    ValidationMsgs.AccountNotRegistered = "Account not register!.";
    ValidationMsgs.existPassword =
        "The new password cannot be the same as the old password. Please choose a different password.";
    ValidationMsgs.PasswordEmpty = "Password required!";
    ValidationMsgs.EmailInvalid = "Email is invalid";
    ValidationMsgs.PasswordInvalid = "Password is invalid";
    ValidationMsgs.AuthFail = "Please authenticate!";
    ValidationMsgs.UnableToLogin = "Incorrect email and/or password";
    ValidationMsgs.UserTypeEmpty = "User type required!";
    ValidationMsgs.NameEmpty = "Name required!";
    ValidationMsgs.EmailEmpty = "Email required!";
    ValidationMsgs.LockerNumberEmpty = "Locker Number required!";
    ValidationMsgs.CodeNumberEmpty = "Code Number required!";
    ValidationMsgs.DuplicateEmail = "Email id already exist, please enter different email";
    ValidationMsgs.NewPasswordEmpty = "New password required!";
    ValidationMsgs.PassResetTokenEmpty = "Password Reset Token required!";
    ValidationMsgs.OldPasswordIncorrect = "You've entered an incorrect old password";
    ValidationMsgs.Question = "Question required!";
    ValidationMsgs.Answer = "Answer required!";
    ValidationMsgs.DataEmpty = "Data is empty";
    ValidationMsgs.SomethingWrong = "Something Went Wrong!";
    ValidationMsgs.DuplicateData = "Duplicate Data Insert Error";
    ValidationMsgs.InsertError = "Insert Error";
    ValidationMsgs.FieldEmpty = "field is Empty";
    ValidationMsgs.AdminNameEmpty = "Admin name field is required";
    ValidationMsgs.AdminPhoneEmpty = "Admin Phone field is required";
    ValidationMsgs.CountryCodeEmpty = "Country Code field is required";
    ValidationMsgs.PhoneNumberEmpty = "Phone Number field is required";
    ValidationMsgs.ClassEmpty = "Class field is required";
    ValidationMsgs.BoxEmpty = "No of box field is required";
    ValidationMsgs.UnableToForgotPassword = "Unable to forget password!"
    ValidationMsgs.InvalidPassResetCode = "You entered wrong digits"
    ValidationMsgs.PhoneEmpty = "It seems you’re missing phone number"
    ValidationMsgs.AdminNameEmpty = "Admin name is required"
    ValidationMsgs.DuplicatePhone = "Duplicate phone number"
    ValidationMsgs.ParameterError = "Seems like parameter doesn’t match"
    ValidationMsgs.AddressEmpty = "Address is required field"
    ValidationMsgs.NotAllowed = "Looks like you don’t have access for this action"
    ValidationMsgs.ConfirmPasswordNotMatched = "password and confirm password not match"
    ValidationMsgs.ResetToken = "Reset token is required"
    ValidationMsgs.PhoneInvalid = "Phone is invalid";
    ValidationMsgs.PhoneCountryEmpty = "Phone country code cannot be blank!";
    ValidationMsgs.RegNumberUnique = "Student id already exists, Please enter different Student id";
    ValidationMsgs.NFCCodeUnique = "NFC code already exists, Please enter different NFC code";
    ValidationMsgs.InvalidToken = "Your password link has been expired"
    ValidationMsgs.YearRequired = "Year is required field"
    ValidationMsgs.YearExist = "Year already exist"
    ValidationMsgs.AcademicNotFound = "Academic year not found"
    ValidationMsgs.SchoolCannotDelete = "School cannot be removed as students are already associated";
    ValidationMsgs.IncorrectImage = "Incorrect Image!";
    ValidationMsgs.AccountDeletedOrInactive = "Your account has been deleted, Please contact to admin for more details";
    ValidationMsgs.InvalidAttempt = "Invalid attempt, please try agin later";
    ValidationMsgs.InvalidPhoneOTP = "You've entered an incorrect OTP";
    ValidationMsgs.StartDateEmpty = "Start date is required!";
    ValidationMsgs.EndDateEmpty = "End date is required!";
    ValidationMsgs.StartDateLessThan = "Start date should less than to end date";
    ValidationMsgs.RefEmpty = "Passing empty reference";
    ValidationMsgs.StudentLogNotFound = "Student's log not found";
    ValidationMsgs.TodayIsNotWorkingDay = "Today is not working day for you";
    ValidationMsgs.AlreadyClockedIn = "You are already checked in!";
    ValidationMsgs.ImageNotFound = "Image not found";
    ValidationMsgs.RegEmpty = "Student Id number is required";
    ValidationMsgs.NFCEmpty = "NFC number is required";
    ValidationMsgs.PastLeaveNotDelete = "Leave cannot be deleted because it includes today or a past date";
    ValidationMsgs.HolidayExistForLeave = "Cannot add leave on a dates that exist with a holiday";
    ValidationMsgs.LeaveExist = "Leave already exist with given dates";
    ValidationMsgs.TooEarly = "You're allowed to check in only 30 minutes before the school starts";
    ValidationMsgs.NeedClockInFirst = "You need to check in first"
    ValidationMsgs.UnderMaintenance = "Oops! The app is currently undergoing maintenance. Please try again later!"
    ValidationMsgs.ForceUpdate = "Whoops! Please update the app to continue using it"
    ValidationMsgs.AccountInactive = "Your account has been deactivated, Please contact to admin for more details!"
    ValidationMsgs.StudentRecordNotFound = "The email you've entered is not registered with us"
    ValidationMsgs.AccountNotRegisteredWithEmail = "The email you've entered that isn't registered with us"
    ValidationMsgs.YourSchoolIsInactive = "Your school account has been deactivated, Please contact your school for more details!"
    ValidationMsgs.LoginProcessCompleted = "First login attempt is completed"
    ValidationMsgs.NoMoreBoxes = "The allocated boxes to this school are full, You can't add more students! Please contact to admin"
    ValidationMsgs.BoxesAreAllocated = "You can't reduce the Box count that school has already used, Increase the box count to proceed further"
    ValidationMsgs.HolidayExist = "Holiday already exist with given dates"
    ValidationMsgs.DuplicatePhoneSchool = "School number already exist, Please enter different number"
    ValidationMsgs.DuplicatePhoneStudent = "Phone number is already associated with another student, please enter different number"
    ValidationMsgs.DuplicateEmailStudent = "Email id is already associated with another student, please enter different id"
    ValidationMsgs.DuplicateEmailSchool = "Email id is already associated with another school, please enter different id"
    ValidationMsgs.ClassAlreadyExist = "Class name already exist, Please enter different name"
    ValidationMsgs.ClassAlreadyAssigned = "You can't delete this class as students are associated with this class"
    ValidationMsgs.UnableToSendOtp = "We're unable to send the OTP to your parent's number. Please double-check the number and try again."
    ValidationMsgs.InValidData = "You have filled an invalid data, please check & upload again"
    ValidationMsgs.DuplicateEmailStudentInAnotherSchool = "Email id is already associated with another school, please enter different id"
    ValidationMsgs.ClockoutReasonNotFound = "Clockout reason not found"
    ValidationMsgs.InvitationsEmailSent = "Invitation is already sent to all the students"
    ValidationMsgs.DuplicateEmailStaffMember = "Email id is already associated with another staff member, please enter different email"
    ValidationMsgs.DuplicateEmailStaffInAnotherSchool = "Email id is already associated with another school's staff member, please enter different email"
    return ValidationMsgs;
})();

const ResponseMessages = (function () {
    function ResponseMessages() { }
    ResponseMessages.Ok = "Ok";
    ResponseMessages.NotFound = "Data not found!";
    ResponseMessages.signInSuccess = "Sign In successfully!";
    ResponseMessages.signOutSuccess = "Sign Out successfully!";
    ResponseMessages.insertSuccessfully = "Data inserted Successfully!";
    return ResponseMessages;
})();

const TableNames = (function () {
    function TableNames() { }
    TableNames.Admin = "admins";
    TableNames.Faq = "faqs";
    TableNames.Grade = "grades";
    TableNames.School = "schools";
    TableNames.Streak = "streaks";
    TableNames.Logs = "logs";
    TableNames.Student = "students";
    TableNames.AcademicYear = "academics";
    TableNames.Holidays = "holidays";
    TableNames.Leave = "leaves";
    TableNames.DefaultConfiguration = "default-configurations";
    TableNames.Class = "classes";
    TableNames.SchoolTiming = "school-timings";
    TableNames.Counter = 'counter'
    TableNames.Notification = 'notifications'
    TableNames.StaffMembers = 'staff-members'
    return TableNames;
})();

const TableFields = (function () {
    function TableFields() { }
    TableFields.ID = "_id";
    TableFields.userId = "userId";
    TableFields.name_ = "name";
    TableFields.userType = "userType";
    TableFields.countryCode = "countryCode";
    TableFields.phoneNumber = "phoneNumber";
    TableFields.platform = "platform";
    TableFields.passwordResetToken = "passwordResetToken";
    TableFields.fcmTokens = "fcmTokens";
    TableFields.token = "token";
    TableFields._createdAt = "_createdAt";
    TableFields._updatedAt = "_updatedAt";
    TableFields.email = "email";
    TableFields.password = "password";
    TableFields.tokens = "tokens";
    TableFields.approved = "approved";
    TableFields.interface = "interface";
    TableFields.active = "active";
    TableFields.image = "image";
    TableFields.question = "question";
    TableFields.answer = "answer";
    TableFields.deletedAt = "deletedAt";
    TableFields.grade = "grade";
    TableFields.status = "status";
    TableFields.deleted = "deleted";
    TableFields._deletedAt = "_deletedAt";
    TableFields.regCompleted = "regCompleted";
    TableFields.adminName = "adminName";
    TableFields.adminPhone = "adminPhone";
    TableFields.adminPhoneCountry = "adminPhoneCountry";
    TableFields.boxCount = "boxCount";
    TableFields.status = "status";
    TableFields.grades = "grades";
    TableFields.startTime = "startTime";
    TableFields.endTime = "endTime";
    TableFields.addedByAdmin = "addedByAdmin";
    TableFields.createdAt = "createdAt";
    TableFields.updatedAt = "updatedAt";
    TableFields.phone = "phone";
    TableFields.phoneCountry = "phoneCountry";
    TableFields.thumbnail = "thumbnail";
    TableFields.reference = "reference";
    TableFields.authType = "authType";
    TableFields.totalStudents = "totalStudents";
    TableFields.avgPhoneAwayHours = "avgPhoneAwayHours";
    TableFields.address = "address";
    TableFields.firstName = "firstName";
    TableFields.lastName = "lastName";
    TableFields.fullName = "fullName";
    TableFields.dob = "dob";
    TableFields.regNumber = "regNumber";
    TableFields.associatedSchool = "associatedSchool";
    TableFields.nfcCode = "nfcCode";
    TableFields.gradeReference = "gradeReference";
    TableFields.gradeName = "gradeName";
    TableFields.parents = "parents";
    TableFields.year = "year";
    TableFields.academic = "academic";
    TableFields.file = "file";
    TableFields.streak = "streak";
    TableFields.pinId = "pinId";
    TableFields.phoneVerified = "phoneVerified";
    TableFields.school = "school";
    TableFields.date = "date";
    TableFields.calenderDayStatus = "calenderDayStatus";
    TableFields.validInOutPairs = "validInOutPairs";
    TableFields.timeEntries = "timeEntries";
    TableFields.time = "time";
    TableFields.inTime = "inTime";
    TableFields.outTime = "outTime";
    TableFields.totalDuration = "totalDuration";
    TableFields.punchStatus = "punchStatus";
    TableFields.currentPunchStatus = "currentPunchStatus";
    TableFields.startDate = "startDate";
    TableFields.endDate = "endDate";
    TableFields.student = "student";
    TableFields.studentInfo = "studentInfo";
    TableFields.shiftStartTime = "shiftStartTime";
    TableFields.shiftEndTime = "shiftEndTime";
    TableFields.isArrivedLate = "isArrivedLate";
    TableFields.deviceId = "deviceId";
    TableFields.assignedBox = "assignedBox";
    TableFields.totalWorkingDays = "totalWorkingDays";
    TableFields.effectivePhoneAwayHours = "effectivePhoneAwayHours";
    TableFields.leaveDuration = "leaveDuration";
    TableFields.message = "message";
    TableFields.leaveId = "leaveId";
    TableFields.isStudent = "isStudent";
    TableFields.firstClockIn = "firstClockIn";
    TableFields.lastClockOut = "lastClockOut";
    TableFields.bufferStartTime = "bufferStartTime";
    TableFields.bufferEndTime = "bufferEndTime";
    TableFields.iOSVersion = "iOSVersion";
    TableFields.androidVersion = "androidVersion";
    TableFields.iOSUnderMaintenance = "iOSUnderMaintenance";
    TableFields.androidUnderMaintenance = "androidUnderMaintenance";
    TableFields.iOSForceUpdate = "iOSForceUpdate";
    TableFields.androidForceUpdate = "androidForceUpdate";
    TableFields.type = "type";
    TableFields.emailOTP = "emailOTP";
    TableFields.lockerNumber = "lockerNumber";
    TableFields.codeNumber = "codeNumber";
    TableFields.day = "day";
    TableFields.timing = "timing";
    TableFields.className = "className";
    TableFields.avgPhoneAwayHoursInHHMM = "avgPhoneAwayHoursInHHMM";
    TableFields.effectivePhoneAwayHoursInHHMM = "effectivePhoneAwayHoursInHHMM";
    TableFields.value = "value";
    TableFields.refKey = "refKey";
    TableFields.studentDeleted = "studentDeleted";
    TableFields.parentsPhoneOTP = "parentsPhoneOTP";
    TableFields.isSentShiftStart = "isSentShiftStart";
    TableFields.isSentShiftEnd = "isSentShiftEnd";
    TableFields.title = "title";
    TableFields.metadata = "metadata";
    TableFields.unreadItems = "unreadItems";
    TableFields.unreadCounts = "unreadCounts";
    TableFields.notClockedInEmailSent = "notClockedInEmailSent";
    TableFields.clockInGrace = "clockInGrace";
    TableFields.messageType = "messageType";
    TableFields.enableSmsToParents = "enableSmsToParents";
    TableFields.regMailSent = "regMailSent";
    TableFields.clockedOutReportEmailSent = "clockedOutReportEmailSent";
    TableFields.refreshTime = "refreshTime";
    TableFields.accuracy = "accuracy";
    TableFields.distance = "distance";
    TableFields.lat = "lat";
    TableFields.lng = "lng";
    TableFields.duration = "duration";
    TableFields.androidSpeed = "androidSpeed";
    TableFields.iosSpeed = "iosSpeed";

    //For Import Student from Excel
    TableFields.first_name = "First Name";
    TableFields.last_name = "Last Name";
    TableFields.student_email = "Student Email";
    TableFields.class_name = "Class Name";
    TableFields.first_parent_name = "First Parent Name";
    TableFields.second_parent_name = "Second Parent Name";
    TableFields.first_parent_phone = "First Parent Phone Number";
    TableFields.second_parent_phone = "Second Parent Phone Number";
    TableFields.code_number = "Code Number";
    TableFields.locker_number = "Locker Number";
    return TableFields;
})();

const ResponseStatus = (function () {
    function ResponseStatus() { }
    ResponseStatus.Failed = 0;
    ResponseStatus.Success = 200;
    ResponseStatus.BadRequest = 400
    ResponseStatus.Unauthorized = 401;
    ResponseStatus.NotFound = 404;
    ResponseStatus.UpgradeRequired = 426;
    ResponseStatus.AccountDeactivated = 3001;
    ResponseStatus.InternalServerError = 500;
    ResponseStatus.ServiceUnavailable = 503;
    return ResponseStatus;
})();

const ResponseFields = (function () {
    function ResponseFields() { }
    ResponseFields.status = "status";
    ResponseFields.message = "message";
    ResponseFields.result = "result";
    return ResponseFields;
})();

const AuthTypes = (function () {
    function types() { }
    types.Admin = 1;
    types.School = 2;
    types.Student = 3;
    return types;
})();

const FCMPlatformType = (function () {
    function type() { }
    type.Android = 1;
    type.iOS = 2;
    return type;
})();

const GeneralMessages = (function () {
    function GeneralMessages() { }
    GeneralMessages.forgotPasswordEmailSubject = "Reset your PhoneAwayBox password";
    GeneralMessages.invitationEmailSubject = "Welcome to PhoneAwayBox";
    GeneralMessages.studentLoginEmailSubject = "One Time Password (OTP) for your PhoneAwayBox account";
    GeneralMessages.studentNotClockedEmailSubject = "Students are not checked in";
    GeneralMessages.clockedOutReport = "Students checked out report";

    return GeneralMessages;
})();

const ApiResponseCode = (function () {
    function ApiResponseCode() { }
    ApiResponseCode.ClientOrServerError = 400;
    ApiResponseCode.ResponseSuccess = 200;
    ApiResponseCode.AuthError = 401;
    ApiResponseCode.UnderMaintenance = 503; //Service Unavailable
    ApiResponseCode.ForceUpdate = 409; //Version Control
    return ApiResponseCode;
})();

const CalenderDayStatusTypes = (function () {
    function type() { }
    type.Working = 1
    type.Leave = 2
    type.Holiday = 3
    return type
})();

const PunchStatusTypes = (function () {
    function type() { }
    type.ClockIn = 1
    type.ClockOut = 2
    type.NotClockIn = 3
    return type
})()

const AllStatus = (function () {
    function type() { }
    type.ClockIn = 1
    type.ClockOut = 2
    type.NotClockIn = 3
    type.Leave = 4
    type.Holiday = 5
    return type
})()

const DefaultConfigTypes = (function () {
    function types() { }
    types.StudentAppSettings = "appSettings"; //default configuration type
    types.ClockOutReasons = "reasons"; //default configuration type
    types.DeviceMovements = "device-movements"; //default configuration type
    return types;
})();

const ActivationStatusTypes = (function () {
    function type() { }
    type.All = 1
    type.Active = 2
    type.InActive = 3
    return type
})()

const WeekDays = (function () {
    function type() { }
    type.Mon = 1
    type.Tue = 2
    type.Wed = 3
    type.Thu = 4
    type.Fri = 5
    type.Sat = 6
    type.Sun = 0
    return type
})()

const CounterSchemaType = (function () {
    function types() { }
    types.Class = 'ct1' //ct=counter type
    types.Student = 'ct2' //ct=counter type
    return types;
}());

const NotificationType = (function () {
    function type() { }
    type.GeoLocation = 1
    return type
})()

const ReasonType = (function () {
    function type() { }
    type.Home = 1;
    type.Medical = 2;
    type.Curricular = 3;
    type.Parental = 4;
    type.Classroom = 5;
    type.Other = 6;
    type.Lunch = 7;
    return type;
})()

const Accuracy = (function () {
    function type() { }
    type.Low = 1;
    type.Medium = 2;
    type.High = 3;
    return type;
})()

module.exports = {
    ValidationMsgs,
    TableNames,
    TableFields,
    ResponseStatus,
    ResponseFields,
    ResponseMessages,
    UserTypes,
    Platforms,
    InterfaceTypes,
    AuthTypes,
    FCMPlatformType,
    GeneralMessages,
    ApiResponseCode,
    CalenderDayStatusTypes,
    PunchStatusTypes,
    AllStatus,
    DefaultConfigTypes,
    ActivationStatusTypes,
    WeekDays,
    CounterSchemaType,
    NotificationType,
    ReasonType,
    Accuracy
};
