const stellarSdk = require('stellar-sdk')
const stellarServer = new stellarSdk.Server(process.env.STELLAR_SERVER)
const exception = require('../../exception')

module.exports = {
    create: (secret, code) => {
        return new Promise((resolve, reject) => {
            if (process.env.STELLAR_NETWORK === 'test') {
                stellarSdk.Network.useTestNetwork()
            }

            const issuingKeys = stellarSdk.Keypair.fromSecret(secret)
            const asset = new stellarSdk.Asset(code, issuingKeys.publicKey())

            resolve(asset)
        })
    },
    trust: (secret, code, issuer, limit) => {
        return new Promise((resolve, reject) => {
            if (process.env.STELLAR_NETWORK === 'test') {
                stellarSdk.Network.useTestNetwork()
            }

            const receivingKeys = stellarSdk.Keypair.fromSecret(secret)
            const asset = new stellarSdk.Asset(code, issuer)

            stellarServer.loadAccount(receivingKeys.publicKey())
            .then((receiver) => {
                let transaction = new stellarSdk.TransactionBuilder(receiver)
                .addOperation(stellarSdk.Operation.changeTrust({
                    asset: asset,
                    limit: limit ? limit : '0'
                }))
                .build()

                transaction.sign(receivingKeys)

                return stellarServer.submitTransaction(transaction)
            }).then((result) => {
                resolve(`Trusting asset transaction ${result.hash} sucessful.`)
            }).catch((err) => {
                exception.email(err)
                reject({
                    status: 500,
                    message: `Stellar exception. ${err.toString()}`
                })
            })
        })
    }
}