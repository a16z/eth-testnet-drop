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