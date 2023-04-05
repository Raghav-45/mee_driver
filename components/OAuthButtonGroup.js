import { Button, ButtonGroup, VisuallyHidden } from '@chakra-ui/react'
import { GitHubIcon, GoogleIcon, TwitterIcon, AppleIcon } from './ProviderIcons'
import { useAuth } from '../contexts/AuthContext'

const providers = [
  {
    name: 'Google',
    icon: <GoogleIcon boxSize="5" />,
  },
  {
    name: 'Apple',
    icon: <AppleIcon boxSize="5" />,
  },
  {
    name: 'Twitter',
    icon: <TwitterIcon boxSize="5" />,
  },
]


export const OAuthButtonGroup = () => {
  const { signInWithGoogle} = useAuth()
  return (
  <ButtonGroup variant="outline" spacing="4" width="full">
    <Button key={'Google'} width="full" onClick={() => signInWithGoogle()} >
      <VisuallyHidden>Sign in with Google</VisuallyHidden>
      <GoogleIcon boxSize="5" />
    </Button>

    <Button key={'Apple'} width="full">
      <VisuallyHidden>Sign in with Apple</VisuallyHidden>
      <AppleIcon boxSize="5" />
    </Button>

    <Button key={'Twitter'} width="full">
      <VisuallyHidden>Sign in with Twitter</VisuallyHidden>
      <TwitterIcon boxSize="5" />
    </Button>
  </ButtonGroup>
)}