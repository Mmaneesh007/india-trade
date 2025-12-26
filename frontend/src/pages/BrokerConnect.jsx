import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { supabase } from '../supabaseClient';

export default function BrokerConnect() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedBroker, setSelectedBroker] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Angel One credentials
    const [angelCredentials, setAngelCredentials] = useState({
        clientId: '',
        password: '',
        totp: ''
    });

    // Paper trading settings
    const [paperSettings, setPaperSettings] = useState({
        initialBalance: 100000
    });

    const brokers = [
        {
            id: 'paper',
            name: 'Paper Trading',
            description: 'Practice with virtual money - No real trades',
            icon: '📝',
            color: 'from-green-500 to-emerald-600',
            isFree: true,
            recommended: true
        },
        {
            id: 'angelone',
            name: 'Angel One',
            description: 'Real trading with Angel One SmartAPI',
            icon: '🏦',
            color: 'from-orange-500 to-red-600',
            isFree: true,
            comingSoon: false
        },
        {
            id: 'zerodha',
            name: 'Zerodha',
            description: 'Kite Connect API integration',
            icon: '📊',
            color: 'from-blue-500 to-indigo-600',
            isFree: false,
            comingSoon: true
        },
        {
            id: 'upstox',
            name: 'Upstox',
            description: 'Upstox API v2 integration',
            icon: '📈',
            color: 'from-purple-500 to-pink-600',
            isFree: true,
            comingSoon: true
        }
    ];

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (user) {
            checkConnectionStatus();
        }
    }, [user]);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setUser(session.user);
        } else {
            navigate('/login');
        }
    };

    const checkConnectionStatus = async () => {
        try {
            const response = await api.get(`/broker/status/${user.id}`);
            setConnectionStatus(response.data);
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const connectPaperTrading = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post(`/broker/connect/paper/${user.id}`, {
                initialBalance: paperSettings.initialBalance
            });

            if (response.data.success) {
                setConnectionStatus({ connected: true, broker: 'paper' });
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const connectAngelOne = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post(`/broker/connect/angelone/${user.id}`, {
                clientId: angelCredentials.clientId,
                password: angelCredentials.password,
                totp: angelCredentials.totp
            });

            if (response.data.success) {
                setConnectionStatus({ connected: true, broker: 'angelone' });
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    const disconnect = async () => {
        setLoading(true);
        try {
            await api.post(`/broker/disconnect/${user.id}`);
            setConnectionStatus(null);
            setSelectedBroker(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Disconnect failed');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = () => {
        if (selectedBroker === 'paper') {
            connectPaperTrading();
        } else if (selectedBroker === 'angelone') {
            connectAngelOne();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold mb-4">
                        🔗 Connect Your Broker
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Choose a broker to start trading
                    </p>
                </motion.div>

                {/* Current Connection Status */}
                {connectionStatus?.connected && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-green-400">
                                    ✅ Connected to {connectionStatus.broker === 'paper' ? 'Paper Trading' : 'Angel One'}
                                </h3>
                                <p className="text-slate-400 mt-1">
                                    You're ready to trade
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                                <button
                                    onClick={disconnect}
                                    disabled={loading}
                                    className="px-6 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded-lg transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Broker Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {brokers.map((broker, index) => (
                        <motion.div
                            key={broker.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => !broker.comingSoon && setSelectedBroker(broker.id)}
                            className={`
                                relative p-6 rounded-xl cursor-pointer transition-all duration-300
                                ${broker.comingSoon ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                ${selectedBroker === broker.id
                                    ? 'ring-2 ring-indigo-500 bg-slate-700/50'
                                    : 'bg-slate-800/50 hover:bg-slate-700/30'}
                            `}
                        >
                            {broker.recommended && (
                                <span className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-xs font-bold rounded-full">
                                    RECOMMENDED
                                </span>
                            )}
                            {broker.comingSoon && (
                                <span className="absolute -top-2 -right-2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                                    COMING SOON
                                </span>
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`text-4xl p-3 rounded-xl bg-gradient-to-br ${broker.color}`}>
                                    {broker.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{broker.name}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{broker.description}</p>
                                    <div className="mt-3">
                                        <span className={`text-xs px-2 py-1 rounded ${broker.isFree ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                            {broker.isFree ? 'FREE' : 'PAID'}
                                        </span>
                                    </div>
                                </div>
                                {selectedBroker === broker.id && (
                                    <div className="text-indigo-400">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Connection Form */}
                <AnimatePresence mode="wait">
                    {selectedBroker && (
                        <motion.div
                            key={selectedBroker}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-800/50 rounded-xl p-6"
                        >
                            {selectedBroker === 'paper' && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">📝 Paper Trading Setup</h3>
                                    <p className="text-slate-400 mb-6">
                                        Start with virtual money to practice trading without risk.
                                    </p>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Initial Virtual Balance (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={paperSettings.initialBalance}
                                            onChange={(e) => setPaperSettings({ initialBalance: parseInt(e.target.value) || 100000 })}
                                            className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedBroker === 'angelone' && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">🏦 Angel One Login</h3>
                                    <p className="text-slate-400 mb-6">
                                        Enter your Angel One credentials to connect.
                                    </p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Client ID</label>
                                            <input
                                                type="text"
                                                placeholder="Your Angel One Client ID"
                                                value={angelCredentials.clientId}
                                                onChange={(e) => setAngelCredentials({ ...angelCredentials, clientId: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Password</label>
                                            <input
                                                type="password"
                                                placeholder="Your trading password"
                                                value={angelCredentials.password}
                                                onChange={(e) => setAngelCredentials({ ...angelCredentials, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">TOTP Code</label>
                                            <input
                                                type="text"
                                                placeholder="6-digit TOTP from authenticator app"
                                                value={angelCredentials.totp}
                                                onChange={(e) => setAngelCredentials({ ...angelCredentials, totp: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Connecting...
                                        </span>
                                    ) : (
                                        `Connect to ${selectedBroker === 'paper' ? 'Paper Trading' : 'Angel One'}`
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedBroker(null)}
                                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Section */}
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-800/30 rounded-xl p-6">
                        <div className="text-3xl mb-3">🔒</div>
                        <h4 className="font-semibold mb-2">Secure Connection</h4>
                        <p className="text-slate-400 text-sm">Your credentials are encrypted and never stored on our servers.</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-6">
                        <div className="text-3xl mb-3">⚡</div>
                        <h4 className="font-semibold mb-2">Real-Time Trading</h4>
                        <p className="text-slate-400 text-sm">Execute orders instantly through your broker's official API.</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-6">
                        <div className="text-3xl mb-3">📊</div>
                        <h4 className="font-semibold mb-2">Full Control</h4>
                        <p className="text-slate-400 text-sm">View positions, manage orders, and track P&L in real-time.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
