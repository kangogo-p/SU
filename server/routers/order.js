const util = require('util');
const debug = require('debug');
const { Router } = require('express');
const Order = require('../models/Order');
const passport = require('../util/passport');
const { createResource } = require('./utils');

const log = debug('server:order');

const router = new Router();

router.post('/', passport.allow('customer'), async function ({ originalUrl, user, body }, res) {
    log(util.inspect({ user, body }, { depth: 4, colors: true }));
    const order = new Order({ customer: user, ...body });
    await order.populate('items.product').execPopulate();
    if (+order.total === +body.total && order.items.every(item => item.product && item.purchasePrice === item.product.price)) {
        try {
            return await createResource(res, originalUrl, order);
        } catch (e) {
            log(e);
            const errors = e.errors ? Object.values(e.errors) : [];
            const messages = errors.map(({ message }) => message).join('\n');
            return res.status(e.errors ? 400 : 500).send(messages);
        }
    }
    else {
        return res
            .status(400)
            .send(
                +order.total !== +body.total
                    ? `Total is ${order.total}, not ${body.total}.`
                    : order.items
                        .filter(item => item.purchasePrice !== item.product.price)
                        .map(item => `${item.product.name} costs ${item.product.price}, not ${item.purchasePrice}.`)
                        .join('\n')
            );
    }

});

router.get('/all', async function (req, res) {
    const orders = await Order.find();
    return res.json(orders);
});

router.get('/:id', async function ({ params: { id } }, res) {
    const order = await Order.findById(id);
    return order ? res.json(order) : res.sendStatus(404);
})

module.exports = router;

