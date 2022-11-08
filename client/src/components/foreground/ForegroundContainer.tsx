import Logos from "../Logos";
import { Connecting } from "./ForegroundComponents";

const ForegroundContainer = () => {
    window.Buffer = window.Buffer || require("buffer").Buffer; // For keccak256

    return (
        <div className="foreground-container overflow-scroll md:overflow-hidden">
            <div className="flex flex-row min-h-screen justify-center items-center">
                <ul className="space-y-3 w-5/6 md:w-1/2 items-center place-items-center align-center justify-center">
                    <li className="overflow-hidden 
                            px-6 
                            pt-4
                            text-center">
                        <h1 className="text-xl md:text-4xl">Testnet ETH Claim for Previous Ethereum Developers</h1>
                        {/* <h2 className="font-mono pt-2 text-sm border-t">Merkle Faucet</h2> */}
                    </li>
                    <li className="overflow-hidden rounded-md shadow-md foreground-bin mt-0">
                        <h3 className="text-base md:text-lg leading-6 text-gray-900 border-b p-4">About</h3>
                        <div className="text-xs md:text-base text-center text-gray-700 p-4">
                            Addresses that have deployed one or more contracts on Mainnet / Goerli / Sepolia before November 4, 2022 
                            are eligible for a <span className="underline">one time</span> claim of X (tbd) Goerli and Sepolia test ETH.
                        </div>
                        <div className="text-xs md:text-base text-center text-gray-700 border-t p-4">
                            Goerli ETH supplied by <a className="text-blue-600 hover:underline" href="https://chainsafe.io/">ChainSafe</a> 
                        </div>
                        <div className="text-xs md:text-base text-center text-gray-700 border-t p-4">
                            Sepolia ETH supplied by <a className="text-blue-600 hover:underline" href="https://chainsafe.io/">Tim Beiko (TBD)</a> 
                        </div>
                        <div className="text-xs md:text-base text-center text-gray-700 border-t p-4 flex justify-center">
                            <span className="mr-2">
                                View on Github
                            </span>
                            <a href="http://github.com/a16z/eth-testnet-drop">
                                <svg href="https://github.com" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" className="md:w-7 md:h-7 h-4 w-4"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>
                            </a>
                        </div>

                    </li>
                    <li className="overflow-hidden rounded-md shadow-md foreground-bin">
                        <h3 className="text-base md:text-large leading-6 text-gray-900 border-b p-4">Claim</h3>
                        <div className="text-sm md:text-base text-gray-700 text-center">
                            <Connecting></Connecting>
                        </div>
                    </li>

                    <li className="h-1/2">
                        <Logos></Logos>
                    </li>

                    <li className="overflow-hidden rounded-md px-6 py-4 shadow foreground-bin">
                        <div className="font-mono text-xs">
                            See disclaimer <a className="text-blue-600 hover:underline" href="https://github.com/a16z/eth-testnet-drop/blob/main/DISCLAIMER.md">here.</a>
                        </div>
                    </li>

                    {/* Graffiti spacer */}
                    <li className="h-10">
                    </li>
                </ul>

            </div>
        </div>
    )

}

export default ForegroundContainer;