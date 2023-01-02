import "../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import "sf-font";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { Web3Modal } from "@web3modal/react";

const chains = [polygonMumbai];

const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: "814dc15edaa14564d4ddbcbbac21ec5c" })
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "web3Modal", chains }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, chains);

export default function App({ Component, pageProps }) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <NextUIProvider>
          <div className="">
            <Component {...pageProps} />
          </div>
        </NextUIProvider>
      </WagmiConfig>

      <Web3Modal
        projectId="814dc15edaa14564d4ddbcbbac21ec5c"
        ethereumClient={ethereumClient}
      />
    </>
  );
}
