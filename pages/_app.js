import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Head from "../components/Head";
import "../styles/globals.css";
import "../styles/themes.css";
import { TerminalProvider } from "../contexts/TerminalContext";

function MyApp({ Component, pageProps }) {

  useEffect(() => {
    if (localStorage.getItem("theme")) {
      document.documentElement.setAttribute(
        "data-theme",
        localStorage.getItem("theme")
      );
    }
  }, []);

  return (
    <TerminalProvider>
      <Layout>
        <Head title={`Can Dağdeviren | ${pageProps.title}`} />
        <Component {...pageProps} />
      </Layout>
    </TerminalProvider>
  );
}

export default MyApp;
