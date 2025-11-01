import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, RefreshCw, Key, Lock, Copy, Search, Shield, LogIn, UserPlus, LogOut } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL + "/secret/api";
const AUTH_BASE = import.meta.env.VITE_API_BASE_URL + "/auth/api";


const PasswordManager = () => {
    const [secrets, setSecrets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSecret, setSelectedSecret] = useState(null);
    const [showPassword, setShowPassword] = useState({});
    const [notification, setNotification] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

    // Form states
    const [createForm, setCreateForm] = useState({
        name: '',
        username: '',
        password: '',
        url: '',
        notes: ''
    });

    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });

    const [passwordOptions, setPasswordOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(''), 3000);
    };

    // Check if user is authenticated on load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const login = async () => {
        if (!authForm.email || !authForm.password) {
            showNotification('Email and password are required', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${AUTH_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: authForm.email,
                    password: authForm.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Fix: Use correct path for token and expiry
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('authExpiry', data.data.expiry);
                // No user data in response, so setUser to null
                localStorage.removeItem('userData');
                setIsAuthenticated(true);
                setUser(null);
                setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
                showNotification('Login successful');
                fetchSecrets();
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            showNotification('Login error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const register = async () => {
        if (!authForm.email || !authForm.password || !authForm.name) {
            showNotification('All fields are required', 'error');
            return;
        }

        if (authForm.password !== authForm.confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${AUTH_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: authForm.email,
                    password: authForm.password,
                    name: authForm.name
                })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Registration successful! Please login.');
                setAuthMode('login');
                setAuthForm({ email: authForm.email, password: '', confirmPassword: '', name: '' });
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            showNotification('Registration error', 'error');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
        setSecrets([]);
        setActiveView('list');
        showNotification('Logged out successfully');
    };

    const fetchSecrets = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE}/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setSecrets(data || []);
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            showNotification('Error fetching secrets', 'error');
        } finally {
            setLoading(false);
        }
    };

    const generatePassword = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE}/generatepassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordOptions)
            });

            if (response.ok) {
                const data = await response.json();
                setCreateForm(prev => ({ ...prev, password: data.password }));
                showNotification('Password generated successfully');
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            showNotification('Error generating password', 'error');
        }
    };

    const createSecret = async () => {
        if (!createForm.name || !createForm.password) {
            showNotification('Name and password are required', 'error');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(createForm)
            });

            if (response.ok) {
                showNotification('Secret created successfully');
                setCreateForm({ name: '', username: '', password: '', url: '', notes: '' });
                setActiveView('list');
                fetchSecrets();
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            showNotification('Error creating secret', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getSecretDetail = async (secretId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE}/secretdetail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id: secretId })
            });

            if (response.ok) {
                const data = await response.json();
                setSelectedSecret(data);
                setActiveView('detail');
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            showNotification('Error fetching secret details', 'error');
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showNotification('Copied to clipboard');
        } catch (error) {
            showNotification('Failed to copy', 'error');
        }
    };

    const togglePasswordVisibility = (id) => {
        setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredSecrets = secrets.filter(secret =>
        secret.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        secret.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isAuthenticated) {
            fetchSecrets();
        }
    }, [isAuthenticated]);

    // If not authenticated, show login/register form
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="w-full max-w-md mx-4">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Shield className="w-8 h-8 text-purple-400" />
                            <h1 className="text-4xl font-bold text-white">SecureVault</h1>
                        </div>
                        <p className="text-gray-300">Your secure password manager</p>
                    </div>

                    {/* Auth Form */}
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
                        <div className="flex mb-6">
                            <button
                                onClick={() => setAuthMode('login')}
                                className={`flex-1 py-2 px-4 rounded-l-lg transition-all ${
                                    authMode === 'login'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                <LogIn className="w-4 h-4 inline mr-2" />
                                Login
                            </button>
                            <button
                                onClick={() => setAuthMode('register')}
                                className={`flex-1 py-2 px-4 rounded-r-lg transition-all ${
                                    authMode === 'register'
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                            >
                                <UserPlus className="w-4 h-4 inline mr-2" />
                                Register
                            </button>
                        </div>

                        <div className="space-y-4">
                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={authForm.name}
                                        onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={authForm.email}
                                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.auth ? 'text' : 'password'}
                                        value={authForm.password}
                                        onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('auth')}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                    >
                                        {showPassword.auth ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? 'text' : 'password'}
                                            value={authForm.confirmPassword}
                                            onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Confirm your password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                        >
                                            {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={authMode === 'login' ? login : register}
                                disabled={loading}
                                className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                            >
                                {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Create Account')}
                            </button>
                        </div>
                    </div>

                    {/* Notification */}
                    {notification && (
                        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse ${
                            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                        } text-white`}>
                            {notification.message}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Shield className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-bold text-white">SecureVault</h1>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <p className="text-gray-300">Your secure password manager</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>Welcome, {user?.name || user?.email}</span>
                            <button
                                onClick={logout}
                                className="text-red-400 hover:text-red-300 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 flex gap-1">
                        <button
                            onClick={() => setActiveView('list')}
                            className={`px-6 py-2 rounded-md transition-all ${
                                activeView === 'list'
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <Lock className="w-4 h-4 inline mr-2" />
                            Secrets
                        </button>
                        <button
                            onClick={() => setActiveView('create')}
                            className={`px-6 py-2 rounded-md transition-all ${
                                activeView === 'create'
                                    ? 'bg-purple-500 text-white shadow-lg'
                                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                            }`}
                        >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Add Secret
                        </button>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse ${
                        notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    } text-white`}>
                        {notification.message}
                    </div>
                )}

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    {activeView === 'list' && (
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Your Secrets</h2>
                                <button
                                    onClick={fetchSecrets}
                                    disabled={loading}
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search secrets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Secrets Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSecrets.map((secret) => (
                                    <div
                                        key={secret.id}
                                        className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        onClick={() => getSecretDetail(secret.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-white truncate">{secret.name}</h3>
                                            <Key className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                        </div>
                                        <p className="text-gray-300 text-sm mb-2">{secret.username}</p>
                                        {secret.url && (
                                            <p className="text-gray-400 text-xs truncate">{secret.url}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredSecrets.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg">No secrets found</p>
                                    <p className="text-gray-500 text-sm">Create your first secret to get started</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'create' && (
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                            <h2 className="text-2xl font-bold text-white mb-6">Create New Secret</h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter secret name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={createForm.username}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, username: e.target.value }))}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Enter username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type={showPassword.create ? 'text' : 'password'}
                                                required
                                                value={createForm.password}
                                                onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('create')}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                            >
                                                {showPassword.create ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                                    <input
                                        type="url"
                                        value={createForm.url}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, url: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                                    <textarea
                                        value={createForm.notes}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveView('list')}
                                        className="px-6 py-3 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={createSecret}
                                        disabled={loading}
                                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Secret'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'detail' && selectedSecret && (
                        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">Secret Details</h2>
                                <button
                                    onClick={() => setActiveView('list')}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    ← Back to List
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={selectedSecret.name}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(selectedSecret.name)}
                                            className="p-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={selectedSecret.username}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(selectedSecret.username)}
                                            className="p-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type={showPassword.detail ? 'text' : 'password'}
                                                value={selectedSecret.password}
                                                readOnly
                                                className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                            />
                                            <button
                                                onClick={() => togglePasswordVisibility('detail')}
                                                className="absolute right-3 top-3 text-gray-400 hover:text-white"
                                            >
                                                {showPassword.detail ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(selectedSecret.password)}
                                            className="p-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {selectedSecret.url && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={selectedSecret.url}
                                                readOnly
                                                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                            />
                                            <button
                                                onClick={() => copyToClipboard(selectedSecret.url)}
                                                className="p-3 text-gray-400 hover:text-white transition-colors"
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedSecret.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                                        <textarea
                                            value={selectedSecret.notes}
                                            readOnly
                                            rows={3}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordManager;

