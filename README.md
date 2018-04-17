

# Node.js Stellar API Bridge
A bridge to the [Stellar API](https://www.stellar.org/developers/reference/) built with Node.js. This API makes it easy to perform a few basic actions on the Stellar network, such as account / asset creation and transaction handling. You can use this API from any application, without any need for the Stellar SDK. We built this API for [stemapp.io](stemapp.io) and consume it with a PHP / Laravel application.

## Prerequisites

```
Node
Heroku CLI (optional)
```
## Installation
Install the packages with npm:
```
npm install
```
Add the environment variables to your .env file:
```
API_KEY=
```
A randomly generated key for your instance of the API.
```
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAIL_FROM_ADDRESS=
MAIL_TO_ADDRESS=
```
Mailgun credentials and settings for sending e-mail. You can create credentials on [
mailgun.com](https://www.mailgun.com/). Your are free to change the mail transport in `exception.js`.
```
STELLAR_NETWORK=
```
The Stellar Network you are using (`test` or `live`).
```
STELLAR_SERVER=
```
The Stellar server https://horizon-testnet.stellar.org (test) or https://horizon.stellar.org (live).
```
STELLAR_SECRET=
```
The secret of the Stellar account that will transfer the base reserve (2 XLM by default in this API) to new accounts. Not required when `STELLAR_NETWORK` is `test`. When using the live network it is recommended to provide this account with enough balance of XLM.

You can start the project by executing `app/index.js` or by executing `heroku local web` when using Heroku.

## Usage

#### Authorization
Set the `X-API-KEY` header to the `API_KEY` key you created in your `.env`.

#### Endpoints
Create account:
```
method  POST
url     '/api/v1/account'
header 'X-API-KEY: [YOUR_API_KEY]
```
On the test network the account will get around 10000 XLM from the Stellar friendbot. When using the live network you have to provide the `STELLAR_NETWORK` environment variable. That account will send 2 XLM to the newly created account by default. You can change this amount in `app/resources/stellar/account.js` or create an environment variable. Take the Stellar [base reserve](https://www.stellar.org/developers/guides/concepts/fees.html) into consideration.

Get account:
```
method GET
url     '/api/v1/account/{ACCOUNT ADDRESS}'
header  'X-API-KEY: [YOUR_API_KEY]
```
Create transaction:
```
method  POST
url     '/api/v1/transaction'
header  'Content-Type: application/json'
header  'X-API-KEY: [YOUR_API_KEY]'
body {
    "secret": [ORIGIN ACCOUNT SECRET], (String)
    "destination": [DESTINATION ACCOUNT ADDRESS], (String)
    "amount": [AMOUNT OF TOKENS], (String)
    "asset": [ASSET NAME], (String, leave emtpy for XLM)
    "issuer": [ASSET ISSUER ACCOUNT ADDRESS], (String, leave emtpy for XLM)
    "memo": [MEMO FOR THE TRANSACTION] (String)
}
```
Get latest transactions for an account:
```
request GET
url     '/api/v1/transaction/{ACCOUNT ADDRESS}'
header  'X-API-KEY: [YOUR_API_KEY]'
```
Create an asset:
```
request POST
url     '/api/v1/asset'
header  'Content-Type: application/json'
header  'X-API-KEY: [YOUR_API_KEY]'
body {
    "secret": [ASSET ISSUER ACCOUNT SECRET], (String)
    "asset": [ASSET NAME] (String, max. 12 alphanumeric characters)
}
```
Trust an asset:
```
request POST
url     '/api/v1/asset/trust'
header  'Content-Type: application/json'
header  'X-API-KEY: [YOUR_API_KEY]'
body {
    "secret": [ACCOUNT SECRET] (String),
    "code": [ASSET NAME] (String),
    "issuer": [ASSET ISSUER ACCOUNT ADDRESS] (String),
    "limit": [AMOUNT OF THE ASSET TO TRUST] (String)
}
```


## Deployment
Use any method you like to deploy and run this application, or use Heroku.
#### Heroku
```
heroku create
git push heroku master
```
Set the config variables on your Heroku instance with `heroku config:set VAR_NAME=value`.

## Security vulnerabilities
If you discover a security vulnerability within this project please send an e-mail to Foryard's development team at dev@foryard.nl and do not use the issue tracker. All security vulnerabilities will be promptly addressed.

## License
The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
