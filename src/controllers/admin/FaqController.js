let FaqService = require("../../db/services/FaqService");
const { TableFields } = require("../../utils/constants");

exports.addFaq = async (req) => {
    await FaqService.addFaq(req.body)
}

exports.listFaq = async (req) => {
    return await FaqService.listFaq(req.query).execute()
}

exports.updateFaq = async (req) => {
    await FaqService.updateFaq(req.params[TableFields.ID], req.body)
}

exports.deleteFaq = async (req) => {
    return await FaqService.deleteFaq(req.params[TableFields.ID])
}