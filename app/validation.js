const joi = require('joi')

module.exports = {
    transaction: {
        body: {
            secret: joi.string().required(),
            destination: joi.string().required(),
            amount: joi.string().required(),
            asset: joi.string().optional(),
            issuer: joi.string().optional(),
            memo: joi.string().required(),
        }
    },
    asset: {
        body: {
            secret: joi.string().required(),
            asset: joi.string().required().min(1).max(12)
        },
        trust: {
            body: {
                secret: joi.string().required(),
                code: joi.string().required().min(1).max(12),
                issuer: joi.string().required(),
                limit: joi.string().optional()
            }
        }
    }
};
