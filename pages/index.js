import { Button, Card, Col, Container, Grid, Image, Input, Row, Table, Text, Loading } from '@nextui-org/react'
import { useCallback, useEffect, useState } from 'react'
import { useAccount, useBlockNumber, useProvider, useSigner } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import ConnectButton from '../components/ConnectButton'
import ProfileCard from '../components/ProfileCard'
import useContracts from '../config/contracts'
import { useWaitForTransaction } from 'wagmi'

export default function Home() {
  const { address } = useAccount()

  const [clicked, setClicked] = useState('')
  const [nftAmount, setNftAmount] = useState('')
  const [userInfo, setUserInfo] = useState([])
  const [optionClicked, setOptionClicked] = useState('')
  const [profileData, setProfileData] = useState('')
  const [tx, setTx] = useState()
  const [reward, setReward] = useState()
  const [vipNftBalance, setVipNftBalance] = useState()

  const { userStorageContract, vipContract, memberContract, citizenContract, socialToken } = useContracts()

  const provider = useProvider()
  const { data: signer } = useSigner({ chainId: polygonMumbai?.id })
  const { data } = useBlockNumber({ watch: true })
  const { isLoading } = useWaitForTransaction({
    hash: tx?.hash,
    confirmations: 3,
  })

  async function mint() {
    clicked == 'VIP'
      ? await vipContract?.mint(address, nftAmount).then((tx) => setTx(tx))
      : clicked == 'Member'
      ? await memberContract?.mint(address, nftAmount).then((tx) => setTx(tx))
      : clicked == 'Citizen' && (await citizenContract?.mint(address, nftAmount).then((tx) => setTx(tx)))
  }

  async function updateInfo() {
    optionClicked === 'First Name'
      ? await userStorageContract.updateInfo(0, profileData).then((tx) => setTx(tx))
      : optionClicked === 'Last Name'
      ? await userStorageContract.updateInfo(1, profileData).then((tx) => setTx(tx))
      : await userStorageContract.updateInfo(2, profileData).then((tx) => setTx(tx))
  }

  async function deleteProfile() {
    await userStorageContract?.deleteMyUser().then((tx) => setTx(tx))
  }

  async function claimPeriodicReward() {
    const nftBalance = await vipContract.tokensOfOwner(address)
    await userStorageContract.claimPeriodicReward(nftBalance).then((tx) => setTx(tx))
  }

  useEffect(() => {
    if (signer && provider) {
      userStorageContract.addressToUserInfo(address).then((r) => {
        setUserInfo(r)
      })
      if (vipNftBalance > 0) {
        userStorageContract.periodicRewardInfo(address).then((r) => {
          setReward(r.toString())
        })
      }
      vipContract.balanceOf(address).then((r) => {
        setVipNftBalance(r.toString())
      })
    }
  }, [address, provider, signer, data])

  const inputFilled = nftAmount !== '' && nftAmount > 0
  const profileInputFilled = profileData !== ''

  const hasProfile = userInfo.every((item) => {
    return item !== '' && item !== 0
  })

  const residualReward = (reward / 1e18).toFixed(5)


  return (
    <>
      <Container>
        <ConnectButton />
        <Row css={{ display: 'flex', justifyContent: 'space-between' }}>
          <Col span={4}>
            <Card
              className="card-background"
              css={{
                width: '90%',
                border: 'solid 1px white',
                boxShadow: '1px 1px 20px white',
              }}
            >
              <Card.Body style={{ alignItems: 'center', textAlign: 'center' }}>
                <Text color="white" h3>
                  Total Residuals <span style={{ color: 'yellow' }}>VIP</span> <br />
                  {!hasProfile ? "Create a profile to start earning rewards" : vipNftBalance == 0 ? 'You should have at least 1 VIP NFT' : `Tokens Earned: ${residualReward}`}
                  <Image width="50px" src="fire.gif"></Image>
                </Text>
                <Button
                  css={{
                    background: 'transparent',
                    border: 'solid 1.5px white',
                  }}
                  onPress={claimPeriodicReward}
                >
                  <Text weight="medium" color="white">
                    {vipNftBalance == 0 ? (
                      'You have no VIP NFTs'
                    ) : isLoading ? (
                      <Loading color="currentColor" css={{ p: '$5' }}></Loading>
                    ) : (
                      `Harvest ${residualReward} SOCIAL`
                    )}
                  </Text>
                </Button>
              </Card.Body>
            </Card>
            {/* <Card
              css={{
                mt: '$10',
                width: '90%',
                backgroundColor: 'black',
                border: 'solid 1px white',
              }}
            >
              <Card.Body style={{ alignItems: 'center', textAlign: 'center' }}>
                <Image width="5%" src="warning.png"></Image>
                <Text color="white" css={{ display: 'inline-block' }} h2>
                  Delete Zone
                </Text>
                <Text color="white" h4 weight="light">
                  Warning: Deleting your profile won't give you already claimed reward tokens if you create another one.
                </Text>
              </Card.Body>
              <Card.Footer css={{ justifyContent: 'center' }}>
                <Button
                  css={{
                    background: 'red',
                    border: 'solid 1.5px white',
                  }}
                  onPress={deleteProfile}
                >
                  <Text weight="medium" color="white">
                    {isLoading ? <Loading color="warning" css={{ p: '$5' }}></Loading> : 'Delete my Profile'}
                  </Text>
                </Button>
              </Card.Footer>
            </Card> */}
            <Card
              className="card-background"
              css={{
                width: '90%',
                backgroundColor: 'transparent',
                border: 'solid 1px white',
                mt: '$10',
              }}
            >
              <Card.Body style={{ alignItems: 'center', textAlign: 'center' }}>
                <Text color="white" css={{ display: 'inline-block' }} h2>
                  Mint NFTs
                </Text>
                <Text color="white" h4 weight="light">
                  Select your NFT Type
                </Text>
                <Button.Group>
                  <Button
                    style={{
                      backgroundColor: clicked == 'Citizen' ? 'orange' : 'transparent',
                    }}
                    className="buttonmint"
                    onClick={() => setClicked('Citizen')}
                  >
                    Citizen
                  </Button>
                  <Button
                    style={{
                      backgroundColor: clicked == 'Member' ? 'orange' : 'transparent',
                    }}
                    className="buttonmint"
                    onClick={() => setClicked('Member')}
                  >
                    Member
                  </Button>
                  <Button
                    style={{
                      backgroundColor: clicked == 'VIP' ? 'orange' : 'transparent',
                    }}
                    className="buttonmint"
                    onClick={() => setClicked('VIP')}
                  >
                    VIP
                  </Button>
                </Button.Group>
                <Text color="white" css={{ mt: '1rem' }} h4 weight="light">
                  Input the Amount
                </Text>
                <input
                  id="input-amount"
                  className="inputprofile"
                  type="number"
                  onChange={(e) => setNftAmount(e.target.value)}
                ></input>
              </Card.Body>
              <Card.Footer css={{ justifyContent: 'center' }}>
                <Button disabled={inputFilled ? false : true} className="buttonmint" onPress={mint}>
                  <Text weight="medium" color="yellow">
                    {inputFilled == false ? (
                      'Insert An Amount'
                    ) : isLoading ? (
                      <Loading color="warning" css={{ p: '$5' }}></Loading>
                    ) : clicked == '' ? (
                      'Select NFT Type'
                    ) : (
                      `Mint ${nftAmount} ${clicked}`
                    )}
                  </Text>
                </Button>
              </Card.Footer>
            </Card>
            <Card
              className="card-background"
              css={{
                width: '90%',
                backgroundColor: 'transparent',
                // border: 'solid 1px white',
                boxShadow: '1px 1px 20px yellow',
                mt: '$10',
              }}
            >
              <Card.Body style={{ alignItems: 'center', textAlign: 'center' }}>
                <Text color="white" css={{ display: 'inline-block' }} h2>
                  Your Profile
                </Text>
                {hasProfile ? (
                  <>
                    <Text color="white" css={{ display: 'inline-block' }} h4>
                      First Name: {userInfo?.firstName}
                    </Text>
                    <Text color="white" css={{ display: 'inline-block' }} h4>
                      Last Name: {userInfo?.lastName}
                    </Text>
                    <Text color="white" css={{ display: 'inline-block' }} h4>
                      Username: {userInfo?.username}
                    </Text>
                    <Text color="white" h4 weight="light">
                      What you want to change?
                    </Text>
                    <Button.Group>
                      <Button
                        style={{
                          backgroundColor: optionClicked == 'First Name' ? 'orange' : 'transparent',
                        }}
                        className="buttonmint"
                        onClick={() => setOptionClicked('First Name')}
                      >
                        First Name
                      </Button>
                      <Button
                        style={{
                          backgroundColor: optionClicked == 'Last Name' ? 'orange' : 'transparent',
                        }}
                        className="buttonmint"
                        onClick={() => setOptionClicked('Last Name')}
                      >
                        Last Name
                      </Button>
                      <Button
                        style={{
                          backgroundColor: optionClicked == 'Username' ? 'orange' : 'transparent',
                        }}
                        className="buttonmint"
                        onClick={() => setOptionClicked('Username')}
                      >
                        Username
                      </Button>
                    </Button.Group>
                    <Text color="white" css={{ mt: '1rem' }} h4 weight="light">
                      {optionClicked}
                    </Text>
                    <input
                      id="input-profile"
                      className="inputprofile"
                      onChange={(e) => setProfileData(e.target.value)}
                    ></input>
                  </>
                ) : (
                  <Text color="yellow" css={{ display: 'inline-block' }} h4>
                    Create a profile to see Here
                  </Text>
                )}
              </Card.Body>
              <Card.Footer css={{ justifyContent: 'center' }}>
                {hasProfile && (
                  <>
                    <Button disabled={profileInputFilled ? false : true} className="buttonmint" onPress={updateInfo}>
                      <Text weight="medium" color="yellow">
                        {profileInputFilled == false ? (
                          'Insert Data'
                        ) : isLoading ? (
                          <Loading color="warning" css={{ p: '$5' }}></Loading>
                        ) : optionClicked == '' ? (
                          'Select an Option'
                        ) : (
                          `Change`
                        )}
                      </Text>
                    </Button>
                  </>
                )}
              </Card.Footer>
            </Card>
          </Col>
          <ProfileCard />
        </Row>
      </Container>
    </>
  )
}
