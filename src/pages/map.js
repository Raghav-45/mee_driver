import { useEffect, useState } from 'react'
import Script from 'next/script'
import { Tabs, TabList, TabPanels, Tab, TabPanel, Flex, Text, Center, Box, Input, Button, Stack, VStack, HStack, InputGroup, InputLeftElement, useToast } from '@chakra-ui/react'
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
import { useAuth } from '../../contexts/AuthContext'
// import Map from "mapmyindia-react"

// const map = new mappls.Map('map', {center:{lat:28.612964,lng:77.229463} });

export default function Home() {
  const toast = useToast()
  const { currentUser } = useAuth()

  const [isMapSDKLoaded, setIsMapSDKLoaded] = useState(false)
  const [isMapPluginLoaded, setIsMapPluginLoaded] = useState(false)

  const [pickupLoc, setPickupLoc] = useState('')
  const [destinationLoc, setDestinationLoc] = useState('')
  const MapSettings = {
    zoomControl: false,
    zoom: 16,
    hybrid: true,
  }

  var map
  function initMap() {
    map = new mappls.Map('map', {center:[28.667936, 77.112228], zoom: 16, search: false})

    // map.addListener('load', function () {
    //   var from= new mappls.Marker({
    //     map: map,
    //     position: {"lat": 28.659051 ,"lng":77.113777},
    //     fitbounds: true,
    //     icon: "https://maps.mapmyindia.com/images/from.png"
    //   })
      
    //   var to= new mappls.Marker({
    //     map: map,
    //     position: {"lat": 28.667936 ,"lng":77.112228},
    //     fitbounds: true,
    //     icon: "https://maps.mapmyindia.com/images/to.png"
    //   })
    // })
  }

  function addMarker() {
    map.addListener('load', function () {
      var from= new mappls.Marker({
        map: map,
        position: {"lat": 28.659051 ,"lng":77.113777},
        fitbounds: true,
        icon: "https://maps.mapmyindia.com/images/from.png"
      })
      
      var to= new mappls.Marker({
        map: map,
        position: {"lat": 28.667936 ,"lng":77.112228},
        fitbounds: true,
        icon: "https://maps.mapmyindia.com/images/to.png"
      })

      // mappls.getDistance({
      //   coordinates: "518NSV;123ZRR",
      // },function callback (data) {
      //   console.log("Data",data);
      // })
    })
  }

  useEffect(() => {
    isMapSDKLoaded && initMap()
    isMapSDKLoaded && isMapPluginLoaded && addMarker()
  }, [isMapSDKLoaded, isMapPluginLoaded])

  return (
    <Box>
      <Script src="https://apis.mappls.com/advancedmaps/api/06eb2afcbe49d1fdfe37e89dbe823094/map_sdk?layer=vector&v=3.0" onLoad={() => setIsMapSDKLoaded(true)} />
      <Script src="https://apis.mappls.com/advancedmaps/api/6184180e-dc53-4a44-a7d1-08795a1c70a6/map_sdk_plugins?v=3.0" onLoad={() => setIsMapPluginLoaded(true)} />
      <div id="map"></div>
    </Box>
  )
}