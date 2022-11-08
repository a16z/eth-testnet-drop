# Testnet Faucet
This repo contains a faucet for testnet tokens. The faucet uses a standard merkle proof for set inclusion. In this case, we determine the set of addresses as any address that has ever deployed a contract on Goerli.

![UI](imgs/ui.png)

## `cmds`
- `yarn install`
- `yarn test`
- `yarn start-local-node`
- `yarn deploy-local`
- `yarn start-local-client`
- `yarn deploy-firebase`
- `yarn build-client`

## Dev workflow
Set up the following environment variables:
- DEV_WALLETS (comma separated list – for local UI testing)
- ALCHEMY_API_KEY (for Goerli deployment)
- DEPLOY_PK (for Goerli deployment)

Commands
- Start local node: `yarn start-local-backend`
- Start local client: `yarn start-local-client`
Navigate to `localhost:3000`, potentially clear nonces on wallet for testnet.

Add the local testnets to wallet (as described in `contracts/README.md`).


# Disclaimer
*This code is being provided as is. No guarantee, representation or warranty is being made, express or implied, as to the safety or correctness of the code. It has not been audited and as such there can be no assurance it will work as intended, and users may experience delays, failures, errors, omissions or loss of transmitted information. Nothing in this repo should be construed as investment advice or legal advice for any particular facts or circumstances and is not meant to replace competent counsel. It is strongly advised for you to contact a reputable attorney in your jurisdiction for any questions or concerns with respect thereto. a16z is not liable for any use of the foregoing, and users should proceed with caution and use at their own risk. See a16z.com/disclosures for more info.*