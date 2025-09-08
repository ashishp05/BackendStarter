class ValidationError extends Error {
    constructor(message, data, code) {
        super(message);
        this.name = "ValidationError";
        this.data = data;
        this.code = code;
    }
}

module.exports = ValidationError;
