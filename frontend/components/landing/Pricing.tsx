'use client';

import { Check } from "lucide-react";
import Link from "next/link";
import StarBorder from "@/components/ui/StarBorder";
import SpotlightCard from "@/components/ui/SpotlightCard";

const features = [
    "Projektmanagement",
    "Kundenverwaltung",
    "Rechnungserstellung",
    "Zeiterfassung",
    "Berichte & Statistiken",
    "Unbegrenzte Kunden",
    "Email Support"
];

export const Pricing = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden" id="pricing">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
                        Einfaches <span className="text-[#800040]">Preis</span>modell.
                    </h2>
                    <p className="text-lg text-slate-600">
                        Wir halten es simpel. Ein Preis, alles inklusive. Keine versteckten Kosten.
                        Teste FreelanceFlow 14 Tage lang völlig kostenlos.
                    </p>
                </div>

                <div className="max-w-lg mx-auto">
                    <SpotlightCard
                        className="rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 bg-white/50 backdrop-blur-xl relative"
                        spotlightColor="rgba(219, 39, 119, 0.1)"
                    >
                        {/* Badge */}
                        <div className="absolute top-0 right-0 p-8">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#800040] text-white uppercase tracking-wider shadow-lg shadow-pink-900/20">
                                Beliebt
                            </span>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-2">Pro Mitgliedschaft</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight">30€</span>
                                <span className="text-xl text-slate-500 font-medium">/ Monat</span>
                            </div>
                            <p className="text-slate-500 mt-4 font-medium">
                                Alles was du brauchst, um dein Freelance-Business zu skalieren.
                            </p>
                        </div>

                        <div className="space-y-4 mb-10">
                            {features.map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/register" className="block w-full">
                            <StarBorder as="button" className="w-full rounded-2xl group" color="#d946ef" speed="3s">
                                <div className="h-14 w-full bg-[#800040] text-white flex items-center justify-center rounded-2xl transition-all group-hover:bg-[#600030] font-bold text-lg shadow-xl shadow-pink-900/20">
                                    Jetzt 14 Tage kostenlos testen
                                </div>
                            </StarBorder>
                        </Link>

                        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                            Keine Kreditkarte für den Start erforderlich. Jederzeit kündbar.
                        </p>
                    </SpotlightCard>
                </div>
            </div>
        </section>
    );
};
