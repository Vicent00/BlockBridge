"use client"
import { useAccount } from "wagmi"
import AirDropForm from "./AirDropForm"

export default function HomeContent() {
    const { isConnected } = useAccount()

    return (
        <main>
                    <AirDropForm />
              
        </main>
    )
}