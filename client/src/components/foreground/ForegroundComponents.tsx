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
import { ConfigForChainId } from "../../utils/utils";
import { MerkleProof } from "./MerkleProof";

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

	let [proof, setProof] = useState({} as MerkleProof);
	let [calculatingProof, setCalculatingProof] = useState(false);

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

	// Kick off webworker to calculate proof in backgroudn thread
	useEffect(() => {
		if (leaves.length > 0 && props.address !== "" && !calculatingProof && proof.proof === undefined) {
			setCalculatingProof(true);
			let worker = new Worker(new URL("createMerkleProof", import.meta.url));
			worker.postMessage({address: props.address, leaves: leaves })
			worker.onmessage = ({ data: { resultProof } }) => {
				console.log("result proof", resultProof);
				setCalculatingProof(false);
				setProof(resultProof);
			};
		}
	}, [leaves, props.address])

	let currentChainId = chainConfig.Chain.id;
	let switchChain = CurrentConfig.Chains.find(
		(other) => other.Chain.id !== currentChainId
	)!;

	let switchChains = () => {
		switchNetwork?.(switchChain.Chain.id);
		setTxHash("");
	};

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
									deployed from this address to Mainnet / Goerli / Sepolia.{" "}
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
		} else { // Valid claimant
			if (txHash !== "") { // If we have a hash, tx has been sent, display it
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

			if (txError !== "") { // If we have a tx error, tx has been sent and failed, display it
				return (
					<div className="p-4">
						<div className="p-2 overflow-hidden text-red-400 border border-gray-300 rounded-md bg-red-50">
							Error: {txError}
						</div>
					</div>
				);
			}

			if (calculatingProof) { // If the merkle proof is currently being calculated, display loading
				return (
					<Loading text={"Calculating merkle proof..."} ></Loading>
				)
			}

			if (proof.proof === undefined || proof.root === undefined || proof.leaf === undefined) { // Webworker failure 
				return (
					<div className="p-4">
						...
					</div>
				)
			}


			if (proof.root! !== root) {
				// Possible if the front end and contract get out of sync (likely due to caching)
				return (
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
				);
			}


			// Valid claim! Go for it!
			return (
				<ClaimInteraction
					proof={proof.proof!}
					leaf={proof.leaf!}
					setError={setTxError}
					setTxHash={setTxHash}
				/>
			);
		}
	} else {
		return <Loading text={"Downloading merkle leaves"}></Loading>
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

	let eligable = false;
	if (addressValid) {
		// Only check if the address is valid
		eligable = leaves.findIndex((leaf) => leaf.toLowerCase() === address.toLowerCase()) !== -1;
	}
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

const Loading = (props: {text: string}) => {
	return (
		<div className="p-4">
			<div className="py-2.5 px-5 mr-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
				<svg role="status" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
					<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
				</svg>
				{props.text}
			</div>
		</div>
	)
}

function shortenAddress(addr: string): string {
	return addr.slice(0, 12);
}

export default Connecting;
