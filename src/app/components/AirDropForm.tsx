"use client"

import { useState, useMemo } from "react"
import { InputForm } from "./ui/InputField"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { formatEther } from "viem"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils/CalculateTotal/calculateTotal"
import { TokenDetails } from './ui/TokenDetails'

export default function AirDropForm() {
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const [isApproving, setIsApproving] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amount), [amount])
    const { data: hash, isPending, writeContractAsync } = useWriteContract()

    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if (!tSenderAddress) {
            alert("No tsender address found")
            return 0
        }

        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: 'allowance',
            args: [account.address, tSenderAddress as `0x${string}`],
        })

        return response as number
    }

    const handleSubmit = async () => {
        try {
            setIsSending(true)
            const tSenderAddress = chainsToTSender[chainId]["tsender"]
            const approvedAmount = await getApprovedAmount(tSenderAddress)

            if (approvedAmount < total) {
                // Caso 1: Necesitamos aprobar primero
                setIsApproving(true)
                const approvalHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'approve',
                    args: [tSenderAddress as `0x${string}`, BigInt(total)],
                })

                const approvalReceipt = await waitForTransactionReceipt(config, {
                    hash: approvalHash,
                })

                console.log("Approval Receipt", approvalReceipt)
                setIsApproving(false)

                // Después de aprobar, procedemos con el airdrop
                const airdropHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'airdropERC20',
                    args: [
                        tokenAddress,
                        recipient.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                        amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                        BigInt(total),
                    ],            
                })

                const airdropReceipt = await waitForTransactionReceipt(config, {
                    hash: airdropHash,
                })

                console.log("Airdrop Receipt", airdropReceipt)
                alert("¡Airdrop enviado con éxito!")
            } else {
                // Caso 2: Ya tenemos aprobación suficiente, procedemos directamente con el airdrop
                const airdropHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'airdropERC20',
                    args: [
                        tokenAddress,
                        recipient.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                        amount.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                        BigInt(total),
                    ],            
                })

                const airdropReceipt = await waitForTransactionReceipt(config, {
                    hash: airdropHash,
                })

                console.log("Airdrop Receipt", airdropReceipt)
                alert("¡Airdrop enviado con éxito!")
            }

        } catch (error) {
            console.error("Error en la operación:", error)
            alert("Ha ocurrido un error. Por favor, intente de nuevo.")
        } finally {
            setIsSending(false)
            setIsApproving(false)
        }

        
        
        
        console.log(tokenAddress)
        console.log(recipient)
        console.log(amount)
    }

    

    return (
        <form className="space-y-4 w-full max-w-md mx-auto">
            <InputForm
                label="Token Address"
                placeholder="0x..."
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                isAddress
                required
                storageKey="airdrop-token-address"
                isLoading={false}
                validationRules={[
                    {
                        type: 'address',
                        message: 'Por favor ingrese una dirección de token válida'
                    }
                ]}
            />
            <InputForm
                label="Recipient Address"
                placeholder="0x... (separados por comas o saltos de línea)"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                isAddress
                required
                large
                storageKey="airdrop-recipient-addresses"
                isLoading={isSending}
                validationRules={[
                    {
                        type: 'custom',
                        validator: (value) => {
                            const addresses = value.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== '');
                            return addresses.every(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));
                        },
                        message: 'Todas las direcciones deben ser válidas'
                    }
                ]}
            />
            <InputForm
                label="Amount"
                placeholder="Cantidad por destinatario (separados por comas o saltos de línea)"
                value={amount}
                type="text"
                onChange={e => setAmount(e.target.value)}
                required
                large
                storageKey="airdrop-amounts"
                isLoading={isSending}
                validationRules={[
                    {
                        type: 'custom',
                        validator: (value) => {
                            const amounts = value.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== '');
                            return amounts.every(amt => !isNaN(Number(amt)) && Number(amt) > 0);
                        },
                        message: 'Todas las cantidades deben ser números positivos'
                    }
                ]}
            />

            {/* Token Details Box - Ahora aparece como comprobación antes del botón */}
            {tokenAddress && recipient && amount && (
                <div className="mt-6">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Comprobación de Token:</h3>
                    <TokenDetails 
                        tokenAddress={tokenAddress}
                        className="transition-all duration-300 ease-in-out"
                    />
                </div>
            )}

            <button
                onClick={handleSubmit}
                type="submit"
                disabled={isSending || isApproving}
                className={`
                    w-full 
                    font-bold 
                    mt-5 
                    text-white 
                    py-2 
                    px-4 
                    rounded-md 
                    transition-colors
                    ${isSending || isApproving 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }
                `}
            >
                {isApproving 
                    ? 'Aprobando...' 
                    : isSending 
                        ? 'Enviando Airdrop...' 
                        : 'Enviar Airdrop'
                }
            </button>
        </form>
    )
}

