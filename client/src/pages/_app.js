import '../styles/globals.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>CollegeRAG_AI - AI-Powered College Information Assistant</title>
        <meta
          name="description"
          content="Official AI-powered College Information Assistant with grounded vector retrieval, document citations, and real-time streaming."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
