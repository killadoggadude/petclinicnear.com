import '../styles/globals.css'
import Layout from '../components/Layout' // Assuming Layout component exists

function MyApp({ Component, pageProps }) {
  // Wrap all pages with the Layout component
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp 