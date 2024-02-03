//import "../Styles/Footer.css";

export default function Footer() {
    return (
        <div className="flex bg-purple text-white items-stretch justify-center m-auto">
            <div className="p-1">
                <footer className="mt-auto">
                    &copy;{new Date().getFullYear()} UW Tech Prep. All rights reserved.
                </footer>
            </div>
        </div>
    )
}