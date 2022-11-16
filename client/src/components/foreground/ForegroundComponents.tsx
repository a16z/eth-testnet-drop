import {
	useAccount,
	useConnect,
	useContractRead,
	useDisconnect,
	useContractWrite,
	usePrepareContractWrite,
	useNetwork,
	useSwitchNetwork,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	QuestionMarkCircleIcon,
	XCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { utils } from "ethers";
import { useEffect, useState } from "react";
import CurrentConfig from "../../config";
import CollectorAbi from "../../ABIs/Collector.json";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";
import { ConfigForChainId } from "../../utils/utils";

export const Connecting = () => {
	const { address: walletAddress, isConnected } = useAccount();
	const { connect } = useConnect({
		connector: new InjectedConnector(),
	});
	const { chain } = useNetwork();
	const { switchNetwork } = useSwitchNetwork();

	if (isConnected && walletAddress && chain) {
		let chainConfig = ConfigForChainId(chain!.id);
		if (chainConfig === undefined) {
			return (
				<div className="p-4">
					{CurrentConfig.Chains.map((chain, index) => (
						<button
							key={index}
							className="w-full px-2 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
							onClick={() => switchNetwork?.(chain.Chain.id)}
						>
							Switch network to {chain.HumanNetworkName}
						</button>
					))}
				</div>
			);
		} else {
			return <ClaimValidity address={walletAddress} />;
		}
	} else {
		return (
			<div>
				<div className="p-4">
					<button
						type="button"
						onClick={() => connect()}
						className="w-full rounded rounded-md text-sm md:text-base border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Connect wallet
					</button>
				</div>
				<div className="p-4 border-t">
					<div className="text-gray-700">or check address eligibility</div>
					<FreeInput></FreeInput>
				</div>
			</div>
		);
	}
};

const ClaimValidity = (props: { address: string }) => {
	let [leaves, setLeaves] = useState([] as string[]);
	let [txHash, setTxHash] = useState("");
	let [txError, setTxError] = useState("");

	let { disconnect } = useDisconnect();
	let { switchNetwork } = useSwitchNetwork();

	let { chain } = useNetwork();

	let chainConfig = ConfigForChainId(chain!.id)!;

	let claimQuery = useContractRead({
		address: chainConfig.ContractAddr,
		abi: CollectorAbi.abi,
		chainId: chainConfig.Chain.id,
		functionName: "claimed",
		args: [props.address],
		onError: (error) => {
			console.error(error);
		},
	});
	let claimedLoading = claimQuery.isLoading || claimQuery.isFetching;
	let claimed = claimQuery.data;

	let rootQuery = useContractRead({
		address: chainConfig.ContractAddr,
		abi: CollectorAbi.abi,
		chainId: chainConfig.Chain.id,
		functionName: "root",
		onError: (error) => {
			console.error(error);
		},
	});
	let rootQueryLoading = rootQuery.isLoading;
	let root = rootQuery.data;

	// Get the merkle leaves
	useEffect(() => {
		fetch(CurrentConfig.MerkleTreePath)
			.then((r) => r.text())
			.then((text) => {
				let leaves = text.split(",");
				setLeaves(leaves);
			});
	}, []);

	let loadingComplete =
		leaves.length > 0 && claimedLoading === false && rootQueryLoading === false;

	let currentChainId = chainConfig.Chain.id;
	let switchChain = CurrentConfig.Chains.find(
		(other) => other.Chain.id !== currentChainId
	)!;

	let switchChains = () => {
		switchNetwork?.(switchChain.Chain.id);
		setTxHash("");
	};

	// Options to display:
	// 1. Ineligible (not in merkle leaves)
	// 2. Already claimed
	// 3. Claimable

	// Wait for connection and valid address
	if (loadingComplete) {
		let inSet =
			leaves.findIndex(
				(value) => value.toLowerCase() === props.address.toLowerCase()
			) !== -1;
		if (!inSet) {
			return (
				<div className="p-4">
					<div className="p-4 overflow-hidden rounded-md bg-yellow-50">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon
									className="w-5 h-5 text-yellow-400"
									aria-hidden="true"
								></XCircleIcon>
							</div>
							<div className="ml-3">
								<h3 className="text-yellow-800">
									{shortenAddress(props.address)} – Ineligible. No contracts
									deployed from this address to {chainConfig.HumanNetworkName}.{" "}
								</h3>
							</div>
						</div>
					</div>
					<button
						type="button"
						onClick={() => disconnect()}
						className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Disconnect
					</button>
				</div>
			);
		} else if (claimed === true) {
			return (
				<div className="p-4">
					<div className="p-4 overflow-hidden rounded-md bg-yellow-50">
						<div className="flex">
							<div className="flex-shrink-0">
								<XCircleIcon
									className="w-5 h-5 text-yellow-400"
									aria-hidden="true"
								></XCircleIcon>
							</div>
							<div className="ml-3">
								<h3 className="text-yellow-800">
									{shortenAddress(props.address)} – Already claimed.{" "}
								</h3>
							</div>
						</div>
					</div>
					<button
						className="w-full px-2 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
						onClick={() => switchChains()}
					>
						Switch network to {switchChain.HumanNetworkName}
					</button>
					<button
						type="button"
						onClick={() => disconnect()}
						className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Disconnect
					</button>
				</div>
			);
		} else {
			// Valid claimaint
			if (txHash !== "") {
				let txUrl = `${chainConfig.BlockExplorerUrl}${txHash}`;

				return (
					<div className="p-4">
						<div className="overflow-hidden rounded-md bg-green-50">
							<div className="flex p-4">
								<div className="flex-shrink-0">
									<CheckCircleIcon
										className="w-5 h-5 text-green-400"
										aria-hidden="true"
									></CheckCircleIcon>
								</div>
								<div className="ml-3">
									<h3 className="text-green-800">
										{props.address} – Collect Tx Sent!{" "}
									</h3>
								</div>
							</div>

							<div className="p-4 border-t">
								<a className="text-blue-600 hover:underline" href={txUrl}>
									Transaction details
								</a>
							</div>
						</div>
						<button
							className="w-full px-2 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
							onClick={() => switchChains()}
						>
							Switch network to {switchChain.HumanNetworkName}
						</button>
						<button
							type="button"
							onClick={() => disconnect()}
							className="w-full mt-2 rounded rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
						>
							Disconnect
						</button>
					</div>
				);
			}

			if (txError !== "") {
				return (
					<div className="p-4">
						<div className="p-2 overflow-hidden text-red-400 border border-gray-300 rounded-md bg-red-50">
							Error: {txError}
						</div>
					</div>
				);
			}

			let merkleTree = new MerkleTree(leaves, keccak256, {
				hashLeaves: true,
				sortPairs: true,
			});
			let localRoot = merkleTree.getHexRoot();
			let leaf = keccak256(props.address);
			let proof = merkleTree.getHexProof(leaf);

			if (localRoot !== root) {
				// Possible if the front end and contract get out of sync (likely due to caching)
				return (
					<div>
						<div className="p-4 rounded-md bg-red-50">
							<div className="flex">
								<div className="flex-shrink-0">
									<ExclamationTriangleIcon
										className="w-5 h-5 text-red-400"
										aria-hidden="true"
									></ExclamationTriangleIcon>
								</div>
								<div className="ml-3">
									<h3 className="text-red-800">
										Client out of sync. Please wait and try again.
									</h3>
								</div>
							</div>
						</div>
					</div>
				);
			}

			// Valid claim! Go for it!

			return (
				<ClaimInteraction
					proof={proof}
					leaf={`0x${leaf.toString("hex")}`}
					setError={setTxError}
					setTxHash={setTxHash}
				/>
			);
		}
	} else {
		return <div className="p-4">Loading...</div>;
	}
};

const ClaimInteraction = (props: {
	proof: string[];
	leaf: string;
	setError: Function;
	setTxHash: Function;
}) => {
	let [graffiti, setGraffiti] = useState("");
	const { address: walletAddress } = useAccount();
	let { chain } = useNetwork();
	let chainConfig = ConfigForChainId(chain!.id)!;
	const { config } = usePrepareContractWrite({
		address: chainConfig.ContractAddr,
		abi: CollectorAbi.abi,
		chainId: chainConfig.Chain.id,
		functionName: "collect",
		args: [props.proof, graffiti, walletAddress],
	});

	const { write } = useContractWrite({
		...(config as any),
		onSettled: (data, error) => {
			if (error) {
				console.error(error);
				props.setError(error.message);
			} else {
				props.setTxHash(data?.hash);
			}
		},
	});

	let execute = () => {
		write?.();
	};

	return (
		<div className="p-4">
			<input
				type="text"
				className="w-full my-2 border border-gray-300 rounded form-input bg-gray-white"
				placeholder="(optional) graffiti"
				onChange={(evt) => setGraffiti(evt.target.value)}
				value={graffiti}
			/>
			<button
				type="button"
				onClick={execute}
				className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
			>
				Collect
			</button>
		</div>
	);
};

const FreeInput = () => {
	let [address, setAddress] = useState("");
	let [leaves, setLeaves] = useState([] as string[]);

	let addressValid = utils.isAddress(address);

	// Get the merkle leaves
	useEffect(() => {
		fetch(CurrentConfig.MerkleTreePath)
			.then((r) => r.text())
			.then((text) => {
				let leaves = text.split(",");
				setLeaves(leaves);
			});
	}, []);

	let inSet =
		leaves.findIndex((leaf) => leaf.toLowerCase() === address.toLowerCase()) !==
		-1;
	let eligable = inSet;
	return (
		<div>
			<div className="relative">
				<div className="absolute inset-y-0 left-0 flex items-center px-3 m-1 rounded rounded-md rounded-r-none pointer-events-none">
					<MagnifyingGlassIcon
						className="w-5 h-5"
						aria-hidden="true"
					></MagnifyingGlassIcon>
				</div>
				<input
					type="text"
					className="w-full text-sm border border-gray-300 rounded form-input pl-14 text-entry md:text-base"
					placeholder="0xdeadbeef"
					onChange={(evt) => setAddress(evt.target.value)}
					value={address}
				/>
				<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
					{addressValid ? (
						eligable ? (
							<CheckCircleIcon
								className="w-5 h-5 text-green-500"
								aria-hidden="true"
							/>
						) : (
							<XCircleIcon
								className="w-5 h-5 text-red-500"
								aria-hidden="true"
							/>
						)
					) : address === "" ? (
						""
					) : (
						<QuestionMarkCircleIcon
							className="w-5 h-5 text-blue-500"
							aria-hidden="true"
						/>
					)}
				</div>
			</div>
			{addressValid || address === "" ? (
				""
			) : (
				<div className="mt-1 text-blue-700">Invalid address</div>
			)}
		</div>
	);
};

function shortenAddress(addr: string): string {
	return addr.slice(0, 12);
}

export default Connecting;
