"use client"
import { useAccount } from "wagmi"
import AirDropForm from "./AirDropForm"

export default function HomeContent() {
    const { isConnected } = useAccount()

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-4">
            {!isConnected ? (
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to Token Sender</h2>
                    <p className="text-gray-600">Please connect your wallet to start sending tokens</p>
                </div>
            ) : (
                <AirDropForm />
            )}
        </main>
    )
}