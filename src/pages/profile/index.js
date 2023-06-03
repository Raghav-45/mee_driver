import { Avatar, Badge, Box, Button, chakra, Container, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { Icon } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { BsBoxArrowUp, BsBoxArrowInDown } from 'react-icons/bs'

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

  const [transactions, setTransactions] = useState([])

  const getTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*').eq('receiver', currentUser.id)
    return data
  }

  useEffect(() => {
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
        <Heading as='h2' size='2xl' style={{wordSpacing: '-5px'}}>Rs. {1000}</Heading>
      </Box>
      <HStack pt={2} spacing={4} justifyContent={'center'}>
        <Button size={'sm'} rounded='full' variant='primary'>Send</Button>
        <Button size={'sm'} rounded='full' variant='primary'>Receive</Button>
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