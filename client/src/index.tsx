import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Background from "./components/background/Background";
import ForegroundContainer from "./components/foreground/ForegroundContainer";
import reportWebVitals from "./reportWebVitals";

import { WagmiConfig, createClient, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from "wagmi/connectors/injected";
import GraffitiTicker from "./components/GraffitiTicker";
import CurrentConfig from "./config";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

const { chains, provider, webSocketProvider } = configureChains(
	CurrentConfig.Chains.map((chain) => chain.Chain),
	[publicProvider()]
);

// Set up client
const client = createClient({
	autoConnect: true,
	connectors: [
		new InjectedConnector({
			chains,
			options: {
				name: "Injected",
				shimDisconnect: true,
			},
		}),
	],
	provider,
	webSocketProvider,
});

root.render(
	<React.StrictMode>
		<Suspense fallback={null}>
			<Background>
				{/* Nested within background such that we recieve foreground mouse events. */}
				<WagmiConfig client={client}>
					<ForegroundContainer />
					{CurrentConfig.ShowGraffiti ? <GraffitiTicker /> : ""}
				</WagmiConfig>
			</Background>
		</Suspense>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
