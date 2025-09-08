const { TableFields, ValidationMsgs } = require("../../utils/constants");
const Faq = require("../models/faq");
const Util = require("../../utils/util");
const ValidationError = require("../../utils/ValidationError");

class FaqService {
    static addFaq = async (reqBody) => {
        const faq = new Faq({
            [TableFields.question]: reqBody[TableFields.question],
            [TableFields.answer]: reqBody[TableFields.answer],
        })
        await faq.save()
    }

    static listFaq = (filter = {}) => {
        return new FaqProjectionBuilder(async function () {
            let limit = filter.limit || 0;
            let skip = filter.skip || 0;
            let sortKey = filter.sortKey || TableFields.createdAt;
            let sortOrder = filter.sortOrder || -1;
            let needCount = Util.parseBoolean(filter.needCount);
            let searchTerm = filter.searchTerm
            let qry = {}
            if (searchTerm) {
                qry[TableFields.question] = {
                    $regex: Util.wrapWithRegexQry(searchTerm),
                    $options: 'i'
                }
            }
            return await Promise.all([
                needCount ? Faq.countDocuments(qry) : undefined,
                Faq.find(qry, this).limit(parseInt(limit)).skip(parseInt(skip)).sort({ [sortKey]: parseInt(sortOrder) })
            ]).then(([total, records]) => ({ total, records }))
        })
    }

    static updateFaq = async (recordId, reqBody) => {
        const record = await Faq.findByIdAndUpdate(recordId, {
            [TableFields.question]: reqBody[TableFields.question],
            [TableFields.answer]: reqBody[TableFields.answer],
        }, { new: false })

        if (!record) {
            throw new ValidationError(ValidationMsgs.RecordNotFound)
        }
    }

    static deleteFaq = async (recordId) => {
        await Faq.findByIdAndRemove(recordId)
    }
};

const FaqProjectionBuilder = class {
    constructor(methodToExecute) {
        const projection = {
            populate: {},
        };
        this.withInfo = () => {
            projection[TableFields.question] = 1;
            projection[TableFields.answer] = 1;
            return this;
        };

        this.withId = () => {
            projection[TableFields.ID] = 1;
            return this;
        };

        this.execute = async () => {
            if (Object.keys(projection.populate) == 0) {
                delete projection.populate;
            } else {
                projection.populate = Object.values(projection.populate);
            }
            return await methodToExecute.call(projection);
        };
    }
};

module.exports = FaqService;
