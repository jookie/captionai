import Head from "next/head";
import { NextPage } from "next";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

import ConvexClientProvider from "./api/ConvexClientProvider";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Photo BotCheck</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💭</text></svg>"
        />
      </Head>

      <div className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
          <ConvexClientProvider>
            <Navbar />
            <HeroSection />
            <Footer />
          </ConvexClientProvider>
        </div>
      </div>
    </>
  );
};

export default Home;
