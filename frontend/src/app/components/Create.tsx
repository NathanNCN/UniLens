'use client'

// Imports
import { useEffect, useState } from 'react';
import { createApplication } from '../../api';
import { getApplications } from '../../api';
import { useAuth } from '@/contexts/AuthContext';

// Const to store valid schools
const schools: string[] = [
    "University of Waterloo",
    "University of Toronto",
    "McMaster University", 
    "Western University",
    "Queen's University",
    "York University",
    "Carleton University",
    "University of Ottawa",
    "Toronto Metropolitan University",
    "University of British Columbia",
    "McGill University",
    "University of Alberta",
    "University of Montreal",
    "University of Calgary",
    "University of Guelph",
    "Wilfrid Laurier University",
    "Simon Fraser University",
    "University of Saskatchewan",
    "University of Windsor",
    "Brock University",
    "Ontario Tech University"
];


// Const to store valid provinces
const provinces: string[] = [
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

function Create() {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    // Set form data to empty values to begin with
    const [formData, setFormData] = useState({
        user_id: '',
        uni: '',
        program: '',
        gpa: '',
        extra: '',
        awards: '',
        location: '',
        tips: '',
        other: '',
        year: '',
        city: '',
        prov: ''
    });

    // Hooks to keep track of applications 
    const [submitted, setSubmitted] = useState(false);
    const [checkingSubmission, setCheckingSubmission] = useState(true);
    const [error, setError] = useState<string>('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);


    useEffect(() => {

        // Function to scan database to check if users as already submited an application
        const checkExistingSubmission = async () => {

            // Check if user is currently not logged in
            if (!user) {
                setCheckingSubmission(false);
                return;
            }

            try {
                // Collect all applications from DB
                const applications = await getApplications();

                // Loop through application to check if any apps have same uuid
                for (let app=0; app < applications.length; app++){
                    if (applications[app].user_id == user.uuid){
                        setSubmitted(true)
                        break
                    }
                }
            // Display error if occurs 
            } catch (error) {
                console.error('Error checking existing submissions:', error);
            
            } finally {
                setCheckingSubmission(false);
            }
        };

        // Call the functions
        checkExistingSubmission();
    
        //Only do this every time user changes account or someone else logs in
    }, [user]);


    // Handle form data change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {

        // Select the name and value of the tag
        const { name, value } = e.target;

        //check if form was a city or prov
        if (name === 'city' || name === 'prov') {
            setFormData(prev => ({
                ...prev,

                [name]: value,
                location: name === 'city' 
                    ? `${value}${prev.prov ? ', ' + prev.prov : ''}`
                    : `${prev.city ? prev.city + ', ' : ''}${value}`
            }));
        } else {

            // Update object
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user is not log in
        if (!user) {
            console.error('User not logged in');
            return;
        }
        
        // Clear any previous errors
        setError('');
        
        try {
            // Send the application to backend api
            await createApplication({
                ...formData,
                user_id: user.uuid,
                gpa: parseFloat(formData.gpa),
                year: parseInt(formData.year)
            });
            
            // Reset form after successful submission
            setFormData({
                user_id: '',
                uni: '',
                program: '',
                gpa: '',
                extra: '',
                awards: '',
                location: '',
                tips: '',
                other: '',
                year: '',
                city: '',
                prov: ''
            });
            
            // Update submited
            setSubmitted(true);
            
            // Refresh the page to show user something happend
            setTimeout(() => {
                window.location.reload();
            }, 1500); 
        
        // display any errors
        } catch (error) {
            console.error('Error creating application:', error);
            
            // Handle specific error cases
            if (error instanceof Error && error.message && error.message.includes('already submitted')) {
                setError('You have already submitted an application. Only one application per user is allowed.');
                setSubmitted(true); // Show the submitted state
            } else {
                setError('An error occurred while submitting your application. Please try again.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
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

    // Loading state
    if (isLoading || checkingSubmission) {
        return (
            <div className="flex flex-col items-center justify-center bg-emerald-900 pt-20 pb-20 mt-10 h-[400px] px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-100 text-center">Create Application</h1>
                <div className="mt-10 flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-100"></div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium text-emerald-100 text-center">Loading...</h1>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center bg-emerald-900 pt-20 pb-20 mt-10 h-[400px] px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-100 text-center">Create Application</h1>
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium text-emerald-100 text-center mt-10 mb-8">
                    Sign in with Google to submit your application
                </h1>
                <button 
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="px-8 py-4 bg-white text-emerald-900 rounded-full hover:bg-emerald-50 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 shadow-lg"
                >
                    {isLoggingIn ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-900"></div>
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Sign in with Google</span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    // Already submitted
    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center bg-emerald-900 pt-20 pb-20 mt-10 h-[400px] px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-100 text-center">Create Application</h1>
                <div className="text-center mt-10">
                    <div className="text-emerald-100 text-6xl mb-4">✓</div>
                    <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-medium text-emerald-100 text-center">
                        Application submitted successfully!
                    </h1>
                    <p className="text-emerald-200 mt-4">
                        You can only submit one application per account.
                    </p>
                </div>
            </div>
        );
    }

    // Show form 
    return (
        <div className="flex flex-col items-center justify-center bg-emerald-900 pt-20 pb-20 mt-10">
            <h1 className="text-7xl sm:text-5xl md:text-6xl font-medium text-emerald-100 text-center mb-12">Create Application</h1>
            
            {/* Error Display */}
            {error && (
                <div className="w-[90%] sm:w-[95%] md:w-[85%] lg:w-[70%] mb-6 bg-red-500/20 backdrop-blur-sm rounded-2xl p-4 border border-red-400/30">
                    <div className="flex items-center space-x-3">
                        <div className="text-red-300 text-xl">⚠️</div>
                        <p className="text-red-100 font-medium">{error}</p>
                    </div>
                </div>
            )}
            
            <div className="w-[90%] sm:w-[95%] md:w-[85%] lg:w-[70%] bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-items-center">
                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">University</label>
                        <select 
                            name="uni"
                            value={formData.uni}
                            onChange={handleChange}
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl" 
                            required
                        >
                            <option value="" disabled>Select School</option>
                            {schools.map((school) => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Program</label>
                        <input 
                            type="text" 
                            name="program"
                            value={formData.program}
                            onChange={handleChange}
                            placeholder="Program Name" 
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                            required/>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">GPA</label>
                        <input 
                            type="number" 
                            name="gpa"
                            value={formData.gpa}
                            onChange={handleChange}
                            placeholder="Average" 
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                            required/>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Extracurricular</label>
                        <input 
                            type="text" 
                            name="extra"
                            value={formData.extra}
                            onChange={handleChange}
                            placeholder="Extracurricular Activities" 
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                            required/>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Awards</label>
                        <input 
                            type="text" 
                            name="awards"
                            value={formData.awards}
                            onChange={handleChange}
                            placeholder="Awards & Achievements" 
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                            required/>
                    </div>

                    <div className="w-full space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Location</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text" 
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City" 
                                className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                                required/>
                            <select 
                                name="prov"
                                value={formData.prov}
                                onChange={handleChange}
                                className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl" 
                                required
                            >
                                <option value="" disabled>Province</option>
                                {provinces.map((province) => (
                                    <option key={province} value={province}>{province}</option>
                                ))}
                                
                            </select>
                        </div>
                    </div>
                    
                    <div className="w-full sm:w-[60%] lg:w-[40%] col-span-1 lg:col-span-2 mx-auto space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Year</label>
                        <input 
                            type="number" 
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            placeholder="Application Year" 
                            className="w-full h-[60px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm text-center text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60" 
                            required
                        />
                    </div>

                    <div className="w-full col-span-1 lg:col-span-2 space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Tips & Advice</label>
                        <textarea 
                            name="tips"
                            value={formData.tips}
                            onChange={handleChange}
                            placeholder="Share your tips and advice for future applicants..." 
                            className="w-full h-[120px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm p-4 text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60 resize-none" 
                            required
                        />
                    </div>

                    <div className="w-full col-span-1 lg:col-span-2 space-y-2">
                        <label className="text-emerald-100 font-medium text-sm uppercase tracking-wide">Additional Information</label>
                        <textarea 
                            name="other"
                            value={formData.other}
                            onChange={handleChange}
                            placeholder="Any other information you'd like to share (optional)..." 
                            className="w-full h-[120px] rounded-2xl border-0 bg-white/90 backdrop-blur-sm p-4 text-emerald-900 font-medium shadow-lg focus:ring-4 focus:ring-emerald-300 focus:outline-none transition-all duration-300 hover:bg-white hover:shadow-xl placeholder:text-emerald-600/60 resize-none" 
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2 mt-8">
                        <button 
                            type="submit"
                            className="w-full sm:w-[300px] h-[60px] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xl shadow-2xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 focus:ring-4 focus:ring-emerald-300 focus:outline-none"
                        >
                            Create Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Create; 