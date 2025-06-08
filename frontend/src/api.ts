// Application type
export type Application = {
    id?: number;
    user_id: string;
    uni: string;
    program: string;
    gpa: number;
    extra: string;
    awards: string;
    location: string;
    tips: string;
    other: string;
    year: number;
}


// API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://unilens.onrender.com';

// Function to get application form DB
export async function getApplications(): Promise<Application[]> {
    try {

        // Send a GET request to fetch applications
        const response = await fetch(`${API_BASE_URL}/applications`, {
            credentials: 'include',
        });
        
        // If error occurs, throw error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Turn response into json then send back
        const data = await response.json();
        return data;
    
    // Display error
    } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
    }
}

// Function to create an application
export async function createApplication(application: Omit<Application, 'id'>): Promise<Application> {
    try {

        // Function, create a post Request
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', 
            body: JSON.stringify(application)
        });
        
        if (!response.ok) {
            // Try to get the error message from the response
            try {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create application: ${response.statusText}`);
            } catch {
                // If we can't parse the error response, use the status text
                throw new Error(`Failed to create application: ${response.status} ${response.statusText}`);
            }
        }
        
        return response.json();
    } catch (error) {
        console.error('Error creating application:', error);
        throw error;
    }
}

