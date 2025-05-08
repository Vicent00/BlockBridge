/**
 * AirDropForm Component
 * 
 * A form component for handling token airdrops on the blockchain.
 * Supports token approval and distribution to multiple recipients.
 * 
 * Features:
 * - Token address input with validation
 * - Multiple recipient addresses
 * - Amount distribution
 * - Automatic token approval
 * - Transaction handling
 * - Loading states
 * - Error handling
 */

"use client"

import { useState, useMemo } from "react"
import { InputForm } from "./ui/InputField"
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants"
import { formatEther, parseEther } from "viem"
import { useChainId, useConfig, useAccount, useWriteContract } from "wagmi"
import { readContract, waitForTransactionReceipt } from "@wagmi/core"
import { calculateTotal } from "@/utils/CalculateTotal/calculateTotal"
import { TokenDetails } from './ui/TokenDetails'

/**
 * AirDropForm Component
 * 
 * @returns React component for handling token airdrops
 */
export default function AirDropForm() {
    // State management
    const [tokenAddress, setTokenAddress] = useState("")
    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const [amountUnit, setAmountUnit] = useState<'wei' | 'ether'>('ether')
    const [isApproving, setIsApproving] = useState(false)
    const [isSending, setIsSending] = useState(false)

    // Blockchain hooks
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()
    const total: number = useMemo(() => calculateTotal(amount), [amount])
    const { data: hash, isPending, writeContractAsync } = useWriteContract()

    /**
     * Gets the approved amount for the token
     * @param tSenderAddress - The address of the token sender contract
     * @returns Promise<number> - The approved amount
     */
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

    /**
     * Handles the form submission
     * Manages token approval and airdrop process
     */
    const handleSubmit = async () => {
        try {
            setIsSending(true)
            const tSenderAddress = chainsToTSender[chainId]["tsender"]
            const approvedAmount = await getApprovedAmount(tSenderAddress)

            // Convert amounts based on selected unit
            const amounts = amount.split(/[,\n]+/)
                .map(amt => amt.trim())
                .filter(amt => amt !== '')
                .map(amt => {
                    return amountUnit === 'ether' 
                        ? parseEther(amt) // Convert ether to wei
                        : BigInt(amt); // Keep as wei
                });

            const totalAmount = amounts.reduce((acc, val) => acc + val, BigInt(0));

            if (approvedAmount < totalAmount) {
                // Case 1: Need to approve first
                setIsApproving(true)
                const approvalHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'approve',
                    args: [tSenderAddress as `0x${string}`, totalAmount],
                })

                const approvalReceipt = await waitForTransactionReceipt(config, {
                    hash: approvalHash,
                })

                console.log("Approval Receipt", approvalReceipt)
                setIsApproving(false)

                // After approval, proceed with airdrop
                const airdropHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'airdropERC20',
                    args: [
                        tokenAddress,
                        recipient.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                        amounts,
                        totalAmount,
                    ],            
                })

                const airdropReceipt = await waitForTransactionReceipt(config, {
                    hash: airdropHash,
                })

                console.log("Airdrop Receipt", airdropReceipt)
                alert("Airdrop sent successfully!")
            } else {
                // Case 2: Already have sufficient approval, proceed directly with airdrop
                const airdropHash = await writeContractAsync({
                    abi: erc20Abi,
                    address: tokenAddress as `0x${string}`,
                    functionName: 'airdropERC20',
                    args: [
                        tokenAddress,
                        recipient.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                        amounts,
                        totalAmount,
                    ],            
                })

                const airdropReceipt = await waitForTransactionReceipt(config, {
                    hash: airdropHash,
                })

                console.log("Airdrop Receipt", airdropReceipt)
                alert("Airdrop sent successfully!")
            }

        } catch (error) {
            console.error("Operation error:", error)
            alert("An error occurred. Please try again.")
        } finally {
            setIsSending(false)
            setIsApproving(false)
        }
    }

    // Add this function after the other state declarations
    const clearForm = () => {
        // Clear state
        setTokenAddress("");
        setRecipient("");
        setAmount("");
        
        // Clear localStorage
        localStorage.removeItem("airdrop-token-address");
        localStorage.removeItem("airdrop-recipient-addresses");
        localStorage.removeItem("airdrop-amounts");

        // Force a re-render of the form
        window.location.reload();
    };

    return (
        <form className="space-y-4 w-full max-w-md mx-auto">
            {/* Token Address Input */}
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
                        message: 'Please enter a valid token address'
                    }
                ]}
            />

            {/* Recipient Addresses Input */}
            <InputForm
                label="Recipient Address"
                placeholder="0x... (separated by commas or new lines)"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                isAddress
                required
                large
                storageKey="airdrop-recipient-addresses"
                isLoading={false}
                validationRules={[
                    {
                        type: 'custom',
                        validator: (value) => {
                            if (!value) return true; // Allow empty value for editing
                            const addresses = value.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== '');
                            return addresses.every(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));
                        },
                        message: 'All addresses must be valid'
                    }
                ]}
            />

            {/* Amount Input */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-zinc-800 font-medium text-sm tracking-wide">
                        Amount
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-zinc-600">Unit:</span>
                        <select
                            value={amountUnit}
                            onChange={(e) => setAmountUnit(e.target.value as 'wei' | 'ether')}
                            className="
                                text-sm
                                bg-zinc-600
                                border border-zinc-300
                                rounded-md
                                px-2 py-1
                                focus:outline-none
                                focus:ring-2
                                focus:ring-indigo-500
                            "
                        >
                            <option value="ether">ETH</option>
                            <option value="wei">Wei</option>
                        </select>
                    </div>
                </div>
                <InputForm  
                    label=""
                    placeholder={`Amount per recipient in ${amountUnit} (separated by commas or new lines)`}
                    value={amount}
                    type="text"
                    onChange={e => setAmount(e.target.value)}
                    required
                    large
                    storageKey="airdrop-amounts"
                    isLoading={false}
                    validationRules={[
                        {
                            type: 'custom',
                            validator: (value) => {
                                if (!value) return true;
                                const amounts = value.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== '');
                                return amounts.every(amt => {
                                    const num = Number(amt);
                                    if (isNaN(num)) return false;
                                    if (amountUnit === 'wei') {
                                        return Number.isInteger(num) && num >= 0;
                                    }
                                    return num > 0;
                                });
                            },
                            message: amountUnit === 'wei' 
                                ? 'All amounts must be valid non-negative integers' 
                                : 'All amounts must be valid positive numbers'
                        }
                    ]}
                />
                <p className="text-sm text-zinc-500 mt-1">
                    {amountUnit === 'wei' 
                        ? 'Enter amounts in wei (1 ETH = 10^18 wei)'
                        : 'Enter amounts in ETH (e.g., 1.5 for 1.5 ETH)'
                    }
                </p>
            </div>

            {/* Token Details Display */}
            {tokenAddress && recipient && amount && (
                <div className="mt-6">
                    <h3 className="text-zinc-400 text-sm font-medium mb-2">Token Check:</h3>
                    <TokenDetails 
                        tokenAddress={tokenAddress}
                        className="transition-all duration-300 ease-in-out"
                    />
                </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 mt-5">
                <button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={isSending || isApproving}
                    className={`
                        flex-1
                        font-bold 
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
                        ? 'Approving...' 
                        : isSending 
                            ? 'Sending Airdrop...' 
                            : 'Send Airdrop'
                    }
                </button>

                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        clearForm();
                    }}
                    className="
                        px-4
                        py-2
                        font-bold
                        text-gray-700
                        bg-gray-200
                        rounded-md
                        hover:bg-gray-300
                        transition-colors
                    "
                >
                    Clear Form
                </button>
            </div>
        </form>
    )
}

