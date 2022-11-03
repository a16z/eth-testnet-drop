import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Background from './pages/background/Background';
import Foreground from './pages/foreground/Foreground';
import reportWebVitals from './reportWebVitals';


import { WagmiConfig, createClient, chain, configureChains } from 'wagmi'
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';




const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const { chains, provider, webSocketProvider} = configureChains(
  // defaultChains,
  [chain.hardhat, chain.goerli], 
  [publicProvider()])

// Set up client
const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

root.render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <Background>
        <WagmiConfig client={client}>
          <Foreground />
        </WagmiConfig>
      </Background>
    </Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
