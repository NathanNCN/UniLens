'use client'

// Imports
import Display from './Display'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

function Header() {

    // Collects user data and handles login/logout
    const { user, logout, isAuthenticated, isLoading } = useAuth();

    //Variables for logins and logouts
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    //Function to handle google login
    const handleGoogleLogin = async () => {
        try {
            //Update hook
            setIsLoggingIn(true);
            
            // Store current page for redirect after login
            localStorage.setItem('auth_redirect', window.location.pathname);
            
            // Get the Google OAuth URL from backend
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/auth/google/login`, {
                credentials: 'include', // Include cookies for state
            });
            
            if (response.ok) {
                const data = await response.json();
                // Redirect to Google OAuth
                window.location.href = data.auth_url;
                
            } else {
                console.error('Failed to get Google OAuth URL');
                setIsLoggingIn(false);
            }
        } catch (error) {
            console.error('Error initiating Google login:', error);
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        // Reset state after logout completes (with the delay)
        setTimeout(() => {
            setIsLoggingOut(false);
        }, 1100); // Slightly longer than the logout delay
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 pt-20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-row justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <h1 className="text-4xl sm:text-3xl md:text-4xl font-bold text-emerald-800">UniLens</h1>
                    </div>
                    <div className="space-x-4 flex items-center">
                        {isLoading ? (
                            <div className="animate-pulse bg-emerald-200 h-8 w-20 rounded-full"></div>
                        ) : isAuthenticated && user ? (
                            <div className="flex items-center space-x-3">
                                <span className="text-emerald-700 text-sm hidden sm:inline">
                                    {user.name}
                                </span>
                                <button 
                                    onClick={handleLogout} 
                                    disabled={isLoggingOut}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isLoggingOut && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                        </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleGoogleLogin} 
                                disabled={isLoggingIn}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span>Sign in with Google</span>
                                    </>
                                )}
                        </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="container mx-auto mt-10 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <Display/>
                    <div className="order-first lg:order-last">
                        <img src="./images/mission.jpg" alt="Example" className="w-full h-auto max-w-[90%] mx-auto lg:ml-10 lg:w-[100%] lg:h-[100%] rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header