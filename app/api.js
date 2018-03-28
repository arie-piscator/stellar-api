const express = require('express')
const router = express.Router()
const middleware = require('./middleware')
const axios = require('axios')
const bodyParser = require('body-parser')
const StellarSdk = require('stellar-sdk')
const jsonParser = bodyParser.json()
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

router.post('/transaction', jsonParser, (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    // Todo: Validate properly
    if (!req.body.secret) { // String
        return res.status(422).send('The origin secret is missing.')
    }

    if (!req.body.destination) { // String
        return res.status(422).send('The destination id is missing.')
    }

    if (!req.body.amount) { // String
        return res.status(422).send('The amount is missing.')
    }

    if (!req.body.memo) { // String
        return res.status(422).send('The memo is missing.')
    }

    const sourceKeys = StellarSdk.Keypair.fromSecret(req.body.secret)
    const destinationId = req.body.destination
    let transaction

    StellarSdk.Network.useTestNetwork()

    stellarServer.loadAccount(destinationId)
    // Destination account not found
    .catch(StellarSdk.NotFoundError, (error) => {
        return res.status(422).send('The destination account does not exist.')
    })
    // Load origin account
    .then(() => {
        return stellarServer.loadAccount(sourceKeys.publicKey());
    })
    .then((originAccount) => {
        transaction = new StellarSdk.TransactionBuilder(originAccount)
        .addOperation(StellarSdk.Operation.payment({
            destination: destinationId,
            asset: StellarSdk.Asset.native(), // Lumens
            amount: req.body.amount
        }))
        // Add meta data
        .addMemo(StellarSdk.Memo.text(req.body.memo))
        .build()

        transaction.sign(sourceKeys);

        return stellarServer.submitTransaction(transaction);
    })
    .then((result) => {
        return res.send(`Transaction ${result.hash} sucessful.`)
    })
    .catch((err) => {
        return res.status(500).send(`Stellar exception. ${err.toString()}`)
    });
})

module.exports = router