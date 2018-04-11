const express = require('express')
const router = express.Router()
const middleware = require('./middleware')
const stellarAccount = require('./resources/stellar/account')
const stellarAsset = require('./resources/stellar/asset')
const stellarTransaction = require('./resources/stellar/transaction')
const validate = require('express-validation')
const validation = require('./validation')

router.use(middleware)

router.post('/account', (req, res) => {
    if (process.env.STELLAR_NETWORK === 'test') {
        stellarAccount.createTest()
        .then(account => {
            res.send(account)
        })
        .catch(err => {
            res.status(err.status).send(err.message)
        })
    }

    if (process.env.STELLAR_NETWORK === 'live') {
        stellarAccount.createLive()
        .then(account => {
            return res.send(account)
        })
        .catch(err => {
            return res.status(err.status).send(err.message)
        })
    }
})

router.get('/account/:account', (req, res) => {
    stellarAccount.get(req.params.account)
    .then(account => {
        res.send(account)
    })
    .catch(err => {
        res.status(err.status).send(err.message)
    })
})

router.post('/asset', validate(validation.asset), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    stellarAsset.create(req.body.secret, req.body.asset)
    .then(asset => {
        res.send(asset)
    })
    .catch(err => {
        res.status(err.status).send(err.message)
    })
})

router.get('/asset', (req, res) => {
    res.send('GET asset')
})

router.post('/asset/trust', validate(validation.asset.trust), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    stellarAsset.trust(req.body.secret, req.body.code, req.body.issuer, req.body.limit)
    .then(result => {
        res.send(result)
    })
    .catch(err => {
        res.status(err.status).send(err.message)
    })
})

router.post('/transaction', validate(validation.transaction), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    stellarTransaction.create(
        req.body.secret,
        req.body.destination,
        req.body.amount,
        req.body.asset,
        req.body.issuer,
        req.body.memo
    )
    .then(result => {
        res.send(result)
    })
    .catch(err => {
        res.status(err.status).send(err.message)
    })
})

router.get('/transaction/:account', (req, res) => {
    stellarTransaction.show(req.params.account)
    .then(transactions => {
        res.send(transactions)
    })
    .catch(err => {
        res.status(err.status).send(err.message)
    })
})

router.use((err, req, res, next) => {
  res.status(400).json(err);
});

module.exports = router