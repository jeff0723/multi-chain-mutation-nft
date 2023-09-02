import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  midnightTheme,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, aurora, gnosis, localhost } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { Toaster } from "react-hot-toast";
const toastOptions = {
  style: {
    background: "rgba(0, 0, 0)",
    color: "#ffffff",
  },
  success: {
    className: "border border-green-500",
    iconTheme: {
      primary: "#10B981",
      secondary: "white",
    },
  },
  error: {
    className: "border border-red-500",
    iconTheme: {
      primary: "#EF4444",
      secondary: "white",
    },
  },
  loading: { className: "border border-yello-300" },
};

const { chains, publicClient } = configureChains(
  [gnosis, aurora, mainnet, polygon, optimism, arbitrum, localhost],
  [
    publicProvider()
  ]
);

const projectId = 'd70627db8863f52dd98dafa4550cf646';

const { wallets } = getDefaultWallets({
  appName: 'ZKAlpha',
  projectId,
  chains,
});

const demoAppInfo = {
  appName: 'ZKAlpha',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider theme={midnightTheme()} chains={chains} appInfo={demoAppInfo}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
