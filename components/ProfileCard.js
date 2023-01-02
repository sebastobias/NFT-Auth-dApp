import { Button, Card, Col, Grid, Input, Text } from "@nextui-org/react"
import { useCallback, useEffect, useState } from "react"
import { useAccount, useBlockNumber, useProvider, useSigner, useWaitForTransaction } from "wagmi"
import { polygonMumbai } from "wagmi/chains"
import useContracts from "../config/contracts"
import { Loading } from "@nextui-org/react"

export default function ProfileCard() {
  const { userStorageContract, vipContract, memberContract, citizenContract, socialToken } = useContracts()

  const { address } = useAccount()
  const { data: signer } = useSigner({ chainId: polygonMumbai?.id })
  const provider = useProvider()

  const [fName, setFName] = useState("")
  const [lName, setLName] = useState("")
  const [username, setUsername] = useState("")
  const [membershipType, setMembershipType] = useState("4")
  const [vipBalance, setVipBalance] = useState()
  const [memberBalance, setMemberBalance] = useState()
  const [citizenBalance, setCitizenBalance] = useState()
  const [unusedMemberTokenIds, setUnusedMemberTokenIds] = useState()
  const [unusedVipTokenIds, setUnusedVipTokenIds] = useState()
  const [tx, setTx] = useState()

  const { data } = useBlockNumber({ watch: true })

  const { isLoading } = useWaitForTransaction({
    hash: tx?.hash,
    confirmations: 3,
  })

  const filterAsync = async (array, callback) => {
    const results = await Promise.all(array.map(async (element) => await callback(element)))
    return array.filter((_, index) => results[index])
  }

  async function createProfile() {
    await userStorageContract.createProfile(fName, lName, username).then((tx) => setTx(tx))
  }

  async function claimReward() {
    if (membershipType == 2) {
      await userStorageContract.claimMember(unusedMemberTokenIds).then((tx) => setTx(tx))
    }
    if (membershipType == 1) {
      await userStorageContract.claimVip(unusedVipTokenIds, unusedMemberTokenIds).then((tx) => setTx(tx))
    }
  }

  async function getUnusedTokens() {
    const memberTokenIds = await memberContract.tokensOfOwner(address)
    const vipTokenIds = await vipContract.tokensOfOwner(address)
    await filterAsync(memberTokenIds, async (tokenId) => {
      return !(await userStorageContract.usedIdsMember(tokenId))
    }).then((r) => {
      setUnusedMemberTokenIds(r)
    })

    await filterAsync(vipTokenIds, async (tokenId) => {
      return !(await userStorageContract.usedIdsVip(tokenId))
    }).then((r) => {
      setUnusedVipTokenIds(r)
    })
  }

  useEffect(() => {
    if (signer && provider) {
      userStorageContract?.membershipType(address).then((r) => setMembershipType(r.toString()))
      vipContract.balanceOf(address).then((r) => setVipBalance(r.toString()))
      memberContract.balanceOf(address).then((r) => setMemberBalance(r.toString()))
      citizenContract.balanceOf(address).then((r) => setCitizenBalance(r.toString()))
      getUnusedTokens()
    }
  }, [data, address, signer, provider])

  const inputfilled = fName !== "" && lName !== "" && username !== ""

  const vipToClaim = unusedVipTokenIds?.length * 7.5
  const memberToClaim = unusedMemberTokenIds?.length * 5
  return (
    <>
      <Col span={8}>
        <Card
          className="card-background"
          css={{
            width: "90%",
            textAlign: "center",
            background: "transparent",
            border: "solid 1px white",
            boxShadow: "1px 1px 20px white",
          }}
        >
          <div>
            <Text h2 css={{ color: "white", mt: "$10", display: "inline-block" }}>
              CREATE YOUR <span style={{ color: "gold", textShadow: "1px 1px 2px black" }}>WEB3</span> PROFILE
              <img src="profile.png" style={{ width: "5%", marginLeft: "20px" }}></img>
            </Text>
          </div>
          <Text h3 css={{ color: "white", mt: "$10" }}>
            MEMBERSHIP TYPE: <span style={{ color: "gold", textShadow: "1px 1px 2px black" }}>{membershipType}</span>
          </Text>
          <Card.Body css={{ alignItems: "center" }}>
            <Grid.Container justify="center" alignContent="center">
              <Grid xs={6} justify="center">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "40%",
                  }}
                >
                  <label
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      marginBottom: "5px",
                    }}
                    htmlFor="fname"
                  >
                    First Name {""}
                  </label>
                  <input
                    name="fname"
                    type="text"
                    className="inputprofile"
                    onChange={(e) => setFName(e.target.value)}
                    style={{
                      backgroundColor: "transparent",
                      fontWeight: "lighter",
                      color: "white",
                      border: "solid 1px #D9DDF5",
                      borderRadius: "5px",
                      height: "2rem",
                    }}
                  />
                </div>
              </Grid>
              <Grid xs={6} justify="center">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "40%",
                  }}
                >
                  <label
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      marginBottom: "5px",
                    }}
                    htmlFor="lname"
                  >
                    Last Name {""}
                  </label>
                  <input
                    name="lname"
                    type="text"
                    className="inputprofile"
                    onChange={(e) => setLName(e.target.value)}
                    style={{
                      backgroundColor: "transparent",
                      fontWeight: "lighter",
                      color: "white",
                      border: "solid 1px #D9DDF5",
                      borderRadius: "5px",
                      height: "2rem",
                    }}
                  />
                </div>
              </Grid>
              <Grid xs={3} justify="center">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  <label
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                      marginBottom: "5px",
                      borderRadius: "5px",
                      display: "inline-block",
                    }}
                    htmlFor="username"
                  >
                    Username {""}
                  </label>
                  <input
                    name="username"
                    type="text"
                    className="inputprofile"
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      backgroundColor: "transparent",
                      fontWeight: "lighter",
                      color: "white",
                      border: "solid 1px #D9DDF5",
                      borderRadius: "5px",
                      height: "2rem",
                    }}
                  />
                </div>
              </Grid>
            </Grid.Container>
            <Button
              css={{
                width: "70%",
                mt: "$15",
                color: inputfilled && membershipType != 4 ? "yellow" : "red",
                background: "transparent",
                border: inputfilled && membershipType != 4 ? "solid 1px yellow" : "solid 1px red",
                boxShadow: inputfilled && membershipType != 4 ? "1px 1px 20px yellow" : "1px 1px 20px red",
                cursor: inputfilled && membershipType != 4 ? "pointer" : "not-allowed",
              }}
              onPress={inputfilled && membershipType != 4 ? createProfile : null}
            >
              {!inputfilled ? (
                "Fill the Inputs"
              ) : isLoading ? (
                <Loading color="warning"></Loading>
              ) : membershipType == 4 ? (
                "You don't own any NFT"
              ) : (
                "Create Profile"
              )}
            </Button>

            <div
              style={{
                width: "50%",
                marginTop: "3rem",
                textAlign: "center",
              }}
            >
              <hr style={{ border: "1px solid white", margin: "1rem" }} />
              <Text color="white" h2>
                CLAIM your PROFILE Tokens
              </Text>
              <Text color="white" h5>
                Your rewards will depend on the amount of NFTs you have
              </Text>
              <Text color="white" h5>
                Only Member and VIP NFT Owners get rewards for their first profile creation.
              </Text>
              <table
                className="table-glow"
                style={{
                  border: "1px solid gray",
                  color: "white",
                  width: "100%",
                  borderCollapse: "collapse",
                  height: "8rem",
                  marginBottom: "2rem",
                }}
              >
                <tr>
                  <th style={{ fontWeight: "bolder", fontSize: "20px" }} className="table-item">
                    NFT Type
                  </th>
                  <th style={{ fontWeight: "bolder", fontSize: "20px" }} className="table-item">
                    Amount Owned
                  </th>
                  <th style={{ fontWeight: "bolder", fontSize: "20px" }} className="table-item">
                    Tokens to Claim
                  </th>
                </tr>
                <tr>
                  <td className="table-item">Citizen</td>
                  <td className="table-item">{citizenBalance}</td>
                  <td className="table-item">0 SOCIAL</td>
                </tr>
                <tr>
                  <td className="table-item">Member</td>
                  <td className="table-item">{memberBalance}</td>
                  <td className="table-item">{memberToClaim} SOCIAL</td>
                </tr>
                <tr>
                  <td className="table-item">Vip</td>
                  <td className="table-item">{vipBalance}</td>
                  <td className="table-item">{vipToClaim} SOCIAL</td>
                </tr>
              </table>
              <Button
                css={{
                  width: "70%",
                  m: "auto",
                  color: "black",
                  fontWeight: "bold",
                  background: "yellow",
                  border: "solid 1px yellow",
                  boxShadow: "1px 1px 20px yellow",
                }}
                onPress={claimReward}
                disabled={vipToClaim == 0 && memberToClaim == 0 ? true : false}
              >
                {isLoading ? <Loading color="warning"></Loading> : vipToClaim == 0 && memberToClaim == 0 ? "Nothing to Claim" : `CLAIM`}
              </Button>
              <Text style={{ marginTop: "2rem" }} color="white" h5>
                You can't claim twice the rewards for the same nfts
              </Text>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}
