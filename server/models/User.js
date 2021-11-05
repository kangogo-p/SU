const { Schema, model, Error } = require('mongoose');
const hash = require('../util/hash');

const schema = new Schema({
    _id: { type: String, match: /^\d{9}$/ },
    role: { type: String, required: true, enum: ['customer', 'admin'] },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    name: {
        first: { type: String, required: true, trim: true },
        last: { type: String, required: true, trim: true },
    },
    address: {
        city: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        house: { type: Number, required: true, min: 1 },
    },
}, {
    toJSON: { useProjection: true },
    timestamps: true,
});

schema.method('validPassword', function (password) {
    return this.passwordHash === hash(password);
});

schema.virtual('password').set(function (password) {
    this.passwordHash = hash(password);
});

schema.virtual('firstName')
    .get(function () {
        return this.name.first;
    })
    .set(function (firstName) {
        this.name.first = firstName;
    });

schema.virtual('lastName')
    .get(function () {
        return this.name.last;
    })
    .set(function (lastName) {
        this.name.last = lastName;
    });

schema.virtual('city')
    .get(function () {
        return this.address.city;
    })
    .set(function (city) {
        this.address.city = city;
    });

schema.virtual('streetAddress')
    .get(function () {
        return `${this.address.house} ${this.address.street}`;
    })
    .set(function (streetAddress) {
        const match =
            streetAddress.match(/^(?<house>\d+)\s+(?<street>.+)$/) ||
            streetAddress.match(/^(?<street>.+)\s+(?<house>\d+)$/);
        if (match) {
            const { groups: { house, street } } = match;
            Object.assign(this.address, { street, house });
        }
        else {
            throw new Error(`"${streetAddress}" is not a valid street address. A valid address must match either /^\\d+\\s+.+$/ or /^.+\\s+\\d+$/.`);
        }
    });

module.exports = model('User', schema);

