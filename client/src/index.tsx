import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Background from "./components/background/Background";
import ForegroundContainer from "./components/foreground/ForegroundContainer";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";

import GraffitiTicker from "./components/GraffitiTicker";
import CurrentConfig from "./config";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<BrowserRouter>
		<Suspense fallback={null}>
			<Background>
				<div className="fixed top-0 w-full p-1 text-center bg-white banner">
					New domain! Recently migrated from <a className="p-0 hover:underline" href="collect-test-eth.org">collect-test-eth.org</a> to <a className="p-0 hover:underline" href="grabteeth.xyz">grabteeth.xyz</a>!
				</div>

				{/* Nested within background such that we recieve foreground mouse events. */}
				<DynamicContextProvider
					settings={{
						initialAuthenticationMode: "connect-only",
						environmentId: "e3736e0b-c7cf-4e70-9c2a-b79b864437d1",
					}}
				>
					<DynamicWagmiConnector>
						<ForegroundContainer />
						{CurrentConfig.ShowGraffiti ? <GraffitiTicker /> : ""}
					</DynamicWagmiConnector>
				</DynamicContextProvider>
			</Background>
		</Suspense>
	</BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
