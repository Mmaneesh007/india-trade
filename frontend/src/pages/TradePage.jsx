import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, ChevronDown, Info } from 'lucide-react';
import api from '../api';
import { supabase } from '../supabaseClient';

export default function TradePage() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Trading state
    const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
    const [orderMode, setOrderMode] = useState('delivery'); // delivery, intraday, mtf
    const [exchange, setExchange] = useState('NSE'); // NSE or BSE
    const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
    const [quantity, setQuantity] = useState('');
    const [priceType, setPriceType] = useState('limit'); // limit or market
    const [price, setPrice] = useState('');
    const [balance, setBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(true);

    useEffect(() => {
        fetchStockData();
        checkUser();
    }, [symbol]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) fetchWalletBalance(user.id);
    };

    const fetchWalletBalance = async (userId) => {
        try {
            let { data, error } = await supabase
                .from('wallet')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (error && error.code === 'PGRST116') {
                // Wallet doesn't exist, create one with default funds
                const { data: newData, error: createError } = await supabase
                    .from('wallet')
                    .insert([{ user_id: userId, balance: 100000 }])
                    .select()
                    .single();

                if (createError) throw createError;
                data = newData;
            } else if (error) {
                throw error;
            }

            if (data) setBalance(parseFloat(data.balance));
        } catch (error) {
            console.error('Error fetching wallet:', error);
        } finally {
            setLoadingBalance(false);
        }
    };

    const fetchStockData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/movers/stock/${encodeURIComponent(symbol)}`);
            setStockData(res.data);
            setPrice(res.data.priceNSE?.toFixed(2) || '500');
        } catch (error) {
            console.error('Failed to fetch stock:', error);
            // Fallback data
            setStockData({
                symbol,
                name: symbol.replace('.NS', '').replace('.BO', ''),
                priceNSE: 500,
                priceBSE: 499.5,
                changePercent: 2.5,
            });
            setPrice('500');
        }
        setLoading(false);
    };

    const currentPrice = exchange === 'NSE' ? stockData?.priceNSE : stockData?.priceBSE;
    const approxRequired = quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '0';

    const handleExecuteOrder = async () => {
        if (!quantity || !price) {
            alert('Please enter quantity and price');
            return;
        }

        const qty = parseInt(quantity);
        const orderPrice = parseFloat(price);

        if (tradeType === 'BUY' && parseFloat(approxRequired) > balance) {
            alert('Insufficient balance!');
            return;
        }

        // Log transaction
        if (user) {
            try {
                await supabase.from('transactions').insert([{
                    user_id: user.id,
                    symbol: symbol,
                    type: tradeType,
                    quantity: qty,
                    price: orderPrice,
                    mode: orderMode,
                    exchange: exchange,
                    timestamp: new Date().toISOString()
                }]);
            } catch (err) {
                console.error('Failed to log transaction:', err);
            }
        }

        alert(`${tradeType} Order Placed!\n\n${qty} shares of ${stockData?.name}\n@ ₹${orderPrice}\nMode: ${orderMode.toUpperCase()}\nExchange: ${exchange}\nTotal: ₹${approxRequired}`);

        // Update balance logic
        let newBalance = balance;
        if (tradeType === 'BUY') {
            newBalance = balance - parseFloat(approxRequired);
        } else {
            newBalance = balance + parseFloat(approxRequired);
        }

        // Persist new balance
        if (user) {
            try {
                const { error } = await supabase
                    .from('wallet')
                    .update({ balance: newBalance, updated_at: new Date() })
                    .eq('user_id', user.id);

                if (error) throw error;
                setBalance(newBalance);
            } catch (err) {
                console.error('Failed to update balance:', err);
                alert('Failed to update wallet balance. Please check your connection.');
                return;
            }
        } else {
            setBalance(newBalance); // Fallback for guest (though button is disabled for guest usually)
        }

        setQuantity('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-gray-900">{stockData?.name}</h1>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`font-medium ${stockData?.changePercent >= 0 ? 'text-groww-primary' : 'text-red-500'}`}>
                                NSE ₹{stockData?.priceNSE?.toFixed(2)} ({stockData?.changePercent >= 0 ? '+' : ''}{stockData?.changePercent?.toFixed(2)}%)
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500">BSE ₹{stockData?.priceBSE?.toFixed(2)}</span>
                            <button className="text-groww-primary font-medium text-xs">Depth</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 max-w-md">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* BUY / SELL Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setTradeType('BUY')}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${tradeType === 'BUY'
                                ? 'text-groww-primary border-b-2 border-groww-primary bg-green-50/50'
                                : 'text-gray-400'
                                }`}
                        >
                            BUY
                        </button>
                        <button
                            onClick={() => setTradeType('SELL')}
                            className={`flex-1 py-4 text-center font-bold text-lg transition-colors ${tradeType === 'SELL'
                                ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
                                : 'text-gray-400'
                                }`}
                        >
                            SELL
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Order Mode */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOrderMode('delivery')}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${orderMode === 'delivery'
                                    ? 'border-gray-900 bg-white text-gray-900'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                Delivery
                            </button>
                            <button
                                onClick={() => setOrderMode('intraday')}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${orderMode === 'intraday'
                                    ? 'border-gray-900 bg-white text-gray-900'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                Intraday
                            </button>
                            <button
                                onClick={() => setOrderMode('mtf')}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${orderMode === 'mtf'
                                    ? 'border-gray-900 bg-white text-gray-900'
                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                MTF 3.13x
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Settings size={20} />
                            </button>
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <button
                                        onClick={() => setShowExchangeDropdown(!showExchangeDropdown)}
                                        className="flex items-center gap-1 text-gray-700 font-medium"
                                    >
                                        Qty {exchange} <ChevronDown size={16} />
                                    </button>
                                    {showExchangeDropdown && (
                                        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 min-w-[100px]">
                                            <button
                                                onClick={() => { setExchange('NSE'); setShowExchangeDropdown(false); setPrice(stockData?.priceNSE?.toFixed(2)); }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${exchange === 'NSE' ? 'text-groww-primary font-medium' : 'text-gray-700'}`}
                                            >
                                                NSE
                                            </button>
                                            <button
                                                onClick={() => { setExchange('BSE'); setShowExchangeDropdown(false); setPrice(stockData?.priceBSE?.toFixed(2)); }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${exchange === 'BSE' ? 'text-groww-primary font-medium' : 'text-gray-700'}`}
                                            >
                                                BSE
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="Enter quantity"
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-right text-lg font-medium focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
                            />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="relative">
                                    <button className="flex items-center gap-1 text-gray-700 font-medium">
                                        Price {priceType.charAt(0).toUpperCase() + priceType.slice(1)} <ChevronDown size={16} />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-right text-lg font-medium focus:outline-none focus:ring-2 focus:ring-groww-primary focus:border-transparent"
                            />
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Info size={12} />
                                <span>LTP: ₹{currentPrice?.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Balance & Approx */}
                        <div className="flex justify-between items-center py-4 border-t border-gray-100 text-sm">
                            <div>
                                <span className="text-gray-500">Balance : </span>
                                <span className="font-medium text-gray-900">₹{balance.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Approx req. : </span>
                                <span className="font-medium text-gray-900">₹{parseFloat(approxRequired).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <button
                            onClick={handleExecuteOrder}
                            disabled={!quantity || !price}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${tradeType === 'BUY'
                                ? 'bg-groww-primary hover:bg-green-600 disabled:bg-gray-300'
                                : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-300'
                                } disabled:cursor-not-allowed`}
                        >
                            {tradeType === 'BUY' ? 'Buy' : 'Sell'}
                        </button>
                    </div>
                </div>

                {/* Stock Info Card */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Stock Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">52W High</span>
                            <div className="font-medium text-gray-900">₹{stockData?.week52High}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">52W Low</span>
                            <div className="font-medium text-gray-900">₹{stockData?.week52Low}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">Market Cap</span>
                            <div className="font-medium text-gray-900">{stockData?.marketCap}</div>
                        </div>
                        <div>
                            <span className="text-gray-500">P/E Ratio</span>
                            <div className="font-medium text-gray-900">{stockData?.pe}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
