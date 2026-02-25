'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Menu, X, Check, Clock, Users, Zap, Shield, Star, Search, Layout,
    BarChart3, FileText, CreditCard, Target, Send, Download, Briefcase,
    Wallet, PieChart, TrendingUp, TrendingDown, ShieldCheck, Calendar, ArrowRight,
    Fingerprint, Lock, ShieldAlert, BadgeEuro, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';

// --- Reusable Animation Wrapper ---

const Reveal = ({ children, delay = 0, y = 20, x = 0 }: { children: React.ReactNode, delay?: number, y?: number, x?: number }) => (
    <motion.div
        initial={{ opacity: 0, y, x }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);

// --- Components ---

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 py-3 shadow-sm' : 'bg-transparent py-6'
            }`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                    <Image
                        src="/logo.svg"
                        alt="FreelancerTool Logo"
                        width={150}
                        height={30}
                        className="h-8 w-auto"
                        priority
                    />
                </Link>

                <div className="hidden lg:flex items-center gap-8">
                    <Link href="#loesung" className="text-[13px] font-bold text-slate-600 hover:text-[#800040] transition-colors">Funktionen</Link>
                    <Link href="#steuern" className="text-[13px] font-bold text-slate-600 hover:text-[#800040] transition-colors">Steuern</Link>
                    <Link href="#preise" className="text-[13px] font-bold text-slate-600 hover:text-[#800040] transition-colors">Preise</Link>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/login" className="text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-tight">Login</Link>
                    <Link href="/register">
                        <button className="bg-[#800040] text-white text-[12px] font-black px-6 py-2.5 rounded-full hover:bg-slate-900 transition-all shadow-xl shadow-[#800040]/10 active:scale-95 uppercase tracking-tight">
                            Gratis Starten
                        </button>
                    </Link>
                </div>

                <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-8 lg:hidden shadow-2xl text-center"
                    >
                        <div className="flex flex-col gap-6">
                            <Link href="#loesung" className="text-lg font-black text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Funktionen</Link>
                            <Link href="#steuern" className="text-lg font-black text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Steuern</Link>
                            <div className="pt-4 flex flex-col gap-3">
                                <Link href="/register" className="w-full py-4 bg-[#800040] text-white rounded-2xl font-black text-sm uppercase">14 Tage kostenlos testen</Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

const FloatingCard = ({ children, className, delay = 0, rotate = 0 }: { children: React.ReactNode, className: string, delay?: number, rotate?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9, rotate }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`absolute shadow-2xl rounded-3xl bg-white border border-slate-100 z-20 ${className}`}
    >
        {children}
    </motion.div>
);

export default function LandingPage2() {
    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#800040]/10 selection:text-[#800040] overflow-x-hidden antialiased">
            <Navbar />

            {/* --- HERO SECTION --- */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale }}
                className="relative min-h-screen flex items-center justify-center pt-32 pb-20 overflow-visible isolate"
            >

                {/* HERO BACKGROUND - LIMITED TO HERO */}
                <div className="absolute inset-0 -z-10 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.02)]">
                    <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                        <PixelBlast variant="square" pixelSize={3} color="#800040" patternScale={5} patternDensity={0.5} speed={0.3} transparent />
                    </div>
                    {/* Soft Bordeaux Gradient Orb */}
                    <div className="absolute top-[5%] left-[-10%] w-[1000px] h-[1000px] bg-[#800040]/10 rounded-full blur-[160px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-blue-500/5 rounded-full blur-[140px]" />
                </div>

                <div className="container mx-auto px-6 relative text-center">

                    {/* --- VISUAL WOW ELEMENTS --- */}

                    {/* Left Stock Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -100, rotate: -12 }}
                        animate={{ opacity: 1, x: 0, rotate: -6 }}
                        transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-[15%] left-[-80px] hidden 2xl:block z-10"
                    >
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" className="w-56 h-72 object-cover rounded-[3.5rem] shadow-2xl border-4 border-white" alt="Freelancer Success" />
                    </motion.div>

                    {/* Right Stock Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, rotate: 12 }}
                        animate={{ opacity: 1, x: 0, rotate: 6 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute bottom-[20%] right-[-100px] hidden 2xl:block z-10"
                    >
                        <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400" className="w-60 h-80 object-cover rounded-[3.8rem] shadow-2xl border-4 border-white" alt="Work In Flow" />
                    </motion.div>

                    {/* Profit Card Mockup */}
                    <FloatingCard className="top-[45%] right-[5%] hidden xl:block p-6 w-64 rotate-[-3deg]" delay={0.8}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={16} /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rentabilität</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tracking-tighter">€84,50/h</div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full mt-4"><div className="h-full bg-[#800040] w-[85%] rounded-full" /></div>
                    </FloatingCard>

                    {/* Invoice Badge Mockup */}
                    <FloatingCard className="bottom-[15%] left-[5%] hidden xl:block p-5 w-60 rotate-[4deg]" delay={1}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Check size={16} /></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                        </div>
                        <div className="text-xl font-black text-slate-900 tracking-tight">Rechnung bezahlt</div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">Automatisch erfasst</p>
                        <div className="mt-4 flex justify-end"><div className="px-2 py-0.5 bg-blue-600 text-white rounded-[4px] text-[8px] font-black">STRIPE</div></div>
                    </FloatingCard>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full border border-slate-200 bg-white/50 text-[#800040] text-[10px] font-black uppercase tracking-[0.25em] mb-12 shadow-sm backdrop-blur-md"
                    >
                        <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
                        Deutschlands Business-Cockpit
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-[54px] md:text-[100px] lg:text-[140px] font-black tracking-[-0.07em] leading-[0.82] text-slate-950 mb-10 max-w-6xl mx-auto drop-shadow-sm"
                    >
                        Arbeite im <br /> <span className="text-[#800040]">Flow.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl md:text-3xl text-slate-500 font-bold max-w-2xl mx-auto mb-16 leading-tight"
                    >
                        Projekte, Rechnungen & Finanzen <br className="hidden md:block" />
                        in einer Hand. 100% für Freelancer.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-2xl mx-auto mb-20 md:mb-32 px-4"
                    >
                        <div className="flex-1 w-full bg-white p-1 rounded-[2rem] border-2 border-slate-100 shadow-2xl flex items-center group transition-all focus-within:border-[#800040]/30">
                            <input
                                type="email"
                                placeholder="Deine E-Mail Adresse"
                                className="bg-transparent border-none focus:ring-0 w-full px-6 py-4 text-[16px] font-bold placeholder:text-slate-300"
                            />
                            <button className="whitespace-nowrap bg-slate-950 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-[#800040] transition-all hover:scale-[1.03] active:scale-95 m-1">
                                Gratis Starten
                            </button>
                        </div>
                    </motion.div>

                    {/* Target Audience Tags */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.4 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-t border-slate-100 pt-16"
                    >
                        <span className="hover:text-[#800040] transition-colors cursor-default">IT-Freelancer</span>
                        <span className="hover:text-[#800040] transition-colors cursor-default">Designer</span>
                        <span className="hover:text-[#800040] transition-colors cursor-default">Entwickler</span>
                        <span className="hover:text-[#800040] transition-colors cursor-default">Berater</span>
                        <span className="hover:text-[#800040] transition-colors cursor-default">Kreative</span>
                    </motion.div>
                </div>
            </motion.section>

            {/* --- SOLUTION SECTION --- */}
            <section id="loesung" className="py-20 md:py-32 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-24">
                        <div className="flex-1">
                            <Reveal x={-30}>
                                <span className="text-[#800040] font-black text-[11px] uppercase tracking-[0.3em] mb-10 block">Die Lösung: FreelancerTool</span>
                                <h2 className="text-4xl md:text-7xl font-black mb-12 tracking-tight text-slate-950 leading-[1.1]">Klarheit für dein <br /> gesamtes Business.</h2>
                                <p className="text-slate-500 text-lg md:text-xl font-bold mb-16 leading-relaxed">FreelancerTool wurde speziell für die Anforderungen der deutschen Solo-Selbstständigkeit entwickelt. Keine überladene Agentur-Software, sondern Präzision für Einzelunternehmer.</p>
                            </Reveal>

                            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
                                {[
                                    { label: "Projektverwaltung", desc: "Alle Details, Budgets und Status an einem Ort." },
                                    { label: "Rechnungsstellung", desc: "Professionelle PDFs inkl. Kleinunternehmer-Modus." },
                                    { label: "DATEV-Export", desc: "EXTF-Format für SKR03 standardmäßig integriert." },
                                    { label: "Mahnwesen", desc: "4-stufige Automation für pünktliche Zahlungen." },
                                    { label: "Online-Zahlung", desc: "Via Stripe direkt im Rechnungs-Link bezahlen." },
                                    { label: "Rentabilitätsanalyse", desc: "Stundensatz-Auswertung nach jedem Projekt." }
                                ].map((f, i) => (
                                    <Reveal key={i} delay={i * 0.1} y={20}>
                                        <div className="flex gap-4 items-start">
                                            <div className="w-5 h-5 rounded-full bg-[#800040] flex items-center justify-center text-white shrink-0 mt-1">
                                                <Check size={12} />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 mb-1">{f.label}</h5>
                                                <p className="text-xs font-bold text-slate-400">{f.desc}</p>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        <Reveal x={30} className="flex-1 w-full">
                            <div className="bg-slate-50 p-6 rounded-[4rem] border border-slate-100 flex flex-col gap-6 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-700">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#800040]/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-slate-400 tracking-widest uppercase border border-slate-100 shadow-sm">RE-2024-042</div>
                                        <div className="px-2 py-0.5 rounded bg-[#800040]/10 text-[#800040] text-[9px] font-black uppercase tracking-widest">Wartet auf Zahlung</div>
                                    </div>
                                    <div className="text-4xl font-black text-slate-900 tracking-tighter">€4.840,00</div>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 italic flex items-center gap-2">Gemäß §19 UStG wird keine Umsatzsteuer berechnet.</p>
                                </div>

                                <div className="p-8 bg-[#800040] rounded-[2.5rem] text-white">
                                    <div className="flex justify-between items-center mb-10">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">Netto-Rentabilität</h5>
                                        <TrendingUp size={16} />
                                    </div>
                                    <div className="text-5xl font-black tracking-tighter mb-4">€84,50/h</div>
                                    <p className="text-xs font-bold text-white/50 italic text-left">Echter Stundensatz nach Ausgaben & Steuerrücklage.</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* --- STEUR-TRANSPARENZ --- */}
            <section id="steuern" className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <Reveal x={-30} className="flex-1 relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full" />
                            <div className="p-10 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-sm relative z-10 transition-transform hover:scale-[1.02] duration-700">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 rounded-2xl bg-[#800040]/5 flex items-center justify-center text-[#800040]"><PieChart size={24} /></div>
                                    <div>
                                        <h4 className="font-black text-slate-900 leading-none">Steuer-Assistent</h4>
                                        <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Planung 2024</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-500">Einkommensteuer</span>
                                        <span className="text-2xl font-black text-slate-900">€6.420</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-bold text-slate-500">Umsatzsteuer (19%)</span>
                                        <span className="text-xl font-black text-[#800040]">€3.120</span>
                                    </div>
                                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-6">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "35%" }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-[#800040]"
                                        />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mt-2">Empfohlene Rücklage: 35% vom Gewinn</p>
                                </div>
                            </div>
                        </Reveal>

                        <div className="flex-1 order-1 lg:order-2">
                            <Reveal x={30}>
                                <span className="text-[#800040] font-black text-[11px] uppercase tracking-[0.3em] mb-10 block">Finanzielle Sicherheit</span>
                                <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight text-slate-950">Intelligente Steuer-Vorschau.</h2>
                                <p className="text-slate-500 text-lg md:text-xl font-bold mb-10 leading-relaxed">Keine bösen Überraschungen bei der Vorauszahlung. Das FreelancerTool berechnet voraussichtliche Beträge basierend auf dem deutschen Einkommensteuer-Grundtarif.</p>

                                <ul className="space-y-4 mb-12 text-slate-600 font-bold text-sm">
                                    <li className="flex items-start gap-3"><Check size={18} className="text-[#800040] shrink-0 mt-0.5" /> Berechnung nach deutschem Grundtarif</li>
                                    <li className="flex items-start gap-3"><Check size={18} className="text-[#800040] shrink-0 mt-0.5" /> Umsatzsteuer-Überwachung (Normal & §19)</li>
                                    <li className="flex items-start gap-3"><Check size={18} className="text-[#800040] shrink-0 mt-0.5" /> Vierteljährliche Planungsunterstützung</li>
                                </ul>

                                <p className="text-[10px] font-bold text-slate-300 leading-relaxed max-w-md mt-12 italic border-l border-slate-100 pl-4">
                                    * Die Berechnungen stellen keine steuerliche Beratung dar und ersetzen nicht die Prüfung durch einen Steuerberater.
                                </p>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECURITY SECTION --- */}
            <section className="py-20 md:py-24 bg-white overflow-hidden relative isolate">
                <div className="container mx-auto px-6 text-center">
                    <Reveal y={20}>
                        <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tight text-slate-950 leading-none py-1">Deine Daten. Deine Freiheit.</h2>
                    </Reveal>

                    <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                        {[
                            { icon: Fingerprint, title: "Vollständige Datenisolierung", desc: "Deine geschäftlichen Daten sind strikt isoliert und jederzeit unter deiner Kontrolle.", color: "text-[#800040]" },
                            { icon: Lock, title: "Höchste Auth-Standards", desc: "Sicherer Zugriff via JWT-Authentifizierung mit regelmäßigen Token-Refreshes.", color: "text-blue-600" },
                            { icon: BadgeEuro, title: "Valide Zahlungsabwickung", desc: "Stripe-Webhook-Validierung garantiert eine sichere und automatisierte Abrechnung.", color: "text-black" }
                        ].map((s, i) => (
                            <Reveal key={i} delay={i * 0.2} y={30}>
                                <div className="text-center group p-8 rounded-[2.5rem] hover:bg-slate-50 transition-colors duration-500">
                                    <div className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform"><s.icon size={32} className={s.color} /></div>
                                    <h4 className="text-xl font-black mb-4 tracking-tight">{s.title}</h4>
                                    <p className="text-slate-400 font-bold text-sm leading-relaxed">{s.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FINAL COMBINED SECTION (Pricing & CTA) --- */}
            <section id="preise" className="py-20 md:py-32 bg-white overflow-visible relative">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <Reveal y={20}>
                        <h2 className="text-5xl md:text-8xl font-black mb-20 tracking-[-0.05em] leading-none text-slate-950">
                            Finde heute deinen <br /> <span className="text-[#800040]">Flow.</span>
                        </h2>
                    </Reveal>

                    <Reveal y={40} delay={0.2}>
                        <div className="relative p-12 md:p-20 rounded-[4rem] bg-[#800040] text-white shadow-[0_50px_100px_rgba(128,0,64,0.3)] overflow-hidden text-left flex flex-col md:flex-row items-center gap-12 md:gap-20">
                            {/* Background Reflective Patterns (Blobs from old Landing Page) */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none" />
                            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none" />

                            {/* Shine Reflection Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-50" />

                            <div className="flex-1 text-center md:text-left relative z-10">
                                <h3 className="text-[12px] font-black uppercase text-pink-200/60 tracking-[0.4em] mb-4">Faire Konditionen</h3>
                                <div className="text-8xl font-black leading-none tracking-tighter mb-4">25€</div>
                                <p className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-8">pro Monat · Inkl. PRO Funktionsumfang</p>
                                <Link href="/register" className="block transform transition-transform hover:scale-[1.03] active:scale-[0.98]">
                                    <button className="w-full bg-white text-[#800040] py-5 rounded-2xl font-black text-lg uppercase tracking-wider hover:bg-pink-50 transition-all shadow-2xl shadow-pink-900/40">
                                        Probeszeit starten
                                    </button>
                                </Link>
                                <p className="text-white/40 text-[10px] font-bold mt-4">14 Tage kostenlos · Keine Kreditkarte nötig</p>
                            </div>

                            <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-white/20 pt-12 md:pt-0 md:pl-16 relative z-10">
                                <ul className="space-y-6 font-bold text-sm">
                                    {[
                                        "Alle CRM & Projekt-Features",
                                        "DATEV & Steuer-Software EXTF",
                                        "Unbegrenzte Rechnungen & Kunden",
                                        "Keine Kündigungsfrist"
                                    ].map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                                                <Check size={12} className="text-white" />
                                            </div>
                                            {item}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="pt-20 pb-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-20 mb-32">
                        <div className="max-w-sm">
                            <Link href="/" className="mb-10 block transition-transform hover:scale-105">
                                <Image src="/logo.svg" alt="Logo" width={140} height={30} className="h-7 w-auto" />
                            </Link>
                            <p className="text-slate-400 font-bold leading-relaxed text-sm">
                                Die intuitive Lösung für Freelancer, die ihr Business lieben und ihr Management hassen. Entwickelt für Deutschland. 100% DSGVO-konform.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
                            {[
                                { title: 'Plattform', links: ['Funktionen', 'Dashboard', 'Preise'] },
                                { title: 'Rechtliches', links: ['Impressum', 'Datenschutz', 'AGB'] },
                                { title: 'Kontakt', links: ['Support', 'Twitter', 'LinkedIn'] }
                            ].map((col, i) => (
                                <div key={i}>
                                    <h5 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 mb-8">{col.title}</h5>
                                    <ul className="space-y-4">
                                        {col.links.map(l => (
                                            <li key={l}><Link href="#" className="text-slate-400 hover:text-[#800040] text-[13px] font-bold transition-all">{l}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest text-center border-t border-slate-50 pt-16">
                        © {new Date().getFullYear()} FREELANCERTOOL. ALLE RECHTE VORBEHALTEN. GEFERTIGT IN DEUTSCHLAND.
                    </p>
                </div>
            </footer>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
        
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
          background: white;
        }

        html {
          scroll-behavior: smooth;
        }

        .shadow-wow {
            box-shadow: 0 40px 100px -20px rgba(128,0,64,0.3), 0 20px 40px -10px rgba(0,0,0,0.1);
        }

        ::selection {
            background-color: #800040;
            color: white;
        }
      `}</style>
        </div>
    );
}
