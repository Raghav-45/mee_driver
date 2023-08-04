import { useToast, SimpleGrid, Box, Button, AspectRatio, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react'

import { supabase } from '../../lib/supabaseClient'
import { useEffect, useRef, useState } from 'react'
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
  const [directionsResponse_AcceptedRide, setDirectionsResponse_AcceptedRide] = useState(null)
  const [geoLoc, setGeoLoc] = useState({lat: null, lng: null})

  const [didPing, setDidPing] = useState(false)
  
  const [rideQueue, setRideQueue] = useState([])
  const [watchForRealtimeChanges, setWatchForRealtimeChanges] = useState(true)

  const { isOpen: isOpen_NewRideDialog, onOpen: onOpen_NewRideDialog, onClose: onClose_NewRideDialog } = useDisclosure()
  const cancelRef_NewRideDialog = useRef()
  const [alertRide, setAlertRide] = useState()
  
  const [acceptedRide, setAcceptedRide] = useState()

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
  
  async function calculateRouteForAcceptedRide(start, end) {
    if (start === '' || end === '') { return }
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    setDirectionsResponse_AcceptedRide(results)
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
    const driver_id = String(currentUser.id);
    const docRef = doc(db, "map-data", driver_id);
    const docData = { lat: lat, lng: lng, uuid: driver_id };
    setDoc(docRef, docData, { merge: false });
    console.log("Updated DB with new location:", lat, lng);
  };

  const pingDriver = async () => {
    if (didPing) {
      console.log("already did ping");
    }
    
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
    !payload.is_accepted &&
      (await supabase
        .from("waiting_rides_test")
        .update({ is_accepted: true, driver_id: currentUser.id })
        .eq("id", payload.id));
  };

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

  // useEffect(() => {
  //   if (rideQueue.length > 0) {
  //     const ride = rideQueue[rideQueue.length - 1]
  //     // TODO: I'll add popup or dialog to alert driver about new Ride
  //     toast({
  //       title: 'New Ride',
  //       description: `Fare ₹${ride.fare}`,
  //       status: 'info',
  //       duration: 10000,
  //       isClosable: true,
  //     })
  //     setAlertRide(ride)
  //     onOpen_NewRideDialog()
  //     calculateRoute(ride.pickup_loc, ride.drop_loc)
  //   }
  // }, [rideQueue])

  const rideisAccepted = (payload) => {
    rideQueue.forEach((elem) => {
      elem.id == payload.id && console.log('exists')
    })
  }

  function checkIfRideExists(array, checkFor) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == checkFor) {
        console.log('this exists')
        return true;
      }
    }
    return false;
  }

  function removeIfRideExists(array, checkFor) {
    const updated_array = []
    for (var i = 0; i < array.length; i++) {
      if (array[i].id == checkFor) {
        console.log('this exists', i)
      } else {
        updated_array.push(array[i])
      }
    }
    return updated_array;
  }

  useEffect(() => {
    const subscribe = supabase.channel('any')
      //TODO: i have to add Filter Here
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waiting_rides_test' }, payload => {
        console.log('Change received!', payload)

        if (payload.eventType == 'INSERT' && payload.new.is_accepted == null) {
          setRideQueue(current => [...current, payload.new])

          setAlertRide(payload.new)
          onOpen_NewRideDialog()
          calculateRoute(payload.new.pickup_loc, payload.new.drop_loc)
        }
        if (payload.eventType == 'UPDATE' && payload.new.is_accepted == true) {
          if (payload.new.is_accepted == true && payload.new.driver_id == currentUser.id) {
            updateRideIsAccepted(payload.new)
            setAcceptedRide(payload.new)
            calculateRouteForAcceptedRide(payload.new.pickup_loc, payload.new.drop_loc)
          }
          if (payload.new.is_accepted == true && payload.new.driver_id != currentUser.id) {
            setRideQueue(current => removeIfRideExists([...current], payload.new.id))
          }
        }
      }).subscribe()
    return () => {
      supabase.removeChannel(subscribe)
    }
  }, [watchForRealtimeChanges, currentUser])

  const GetDriverName = (props) => {
    const [userInfo, setUserInfo] = useState(null)

    const getRequestedUserInfo = (u) => {
      return new Promise((resolve, reject) => {
        supabase
          .from("profiles")
          .select("username")
          .eq("id", u)
          .single()
          .then(({ data, error }) => {
            if (error) {
              reject(error);
            } else {
              console.log("info", data);
              resolve(data);
            }
          })
          .catch((error) => {
            reject(error);
          });
      });
    };

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
        <Box border='2px' borderColor='gray.200' mb={4} position={'relative'} left={0} top={0} h={'200px'} w={'100%'} overflow={'hidden'} rounded={'xl'}>
          <Box position={'absolute'} left={0} top={0} h={'100%'} w={'100%'}>
            <GoogleMap center={center} zoom={17} mapContainerStyle={{width: '100%', height: '100%'}} options={mapOptions}>
              {/* <Marker position={center} /> */}
              {directionsResponse_AcceptedRide && <DirectionsRenderer directions={directionsResponse_AcceptedRide} />}
            </GoogleMap>
          </Box>
        </Box>

        {alertRide && <>
          <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={cancelRef_NewRideDialog}
            onClose={onClose_NewRideDialog}
            isOpen={isOpen_NewRideDialog}
            isCentered
          >
            <AlertDialogOverlay />
            <AlertDialogContent rounded={'xl'}>
              <AlertDialogHeader>Accept Ride?</AlertDialogHeader>
              
              <AlertDialogCloseButton />
              
              <AlertDialogBody py={0}>
                <Box border='2px' borderColor='gray.200' mb={4} position={'relative'} left={0} top={0} h={'200px'} w={'100%'} overflow={'hidden'} rounded={'xl'}>
                  <Box position={'absolute'} left={0} top={0} h={'100%'} w={'100%'}>
                    <GoogleMap center={center} zoom={17} mapContainerStyle={{width: '100%', height: '100%'}} options={mapOptions}>
                      {/* <Marker position={center} /> */}
                      // TODO: Show New Ride's Route here, and show Ride route in main map ( also planning to stop driver from reviving new rides when he is currently in an ride. )
                      {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                    </GoogleMap>
                  </Box>
                </Box>
              </AlertDialogBody>
              
              <AlertDialogFooter pt={0} justifyContent={'space-between'}>
                <Button width={'48%'} colorScheme='red' ref={cancelRef_NewRideDialog} onClick={() => {setRideQueue(current => removeIfRideExists([...current], alertRide.id)); onClose_NewRideDialog();}}>Reject</Button>
                <Button width={'48%'} colorScheme='blue' onClick={() => {AcceptRide(alertRide); onClose_NewRideDialog();}}>Accept ₹{alertRide.fare}</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>}

        <SimpleGrid height={'100%'} columns={2} spacing={4}>
          {rideQueue && rideQueue.map((elem) => 
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