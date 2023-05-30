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

  const [driver, setDriver] = useState()

  const [pickupLoc, setPickupLoc] = useState('')
  const [destinationLoc, setDestinationLoc] = useState('')

  const [watchForRealtimeChanges, setWatchForRealtimeChanges] = useState(true)
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

  const getDriverDetails = async () => {
    const { error, data } = await supabase.from('profile_driver').select().eq('username', currentUser.user_metadata.username.toLowerCase()).maybeSingle()
    console.log(data)
    return data
  }

  useEffect(() => {
    currentUser && getDriverDetails().then((e) => setDriver(e))
  }, [currentUser])

  useEffect(() => {
    const pingDriver = async () => {
      if (driver) {
        const { error, data } = await supabase.from('online_driver').select().eq('id', driver.id).maybeSingle()
        if (data) {
          console.log('datamila')
          // ping it ( update last_ping_at )
        } else {
          const { data, error } = await supabase.from('online_driver').insert({ id: driver.id})
        }
        // console.log(driver?.id)
      }
    }
    pingDriver()
  }, [driver])

  useEffect(() => {
    const sub = supabase.channel('any')
      .on('postgres_changes', driver ? { event: 'INSERT', schema: 'public', table: 'rides', filter: `driver_id=eq.${driver.id}` } : { event: 'INSERT', schema: 'public', table: 'rides' }, payload => {
        console.log('Change received!', payload)
        watchForRealtimeChanges && toast({
          title: `New ride - ${driver && driver.id}`,
          description: `from (${payload.new.pickup_loc}) - (${payload.new.drop_loc}) for ${payload.new.fare}Rs`,
          status: 'info',
          duration: 10000,
          isClosable: false,
          position: 'bottom-right',
        })
        // chats.includes(payload.new) && console.log('i already have', payload.new)
        // console.log(chats)
        // setChats((current) => [...current, payload.new])
        // setChats((current) => current.includes(payload.new) ? current : [...current, payload.new])
      }).subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [watchForRealtimeChanges])
  

  useEffect(() => {
    myRide && console.log('Got ride', myRide)
  }, [myRide])

  return (
    <Box>
      <chakra.pre p={4}>
        {myRide && <pre>{JSON.stringify(myRide, null, 2)}</pre>}
      </chakra.pre>
    </Box>
  )
}