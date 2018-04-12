const stellarSdk = require('stellar-sdk')
const stellarServer = new stellarSdk.Server(process.env.STELLAR_SERVER)
const exception = require('../../exception')
const policy = require('../../policy')

module.exports = {
    create: (secret, destination, amount, code, issuer, memo) => {
        return new Promise((resolve, reject) => {
            if (process.env.STELLAR_NETWORK === 'test') {
                stellarSdk.Network.useTestNetwork()
            }

            if (process.env.STELLAR_NETWORK === 'live') {
                stellarSdk.Network.usePublicNetwork()
            }

            const sourceKeys = stellarSdk.Keypair.fromSecret(secret)
            const destinationId = destination
            let asset = stellarSdk.Asset.native()

            // Custom asset
            if (code && issuer) {
                asset = new stellarSdk.Asset(code, issuer)
            }

            policy.transaction.destinationTrustsAsset(destinationId, asset)
            // Load origin account
            .then(() => {
                return stellarServer.loadAccount(sourceKeys.publicKey())
            })
            .then((originAccount) => {

                let transaction = new stellarSdk.TransactionBuilder(originAccount)
                .addOperation(stellarSdk.Operation.payment({
                    destination: destinationId,
                    asset: asset,
                    amount: amount
                }))
                // Add meta data
                .addMemo(stellarSdk.Memo.text(memo))
                .build()

                transaction.sign(sourceKeys);

                return stellarServer.submitTransaction(transaction)
            })
            .then((result) => {
                resolve(`Transaction ${result.hash} successful.`)
            })
            .catch((err) => {
                exception.email(err)
                reject({
                    status: 500,
                    message: err.toString()
                })
            })
        })
    },
    createAccount: (destination, balance, secret) => {
        return new Promise((resolve, reject) => {
            if (process.env.STELLAR_NETWORK === 'test') {
                stellarSdk.Network.useTestNetwork()
            }

            if (process.env.STELLAR_NETWORK === 'live') {
                stellarSdk.Network.usePublicNetwork()
            }

            const sourceKeys = stellarSdk.Keypair.fromSecret(secret)

            stellarServer.loadAccount(sourceKeys.publicKey())
            .then((originAccount) => {

                let transaction = new stellarSdk.TransactionBuilder(originAccount)
                .addOperation(stellarSdk.Operation.createAccount({
                    destination: destination,
                    startingBalance: balance
                }))
                .build()

                transaction.sign(sourceKeys);

                return stellarServer.submitTransaction(transaction)
            })
            .then((result) => {
                resolve(`Create account transaction successful.`)
            })
            .catch((err) => {
                exception.email(err)
                reject({
                    status: 500,
                    message: err.toString()
                })
            })
        })
    },
    show: (account) => {
        return new Promise((resolve, reject) => {
            if (process.env.STELLAR_NETWORK === 'test') {
                stellarSdk.Network.useTestNetwork()
            }

            if (process.env.STELLAR_NETWORK === 'live') {
                stellarSdk.Network.usePublicNetwork()
            }

            // Get first page of transactions for account
            stellarServer.transactions()
            .forAccount(account)
            .call()
            .then((page) => {
                resolve(page.records)
            })
            .catch((err) => {
                exception.email(err)
                reject({
                    status: 500,
                    message: `Stellar exception. ${err.toString()}`
                })
            })
        })
    }
}