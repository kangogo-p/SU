const { Router } = require('express');
const { Error: MongooseError } = require('mongoose');
const User = require('../models/User');

const router = new Router();

router.put('/:id', async function ({ originalUrl, params: { id: _id }, body: { email, password, firstName, lastName, city, streetAddress } }, res) {
    const obj = { _id, role: 'customer', email, password, firstName, lastName, city, streetAddress };
    try {
        const user = await User.findById(_id) || new User(obj);
        const { isNew } = user;
        if (!isNew) {
            user.overwrite(obj);
        }
        await user.save();
        return res.status(isNew ? 201 : 200).set('Content-Location', originalUrl).json(user);
    } catch (err) {
        if (err instanceof MongooseError) {
            return res.status(400).send(err.message);
        }
        else {
            return res.sendStatus(500);
        }
    }
});

module.exports = router;
