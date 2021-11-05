const path = require('path');
const debug = require('debug');
const { connection, model, Schema } = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const { generateReceipt } = require('../util/receipt');

const log = debug('server:order');

const itemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Schema.Types.Decimal128, get: Number, required: true },
}, {
    _id: false,
    id: false,
    toJSON: {
        getters: true,
    },
});

const schema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    delivery: {
        on: { type: Date, required: true },
        to: {
            city: { type: String, required: true },
            street: { type: String, required: true },
            house: { type: Number, required: true },
        },
    },
    payment: {
        cc: {
            number: {
                type: String,
                match: /^\w{4}$/,
                trim: true,
                get(value) {
                    return `**** **** **** ${value}`;
                },
                set(value) {
                    const match = value.match(/(\w{4})\s*$/);
                    return match?.[1];
                },
                required: true,
            },
        },
    },
    items: [itemSchema],
    receiptUrl: String,
}, {
    id: false,
    timestamps: true,
    toJSON: {
        depopulate: true,
        getters: true,
    },
});

schema.virtual('totalItems').get(function () {
    return this.items.reduce((total, { quantity }) => total + quantity, 0);
});

schema.virtual('total').get(function () {
    return this.items.reduce((total, { quantity, purchasePrice }) => total + quantity * purchasePrice, 0).toFixed(2);
});

schema.post('save', async function (order, next) {
    const { pdf: { filename: receiptFilename } } = await generateReceipt(order);
    order.receiptUrl = '/' + path.relative(global.staticFilesDir, receiptFilename).replace(path.sep, '/');
    return next();
});

autoIncrement.initialize(connection);

schema.plugin(autoIncrement.plugin, 'Order');

module.exports = model('Order', schema);

