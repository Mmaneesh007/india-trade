import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp } from 'lucide-react';
import api from '../api';

export default function SearchAutocomplete({ onSelect }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const fetchSuggestions = async (searchQuery) => {
        setLoading(true);
        try {
            const res = await api.get(`/api/search/${searchQuery}`);
            setSuggestions(res.data.slice(0, 5)); // Top 5 results
        } catch (error) {
            console.error('Search failed:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const saveRecentSearch = (symbol) => {
        const updated = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleSelect = (symbol) => {
        saveRecentSearch(symbol);
        setQuery('');
        setSuggestions([]);
        setShowDropdown(false);
        onSelect(symbol);
    };

    const handleKeyDown = (e) => {
        const items = query.length >= 2 ? suggestions : recentSearches;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                const symbol = typeof items[selectedIndex] === 'string'
                    ? items[selectedIndex]
                    : items[selectedIndex].symbol;
                handleSelect(symbol);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const displayItems = query.length >= 2 ? suggestions : recentSearches;

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search stocks..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-groww-primary/20 focus:border-groww-primary transition-all"
                />
            </div>

            {/* Dropdown */}
            {showDropdown && (query.length >= 2 || recentSearches.length > 0) && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-groww-primary mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            {query.length < 2 && recentSearches.length > 0 && (
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-b">
                                    Recent Searches
                                </div>
                            )}

                            {displayItems.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">
                                    {query.length >= 2 ? 'No stocks found' : 'Start typing to search'}
                                </div>
                            ) : (
                                <div>
                                    {displayItems.map((item, index) => {
                                        const isRecent = typeof item === 'string';
                                        const symbol = isRecent ? item : item.symbol;
                                        const name = isRecent ? symbol : item.longName || item.shortName || symbol;

                                        return (
                                            <button
                                                key={symbol}
                                                onClick={() => handleSelect(symbol)}
                                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selectedIndex === index ? 'bg-gray-100' : ''}`}
                                            >
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {symbol.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-gray-900 truncate">{symbol}</div>
                                                    {!isRecent && <div className="text-xs text-gray-500 truncate">{name}</div>}
                                                </div>
                                                {isRecent ? (
                                                    <Clock size={16} className="text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <TrendingUp size={16} className="text-groww-primary flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
