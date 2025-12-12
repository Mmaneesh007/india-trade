import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Smartphone, ArrowRight, Activity, DollarSign } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Nav */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-groww-primary rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">IndiaTrade</span>
                    </div>
                    <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                        <a href="#" className="hover:text-groww-primary">Products</a>
                        <a href="#" className="hover:text-groww-primary">Pricing</a>
                        <a href="#" className="hover:text-groww-primary">Learn</a>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/login')} className="text-gray-900 font-medium hover:text-groww-primary">Login</button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-groww-primary hover:bg-green-600 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>

                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Invest in <br />
                        <span className="text-groww-primary">Stocks & Mutual Funds</span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                        Trusted by millions of Indians. Start investing with as low as ₹100. zero brokerage on equity delivery.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-groww-primary hover:bg-green-600 text-white text-lg px-10 py-4 rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            Start Investing <ArrowRight size={20} />
                        </button>
                        <button className="text-gray-600 font-medium px-8 py-4 border border-gray-200 rounded-xl hover:bg-gray-50">
                            Download App
                        </button>
                    </div>
                </div>

                {/* Mock UI Showcase */}
                <div className="container mx-auto px-6 mt-20 relative">
                    <div className="absolute inset-0 bg-groww-primary blur-[100px] opacity-10 rounded-full z-0 h-64 w-2/3 mx-auto top-20"></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-5xl mx-auto transform perspective-1000 rotate-x-6">
                        <div className="bg-gray-50 border-b border-gray-100 h-10 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <img src="https://assets.groww.in/website-assets/prod/v1/screenshots/dashboard_light.png" alt="Dashboard" className="w-full opacity-90" />
                        {/* If you don't have an image, we can just use a div placeholder or text, but user wants 'big brand' feel */}
                        <div className="p-20 text-center bg-gray-50">
                            <div className="text-groww-primary font-bold text-2xl">Interactive Real-Time Dashboard</div>
                            <div className="text-gray-400">Live NIFTY 50 • Candlestick Charts • Instant Order Execution</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<Shield className="text-groww-primary w-8 h-8" />}
                            title="100% Safe & Secure"
                            desc="256-bit encryption and regulated by SEBI standards."
                        />
                        <FeatureCard
                            icon={<DollarSign className="text-groww-primary w-8 h-8" />}
                            title="0% Brokerage"
                            desc="Zero fees on equity delivery and direct mutual funds."
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-groww-primary w-8 h-8" />}
                            title="Lightning Fast"
                            desc="Execute trades in milliseconds on our optimized platform."
                        />
                    </div>
                </div>
            </section>

            <footer className="bg-white border-t border-gray-100 py-12 text-center text-gray-500 text-sm">
                <p>&copy; 2025 IndiaTrade Financial Services. All rights reserved.</p>
                <div className="flex justify-center gap-6 mt-4">
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Sitemap</a>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{title}</h3>
            <p className="text-gray-500 leading-relaxed">{desc}</p>
        </div>
    )
}
