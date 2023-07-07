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

import { Toast } from '../../components/Toast'
import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/router'

import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebaseClient'

import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";

const googleMapLibs = ['places']

export default function Home() {
  const { currentUser } = useAuth()
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB0f0o77WzVWMIXX69u0oJL8zyKPKSsAEA',
    libraries: googleMapLibs,
  })

  const center = { lat: 28.659051, lng: 77.113777 }
  const mapOptions = {zoomControl: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: false}
  const [directionsResponse, setDirectionsResponse] = useState(null)

  const [driver, setDriver] = useState()

  const [latitude, setLatitude] = useState()
  const [longitude, setLongitude] = useState()

  const [rideQueue, setRideQueue] = useState([])

  const [watchForRealtimeChanges, setWatchForRealtimeChanges] = useState(true)

  async function calculateRoute(start, end) {
    if (start === '' || end === '') { return }
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse(results)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    originInputRef.current.value = ''
    destinationInputRef.current.value = ''
  }


  const getDriverDetails = async () => {
    const { error, data } = await supabase.from('profiles').select().eq('username', currentUser.user_metadata.username).maybeSingle()
    console.log(data)
    return data
  }

  useEffect(() => {
    currentUser && getDriverDetails().then((e) => setDriver(e))
  }, [currentUser])

  const updateGeoLocOnDB = (lat, lng) => {
    // Code to update the database with new latitude and longitude
    const driver_id = String(driver.id)
    const docRef = doc(db, 'map-data', driver_id)
    const docData = { lat: lat, lng: lng, uuid: driver_id }
    setDoc(docRef, docData, { merge: false })
    console.log('Updated DB with new location:', lat, lng);
  }

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
        // updateGeoLocOnDB()
      }
    }
    pingDriver()

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude: newLatitude, longitude: newLongitude } = position.coords
          if (latitude !== newLatitude || longitude !== newLongitude) {
            // Only update the database if the location has changed
            updateGeoLocOnDB(newLatitude, newLongitude)
            setLatitude(newLatitude)
            setLongitude(newLongitude)
          } else {
            console.log('Same GeoLoc, No Need to Update on DB')
          }
        }, (error) => {
          console.error('Error getting location:', error)
        })
      } else {
        console.error('Geolocation is not supported by this browser.')
      }
    }

    const interval = setInterval(() => {
      if (driver) {getLocation()}
    }, 3000)

    return () => clearInterval(interval)
  }, [driver, latitude, longitude])

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     // Code to be executed every n seconds
  //     if (driver) {
  //       updateGeoLocOnDB()
  //     }
  //     // console.log('Action performed every n seconds');
  //   }, 3000); // Replace 5000 with your desired interval in milliseconds (e.g., 1000 for 1 second)

  //   // Cleanup the interval on component unmount
  //   return () => clearInterval(interval);
  // }, [driver]);

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
    const { data, error } = await supabase.from('waiting_rides_test').update({ is_accepted: true, driver_id: currentUser.id }).eq('id', payload.id)
    // toast({
    //   title: 'New Ride',
    //   status: 'success',
    //   duration: 10000,
    //   isClosable: false,
    //   position: 'bottom-right'
    // })
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiting_rides_test' }, payload => {
        console.log('Change received!', payload)

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

  const GetDriverName = (props) => {
    const [userInfo, setUserInfo] = useState(null)

    const getRequestedUserInfo = (u) => {
      return new Promise((resolve, reject) => {
        supabase.from("profiles").select("username").eq("id", u).single()
          .then(({ data, error }) => {
            if (error) {
              reject(error)
            } else {
              console.log('info', data)
              resolve(data)
            }
          })
          .catch((error) => {reject(error)})
      })
    }

    useEffect(() => {
      const fetchUserInfo = async () => {
        try {
          const data = await getRequestedUserInfo(props.uuid)
          setUserInfo(data)
        } catch (error) {
          console.error(error)
        }
      }
      fetchUserInfo()
    }, [])

    return (userInfo ? userInfo.username : 'Loading user info...')
  };

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
              <Button rounded={'xl'} bg={elem.is_accepted != true ? 'red.400' : 'blue.400'} colorScheme={elem.is_accepted != true ? 'red' : 'blue'} textColor={'white'} size={'sm'} onClick={() => {AcceptRide(elem)}}>
                <GetDriverName uuid={String(elem.person_id)} />
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