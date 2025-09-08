const mongoose = require("mongoose");
mongoose.connection.on("connected", () => {
    console.log("Database Connection Established");
});
mongoose.connection.on("reconnected", () => {
    console.log("Database Connection Reestablished");
});
mongoose.connection.on("disconnected", () => {
    console.log("Database Connection Disconnected");
});
mongoose.connection.on("close", () => {
    console.log("Database Connection Closed");
});
mongoose.connection.on("error", (error) => {
    console.log("Database ERROR: " + error);
});

class MongoUtil {
    static newObjectId() {
        return new mongoose.Types.ObjectId();
    }

    static toObjectId(stringId) {
        return new mongoose.Types.ObjectId(stringId);
    }

    static isValidObjectID(id) {
        return mongoose.isValidObjectId(id);
    }
}

const initConnection = (callback) => {
    mongoose.connect(process.env.DB_URL);
    // mongoose.set('debug', true);
    var db = mongoose.connection;
    db.once("open", function () {
        callback();
    });
};
module.exports = {
    initConnection,
    mongoose,
    MongoUtil
};
