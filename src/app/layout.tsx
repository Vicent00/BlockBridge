import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';
import { Header } from './components/Header';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ 
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-orbitron',
});

export const metadata = {
  title: 'BlockBridge',
  description: 'BlockBridge DApp',
  icons: {
    icon: '/V.png',
  },
};

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} font-orbitron`}>
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
