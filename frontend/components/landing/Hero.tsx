'use client';

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

import PixelBlast from './PixelBlast';
import StarBorder from "@/components/ui/StarBorder";

export const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden isolate">
            {/* Background Elements */}
            {/* Background Elements */}
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-slate-50">
                {/* Pixel Blast Background Layer */}
                <div className="absolute inset-0 w-full h-full opacity-60">
                    <PixelBlast
                        variant="square"
                        pixelSize={4}
                        color="#800040"
                        patternScale={2}
                        patternDensity={1}
                        pixelSizeJitter={0}
                        enableRipples
                        rippleSpeed={0.4}
                        rippleThickness={0.12}
                        rippleIntensityScale={1.5}
                        liquid={false}
                        liquidStrength={0.12}
                        liquidRadius={1.2}
                        liquidWobbleSpeed={5}
                        speed={0.5}
                        edgeFade={0.25}
                        transparent
                        className="custom-class"
                    />
                </div>

                {/* Contrast Enhancer: White radial mask behind text */}
                <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.8)_30%,rgba(255,255,255,0)_70%)] pointer-events-none" />

                {/* Fade out to blend with next section */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-800 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-600"></span>
                        </span>
                        Jetzt Verfügbar für Freelancer & Agenturen
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                    >
                        Mehr Zeit für Arbeit, <br /> weniger für <span className="text-[#800040] drop-shadow-sm">Verwaltung.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-700 font-medium mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Verwalte Angebote, Projekte und Zahlungen an einem Ort.
                        Hole dir die Kontrolle über deinen Cashflow zurück – mit automatisierten Erinnerungen und smarten Berichten.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/register">
                            <StarBorder as="button" className="rounded-full group" color="#d946ef" speed="4s">
                                <div className="h-14 px-8 bg-[#800040] text-white flex items-center justify-center rounded-full transition-all group-hover:bg-[#600030] font-semibold">
                                    Kostenlos Starten <ArrowRight className="ml-2 w-5 h-5" />
                                </div>
                            </StarBorder>
                        </Link>
                        <Link href="#features">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-base bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all hover:scale-105 font-medium shadow-sm">
                                Funktionen ansehen
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 flex items-center justify-center gap-8 text-sm text-slate-600 font-medium"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#800040]" />
                            <span>Keine Kreditkarte nötig</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-[#800040]" />
                            <span>Kostenlos für Starter</span>
                        </div>
                    </motion.div>
                </div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-20 relative mx-auto max-w-6xl shadow-2xl rounded-xl border border-slate-200 bg-white p-2 md:p-4 rotate-x-12 perspective-1000"
                >
                    <div className="rounded-lg overflow-hidden bg-slate-50 border border-slate-200 aspect-[16/9] relative group">
                        {/* Mock Dashboard UI */}
                        <div className="absolute top-0 left-0 w-64 h-full bg-slate-900 border-r border-slate-800 p-4 hidden md:block">
                            <div className="h-8 w-8 bg-blue-600 rounded mb-8" />
                            <div className="space-y-4">
                                <div className="h-4 w-24 bg-slate-800 rounded" />
                                <div className="h-4 w-32 bg-slate-800 rounded opacity-75" />
                                <div className="h-4 w-20 bg-slate-800 rounded opacity-75" />
                                <div className="h-4 w-28 bg-slate-800 rounded opacity-75" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 md:left-64 bottom-0 bg-slate-50 p-6 md:p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
                                    <div className="h-4 w-64 bg-slate-100 rounded" />
                                </div>
                                <div className="h-10 w-32 bg-blue-600 rounded shadow-sm" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <div className="h-8 w-8 bg-blue-50 rounded-lg mb-4" />
                                        <div className="h-6 w-16 bg-slate-100 rounded mb-2" />
                                        <div className="h-8 w-24 bg-slate-200 rounded" />
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100 h-64">
                                <div className="h-6 w-32 bg-slate-100 rounded mb-6" />
                                <div className="space-y-4">
                                    <div className="h-12 w-full bg-slate-50 rounded" />
                                    <div className="h-12 w-full bg-slate-50 rounded" />
                                    <div className="h-12 w-full bg-slate-50 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                    </div>
                    {/* Glossy Reflection */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-transparent opacity-50 rounded-b-xl pointer-events-none" />
                </motion.div>
            </div>
        </section>
    );
};
