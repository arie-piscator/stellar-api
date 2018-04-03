const express = require('express')
const router = express.Router()
const middleware = require('./middleware')
const axios = require('axios')
const validate = require('express-validation')
const validation = require('./validation')
const stellarSdk = require('stellar-sdk')
const stellarServer = new stellarSdk.Server('https://horizon-testnet.stellar.org')

router.use(middleware)

router.post('/account', (req, res) => {
    const pair = stellarSdk.Keypair.random();

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

router.post('/asset', validate(validation.asset), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    const issuingKeys = stellarSdk.Keypair.fromSecret(req.body.secret)
    const asset = new stellarSdk.Asset(req.body.asset, issuingKeys.publicKey())

    res.send(asset)
})

router.get('/asset', (req, res) => {
    res.send('GET asset')
})

router.post('/asset/trust', validate(validation.asset.trust), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    const receivingKeys = stellarSdk.Keypair.fromSecret(req.body.secret)
    const asset = new stellarSdk.Asset(req.body.code, req.body.issuer)

    stellarSdk.Network.useTestNetwork()

    stellarServer.loadAccount(receivingKeys.publicKey())
    .then((receiver) => {
        let transaction = new stellarSdk.TransactionBuilder(receiver)
        .addOperation(stellarSdk.Operation.changeTrust({
            asset: asset,
            limit: req.body.limit ? req.body.limit : '0'
        }))
        .build()

        transaction.sign(receivingKeys)

        return stellarServer.submitTransaction(transaction)
    }).then((result) => {
        return res.send(`Trusting asset transaction ${result.hash} sucessful.`)
    }).catch((err) => {
        return res.status(500).send(`Stellar exception. ${err.toString()}`)
    })
})

router.post('/transaction', validate(validation.transaction), (req, res) => {
    if (!req.body) {
        return res.sendStatus(400)
    }

    const sourceKeys = stellarSdk.Keypair.fromSecret(req.body.secret)
    const destinationId = req.body.destination
    let asset = stellarSdk.Asset.native()

    // Custom asset
    if (req.body.asset && req.body.issuer) {
        asset = new stellarSdk.Asset(req.body.asset, req.body.issuer)
    }

    stellarSdk.Network.useTestNetwork()

    stellarServer.loadAccount(destinationId)
    .then((destinationAccount) => {
         // Check if receiver trusts asset
        let trusted = destinationAccount.balances.some((balance) => {
            return asset.asset_type === 'native'
                || (balance.asset_code === asset.code
                && balance.asset_issuer === asset.issuer)
        })

        if (!trusted) {
           throw new Error(
                `The receiving account (${destinationId})
                does not have a trustline for the asset.`
            )
        }
    })
    // Load origin account
    .then(() => {
        return stellarServer.loadAccount(sourceKeys.publicKey());
    })
    .then((originAccount) => {
        let transaction = new stellarSdk.TransactionBuilder(originAccount)
        .addOperation(stellarSdk.Operation.payment({
            destination: destinationId,
            asset: asset,
            amount: req.body.amount
        }))
        // Add meta data
        .addMemo(stellarSdk.Memo.text(req.body.memo))
        .build()

        transaction.sign(sourceKeys);

        return stellarServer.submitTransaction(transaction);
    })
    .then((result) => {
        return res.send(`Transaction ${result.hash} sucessful.`)
    })
    .catch((err) => {
        return res.status(500).send(err.toString())
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