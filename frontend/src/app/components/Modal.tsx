
// Modal props for interface
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
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

// Dict to store paths of images based on school
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



function Modal({ isOpen, onClose, uni, program, gpa, extra, awards, location, tips, other, year }: ModalProps) {

    //Return nothing if modal is not open yet
    if (!isOpen) return null;       

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl mx-4 h-[80vh] w-[60vh] border-2 border-emerald-600 border-radius-lg flex flex-col">
                
                {/* Banner image */}
                <div className="h-48 sm:h-56 md:h-64 lg:h-72 w-full flex-shrink-0">
                    <img 
                        src={logos[uni][1]} 
                        alt="Banner" 
                        className="w-full h-full rounded-lg"
                    />
                </div>
                
                {/* School logo and name */}
                <div className="flex flex-row gap-5 p-6 border-b border-gray-100 flex-shrink-0">
                    <img 
                        src={logos[uni][0]} 
                        alt="School Logo" 
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
                    />
                    <h2 className="text-2xl font-medium text-emerald-800">
                        {uni}
                        <br/><span className="text-lg text-emerald-600">{program}</span>
                    </h2>
                </div>

                {/* Application Information */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <h3 className="text-lg font-medium text-emerald-800">Application</h3>
                    <ul className="list-disc list-inside">
                        <li><span className="font-medium text-emerald-800">Average:</span> {gpa}</li>
                        <li><span className="font-medium text-emerald-800">Extracurricular:</span> {extra}</li>
                        <li><span className="font-medium text-emerald-800">Awards:</span> {awards}</li>
                        <li><span className="font-medium text-emerald-800">Location:</span> {location}</li>
                        <li><span className="font-medium text-emerald-800">Year:</span> {year}</li>
                        <li><span className="font-medium text-emerald-800">Tips:</span> {tips}</li>
                        <li><span className="font-medium text-emerald-800">Other:</span> {other}</li>
                        
                    </ul>
                </div>

                {/* Close modal button */}
                <div className="p-6 border-t border-gray-100 flex justify-end space-x-4 flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                        Finish
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal;

