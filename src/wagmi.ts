'use client'

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  zksync,
  mainnet,
  optimism,
  anvil,
  sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [
    mainnet,
    anvil,
    optimism,
    arbitrum,
    zksync,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  ssr: true,
});
