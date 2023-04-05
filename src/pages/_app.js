import { ChakraProvider } from '@chakra-ui/react'
import '@/styles/globals.css'
import AuthContextProvider from '../../contexts/AuthContext'

// 1. Import the extendTheme function
import { extendTheme } from '@chakra-ui/react'
import { Layout } from '../../components/Layout'

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  // brand: {
  //   900: '#1a365d',
  //   800: '#153e75',
  //   700: '#2a69ac',
  // },
}

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'red.400',
        }
      },
    },
  }
}

const theme = extendTheme({
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'black',
          textColor: 'white',
        },
        secondary: {
          bg: 'white',
          textColor: 'black',
        },
      },
    },
    toast: {
      variants: {
        information: props => ({
          color: mode( 'gray.800','white')(props),
          bg: "red",
        }),
      },
    },
  }
})

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <AuthContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthContextProvider>
    </ChakraProvider>
  )
}
