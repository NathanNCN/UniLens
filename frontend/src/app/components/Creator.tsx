'use client'

import Image from 'next/image'

function Creator() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100 pt-20">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-900 text-center mb-16">Creator</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] w-full max-w-md mx-auto lg:max-w-none lg:w-[90%]">
                        <Image
                            src="/images/IMG_1557.jpg"
                            alt="Nathan Chau-Nguyen"
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800">Nathan Chau-Nguyen</h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
                        Hi, my name is Nathan Chau-Nguyen and I&apos;m the creator of Uni Lens. I&apos;m currently a math student at 
                        the University of Waterloo with a passion for programming. I created Uni Lens because, when I was applying 
                        to universities, I would have loved to draw inspiration from real applications to improve my chances of getting 
                        into my dream program. Thus, I decided to create a platform that allows you to view real applications to 
                        universities and get inspired.
                        </p>
                        <div className="pt-6">
                            <h3 className="text-2xl font-semibold text-emerald-700 mb-6">Contact Me</h3>
                            <div className="flex space-x-8">
                                <a
                                    href="https://github.com/NathanNCN"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors text-xl"
                                >
                                    <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                    GitHub
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/nathanchau-nguyen"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors text-xl"
                                >
                                    <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                    </svg>
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}   

export default Creator;