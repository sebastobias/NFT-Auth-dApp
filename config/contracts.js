import { useAccount, useContract, useSigner } from "wagmi";
import NFTSABI from "./abi/abi_nfts.json";
import SOCIALTOKENABI from "./abi/abi_socialtoken.json";
import USERSTORAGEABI from "./abi/abi_userstorage.json";
import { polygonMumbai } from "wagmi/chains";

export default function useContracts() {
  
  const { data: signer } = useSigner({ chainId: polygonMumbai?.id });

  const userStorageContract = useContract({
    address: "0xA6f0C3819ef8C5dF3Cd650Bc4af7DF35F798Cfd0",
    abi: USERSTORAGEABI,
    signerOrProvider: signer,
  });

  const vipContract = useContract({
    address: "0xC485920cd3461c24D00fD95ce136c9cEe602760B",
    abi: NFTSABI,
    signerOrProvider: signer,
  });

  const memberContract = useContract({
    address: "0xbE71078C4af417227BAeba872Aa552dFD25A971E",
    abi: NFTSABI,
    signerOrProvider: signer,
  });

  const citizenContract = useContract({
    address: "0xA9598E264528047809f4cD69eF8e6E557Ede73C1",
    abi: NFTSABI,
    signerOrProvider: signer,
  });

  const socialToken = useContract({
    address: "0x0B97EaB8f18f69D3880C69f5243b705aF3bC637A",
    abi: SOCIALTOKENABI,
    signerOrProvider: signer,
  });

  return {
    userStorageContract,
    vipContract,
    memberContract,
    citizenContract,
    socialToken
  };
}