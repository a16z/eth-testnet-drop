import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Background from './components/background/Background';
import Foreground from './components/foreground/Foreground';
import Logos from './components/Logos';
import reportWebVitals from './reportWebVitals';


import { WagmiConfig, createClient, chain, configureChains } from 'wagmi'
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from 'wagmi/connectors/injected';
// import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import GraffitiTicker from './components/GraffitiTicker';
import CurrentConfig from './config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const { chains, provider, webSocketProvider} = configureChains(
  CurrentConfig.Chains.map(chain => chain.Chain), 
  [publicProvider()]
)

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
    // new MetaMaskConnector({ chains }),
  ],
  provider,
  webSocketProvider,
})

root.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Background>
      </Background>
      <WagmiConfig client={client}>
        <Foreground />
        { CurrentConfig.ShowGraffiti ? <GraffitiTicker /> : ""}
      </WagmiConfig>
    </Suspense>

    <Logos></Logos>

    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
