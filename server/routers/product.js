const { Router } = require('express');
const Product = require('../models/Product');
const ProductCategory = require('../models/ProductCategory');
const { allow } = require('../util/passport');

const router = new Router();

/**
 * @param {ProductCategory} category
 */
router.post('/', allow('admin'), async function ({ originalUrl, category: { _id: categoryId }, body: { name, price, imageUrl } }, res) {
    try {
        const product = new Product({ name, price, imageUrl, categoryId });
        await product.save();
        return res.status(201).set('Content-Location', `${originalUrl}/${product._id}`).json(product);
    }
    catch ({ code, message }) {
        return res.status(code === 11000 ? 409 : 400).send(message);
    }
});

/**
 * @param {ProductCategory} category
 */
router.put('/:productId', allow('admin'), async function ({ category: { _id: categoryId }, params: { productId }, body: { name, price, imageUrl } }, res) {
    try {
        const product = await Product.findOne({ _id: productId, categoryId });
        if (product) {
            product.overwrite({
                name,
                price,
                imageUrl,
                categoryId,
            });
            await product.save()
            return res.json(product);
        }
        else {
            return res.sendStatus(404);
        }
    }
    catch ({ message }) {
        return res.status(400).send(message);
    }
});

/**
 * @param {ProductCategory} category
 */
router.get('/all', async function ({ category, query: { q } }, res) {
    const filter = q ? { name: { $regex: q, $options: 'i' } } : {};
    if (category === true) {
        // `true` means all the categories.
        const products = await Product.find(filter);
        return res.json(products);
    }
    else if (category instanceof ProductCategory) {
        await category.populate({ path: 'products', match: filter }).execPopulate();
        return res.json(category.products);
    }
    else {
        return res.sendStatus(500);
    }
});

/**
 * @param {ProductCategory} category
 */
router.get('/:id', async function ({ category: { _id: categoryId }, params: { id: productId } }, res) {
    const product = await Product.findOne({ _id: productId, categoryId });
    return product ? res.json(product) : res.sendStatus(404);
});

module.exports = router;

