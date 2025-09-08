const { TableNames, TableFields, CounterSchemaType } = require("../../utils/constants");
const mongoose = require("mongoose");

const rootSchema = {
    [TableFields.value]: {
        type: Number,
        default: 1
    }
}

const counterSchema = new mongoose.Schema({
    ...rootSchema
}, {
    discriminatorKey: TableFields.type
});


const CounterRoot = mongoose.model(TableNames.Counter, counterSchema)
const ClassCounter = CounterRoot.discriminator(CounterSchemaType.Class, counterSchema)

module.exports = {
    CounterRoot,
    ClassCounter
}


