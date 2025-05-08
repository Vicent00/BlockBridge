'use client';


export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
           
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-zinc-900 mb-4">
                        About BlockBridge
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
                        Revolutionizing token distribution with secure and efficient airdrops
                    </p>
                </div>

                {/* Mission Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                    <h2 className="text-2xl font-semibold text-zinc-900 mb-4">Our Mission</h2>
                    <p className="text-zinc-600 leading-relaxed">
                        At BlockBridge, we're committed to simplifying the process of token distribution through 
                        secure and efficient airdrops. Our platform provides a seamless experience for projects 
                        looking to distribute their tokens to their community members.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-2">Secure Distribution</h3>
                        <p className="text-zinc-600">
                            Built with security in mind, ensuring safe token transfers to your community.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-2">Efficient Process</h3>
                        <p className="text-zinc-600">
                            Streamlined airdrop process that saves time and reduces gas costs.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 mb-2">User-Friendly</h3>
                        <p className="text-zinc-600">
                            Intuitive interface designed for both beginners and experienced users.
                        </p>
                    </div>
                </div>

                {/* Team Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-semibold text-zinc-900 mb-6">Our Team</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-xl font-semibold text-indigo-600">VA</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900">Vicente Aguilar</h3>
                                <p className="text-indigo-600 mb-2">Founder & Developer</p>
                                <p className="text-zinc-600">
                                    Blockchain enthusiast and full-stack developer with a passion for creating 
                                    innovative solutions in the Web3 space.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
