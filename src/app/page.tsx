"use client"

import dynamic from "next/dynamic"

const HomeContent = dynamic(() => import("./components/homeContent"), {
    ssr: false,
})

function Page() {
  return <HomeContent />
   
}

export default Page;
