import CurrentConfig, { ChainConfig} from "../config";

export function ConfigForChainId(chainId: number): ChainConfig | undefined {
    return CurrentConfig.Chains.find((chainConfig) => chainConfig.Chain.id === chainId);
}