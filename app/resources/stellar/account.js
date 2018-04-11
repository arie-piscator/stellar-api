const axios = require('axios')
const stellarSdk = require('stellar-sdk')
const stellarServer = new stellarSdk.Server(process.env.STELLAR_SERVER)
const exception = require('../../exception')

module.exports = {
    get: (account) => {
        return new Promise((resolve, reject) => {
            stellarServer.accounts()
            .accountId(account)
            .call()
            .then(accountResult => {
                resolve(accountResult)
            })
            .catch(err => {
                const error = err.data.data

                exception.email(err)
                reject({
                    status: error.status,
                    message: error.title
                })
            })
        })
    },
    createTest: () => {
        return new Promise((resolve, reject) => {
            const pair = stellarSdk.Keypair.random();

            stellarSdk.Network.useTestNetwork()

            axios.get('https://friendbot.stellar.org', {
                params: {
                    addr: pair.publicKey()
                }
            })
            .then((response) => {
                resolve({
                    publicKey: pair.publicKey(),
                    secret: pair.secret()
                })
            })
            .catch((err) => {
                const error = err.data.data

                exception.email(err)
                reject({
                    status: error.status,
                    message: error.title
                })
            })
        })
    },
    createLive: () => {
        return new Promise((resolve, reject) => {
            const pair = stellarSdk.Keypair.random();

            // Todo: send 1 XLM to account
            resolve({
                publicKey: pair.publicKey(),
                secret: pair.secret()
            })
        })

    }
}