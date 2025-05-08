import React from 'react';
import { useReadContract } from 'wagmi';
import { erc20Abi } from '@/constants';

interface TokenDetailsProps {
    tokenAddress: string;
    className?: string;
}

export function TokenDetails({ tokenAddress, className = '' }: TokenDetailsProps) {
    const { data: name, isLoading: isLoadingName } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'name',
    });

    const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'symbol',
    });

    const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
    });

    if (!tokenAddress || isLoadingName || isLoadingSymbol || isLoadingDecimals) {
        return (
            <div className={`
                mt-4 p-4 
                bg-gradient-to-br from-zinc-900/50 to-zinc-800/50
                backdrop-blur-sm
                border-2 border-zinc-700/50
                rounded-xl
                ${className}
            `}>
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-zinc-700/50 rounded w-1/4"></div>
                    <div className="space-y-2">
                        <div className="h-3 bg-zinc-700/50 rounded"></div>
                        <div className="h-3 bg-zinc-700/50 rounded"></div>
                        <div className="h-3 bg-zinc-700/50 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!name || !symbol) {
        return null;
    }

    return (
        <div className={`
            mt-4 p-4 
            bg-gradient-to-br from-zinc-900/50 to-zinc-800/50
            backdrop-blur-sm
            border-2 border-zinc-700/50
            rounded-xl
            transition-all duration-300 ease-in-out
            hover:border-indigo-500/50
            ${className}
        `}>
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Token Details</h3>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Name:</span>
                    <span className="text-zinc-100 font-medium">{name?.toString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Symbol:</span>
                    <span className="text-zinc-100 font-medium">{symbol?.toString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Decimals:</span>
                    <span className="text-zinc-100 font-medium">{decimals?.toString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Address:</span>
                    <span 
                        className="text-zinc-100 font-mono text-sm cursor-pointer hover:text-indigo-400 transition-colors"
                        onClick={() => {
                            navigator.clipboard.writeText(tokenAddress);
                            // Aquí podrías añadir un toast o notificación
                        }}
                        title="Click to copy"
                    >
                        {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                    </span>
                </div>
            </div>
        </div>
    );
}
