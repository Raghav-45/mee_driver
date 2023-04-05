import { chakra, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Text, Center, Box, Input, Button, Stack, VStack, HStack, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { AiFillCar } from 'react-icons/ai'
import { FiPackage } from 'react-icons/fi'
import { GiCarWheel } from 'react-icons/gi'

import { HiLocationMarker } from 'react-icons/hi'
import { TbLocationFilled } from 'react-icons/tb'
import { RiTruckFill } from 'react-icons/ri'
import { FaTruckLoading } from 'react-icons/fa'
import { TbTruckLoading } from 'react-icons/tb'

import { Toast } from "../../components/Toast";
import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'

export default function Home() {
  const toast = useToast()
  const { currentUser } = useAuth()
  const router = useRouter()

  const [pickupLoc, setPickupLoc] = useState('')
  const [destinationLoc, setDestinationLoc] = useState('')

  const [myRide, setMyRide] = useState()

  function TabChange(index) {
    index == 0 && toast({
      title: 'Excited!',
      description: "Riding is now avaliable",
      status: 'success',
      duration: 3000,
      isClosable: true,
      // variant:"information",
    })

    index == 2 && toast({
      title: 'Info',
      description: "Sorry, Renting service is currently not avaliable",
      status: 'warning',
      duration: 3000,
      isClosable: true,
      variant:"information",
    })
  }

  const registerRide = async () => {
    const { data, error } = await supabase.from('rides').insert({pickup_loc: pickupLoc, drop_loc: destinationLoc, fare: 10, driver_id: '6e6ba6ad-76aa-4192-8a50-f3c113eb8d6e'}).select().maybeSingle()
    return data
  }

  const BookRide = async () => {
    registerRide().then((e) => setMyRide(e))
  }

  useEffect(() => {
    TabChange(0)
  }, [])

  useEffect(() => {
    myRide && console.log('Got ride', myRide)
  }, [myRide])
  

  return (
    <Box>
      <Tabs onChange={(index) => TabChange(index)} defaultIndex={0}>
        <TabList>
          <Tab height={24} width={24} _selected={{ color: 'black', bg: 'blackAlpha.200', borderBottomColor: 'black' }}>
            <Center>
              <Flex boxSize={'full'} alignItems={'center'} flexDirection='column'>
                <AiFillCar size={'22'} />
                <Text pt={1.5}>Ride</Text>
              </Flex>
            </Center>
          </Tab>
          <Tab height={24} width={24} _selected={{ color: 'black', bg: 'blackAlpha.200', borderBottomColor: 'black' }}>
            <Center>
              <Flex boxSize={'full'} alignItems={'center'} flexDirection='column'>
                <FiPackage size={'22'} />
                <Text pt={1.5}>Deliver</Text>
              </Flex>
            </Center>
          </Tab>
          <Tab height={24} width={24} _selected={{ color: 'black', bg: 'blackAlpha.200', borderBottomColor: 'black' }}>
            <Center>
              <Flex boxSize={'full'} alignItems={'center'} flexDirection='column'>
                <GiCarWheel size={'22'} />
                <Text pt={1.5}>Rent</Text>
              </Flex>
            </Center>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex direction={'column'}>
              <Text fontSize={'3xl'} as='b'>Request a ride now</Text>
              <Box py={8}>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  <InputLeftElement pointerEvents='none' children={<TbLocationFilled color='gray.300' />} />
                  <Input variant='filled' background={'#F6F6F6'} placeholder='Enter Pickup Location' onChange={(e) => {setPickupLoc(e.target.value);}} />
                </InputGroup>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  <InputLeftElement pointerEvents='none' children={<HiLocationMarker color='gray.300' />} />
                  <Input variant='filled' background={'#F6F6F6'} placeholder='Enter Destination' onChange={(e) => {setDestinationLoc(e.target.value);}} />
                </InputGroup>
              </Box>
              <VStack spacing={2}>
                <Button width={'full'} variant='primary' onClick={BookRide}>Request now</Button>
                <Button width={'full'} variant='secondary'>Schedule for later</Button>
                <Button size={'sm'} rounded='full' variant='primary' _hover={{ bg: "whiteAlpha.400" }} onClick={() => router.replace('/map')}>Test Our Map</Button>
              </VStack>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex direction={'column'}>
              <Text fontSize={'3xl'} as='b'>Request a ride now</Text>
              <Box py={8}>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  <InputLeftElement pointerEvents='none' children={<FiPackage color='gray.300' />} />
                  <Input variant='filled' placeholder='Enter Pickup Location' />
                </InputGroup>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  {/* <InputLeftElement pointerEvents='none' children={<FaTruckLoading color='gray.300' style={{'-webkit-transform': 'scaleX(-1)', transform: 'scaleX(-1)'}} />} /> */}
                  <InputLeftElement pointerEvents='none' children={<RiTruckFill color='gray.300' />} />
                  <Input variant='filled' placeholder='Enter Destination' />
                </InputGroup>
              </Box>
              <VStack spacing={2}>
                <Button width={'full'} variant='primary'>Request now</Button>
                <Button width={'full'} variant='secondary'>Schedule for later</Button>
              </VStack>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex direction={'column'}>
              <Text fontSize={'3xl'} as='b'>Request a ride now</Text>
              <Box py={8}>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  <InputLeftElement pointerEvents='none' children={<TbLocationFilled color='gray.300' />} />
                  <Input variant='filled' placeholder='Enter Pickup Location' />
                </InputGroup>
                <InputGroup position={'relative'} size={'lg'} my={2} border={'none'}>
                  <InputLeftElement pointerEvents='none' children={<HiLocationMarker color='gray.300' />} />
                  <Input variant='filled' placeholder='Enter Destination' />
                </InputGroup>
              </Box>
              <VStack spacing={2}>
                <Button width={'full'} variant='primary'>Request now</Button>
                <Button width={'full'} variant='secondary'>Schedule for later</Button>
              </VStack>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <chakra.pre p={4}>
        {myRide && <pre>{JSON.stringify(myRide, null, 2)}</pre>}
      </chakra.pre>
    </Box>
  )
}