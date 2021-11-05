const { Types: { ObjectId } } = require('mongoose');
const { S3, config } = require('aws-sdk');
const { Router } = require('express');

const AWS_S3_BUCKET = process.env['AWS_S3_BUCKET'] || 'kwik-e-mart';
const AWS_REGION = process.env['AWS_REGION'] || 'eu-central-1';

config.update({ region: AWS_REGION });

const router = new Router();

router.post('/', async function ({ body: { path, type: mimeType } }, res) {
    const s3 = new S3();
    const mimeTypeRegex = /^image\/(?<fileType>.*)$/;
    if (path?.endsWith('/') && typeof mimeType === 'string' && mimeTypeRegex.test(mimeType)) {
        const { groups: { fileType } } = mimeType.match(mimeTypeRegex);
        const fileName = `${path}${new ObjectId()}.${fileType}`;
        const getUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
        const putUrl = await s3.getSignedUrlPromise('putObject', {
            Bucket: AWS_S3_BUCKET,
            ContentType: mimeType,
            Key: fileName,
            Expires: 60,
            ACL: 'public-read',
        });
        return res.status(201).json({ putUrl, getUrl });
    }
    else {
        return res.sendStatus(400);
    }
});

module.exports = router;

