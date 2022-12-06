import Logos from "../Logos";
import { Connecting } from "./ForegroundComponents";

const ForegroundContainer = () => {
	window.Buffer = window.Buffer || require("buffer").Buffer; // For keccak256

	return (
		<div className="foreground-container">
			<div className="flex flex-row items-center justify-center min-h-screen">
				<ul className="items-center justify-center w-5/6 space-y-3 md:w-1/2 place-items-center align-center">
					{/* Top spacer */}
					<li className="h-4"></li>

					<li className="mt-0 overflow-hidden rounded-md shadow-md foreground-bin">
						<h1 className="p-4 text-2xl text-center text-gray-900 border-b md:text-4xl">
							Testnet ETH Claim for Prior Ethereum Developers
						</h1>
						<div className="p-4 text-xs text-center text-gray-700 md:text-base">
							Addresses that have deployed one or more contracts on Mainnet /
							Goerli / Sepolia before November 15, 2022 are eligible for a{" "}
							<span className="underline">one time</span> claim of 10 
							Goerli and Sepolia test ETH.
						</div>
						<div className="p-4 text-xs text-center text-gray-700 border-t md:text-base">
							Goerli ETH supplied by{" "}
							<a
								className="text-blue-600 hover:underline"
								href="https://chainsafe.io/"
							>
								ChainSafe
							</a>
						</div>
						<div className="p-4 text-xs text-center text-gray-700 border-t md:text-base">
							Sepolia ETH supplied by{" "}
							<a
								className="text-blue-600 hover:underline"
								href="https://twitter.com/TimBeiko"
							>
								Tim Beiko
							</a>
						</div>
						<div className="grid grid-cols-2 p-4 text-xs text-center text-gray-700 border-t place-items-center md:text-base">
							<div className="w-4 h-4 px-2 md:h-10 md:w-10">
								{/* <span className="mr-2">View on Github</span> */}
								<a href="http://github.com/a16z/eth-testnet-drop">
									<svg
										href="https://github.com"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 496 512"
										className="w-4 h-4 md:w-10 md:h-10"
									>
										<path
											fill="currentColor"
											d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
										/>
									</svg>
								</a>
							</div>
							<div className="w-4 h-4 px-2 md:h-10 md:w-10">
								<a href="https://t.me/ethereumtestnettokenclaim">
									<svg
										className="w-4 h-4 text-gray-400 text-blue-400 fill-current md:h-10 md:w-10"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 496 512">
										<path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"></path>
									</svg>
								</a>
							</div>
						</div>
					</li>

					<li className="overflow-hidden rounded-md shadow-md foreground-bin">
						<h3 className="p-4 text-base leading-6 text-gray-900 border-b md:text-large">
							Claim
						</h3>
						<div className="text-sm text-center text-gray-700 md:text-base">
							<Connecting></Connecting>
						</div>
					</li>

					<li className="h-1/2">
						<Logos></Logos>
					</li>

					{/* <li className="px-6 py-4 overflow-hidden rounded-md shadow foreground-bin"> */}
					<li className="px-6 py-4">
						<div className="text-xs">
							See disclaimer{" "}
							<a
								className="text-blue-600 hover:underline"
								href="https://github.com/a16z/eth-testnet-drop/blob/main/DISCLAIMER.md"
							>
								here.
							</a>
						</div>
					</li>

					{/* Graffiti spacer */}
					<li className="h-10"></li>
				</ul>
			</div>
		</div>
	);
};

export default ForegroundContainer;
