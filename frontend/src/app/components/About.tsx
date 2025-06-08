function About() {
    return (
        <div className="flex flex-col items-center justify-center bg-emerald-900 pt-20 pb-20 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-100 text-center">Mission</h1>
            <p className="text-lg sm:text-xl md:text-2xl text-emerald-100/90 text-center w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] mx-auto leading-relaxed mt-6">
                At UniLens, we believe the best way to prepare for your future is by learning from 
                those who have done it. Our platform&apos;s goal is to give students access to real, successful 
                applications so they can get inspired, understand what it takes, and help students get one step 
                closer to reaching their dreams - <span className="font-medium text-white">Creators</span>
            </p>
        </div>
    )
}

export default About;