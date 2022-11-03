

import { useAccount, useConnect, useContractRead, useDisconnect, useContractWrite, usePrepareContractWrite, useNetwork, useSwitchNetwork } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { CheckCircleIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { utils } from "ethers";
import { useEffect, useState } from 'react';
import CurrentConfig from '../../config';
import CollectorAbi from "../../ABIs/Collector.json";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";


const Foreground = () => {
    window.Buffer = window.Buffer || require("buffer").Buffer; // For keccak256

    return (
        <div className="foreground-box rounded-md border w-full drop-shadow font-mono">
            <div className="flex items-center items-stretch grid"> 
                {/* Header */}
                <div className="border-b border-gray-200">
                    <h1 className="text-gray-900 px-4 py-4">
                        Goerli Ethereum Airdrop
                    </h1>
                </div>

                {/* Content  */}
                <div className="center px-4 py-4">
                    <Content></Content>
                </div>
            </div>
        </div>
    )
}

const Content = () => {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const { chain } = useNetwork()
    const { switchNetwork } =
      useSwitchNetwork()

    if (isConnected && address) {
        if (chain?.id !== CurrentConfig.ChainId) {
            return (
                <div>
                    <button className="w-full rounded border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" onClick={() => switchNetwork?.(CurrentConfig.ChainId)}>Switch network to {CurrentConfig.NetworkName}</button>
                </div>
            )

        } else {
            return (<Claiming address={address}></Claiming>)
        }
    } else {
        return (
            <div>
                <h2 className="text-md font-medium text-gray-700">
                    If you've ever deployed a contract on Goerli, you're eligible!
                </h2>


                <div className="mt-2">
                    <button type="button" onClick={() => connect()} className="w-full rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Connect wallet</button>
                    <hr className="my-2"/>
                    <div className="text-gray-700">
                        or check address eligibility
                    </div>
                    <FreeInput></FreeInput>
                </div>
            </div>
        )
    }
}

const Claiming = (props: {address: string}) => {
    let [leaves, setLeaves] = useState([] as string[]);
    let [collected, setCollected] = useState(false);

    let { disconnect } = useDisconnect();

    let claimQuery = useContractRead({
        address: CurrentConfig.ContractAddr,
        abi: CollectorAbi.abi,
        chainId: CurrentConfig.ChainId,
        functionName: "claimed",
        args: [props.address],
        onError: (error) => {
            console.error(error);
        }
    })
    let claimedLoading = claimQuery.isLoading;
    let claimed = claimQuery.data;


    let rootQuery = useContractRead({
        address: CurrentConfig.ContractAddr,
        abi: CollectorAbi.abi,
        chainId: CurrentConfig.ChainId,
        functionName: "root",
        onError: (error) => {
            console.error(error);
        }
    })
    let rootQueryLoading = rootQuery.isLoading;
    let root = rootQuery.data;

    // Get the merkle leaves
    useEffect(() => {
        fetch(CurrentConfig.MerkleTreePath)
            .then((r) => r.text())
            .then(text => {
                let leaves = text.split(",");
                setLeaves(leaves);
            })
    }, [])

    let loadingComplete = leaves.length > 0 && claimedLoading === false && rootQueryLoading === false;

    // Options to display:
    // 1. Ineligible (not in merkle leaves)
    // 2. Already claimed
    // 3. Claimable

    // Wait for connection and valid address
    if (loadingComplete) {
        let inSet = leaves.findIndex((value) => value.toLowerCase() === props.address.toLowerCase()) !== -1;
        if (!inSet)  {
            return (
                <div>
                    <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true"></XCircleIcon>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">{ props.address } – Ineligible. No contracts deployed from this address to Goerli. </h3>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={() => disconnect()} className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Disconnect</button>
                </div>)
        } else if (claimed === true) {
            return (
                <div>
                    <div className="rounded-md bg-yellow-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true"></XCircleIcon>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">{ props.address } – Already claimed. </h3>
                            </div>
                        </div>
                    </div>
                    <button type="button" onClick={() => disconnect()} className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Disconnect</button>
                </div>
            )
        } else { // Valid claimaint, ready to claim.
            if (collected) {
                return (
                    <div>
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true"></CheckCircleIcon>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">{ props.address } – Collected! </h3>
                                </div>
                            </div>
                        </div>
                        <button type="button" onClick={() => disconnect()} className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Disconnect</button>
                    </div>
                )
            }

            let merkleTree = new MerkleTree(leaves, keccak256, { hashLeaves: true , sortPairs:true });
            let localRoot = merkleTree.getHexRoot();
            let leaf = keccak256(props.address);
            let proof = merkleTree.getHexProof(leaf);

            if (localRoot !== root) { // Possible if the front end and contract get out of sync (likely due to caching)
                return (
                    <div>
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true"></ExclamationTriangleIcon>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Client out of sync. Please wait and try again.</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            }

            // Valid claim! Go for it!

            return (<ClaimButton proof={proof} leaf={`0x${leaf.toString('hex')}`} parentReload={() => {setCollected(true)}}></ClaimButton>)
        }
    } else {
        return (<div>Loading</div>)
    }
}

const ClaimButton = (props: {proof: string[], leaf: string, parentReload: Function}) => {
    const { config } = usePrepareContractWrite({
        address: CurrentConfig.ContractAddr,
        abi: CollectorAbi.abi,
        chainId: CurrentConfig.ChainId,
        functionName: "collect",
        args: [props.proof, "GRAFFITI"]
    })

    const { write } = useContractWrite(
        {
            ...(config as any),
            onSettled: (data, error) => {
                if (error) {
                    console.error(error);
                } else {
                    props.parentReload();
                }
            }
        })

    let execute = () => {
        write?.();
    }

    return (<button type="button" onClick={execute} className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Collect</button>)
}

const FreeInput = () => {
    let [address, setAddress] = useState("");
    let [leaves, setLeaves] = useState([] as string[]);

    let addressValid = utils.isAddress(address);

    // Get the merkle leaves
    useEffect(() => {
        fetch(CurrentConfig.MerkleTreePath)
            .then((r) => r.text())
            .then(text => {
                let leaves = text.split(",");
                setLeaves(leaves);
            })
    }, [])

    let inSet = leaves.findIndex((leaf) => leaf.toLowerCase() === address.toLowerCase()) !== -1;
    let eligable = inSet;
    return (
        <div>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-3 rounded rounded-md rounded-r-none m-1">
                    <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true"></MagnifyingGlassIcon>
                </div>
                <input type="text" className="form-input w-full rounded border border-gray-300 bg-gray-white pl-14" placeholder="0xdeadbeef" onChange={(evt) => setAddress(evt.target.value)} value={address}/>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    { addressValid ? 
                        eligable ? <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" /> : <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" /> 
                        :
                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-500" aria-hidden="true" /> 
                    }
                </div>
            </div>
            { addressValid || address === "" ? 
                ""
                :
                <div className="text-sm text-blue-700 mt-1">
                    Invalid address
                </div>
            }
        </div>
    )
}

export default Foreground;