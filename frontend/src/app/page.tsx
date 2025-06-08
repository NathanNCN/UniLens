'use client'

// Imports
import Header from "./components/Header";
import About from "./components/About";
import Applications from "./components/Applications";
import Create from "./components/Create";
import Creator from "./components/Creator";
import { useState, useEffect } from 'react';
import { getApplications } from '../api';

//Home page components
export default function Home() {

  //Loading state
  const [isLoading, setIsLoading] = useState(true);

  
  //UseEffect to wait untill Render Database is done loading
  useEffect(() => {
  
    //Function to load applications
    const loadApplications = async () => {

      // Try to load applications
      try {
        

        await getApplications();
        // Set loading false, once render is finished

        setIsLoading(false)

      } catch {
        // Display error if something happens done
        console.error('Error fetching applications:');
      }
    };

    loadApplications();
  }, []);

  // Present loading screen if DB is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 flex flex-col items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-emerald-800">UniLens</h1>
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-medium text-emerald-700">Loading...</p>
        </div>
      </div>
    );
  }
    

  // Return page once DB is done loading
  return (
    <div>
      <Header />
      <About />
      <Applications/>
      <Create/> 
      <Creator/>
    </div>
  );
}
