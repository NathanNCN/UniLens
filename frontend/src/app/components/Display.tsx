function Display() {
    return (
        <div className="flex flex-col justify-left items-left text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-emerald-800">
                 Real Students.
            <br/>Real Stories. 
            <br/>Real Success.</h1>
            <div className="space-x-4">
                <p className="text-emerald-700 text-base sm:text-lg mt-4 mb-5">
                    Discover real student applications to top universities. Search your dream program,
                    explore successful applications, and plan your path with confidence. 
                </p>
                <a className="px-6 py-2 bg-emerald-600 text-white text-lg sm:text-xl rounded-full hover:bg-emerald-700 transition-colors inline-block" href="#carddisplay">
                    Get Started
                </a>
            </div>
        </div>
    )
}

export default Display;