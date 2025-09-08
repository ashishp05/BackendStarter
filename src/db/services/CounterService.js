const Util = require("../../utils/util");
const { TableFields, CounterSchemaType } = require("../../utils/constants");
const { CounterRoot } = require("../models/counter");

class   CounterService {
    static consumeKeys = async (totalKeysToConsume = 1, type = CounterSchemaType.Class) => {
        const record = await CounterRoot.findOneAndUpdate({
            [TableFields.type]: type
        }, [
            {
                $set: {
                    [TableFields.value]: {
                        $sum: [{
                            $ifNull: ['$' + TableFields.value, 1]
                        }, totalKeysToConsume]
                    }
                }
            }
        ], {
            new: true,
            upsert: true,
            projection: { [TableFields.value]: 1, [TableFields.type]: 1 }
        });
        let startValue = record[TableFields.value] - totalKeysToConsume
        const keys = [];
        let mPrefix = ""
        switch (record[TableFields.type]) {
            case CounterSchemaType.Student:
                mPrefix = "S"
                break
        }
        for (let i = 0; i < totalKeysToConsume; i++) {
            keys.push(mPrefix + Util.padValue((startValue + i)));
        }
        return keys;
    }

    static async consumeSingleKey(type = CounterSchemaType.Class) {
        const generatedKeys = await CounterService.consumeKeys(1, type);
        return generatedKeys[0];
    }

}

module.exports = CounterService;
