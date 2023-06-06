import { Avatar, Badge, Box, Button, chakra, Container, Flex, FormLabel, Heading, HStack, Input, SimpleGrid, Text, useToast, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Icon } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { BsBoxArrowUp, BsBoxArrowInDown } from 'react-icons/bs'
import QRCode from 'react-qr-code'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'

export default function Profilepage() {
  const { currentUser } = useAuth()

  const Transactions_t = [
    {from: 'raghav', to: 'kunal', amount: '32', timestamp: '5:01'},
    {from: 'kunal', to: 'raghav', amount: '12', timestamp: '5:02'},
    {from: 'chapri', to: 'raghav', amount: '25', timestamp: '5:07'},
    {from: 'raghav', to: 'chapri', amount: '28', timestamp: '5:09'},
    {from: 'raghav', to: 'kunal', amount: '23', timestamp: '5:03'},
    {from: 'kunal', to: 'raghav', amount: '17', timestamp: '5:04'},
    {from: 'raghav', to: 'kunal', amount: '20', timestamp: '5:05'},
  ]

  const [userWallet, setUserWallet] = useState()
  const [transactions, setTransactions] = useState([])

  const SendMoneyModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef(null)
    const [whoToSend, setWhoToSend] = useState('')
    const [amount, setAmount] = useState(0)

    const toast = useToast()

    const handleSend = async () => {
      // Check if user exists or not then send Money to that user

      const { data, error } = await supabase.from('transactions')
                                            .insert({ sender: currentUser.id, receiver: whoToSend, amount: amount })
      console.log(data)
      if (!error) {
        toast({
          // title: 'Success',
          description: `${amount} Rupees sent successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      }
      return data
    }
    return (
      <>
        <Button size={'sm'} rounded='full' variant='primary' ref={btnRef} onClick={onOpen}>Send</Button>
        <Modal
          onClose={onClose}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior={'inside'}
          size={'xs'}
          motionPreset='slideInBottom'
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Send Money</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              {/* <FormLabel>Address</FormLabel> */}
              {/* <Input value={whoToSend} onChange={(e) => setWhoToSend(e.target.value)} placeholder='UUID' /> */}

              <HStack>
                <Input w={'75%'} value={whoToSend} onChange={(e) => setWhoToSend(e.target.value)} placeholder='UUID' />
                <Input w={'25%'} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='Amount' />
              </HStack>
            </ModalBody>
            <ModalFooter>
              <Button w={'full'} mr={3} onClick={onClose}>Cancel</Button>
              <Button w={'full'} colorScheme='blue' onClick={handleSend}>Send</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

  const ReceiveMoneyModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const btnRef = React.useRef(null)
    return (
      <>
        <Button size={'sm'} rounded='full' variant='primary' ref={btnRef} onClick={onOpen}>Receive</Button>
        <Modal
          onClose={onClose}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior={'inside'}
          size={'xs'}
          motionPreset='slideInBottom'
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Receive Money</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              {/* <FormLabel>Address</FormLabel> */}
              <Input isInvalid errorBorderColor='gray.300' padding={1} mb={4} fontSize={13} textAlign={'center'} placeholder={`${currentUser.id}`} isDisabled />
              <Box rounded={'md'} overflow={'hidden'}>
                <QRCode
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  // size={'auto'}
                  bgColor={'white'}
                  fgColor={'black'}
                  value={`${currentUser.id}`}
                />
                {/* <img src="https://cdn-icons-png.flaticon.com/512/241/241528.png" /> */}
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button w={'full'} onClick={onClose} colorScheme='blackAlpha'>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }

  const getUserWallet = async () => {
    if (user.wallet_id == null) {
      return {balance: null}
    } else {
      const { data, error } = await supabase.from('wallets')
                                            .select('balance')
                                            .eq('id', currentUser.id)
                                            .single()
      return data
    }
  }

  const getTransactions = async () => {
    // const { data, error } = await supabase.from('transactions').select('*').eq('receiver', currentUser.id)
    const { data, error } = await supabase.from('transactions')
                                          .select('*')
                                          .or(`receiver.eq.${currentUser.id}, sender.eq.${currentUser.id}`)
    return data
  }

  useEffect(() => {
    currentUser && getUserWallet().then(e => {setUserWallet(e)})
    currentUser && getTransactions().then(e => {setTransactions(e); console.log(e);})
  }, [currentUser])

  if (!currentUser) {
    return <Box>Loading...</Box>
  }

  return (
    <Container maxW='container.lg' overflowX='auto' py={4}>
      {/* <chakra.pre p={4}>
        {currentUser && <pre> {JSON.stringify(currentUser, null, 2)}</pre>}
      </chakra.pre> */}

      <Box pt={5} textAlign={'center'}>
        <Text fontSize={'xl'}>Available Balance</Text>
        <Heading as='h2' size='2xl' style={{wordSpacing: '-5px'}}>Rs. {userWallet?.balance == null ? 0 : userWallet.balance}</Heading>
      </Box>
      <HStack pt={2} spacing={2} justifyContent={'center'}>
        {/* <Button size={'sm'} rounded='full' variant='primary'>Send</Button> */}
        {/* <Button size={'sm'} rounded='full' variant='primary'>Receive</Button> */}
        <SendMoneyModal />
        <ReceiveMoneyModal />
      </HStack>
      <Box pt={10} mb={2}>
        <Heading as='h4' size='md' fontWeight={'semibold'}>Transactions</Heading>
      </Box>

      <Box px={4} py={4} bg={'gray.100'} rounded={'2xl'}>
        <VStack alignItems={'left'} spacing={2}>
          {transactions.map((elem) =>
            <Flex key={elem.timestamp}>
              {elem.receiver == currentUser.id ?
                <Avatar bg='blue.500' icon={<Icon mt={'-5px'} fontSize='1.25rem' as={BsBoxArrowInDown} />} />
                :
                <Avatar bg='red.500' icon={<Icon mt={'-5px'} fontSize='1.25rem' as={BsBoxArrowUp} />} />
              }
              <Box ml='3'>
                <Text fontWeight='bold'>
                  {elem.receiver == currentUser.id ?
                    <Badge mr='1' colorScheme='blue'>Received</Badge>
                    :
                    <Badge mr='1' colorScheme='red'>Sent</Badge>
                  }
                  {elem.receiver == currentUser.id ? 'from' : 'to'} {elem.receiver == currentUser.id ? elem.sender : elem.receiver}

                  {/* <Badge mr='1' colorScheme='red'>Sent</Badge>
                  to Raghav */}
                </Text>
                <Text ml='0.25' fontSize='sm' fontWeight='semibold'>Rs. {elem.amount}</Text>
              </Box>
            </Flex>
          )}
        </VStack>
      </Box>
    </Container>
  )
}