import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Background from './components/background/Background';
import Foreground from './components/foreground/Foreground';
import reportWebVitals from './reportWebVitals';


import { WagmiConfig, createClient, chain, configureChains } from 'wagmi'
import { publicProvider } from "wagmi/providers/public";
import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import Logos from './components/Logo';
import {
   DynamicContextProvider,
} from '@dynamic-labs/sdk-react';



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
        <DynamicContextProvider
          settings={{
            appLogoUrl:
              "https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/262f.svg",
            appName: "GoEth",
            environmentId: "00ca15b7-845b-4f0c-abec-19bef950bd11",
            privacyPolicyUrl: "https://www.x0rart.com/privacy-policy",
            termsOfServiceUrl: "https://www.x0rart.com/terms-of-service"
          }}
        >
          <WagmiConfig client={client}>
            <Foreground />
          </WagmiConfig>
        </DynamicContextProvider>
      </Background>
    </Suspense>

    <Logos></Logos>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
