async function createResource(res, url, doc) {
    const { _id } = await doc.save();
    return res.status(201).set('Content-Location', `${url}/${_id}`).json(doc);
}

exports.createResource = createResource;
