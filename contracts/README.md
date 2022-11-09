## compile
`npx hardhat compile`

## test
`npx hardhat test`

## deploy
1. Set up environment variables for `ALCHEMY_API_KY` and `DEPLOY_PK`.
2. `npx hardhat deploy --network goerli --file mt.txt --amount 0.0001`

## collect
*Ideally use the UI for collection, but if you'd like to use cmd, run the command below.*

`ts-node ./scripts/collect.ts --pk=<collection private key> --rpc=<rpc for relevant chain> --contract_address=<Collector contract address> --leaves_file=<Merkle tree leaves file path>`

There are two optional cmd flags: `graffiti` / `recipient`

## dev workflow (UI testing)
1. Set up environment variable for `DEV_WALLETS` (comma separated list of public keys)
2. Fill out `local-mt.txt` with some public keys for claiming
3. Add `Anvil 8500` and `Anvil 8501` networks to wallet
![networks](imgs/MetaMaskSetup.png)
4. `yarn start-local` – spins up 2 anvil nodes at 8500 and 8501 for testing dual network.