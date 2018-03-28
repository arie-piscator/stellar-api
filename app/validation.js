const joi = require('joi')

module.exports = {
    transaction: {
        body: {
            secret: joi.string().required(),
            destination: joi.string().required(),
            amount: joi.string().required(),
            memo: joi.string().required(),
        }
    }
};
