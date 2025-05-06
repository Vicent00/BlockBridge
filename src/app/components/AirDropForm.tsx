"use client"

import { useState, useMemo } from "react"
import { InputForm } from "./ui/InputField"
import { useAccount } from "wagmi"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { formatEther } from "viem"
import { useChainId, useConfig } from "wagmi"
import { readContract } from "@wagmi/core"
import { calculateTotal } from "@/utils/CalculateTotal/calculateTotal"


export default function AirDropForm() {

    const [tokenAddress, setTokenAddress] = useState("")
    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amount), [amount])



async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {

    if (!tSenderAddress) {
        alert("No tsender address found")
        return 0
    }
    // Read from the chain to see if we have already approved the tsender contract to send our tokens

    const response = await readContract(config, {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: 'allowance',
        args: [account.address, tSenderAddress as `0x${string}`],
      })

      // token.allowance(account.address, tsenderAddress)

      return response as number
   
}


    // function to send airdrop

    const handleSubmit = async () => {
        // 1a. If already approved, moved to step2
        // 1b. Approve our tsender contract to send our tokens
        // 2. Send airdrop
        // 3.Wait for the transaction to be mined
        // 4. If the transaction is successful, show a success message
        // 5. If the transaction is not successful, show an error message

        const tSenderAddress = chainsToTSender[chainId]["tsender"]
        const approvedAmount = await getApprovedAmount(tSenderAddress)

        
        
        
        console.log(tokenAddress)
        console.log(recipient)
        console.log(amount)
    }

    

    return (
        <form className="space-y-4 w-full max-w-md mx-auto">
            <InputForm
                label="Token Address"
                placeholder="Enter token address"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            <InputForm
                label="Recipient Address"
                placeholder="Enter recipient address"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
            />
            <InputForm
                label="Amount"
                placeholder="Enter amount"
                value={amount}
                type="number"
                onChange={e => setAmount(e.target.value)}
            />
            <button
                onClick={handleSubmit}
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
                Send Airdrop
            </button>
        </form>
    )
}

