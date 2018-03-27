const express = require('express')
const router = express.Router()
const middleware = require('./middleware')
const axios = require('axios')
const StellarSdk = require('stellar-sdk')
const stellarServer = new StellarSdk.Server('https://horizon-testnet.stellar.org')

router.use(middleware)

router.post('/account', (req, res) => {
    const pair = StellarSdk.Keypair.random();

    axios.get('https://friendbot.stellar.org', {
        params: {
            addr: pair.publicKey()
        }
    })
    .then(response => {
        res.send({
            publicKey: pair.publicKey(),
            secret: pair.secret()
        })
    })
    .catch(err => {
        const error = err.data.data
        res.status(error.status).send(error.title)
    })
})

router.get('/account/:account', (req, res) => {
    stellarServer.accounts()
    .accountId(req.params.account)
    .call()
    .then(accountResult => {
        res.send(accountResult);
    })
    .catch(err => {
        const error = err.data.data
        res.status(error.status).send(error.title)
    })
})

router.post('/asset', (req, res) => {
    res.send('POST create asset')
})

router.get('/asset', (req, res) => {
    res.send('GET asset')
})

router.post('/transaction', (req, res) => {
    res.send('POST create transaction')
})

module.exports = router