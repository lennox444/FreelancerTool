import Image from "next/image";

export const Footer = () => {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12 md:py-16">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Image
                                src="/logo.svg"
                                alt="FreelanceFlow Logo"
                                width={150}
                                height={30}
                                className="h-8 w-auto"
                            />
                        </div>
                        <p className="text-slate-500 max-w-xs mb-6">
                            Das All-in-One Tool für moderne Freelancer. Verwalte Projekte, Zahlungen und Kunden einfach und effizient.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-pink-100 cursor-pointer transition-colors" />
                            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-pink-100 cursor-pointer transition-colors" />
                            <div className="w-8 h-8 rounded-full bg-slate-200 hover:bg-pink-100 cursor-pointer transition-colors" />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Produkt</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Funktionen</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Preise</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Roadmap</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Ressourcen</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Dokumentation</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">API</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Community</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Blog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Rechtliches</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Impressum</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">Datenschutz</a></li>
                            <li><a href="#" className="text-slate-600 hover:text-[#800040] text-sm">AGB</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} FreelanceFlow. Alle Rechte vorbehalten.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-slate-400 text-sm">Made with ❤️ for Freelancers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
