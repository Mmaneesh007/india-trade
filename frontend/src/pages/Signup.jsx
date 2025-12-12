import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TrendingUp, Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();

    // Form State
    const [step, setStep] = useState('register'); // 'register' | 'verify'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    // Step 1: Register (Trigger OTP)
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Call Supabase SignUp
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // If successful, data.user is created but mostly likely not confirmed.
            // We move to step 2 to ask for OTP.
            setMsg(`OTP sent to ${email}. Please check your inbox.`);
            setStep('verify');
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup'
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            // Success! Account verified and logged in.
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

            {/* Header */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-12 h-12 bg-groww-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-white w-7 h-7" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {step === 'register' ? 'Create Account' : 'Verify Email'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    {step === 'register' ? 'Start your investment journey today' : `Enter the code sent to ${email}`}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-2xl sm:px-10 border border-gray-100">

                    {/* STEP 1: REGISTER FORM */}
                    {step === 'register' && (
                        <form className="space-y-6" onSubmit={handleRegister}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-groww-primary focus:border-groww-primary sm:text-sm"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Create Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-groww-primary focus:border-groww-primary sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4 flex gap-3 text-sm text-red-700">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-groww-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-groww-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Sending OTP...' : 'Continue'} <ArrowRight size={16} className="ml-2" />
                            </button>
                        </form>
                    )}

                    {/* STEP 2: VERIFY FORM */}
                    {step === 'verify' && (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div className="rounded-md bg-green-50 p-4 flex gap-3 text-sm text-green-700 mb-4">
                                <CheckCircle size={20} className="shrink-0" />
                                <span>OTP sent successfully!</span>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                    Enter Verification Code
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-groww-primary focus:border-groww-primary sm:text-sm tracking-widest font-mono"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 p-4 flex gap-3 text-sm text-red-700">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-groww-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-groww-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep('register')}
                                    className="text-sm text-groww-primary hover:underline"
                                >
                                    Wrong email? Go back
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'register' && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    to="/login"
                                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
