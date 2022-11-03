interface Config {
    ContractAddr: string,
    NetworkName: string,
    MerkleTreePath: string,
    ChainId: number,
}

const GoerliConfig: Config = {
    ContractAddr: "0xA59dF9347E3e444d71F2146b0EfE147bAc19d5C2",
    NetworkName: "Goerli",
    MerkleTreePath: "/mt.txt",
    ChainId: 5 
}

const LocalConfig: Config = {
    ContractAddr: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    NetworkName: "Hardhat",
    MerkleTreePath: "./local-mt.txt",
    ChainId: 31337
}

let CurrentConfig = process.env.NODE_ENV == 'production' ? GoerliConfig : LocalConfig;

export default CurrentConfig;
