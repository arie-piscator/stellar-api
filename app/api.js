const express = require('express')
const router = express.Router()
const middleware = require('./middleware')
const axios = require('axios')
const validate = require('express-validation')
const validation = require('./validation')
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

router.post('/transaction', validate(validation.transaction), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
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

router.get('/transaction/:account', (req, res) => {
    // Get first page of transactions for account
    stellarServer.transactions()
    .forAccount(req.params.account)
    .call()
    .then((page) => {
        return res.send(page.records)
    })
    .catch((err) => {
        return res.status(500).send(`Stellar exception. ${err.toString()}`)
    });
})

router.use((err, req, res, next) => {
  res.status(400).json(err);
});

module.exports = router