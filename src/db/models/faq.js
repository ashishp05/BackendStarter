const mongoose = require("mongoose");
const { ValidationMsgs, TableNames, TableFields } = require("../../utils/constants");

const faqSchema = new mongoose.Schema(
    {
        [TableFields.question]: {
            type: String,
            required: [true, ValidationMsgs.Question],
        },
        [TableFields.answer]: {
            type: String,
            required: [true, ValidationMsgs.Answer],
        }
    },
    {
        timestamps: true
    }
);

const Faq = mongoose.model(TableNames.Faq, faqSchema);
module.exports = Faq