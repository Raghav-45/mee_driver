import { chakra, SimpleGrid, Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Text, Center, Box, Input, Button, Stack, VStack, HStack, InputGroup, InputLeftElement, AspectRatio } from '@chakra-ui/react'
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

import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

export default function Home() {
  const toast = useToast()
  const { currentUser } = useAuth()
  const router = useRouter()

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB0f0o77WzVWMIXX69u0oJL8zyKPKSsAEA',
    libraries: ['places'],
  })

  const center = { lat: 28.659051, lng: 77.113777 }
  const mapOptions = {zoomControl: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: false}
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  const [driver, setDriver] = useState()

  const [pickupLoc, setPickupLoc] = useState('')
  const [destinationLoc, setDestinationLoc] = useState('')

  const [watchForRealtimeChanges, setWatchForRealtimeChanges] = useState(true)
  const [myRide, setMyRide] = useState()

  const [rideQueue, setRideQueue] = useState([])

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


  async function calculateRoute(start, end) {
    if (start === '' || end === '') { return }
    // setIsCalculatingRoute(true)
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)

    // console.log(results)

    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
    // setIsCalculatingRoute(false)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originInputRef.current.value = ''
    destinationInputRef.current.value = ''
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

  // useEffect(() => {
  //   if (rideQueue.length > 0) {
  //     const e = rideQueue[rideQueue.length - 1]
  //     console.log(e)
  //     toast({
  //       title: 'New Ride',
  //       // description: `from (${e.pickup_loc}) - (${e.drop_loc}) for ${e.fare}Rs`,
  //       description: `${e.fare} Rs`,
  //       status: 'info',
  //       duration: 10000,
  //       isClosable: false,
  //       position: 'bottom-right',
  //     })
  //   }
  // }, [rideQueue])
  

  const AcceptRide = async (payload) => {
    const { data, error } = await supabase.from('waiting_rides').update({ is_accepted: true })
                                                                .match({id: payload.id,
                                                                        person_id: payload.person_id,
                                                                        driver_id: payload.driver_id,
                                                                        booked_at: payload.booked_at,
                                                                        started_at: payload.started_at,
                                                                        leave_at: payload.leave_at,
                                                                        fare: payload.fare,
                                                                        pickup_loc: payload.pickup_loc,
                                                                        drop_loc: payload.drop_loc})
    // console.log('gg', data, error, payload)
  }

  // useEffect(() => {
  //   setRideQueue_Inserted(current => [...current].filter(a => a.id != true))
  //   // setRideQueue_Updated(current => [...current].filter(a => a.id == true))
  // }, [rideQueue_Updated])

  const updateRideIsAccepted = (updatedRide) => {
    setRideQueue(prevRides => {
      return prevRides.map(ride => {
        if (ride.id === updatedRide.id) {
          return { ...ride, is_accepted: true }
        }
        return ride
      })
    })
  }

  useEffect(() => {
    if (rideQueue.length > 0) {
      const e = rideQueue[rideQueue.length - 1]
      calculateRoute(e.pickup_loc, e.drop_loc)
    }
  }, [rideQueue])
  

  useEffect(() => {
    const sub = supabase.channel('any')
      .on('postgres_changes', driver ? { event: '*', schema: 'public', table: 'waiting_rides', filter: `driver_id=eq.${driver.id}` } : { event: '*', schema: 'public', table: 'waiting_rides' }, payload => {
        // console.log('Change received!', payload)

        if (payload.eventType == 'INSERT') {
          setRideQueue(current => [...current, payload.new])
        }
        if (payload.eventType == 'UPDATE') {
          updateRideIsAccepted(payload.new)
        }

        // if (payload.new.is_accepted != true) {
        //   console.log('i can get this ride', payload)
        //   calculateRoute(payload.new.pickup_loc, payload.new.drop_loc)
        // }

        // watchForRealtimeChanges && setRideQueue(current => [...current, payload.new])
      }).subscribe()
    return () => {
      supabase.removeChannel(sub)
    }
  }, [watchForRealtimeChanges])
  

  useEffect(() => {
    myRide && console.log('Got ride', myRide)
  }, [myRide])

  if (!isLoaded) {
    return <Box>Loading...</Box>
  }

  return (
    <Box>
      <Box pt={4}>
        <Box mb={4} position={'relative'} left={0} top={0} h={'200px'} w={'100%'} overflow={'hidden'} rounded={'xl'}>
          <Box position={'absolute'} left={0} top={0} h={'100%'} w={'100%'}>
            <GoogleMap center={center} zoom={17} mapContainerStyle={{width: '100%', height: '100%'}} options={mapOptions}>
              {/* <Marker position={center} /> */}
              {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
            </GoogleMap>
          </Box>
        </Box>

        <SimpleGrid height={'100%'} columns={2} spacing={4}>
          {rideQueue.map((elem) => 
            <AspectRatio key={elem.id} ratio={1 / 1}>
              <Button rounded={'xl'} bg={elem.is_accepted != true ? 'red.400' : 'blue.400'} colorScheme={elem.is_accepted != true ? 'red' : 'blue'} textColor={'white'} size={'sm'} onClick={() => {AcceptRide(elem).then(toast({title: 'New Ride', status: 'success', duration: 10000, isClosable: false, position: 'bottom-right'}))}}>
                {elem.id}
              </Button>
            </AspectRatio>
          )}

          {[...Array(4 - rideQueue.length).keys()].map((elem) => 
            <AspectRatio key={elem} ratio={1 / 1}>
              <Button rounded={'xl'} bg={'gray.400'} colorScheme='blackAlpha' textColor={'gray.900'} size={'sm'} loadingText='Waiting for Rides' isLoading >
              </Button>
            </AspectRatio>
          )}
        </SimpleGrid>
      </Box>

      {/* <chakra.pre p={4}>
        {myRide && <pre>{JSON.stringify(myRide, null, 2)}</pre>}
      </chakra.pre> */}
    </Box>
  )
}