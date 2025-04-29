import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://rpc.ankr.com" />
        <link rel="preconnect" href="https://api.birdeye.so" />
        <link rel="preconnect" href="https://etherscan.io" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
