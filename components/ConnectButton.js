import { Button, Image, Row, Text } from "@nextui-org/react";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";

export default function ConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();

  const [connected, setConnected] = useState()

  useEffect(() => setConnected(isConnected), [])

  return (
    <>
      <Row justify="center">
        <div>
          <Text
            h1
            color="white"
            css={{ textShadow: "1px 1px 2px white", mb: "$5" }}
          >
            <span style={{ color: "#D36209" }}>WEB3</span> NFT{" "}
            <span style={{ color: "#D36209" }}>Authentication</span> Page
          </Text>
        </div>
      </Row>
      <Row justify="center">
        <Button
          onClick={open}
          css={{
            background: "transparent",
            border: "solid 1px white",
            boxShadow: "1px 1px 10px white",
            mb: "$15",
            zIndex: "1",
          }}
        >
          <Text weight="medium" color="white">
            {connected
              ? `${address?.slice(0, 4)}***${address?.slice(36, 40)}`
              : "Connect your Wallet"}
          </Text>
        </Button>
      </Row>
    </>
  );
}
