import React, { useState } from 'react';
import { X, Wallet, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function AddFundsModal({ isOpen, onClose, userId, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleAddFunds = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Fetch current balance
            const { data: currentWallet, error: fetchError } = await supabase
                .from('wallet')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (fetchError) throw fetchError;

            // 2. Update balance
            const newBalance = (parseFloat(currentWallet.balance) || 0) + parseFloat(amount);

            const { error: updateError } = await supabase
                .from('wallet')
                .update({ balance: newBalance, updated_at: new Date() })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            setSuccess(true);
            if (onSuccess) onSuccess(newBalance);

            setTimeout(() => {
                setSuccess(false);
                setAmount('');
                onClose();
            }, 2000);

        } catch (error) {
            console.error('Add funds failed:', error);
            alert('Failed to add funds. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="text-groww-primary" size={24} />
                        Add Funds
                    </h2>
                    <div className="text-[10px] text-gray-500 mt-1">
                        Note: This adds virtual money to your <span className="font-semibold text-gray-700">Demo Wallet</span>.
                        <br />For Real Trading, manage funds in your Angel One app.
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Payment Successful!</h3>
                            <p className="text-gray-500">Funds added to your wallet successfully.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleAddFunds} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                                    <input
                                        type="number"
                                        min="100"
                                        max="1000000"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 text-lg font-bold text-gray-900 bg-gray-50 border-2 border-transparent focus:border-groww-primary/50 focus:bg-white rounded-xl outline-none transition-all"
                                        placeholder="0.00"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <button type="button" onClick={() => setAmount('1000')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">+1,000</button>
                                    <button type="button" onClick={() => setAmount('5000')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">+5,000</button>
                                    <button type="button" onClick={() => setAmount('10000')} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600 font-medium">+10,000</button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !amount}
                                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-groww-primary/30 transition-all transform active:scale-95 ${loading || !amount ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-groww-primary hover:bg-green-600'}`}
                            >
                                {loading ? 'Processing...' : `Add ₹${amount || '0'}`}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
