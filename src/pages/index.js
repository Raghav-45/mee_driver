import { useToast, SimpleGrid, Box, Button, AspectRatio } from '@chakra-ui/react'

import { supabase } from '../../lib/supabaseClient'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../lib/firebaseClient'

import { useJsApiLoader, GoogleMap, Marker, Autocomplete, DirectionsService, DirectionsRenderer } from '@react-google-maps/api'

const googleMapLibs = ['places']

export default function Home() {
  const { currentUser } = useAuth()
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyB0f0o77WzVWMIXX69u0oJL8zyKPKSsAEA',
    libraries: googleMapLibs,
  })

  const toast = useToast()

  const center = { lat: 28.659051, lng: 77.113777 }
  const mapOptions = {zoomControl: false, streetViewControl: false, mapTypeControl: false, fullscreenControl: false}
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [geoLoc, setGeoLoc] = useState({lat: null, lng: null})

  const [didPing, setDidPing] = useState(false)

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

  const updateGeoLocOnDB = (lat, lng) => {
    // Code to update the database with new latitude and longitude
    const driver_id = String(currentUser.id)
    const docRef = doc(db, 'map-data', driver_id)
    const docData = { lat: lat, lng: lng, uuid: driver_id }
    setDoc(docRef, docData, { merge: false })
    console.log('Updated DB with new location:', lat, lng);
  }

  const pingDriver = async () => {
    if (didPing) { console.log('already did ping') }
    if (currentUser && !didPing) {
      const { error, data } = await supabase.from('online_driver').select().eq('id', currentUser.id).maybeSingle()
      if (!data) {
        await supabase.from('online_driver').insert({ id: currentUser.id})
        setDidPing(true)
        console.log('ping done.')
      }
    }
  }

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude: newLatitude, longitude: newLongitude } = position.coords
          if (geoLoc.lat !== newLatitude || geoLoc.lng !== newLongitude) {
            // Only update the database if the location has changed
            updateGeoLocOnDB(newLatitude, newLongitude)
            setGeoLoc({lat: newLatitude, lng: newLongitude})
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

    const interval = setInterval(() => {currentUser && getLocation(); pingDriver();}, 3000)

    return () => clearInterval(interval)
  }, [currentUser, geoLoc])

  const AcceptRide = async (payload) => {
    !payload.is_accepted && await supabase.from('waiting_rides_test').update({ is_accepted: true, driver_id: currentUser.id }).eq('id', payload.id)
  }

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
      const ride = rideQueue[rideQueue.length - 1]
      toast({
        title: 'New Ride',
        description: `Fare ₹${ride.fare}`,
        status: 'info',
        duration: 10000,
        isClosable: true,
      })
      calculateRoute(ride.pickup_loc, ride.drop_loc)
    }
  }, [rideQueue])

  useEffect(() => {
    const subscribe = supabase.channel('any')
      //TODO: i have to add Filter Here
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiting_rides_test' }, payload => {
        console.log('Change received!', payload)

        if (payload.eventType == 'INSERT') {
          setRideQueue(current => [...current, payload.new])
        }
        if (payload.eventType == 'UPDATE') {
          updateRideIsAccepted(payload.new)
        }
      }).subscribe()
    return () => {
      supabase.removeChannel(subscribe)
    }
  }, [watchForRealtimeChanges])

  const GetDriverName = (props) => {
    const [userInfo, setUserInfo] = useState(null)

    const getRequestedUserInfo = (u) => {
      return new Promise((resolve, reject) => {
        supabase.from('profiles').select('username').eq('id', u).single()
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