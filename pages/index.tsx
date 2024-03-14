"use client";

import Head from "next/head";
import { NextPage } from "next";

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import React from "react";
import Chat from "../components/chat0";


// console.log(import.meta.env.VITE_CONVEX_URL)
import { ConvexProvider, ConvexReactClient } from "convex/react";
const VITE_CONVEX_URL = "https://aromatic-bass-805.convex.cloud"
const convex = new ConvexReactClient(VITE_CONVEX_URL);
// const apiKey = process.env.OPENAI_API_KEY!;
// const OrganizationID = process.env.OPENAI_API_ORG_ID;
// if (!apiKey) {
//   throw new Error(
//     "Missing OPENAI_API_KEY in environment variables.\n" +
//     "Set it in the project settings in the Convex dashboard:\n" +
//     "    npx convex dashboard\n or https://dashboard.convex.dev"
//   );
// }

// import dotenv from 'dotenv';
// dotenv.config();
// const convexUrl = process.env.VITE_CONVEX_URL;
// if (!convexUrl) {
// throw new Error("VITE_CONVEX_URL is not defined in the environment variables.");
// Now you can use 'convexUrl' in your application
// console.log("Convex URL:", convexUrl);
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
           <React.StrictMode>
            <ConvexProvider client={convex}>
              <Navbar />
              <Chat />
              
              
            <HeroSection />
            <Footer />
            </ConvexProvider>
            </React.StrictMode>
        </div>
      </div>
    </>
  );
};

export default Home;
