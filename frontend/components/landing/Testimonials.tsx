import Image from "next/image";
import SpotlightCard from "@/components/ui/SpotlightCard";

const testimonials = [
    {
        quote: "Endlich habe ich einen Überblick über meine offenen Rechnungen. FreelanceFlow hat mir geholfen, mein Einkommen um 20% zu steigern, weil ich keine Mahnungen mehr vergesse.",
        author: "Sarah M.",
        role: "UX Designerin",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        quote: "Das einfachste Tool, das ich je genutzt habe. Keine überladenen Menüs, nur das, was ich wirklich brauche. Perfekt für Solo-Selbstständige.",
        author: "Markus W.",
        role: "Fullstack Entwickler",
        avatar: "https://i.pravatar.cc/150?u=markus",
    },
    {
        quote: "Die automatisierten Zahlungserinnerungen sind Gold wert. Seit ich FreelanceFlow nutze, bezahlen meine Kunden viel pünktlicher.",
        author: "Julia K.",
        role: "Copywriterin",
        avatar: "https://i.pravatar.cc/150?u=julia",
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-white border-y border-slate-100">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        Von Freelancern geliebt
                    </h2>
                    <p className="text-lg text-slate-600">
                        Schließe dich hunderten erfolgreichen Selbstständigen an.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <SpotlightCard
                            key={idx}
                            className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col justify-between"
                            spotlightColor="rgba(128, 0, 64, 0.2)"
                        >
                            <div className="mb-6 relative z-10">
                                <div className="flex gap-1 mb-4 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-slate-700 italic leading-relaxed">"{t.quote}"</p>
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative">
                                    {/* Fallback avatar if external images are blocked or slow */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-pink-50 text-[#800040] font-bold">
                                        {t.author.charAt(0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-900">{t.author}</div>
                                    <div className="text-sm text-slate-500">{t.role}</div>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
