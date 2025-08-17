import CardDisplay from "./CardDisplay";
function Applications() {
    return (
        // Applications section to show the applications
        <div className="min-h-screen mx-auto mt-20 px-4" id="carddisplay">
            <div className="flex flex-col items-center justify-center gap-15"> 
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-emerald-800 text-center">Applications</h1>
            </div>
            <div className="flex flex-col items-center justify-center mt-10">
                <CardDisplay />
            </div>
        </div>
    )
}
export default Applications;