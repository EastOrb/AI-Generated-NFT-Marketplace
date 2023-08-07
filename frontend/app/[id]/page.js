"use client";

import React , {useState , useRef, useEffect} from 'react'
import Header from '@/Component/Header/Header'
import {ThirdwebProvider} from "@thirdweb-dev/react"
import { Button , Input ,Alert , Box, Center ,  Text,  AlertIcon , Heading, VStack , HStack ,Spinner, ChakraProvider } from '@chakra-ui/react';
import { ethers } from 'ethers'
import Link from 'next/link';
import {aiftAddress  , aiftabi} from "../../constant.js"
import {ExternalLinkIcon} from "@chakra-ui/icons"


const SingleNFT = ({ params }) => {
    const [nftdata, setnftdata] = useState('');
    const [tokenuri, settokenuri] = useState('');
    const [owner, setowner] = useState('');
    const [name, setname] = useState('');
    const [description, setdescription] = useState('');
    const [image, setimage] = useState('');
    const [loading, setloading] = useState(false);
    const [showMetamaskAlert, setShowMetamaskAlert] = useState(false);
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [price, setprice] = useState(0);
    const [isClientMounted, setIsClientMounted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSameownerAddress , setisSameownerAddress] = useState(false);
    const [connectedAddress , setconnectedAddress] = useState("")
  
    // function for getting the info for each NFT with tokenid
    const getNftInfo = async () => {
      // alert(tokenuri)
      setloading(true)
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const aift = new ethers.Contract(aiftAddress, aiftabi, signer)
  
      const data = await aift.getNFTInfobyId(params.id)
      setnftdata(data)
      settokenuri(data.tokenURI);
      setowner(data.owner);
      const priceinEther  = ethers.utils.formatEther(data.price.toString())
      setprice(priceinEther)
      console.log( "coming from getNFTINFO" , owner)

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      const account = accounts[0];
      setconnectedAddress(account)
      console.log("account" , account)
      if(owner === connectedAddress){
        setisSameownerAddress(true)
      }

      console.log('issameOnweraddress var ------------ ' , isSameownerAddress)
      
      setloading(false)
    }
    const fetchMetadata = async (tokenURI) => {
        try {
          setloading(true)
          const response = await fetch(`https://ipfs.io/ipfs/${tokenURI}/metadata.json`);
          const metadata = await response.json();
          const metadataName = metadata.name;
          setname(metadataName)
          setdescription(metadata.description)
          setimage(metadata.image)
          setloading(false)
          let tokenImagex = metadata.image;
          setimage(tokenImagex);
    
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      };
    
  
  
    const sellButtonCLickhandler = async() =>{
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const aift = new ethers.Contract(aiftAddress, aiftabi, signer)
        const tx = await aift.sellNFT(params.id)
        console.log(tx)

        const txhash = tx.hash 

        signer.provider.on(txhash, (receipt) => {
            console.log('Transaction confirmed:', receipt);
            setStatus('AIFT Selled Succesfully Will be Soon Reflect In Your Profile Section Soon')
            setType('success')
            setShowMetamaskAlert(true)
          });
  
      } catch (error) {
        console.log(error)
        setStatus(' Transaction Rejected')
        setType('error')
        setShowMetamaskAlert(true)
  
        setIsModalOpen(false);
      } 

    }

    useEffect(() => {
      setIsClientMounted(true);
      getNftInfo();
    }, [params.id]);
  
    useEffect(() => {   
      if (tokenuri) {
        fetchMetadata(tokenuri);
      }
    }, [tokenuri]);
  
    return (
      <ThirdwebProvider>
        <ChakraProvider>
          <Header />
  
          <div className='w-full' style={{background: "linear-gradient(135deg, #426F4E 0%, #05101A 100%)"  }} suppressHydrationWarning>
            {showMetamaskAlert && <Alert status={type} className='w-10/12'><AlertIcon />{status}</Alert>}
            {loading ? (
              <Center h={'30vh'}>
                <Spinner thickness='5px' speed='0.5s' emptyColor='rgba(255, 255, 255, 0.90)' color='rgba(255, 255, 255, 0.90)' size='xl' />
              </Center>
            ) : (
              isClientMounted && (
                <div style={{  background: "linear-gradient(135deg, #426F4E 0%, #05101A 100%)"  }} className='px-28 py-20'>
                  <HStack spacing={6} style={{ background: "linear-gradient(135deg, #426F4E 0%, #05101A 100%)" , border: '3px solid rgba(255, 255, 255, 0.90)' }} className='rounded-2xl p-6'>
                    <div style={{ }} className='w-6/12 h-full'>
                      <img
                        className='border-cyan-500 border-2 w-full mx-auto rounded-xl'
                        src={`${image.replace('ipfs://', 'https://nftstorage.link/ipfs/')}`}
                        alt={name}
                        style={{ maxWidth: '70%', border: '3px solid rgba(255, 255, 255, 0.90)' }}
                      />
                    </div>
                    <VStack spacing={6} align='stretch' marginLeft={'5rem'}>
                      <div className='details-div'>
                        <Heading as="h3" m={'1'} size="lg" color={'rgba(255, 255, 255, 0.90)'}>
                          #{params.id}{' '}
                          <Link target='_blank' style={{ marginLeft: '3px' }} href={`https://ipfs.io/ipfs/${tokenuri}/metadata.json`}>
                            <ExternalLinkIcon fontWeight={'1000'} fontSize={'2rem'} color={"#CCEABB"} />
                          </Link>
                        </Heading>
                        <Heading as="h6" m={'1'} size="md" color={'rgb(209 213 219)'}>
                          <Text style={{ marginTop: '2rem 0 2rem 0 ', padding: "1rem", display: 'inline', fontWeight: '1000', color: "#ff8700" }}> <span style={{color:"#fff"}}>Name:&nbsp;  </span>   {  name} </Text>
                        </Heading>
                        {isClientMounted && (
                          <p className='text-slate-300' fontWeight={'700'} m={'1'} fontSize={'xl'}>

                            <Text style={{  display: 'inline', color: "rgba(255, 255, 255, 0.90)", fontWeight: '1000', padding: "1rem", marginTop: '2rem 0 2rem 0 ' , fontSize:'1.2rem' }}>  <span style={{color:"#fff"}}>Description:&nbsp;  </span>  { description}</Text>
                          </p>
                        )}
                        <p className='text-slate-300' fontSize="xl" style={{ color: "rgba(255, 255, 255, 0.90)", padding: "1rem", marginTop: '2rem 0 2rem 0 ' }} fontWeight={'400'} m={'1'}>
                         <span style={{color:"#fff"}}>Owner: </span> {owner}
                        </p>
                      </div>
                      <HStack>
                        {isSameownerAddress ?
                         <p className='text-slate-300' fontSize="xl" style={{ color: "rgba(255, 255, 255, 0.90)", padding: "1rem", marginTop: '2rem 0 2rem 0 ' , fontSize:'1.4rem' }} fontWeight={'400'} m={'1'}>
                        You are a Owner of this AIFT
                        </p>
                        : 
                          <Button onClick={sellButtonCLickhandler   } size='lg' colorScheme='green' borderRadius={'4px'} variant={"solid"} fontWeight={'700'}>
                          Buy AIFT
                          </Button>
                          }
                        
                      </HStack>
                    </VStack>
                  </HStack>
                </div>
              )
            )}
          </div>
        </ChakraProvider>
      </ThirdwebProvider>
    );
  };
  
  export default SingleNFT;
  
 