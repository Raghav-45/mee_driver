import {
  Avatar,
  Badge,
  Box,
  Button,
  chakra,
  Container,
  Flex,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Text,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useClipboard,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  InputLeftElement,
  SlideFade,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { Icon } from "@chakra-ui/react";
import { useAuth } from "../../../contexts/AuthContext";
import { FiPlus, FiMinus } from "react-icons/fi";
import { BsBoxArrowUp, BsBoxArrowInDown } from "react-icons/bs";
import QRCode from "react-qr-code";
import {QrScanner} from '@yudiel/react-qr-scanner'

import Script from "next/script";
import axios from "axios";

export default function Profilepage() {
  const { currentUser } = useAuth();

  const [userWallet, setUserWallet] = useState();
  const [transactions, setTransactions] = useState([]);

  const [reRenderSendMoneyModal, setReRenderSendMoneyModal] = useState('false')

  const SendMoneyModal = (props) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef(null);
    const [whoToSend, setWhoToSend] = useState("");
    const [whoToSend_username, setWhoToSend_username] = useState('')
    const [amount, setAmount] = useState(0);

    const toast = useToast();

    const [tabIndex, setTabIndex] = useState(0)

    function isUUID(uuid) {
      let s = "" + uuid;
      s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
      if (s === null) {
        return false;
      }
      return true;
    }


    const getRequestedUserInfo = async (uuid) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", uuid)
        .single();
      setWhoToSend_username(data.username);
      console.log('inmfo', data);
      // return data;
    }

    const handleSend = async () => {
      // Check if user exists or not then send Money to that user

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          sender: currentUser.id,
          receiver: whoToSend,
          amount: amount,
        });
      console.log(data);
      if (!error) {
        toast({
          // title: 'Success',
          description: `${amount} Rupees sent successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // onClose();
        setTabIndex(2);
      }
      return data;
    };
    return (
      <>
        <Button
          size={"sm"}
          rounded="full"
          variant="primary"
          ref={btnRef}
          onClick={onOpen}
        >
          Send
        </Button>
        <Modal
          onClose={() => {onClose; props.onCallbackfn((new Date()).getTime());}}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior={"inside"}
          size={"xs"}
          motionPreset="slideInBottom"
          autoFocus={false}
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Send Money</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              {/* <FormLabel>Address</FormLabel> */}
              {/* <Input value={whoToSend} onChange={(e) => setWhoToSend(e.target.value)} placeholder='UUID' /> */}

              <Tabs index={tabIndex} onChange={(i) => setTabIndex(i)}>
                <TabList hidden={true}>
                  <Tab>Scan QR</Tab>
                  <Tab>Amount</Tab>
                  <Tab>Status</Tab>
                </TabList>

                <TabPanels p={0} m={0}>
                  <TabPanel p={0} m={0}>
                    <Box rounded={"lg"} overflow={"hidden"}>
                      <QrScanner
                        containerStyle={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        scanDelay={5000}
                        onResult={(result) => {
                          const stringResult = String(result);
                          // toast({
                          //   description: isUUID(result) ? 'QR Scan Success' : 'Please Scan Valid Wallet Code',
                          //   status: isUUID(result) ? 'success' : 'warning',
                          //   duration: 3000,
                          //   isClosable: true,
                          // });
                          // toast.closeAll();
                          (currentUser.id == stringResult) && toast({
                            description: 'You cannot send money to yourself',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                          !isUUID(result) && toast({
                            description: 'Please Scan Valid Wallet Code',
                            status: 'warning',
                            duration: 3000,
                            isClosable: true,
                          });
                          isUUID(result) && (currentUser.id != stringResult) && setWhoToSend(stringResult);
                          isUUID(result) && (currentUser.id != stringResult) && setTabIndex(1);
                        }}
                        onError={(error) => console.log(error?.message)}
                      />
                      {/* <img src="https://cdn-icons-png.flaticon.com/512/241/241528.png" /> */}
                    </Box>
                  </TabPanel>
                  <TabPanel p={0} m={0}>
                    <Box p={2}>
                      <Heading as="h4" size="md" mb={4} textAlign={'center'}>sending to - {whoToSend && getRequestedUserInfo(whoToSend) && whoToSend_username}</Heading>
                      <Input
                        w={'full'}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                      />
                    </Box>
                  </TabPanel>
                  <TabPanel p={0} m={0}>
                    <Alert
                      status='success'
                      variant='subtle'
                      flexDirection='column'
                      alignItems='center'
                      justifyContent='center'
                      textAlign='center'
                      height='200px'
                      rounded={'lg'}
                    >
                      <AlertIcon boxSize='40px' mr={0} />
                      <AlertTitle mt={4} mb={1} fontSize='lg'>
                        {amount ? `${amount} Rupees sent successfully` : 'Money sent successfully'}
                      </AlertTitle>
                      <AlertDescription maxWidth='sm'>
                        transaction id - {'#id'}
                      </AlertDescription>
                    </Alert>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button w={"full"} onClick={onClose}>
                Cancel
              </Button>
              {tabIndex == 1 && <Button w={"full"} ml={3} colorScheme="blue" onClick={handleSend}>
                Send
              </Button>}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const ReceiveMoneyModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { onCopy, value, setValue, hasCopied } = useClipboard(
      `${currentUser.id}`
    );
    const btnRef = React.useRef(null);
    return (
      <>
        <Button
          size={"sm"}
          rounded="full"
          variant="primary"
          ref={btnRef}
          onClick={onOpen}
        >
          Receive
        </Button>
        <Modal
          onClose={onClose}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior={"inside"}
          size={"xs"}
          motionPreset="slideInBottom"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Receive Money</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              {/* <FormLabel>Address</FormLabel> */}
              <HStack mb={4} fontSize={13} textAlign={"center"}>
                <Input
                  isInvalid
                  errorBorderColor="gray.300"
                  padding={2}
                  value={`${currentUser.id}`}
                  placeholder={`${currentUser.id}`}
                  isDisabled
                />
                <Button onClick={onCopy} transition={"all"}>
                  {hasCopied ? "Copied!" : "Copy"}
                </Button>
              </HStack>
              <Box rounded={"md"} overflow={"hidden"}>
                <QRCode
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  // size={'auto'}
                  bgColor={"white"}
                  fgColor={"black"}
                  value={`${currentUser.id}`}
                />
                {/* <img src="https://cdn-icons-png.flaticon.com/512/241/241528.png" /> */}
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button w={"full"} onClick={onClose} colorScheme="blackAlpha">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const AddMoneyModal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef(null);
    const [amount, setAmount] = useState("");
    const toast = useToast();

    const logPaymentToDB = async (
      user,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount
    ) => {
      const { data, error } = await supabase.from("payment_logs").insert({
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_signature: razorpay_signature,
        user: user,
        amount: amount,
      });
      return data;
    };

    const handleAddMoney = async (amount) => {
      const generateRazorPayOrder = async (amount) => {
        const res = await axios.post("/api/rzpay", { amount: amount });
        return res.data;
      };
      const order = await generateRazorPayOrder(amount);
      const options = {
        key: "rzp_test_bflHpE37hU5CbO", // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "My Electric Vehicle",
        image: "/icon-256x256.png",
        order_id: order.id,
        prefill: {
          email: currentUser && currentUser?.email,
          contact: currentUser && currentUser?.phone,
        },
        handler: (response) => {
          // alert(response)
          toast({
            // title: 'Payment Success',
            description: "Payment Success",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          // alert(response.razorpay_payment_id)
          // alert(response.razorpay_order_id)
          // alert(response.razorpay_signature)
          //TODO: Add Data to Server to verify User's Payment authenticity by verifying the signature
          logPaymentToDB(
            currentUser.id,
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
            order.amount / 100
          );
          // const { data, error } = supabase.rpc('add_money_to_wallet', { wallet: currentUser.id, amount: 10 })
        },
        theme: {
          color: "#000000",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      paymentObject.on("payment.failed", (response) => {
        // alert(response.error.code)
        // alert(response.error.description)
        toast({
          title: "Payment Failed",
          description: response.error.description,
          status: "error",
          duration: 3000,
          isClosable: false,
        });
        // alert(response.error.source)
        // alert(response.error.step)
        // alert(response.error.reason)
        // alert(response.error.metadata.order_id)
        // alert(response.error.metadata.payment_id)
      });
    };

    return (
      <>
        <Button
          size={"sm"}
          rounded="full"
          variant="primary"
          ref={btnRef}
          onClick={onOpen}
        >
          Add Money
        </Button>
        <Modal
          onClose={onClose}
          finalFocusRef={btnRef}
          isOpen={isOpen}
          scrollBehavior={"inside"}
          size={"xs"}
          motionPreset="slideInBottom"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Money</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              <HStack>
                <InputGroup>
                  <InputLeftElement
                    pointerEvents='none'
                    color='gray.400'
                    fontSize='1.2em'
                    children='₹'
                  />
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='Enter amount' />
                  <InputRightElement width='auto' overflow={'hidden'}>
                    {<SlideFade in={amount} offsetX='10px' offsetY='-8'>
                    <Button h='1.75rem' ml={0} m={1} size='sm' onClick={() => {onClose(); handleAddMoney(amount);}}>
                      {'Add Money'}
                    </Button></SlideFade>}
                  </InputRightElement>
                </InputGroup>
              </HStack>
            </ModalBody>
            <ModalFooter>
              <Button w={"full"} onClick={onClose} colorScheme="blackAlpha">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const getUserWallet = async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("id", currentUser.id)
      .single();
    return data;
  };

  const getTransactions = async () => {
    // const { data, error } = await supabase.from('transactions').select('*').eq('receiver', currentUser.id)
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        sender_username:profiles!transactions_sender_fkey(username),
        receiver_username:profiles!transactions_receiver_fkey(username)
      `)
      .or(`receiver.eq.${currentUser.id}, sender.eq.${currentUser.id}`);
    console.log('transactions', data, error)
    return data;
  };

  useEffect(() => {
    currentUser &&
      getUserWallet().then((e) => {
        setUserWallet(e);
      });
    currentUser &&
      getTransactions().then((e) => {
        setTransactions(e);
        console.log(e);
      });
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Box>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        Loading...
      </Box>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
      <Container maxW="container.lg" overflowX="auto" py={4}>
        {/* <chakra.pre p={4}>
        {currentUser && <pre> {JSON.stringify(currentUser, null, 2)}</pre>}
      </chakra.pre> */}

        <Box pt={5} textAlign={"center"}>
          <Text fontSize={"xl"}>Available Balance</Text>
          <Heading as="h2" size="2xl" style={{ wordSpacing: "-5px" }}>
            Rs. {userWallet?.balance == null ? 0 : userWallet.balance}
          </Heading>
        </Box>
        <HStack pt={2} spacing={2} justifyContent={"center"}>
          {/* <Button size={'sm'} rounded='full' variant='primary'>Send</Button> */}
          {/* <Button size={'sm'} rounded='full' variant='primary'>Receive</Button> */}
          <SendMoneyModal rerender={reRenderSendMoneyModal} onCallbackfn={setReRenderSendMoneyModal} />
          <ReceiveMoneyModal />
          <AddMoneyModal />
        </HStack>

        <Box pt={10} mb={2}>
          <Heading as="h4" size="md" fontWeight={"semibold"}>
            Transactions
          </Heading>
        </Box>
        <Box px={4} py={4} bg={"gray.100"} rounded={"2xl"}>
          <VStack alignItems={"left"} spacing={2}>
            {transactions.map((elem) => (
              <Flex key={elem.timestamp}>
                {elem.receiver == currentUser.id ? (
                  <Avatar
                    bg="blue.500"
                    icon={
                      <Icon
                        mt={"-5px"}
                        fontSize="1.25rem"
                        as={BsBoxArrowInDown}
                      />
                    }
                  />
                ) : (
                  <Avatar
                    bg="red.500"
                    icon={
                      <Icon mt={"-5px"} fontSize="1.25rem" as={BsBoxArrowUp} />
                    }
                  />
                )}
                <Box ml="3">
                  <Text fontWeight="bold">
                    {elem.receiver == currentUser.id ? (
                      <Badge mr="1" rounded='md' colorScheme="blue">Received</Badge>
                    ) : (
                      <Badge mr="1" rounded='md' colorScheme="red">Sent</Badge>
                    )}
                    {elem.receiver == currentUser.id ? "from" : "to"}{" "}
                    {elem.receiver == currentUser.id
                      ? elem.sender_username.username
                      : elem.receiver_username.username
                    }
                    {/* <Badge mr='1' colorScheme='red'>Sent</Badge>
                  to Raghav */}
                  </Text>
                  <Text ml="0.25" fontSize="sm" fontWeight="semibold">Rs. {elem.amount}</Text>
                </Box>
              </Flex>
            ))}
          </VStack>
        </Box>
      </Container>
    </>
  );
}
