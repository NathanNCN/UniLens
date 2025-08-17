'use client'

// imports
import { useState, useEffect } from 'react';
import Card from "./Card"
import { getApplications, type Application } from '../../api';

function CardDisplay() {

    // Hooks of how many pages currently, and how many applications per page
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 8; 

    // Hook to store applications
    const [cards, setCards] = useState<Application[]>([]);

    
    // Once the pages load get applications
    useEffect(() => 
        {   
            // Call get application function then update hook
            const getApps = async () => {
                const data = await getApplications();
                setCards(data);
            };
            getApps();}
            
    ,[])

    // Find how many pages we have based on applications (rounding up)
    // Note: this is determined by cardsPerPage
    const totalPages = Math.ceil((cards?.length || 0) / cardsPerPage);


    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;


    // UseState for search
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Application[]>([]);


    useEffect(() => {
        //Check if search is not empty
        if (search.trim() !== "") {

            // Turn all letter to lowercase and split into arry by words
            const searchTerms = search.toLowerCase().split(' ');
            
            // Filter the cards based on searchTerms checking if the application
            // contains the search terms
            const filteredResults = cards.filter(app => {
                const uniLower = app.uni.toLowerCase();
                const programLower = app.program.toLowerCase();

                //Check if searched term is in university or program
                return searchTerms.every(term => 
                    uniLower.includes(term) || programLower.includes(term)
                );
            });
            setSearchResults(filteredResults);
        } else {
            setSearchResults(cards);
        }
    
    // useEffect once the user types something inside serach
    }, [search, cards]);

    
    return (<>
            <input 
                className="w-[90%] sm:w-[80%] md:w-[70%] h-[80px] sm:h-[100px] rounded-full border-2 border-emerald-600 text-center text-sm sm:text-base" 
                type="text" 
                placeholder="Ex: Waterloo Computer Science"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div className="w-[99%] px-2 sm:px-4">
                {/* Cards Grid*/}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-20">
                    {searchResults.slice(indexOfFirstCard, indexOfLastCard).map((app) => (
                        <Card key={app.id} 
                        uni={app.uni} 
                        program={app.program} 
                        gpa={app.gpa} 
                        extra={app.extra} 
                        awards={app.awards} 
                        location={app.location} 
                        tips={app.tips} 
                        other={app.other} 
                        year={app.year} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center space-x-2 mt-8 flex-wrap gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-2 text-emerald-700 hover:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex space-x-1 sm:space-x-2">
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${
                                    currentPage === index + 1
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-emerald-700 hover:bg-emerald-100'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-2 text-emerald-700 hover:text-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
        
    )
}

export default CardDisplay;