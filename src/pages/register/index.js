import {
  chakra,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Logo } from '../../../components/Logo'
import { OAuthButtonGroup } from '../../../components/OAuthButtonGroup'
import { PasswordField } from '../../../components/PasswordField'
import { useRouter } from 'next/router'

import { useState, useEffect, useRef } from 'react'
import useMounted from '../../../hooks/useMounted'
import { supabase } from './../../../lib/supabaseClient'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()
  const mounted = useMounted()

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast({
        description: 'Credentials not valid.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      return
    }
    // your register logic here
    setIsSubmitting(true)

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: name,
          is_driver: true,
        },
      },
    })

    if (error) {
      toast({
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      mounted.current && setIsSubmitting(false)
      return
    }

    // TODO: Add Error Handling
    toast({
      title: 'Account created.',
      description: "We've created account for you.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    router.replace('/')

    mounted.current && setIsSubmitting(false)

    // register(email, password)
    //   .then(async res => {
    //     await updateProfile(res.user, { displayName: name })
    //     await setDoc(doc(db, "UserDetails", res.user.uid), {
    //       Email: res.user.email,
    //       PhotoURL: res.user.photoURL,
    //       DisplayName: name,
    //       uid: res.user.uid
    //     })

    //     toast({
    //       title: 'Account created.',
    //       description: "We've created account for you.",
    //       status: 'success',
    //       duration: 3000,
    //       isClosable: true,
    //     })
    //     router.replace('/profile')
    //   })
    //   .catch(error => {
    //     console.log(error.message)
    //     toast({
    //       description: error.message,
    //       status: 'error',
    //       duration: 9000,
    //       isClosable: true,
    //     })
    //   })
    //   .finally(() => {
    //     mounted.current && setIsSubmitting(false)
    //   })
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6">
          <Logo color='blue.500' />
          <Stack spacing={{ base: '2', md: '3' }} textAlign="center">
            <Heading size={{ base: 'lg', md: 'lg' }}>
              Create your account
            </Heading>
            <HStack spacing="1" justify="center">
              <Text color="muted">Have an account?</Text>
              <Button variant="link" colorScheme="blue" onClick={() => router.replace('/login')}>
                Sign in
              </Button>
            </HStack>
          </Stack>
        </Stack>
        <Box py={{ base: '0', sm: '8' }} px={{ base: '4', sm: '10' }} bg={{ base: 'transparent', sm: 'bg-surface' }} boxShadow={{ base: 'none', sm: 'md' }} borderRadius={{ base: 'none', sm: 'xl' }}>
          <chakra.form onSubmit={handleRegister}>
            <Stack spacing="6">
              <Stack spacing="5">
                <FormControl>
                  <FormLabel htmlFor="Name">Name</FormLabel>
                  <Input id="Name" type="text" autoComplete='name' value={name} onChange={e => setName(e.target.value)} />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input id="email" type="email" autoComplete='email' value={email} onChange={e => setEmail(e.target.value)} />
                </FormControl>
                <PasswordField autoComplete='password' value={password} onChange={e => setPassword(e.target.value)} />
              </Stack>
              <HStack justify="space-between">
                <Checkbox defaultChecked>Remember me</Checkbox>
                <Button variant="link" colorScheme="blue" size="sm">
                  Forgot password?
                </Button>
              </HStack>
              <Stack spacing="6">
                <Button type='submit' colorScheme='blue' isLoading={isSubmitting}>Register</Button>
                <HStack>
                  <Divider />
                  <Text fontSize="sm" whiteSpace="nowrap" color="muted">
                    or continue with
                  </Text>
                  <Divider />
                </HStack>
                <OAuthButtonGroup />
              </Stack>
            </Stack>
          </chakra.form>
        </Box>
      </Stack>
    </Container>
  )
}
