const { Schema, model } = require('mongoose');

const schema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
}, {
    timestamps: true,
});

schema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId',
});

module.exports = model('ProductCategory', schema);

