const { Router } = require('express');
const ProductCategory = require('../models/ProductCategory');
const { createResource } = require('./utils');

const router = new Router();

/**
 * Create a new category.
 */
router.post('/', async function ({ originalUrl, body: { name } }, res) {
    try {
        return await createResource(res, originalUrl, new ProductCategory({ name }));
    }
    catch ({ code, message }) {
        return res.status(code === 11000 ? 409 : 500).send(message);
    }
});

/**
 * Get a list of all the categories.
 */
router.get('/all', async function (_req, res) {
    const categories = await ProductCategory.find({}, '-products');
    return res.json([{ _id: 'all', name: 'All Categories' }, ...categories]);
});

/**
 * Handle requests for products in this category.
 */
router.use(
    '/:categoryId/product',
    async function (req, res, next) {
        const { params: { categoryId } } = req;
        try {
            req.category = categoryId === 'all' || await ProductCategory.findById(categoryId);
            return req.category ? next() : res.sendStatus(404);
        }
        catch ({ kind, message }) {
            return res.status(kind === 'ObjectId' ? 400 : 500).send(message);
        }
    },
    require('./product'),
);

module.exports = router;
