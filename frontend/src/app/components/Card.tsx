'use client'

// Imports
import Modal from "./Modal";
import { useState } from "react";

// const to store paths of images based on university name
const logos: Record<string ,string[]> = {
    "University of Waterloo": ["./images/crest/uwCrest.svg", "./images/banners/uwBanner.jpg"],
    "University of Toronto": ["./images/crest/uoftCrest.png", "./images/banners/UoftBanner.jpg"],
    "McMaster University": ["./images/crest/macCrest.png", "./images/banners/MacBanner.jpg"],
    "Western University": ["./images/crest/westCrest.png", "./images/banners/WestBanner.jpg"],
    "Queen's University": ["./images/crest/queensCrest.png", "./images/banners/QueenBanner.jpg"],
    "York University": ["./images/crest/yorkCrest.png", "./images/banners/YorkBanner.jpg"],
    "Carleton University": ["./images/crest/careltonCrest.png", "./images/banners/Carleanner.jpg"],
    "University of Ottawa": ["./images/crest/OttCrest.png", "./images/banners/OttaBanner.jpg"],
    "Toronto Metropolitan University": ["./images/crest/tmu.png", "./images/banners/TmuBanner.jpg"],
    "University of British Columbia": ["./images/crest/ubc.png", "./images/banners/UbcBanner.jpg"],
    "McGill University": ["./images/crest/mcgill.png", "./images/banners/McBanner.jpg"],
    "University of Alberta": ["./images/crest/uniAlberta.png", "./images/banners/AlbBanner.jpg"],
    "University of Montreal": ["./images/crest/uniMont.png", "./images/banners/MonBanner.jpg"],
    "University of Calgary": ["./images/crest/uniCalg.png", "./images/banners/Calanner.jpg"],
    "University of Guelph": ["./images/crest/uniGuel.png", "./images/banners/GulBanner.png"],
    "Wilfrid Laurier University": ["./images/crest/Laurier.png", "./images/banners/LauBanner.jpg"],
    "Simon Fraser University": ["./images/crest/simon.png", "./images/banners/SfuBanner.jpg"],
    "University of Saskatchewan": ["./images/crest/uniSask.ong", "./images/banners/SasBanner.jpg"],
    "University of Windsor": ["./images/crest/uniWind.png", "./images/banners/WindBanner.jpg"],
    "Brock University": ["./images/crest/brock.png", "./images/banners/BroBanner.jpg"],
    "Ontario Tech University": ["./images/crest/uniTech.png", "./images/banners/OnBanner.jpg"]
}

// data type of apps
type App = {
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

function Card(props: App) {

    //Hook for modal
    const [isOpen, isClose] = useState(false);
    
    return (
        <div className="w-full h-[500px] max-w-7xl mx-auto border-2 border-white bg-white rounded-xl shadow-lg overflow-hidden relative">
            {/* Banner */}
            <div className="h-32 sm:h-40 md:h-48 lg:h-56 w-full">
                <img 
                    src={logos[props.uni][1]} 
                    alt="Banner" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-5 md:p-6 h-[calc(500px-12rem)]">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <img 
                        src={logos[props.uni][0]}
                        alt="School Logo" 
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                    />
                    <div className="text-center sm:text-left h-[100px]">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-emerald-800">{props.uni}</h2>
                        <p className="text-sm sm:text-base md:text-lg text-emerald-600">{props.program}</p>
                        <ul>
                            <li>Average: {props.gpa}</li>
                            <li>Extracurricular:{props.extra}</li>
                            <li>Awards: {props.awards}</li>
                            <li>Location: {props.location}</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Button Container */}
            <div className="absolute bottom-4 right-4">
                <button 
                    onClick={() => isClose(true)} 
                    className=" border-3 border-white bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors shadow-lg">
                    View Application
                </button>
            </div>

            <Modal 
                isOpen={isOpen} 
                onClose={() => isClose(false)}
                uni={props.uni}
                program={props.program}
                gpa={props.gpa}
                extra={props.extra}
                awards={props.awards}
                location={props.location}
                tips={props.tips}
                other={props.other}
                year={props.year}
            />
        </div>
    )
}

export default Card;