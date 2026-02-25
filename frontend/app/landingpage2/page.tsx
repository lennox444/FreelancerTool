'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Menu, X, Check, Clock, Users, Zap, Shield, Star, Search, Layout,
    BarChart3, FileText, CreditCard, Target, Send, Download, Briefcase,
    Wallet, PieChart, TrendingUp, TrendingDown, ShieldCheck, Calendar, ArrowRight,
    Fingerprint, Lock, ShieldAlert, BadgeEuro, Sparkles, ChevronRight
} from 'lucide-react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useTransform,
    useInView,
    useSpring,
    useVelocity,
    useMotionValue,
    useMotionTemplate
} from 'framer-motion';
import PixelBlast from '@/components/landing/PixelBlast';

// --- ADVANCED COMPONENTS ---

const GlowCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            onMouseMove={onMouseMove}
            className={`group relative rounded-[2.5rem] border border-slate-200 bg-white p-8 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-[#800040]/20 ${className}`}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            600px circle at ${mouseX}px ${mouseY}px,
                            rgba(128, 0, 64, 0.06),
                            transparent 80%
                        )
                    `,
                }}
            />
            <div className="relative z-10">{children}</div>
        </div>
    );
};

const MagneticButton = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current!.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    const { x, y } = position;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const Reveal = ({ children, delay = 0, y = 20, x = 0 }: { children: React.ReactNode, delay?: number, y?: number, x?: number }) => (
    <motion.div
        initial={{ opacity: 0, y, x }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);

// --- MAIN LANDING PAGE ---

export default function LandingPage2() {
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

    // Parallax values
    const heroContentY = useTransform(smoothProgress, [0, 0.3], [0, 150]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
    const bgScale = useTransform(smoothProgress, [0, 0.5], [1, 1.1]);

    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#800040] selection:text-white overflow-x-hidden antialiased">

            {/* Custom Cursor-glow effect in background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ scale: bgScale }}
                    className="absolute inset-0 transition-opacity duration-1000"
                >
                    <div className="absolute top-[-10%] left-[-10%] w-[1200px] h-[1200px] bg-[#800040]/5 rounded-full blur-[200px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-blue-500/[0.03] rounded-full blur-[180px]" />
                </motion.div>
            </div>

            {/* --- NAV BAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${isScrolled ? 'py-4' : 'py-8'
                }`}>
                <div className="container mx-auto px-6">
                    <div className={`mx-auto max-w-7xl flex items-center justify-between px-8 py-3 rounded-full transition-all duration-700 ${isScrolled ? 'bg-white/80 backdrop-blur-2xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]' : 'bg-transparent'
                        }`}>
                        <Link href="/" className="group flex items-center gap-2">
                            <Image
                                src="/logo.svg"
                                alt="Logo"
                                width={140}
                                height={30}
                                className="h-7 w-auto transition-transform group-hover:scale-105"
                                priority
                            />
                        </Link>

                        <div className="hidden lg:flex items-center gap-10">
                            {['Funktionen', 'Steuern', 'Preise'].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-[#800040] transition-colors"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-8">
                            <Link href="/login" className="hidden md:block text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors">Login</Link>
                            <MagneticButton>
                                <Link href="/register">
                                    <button className="bg-[#800040] text-white text-[10px] font-black px-8 py-3 rounded-full shadow-[0_10px_30px_rgba(128,0,64,0.3)] hover:bg-slate-950 transition-all uppercase tracking-widest active:scale-95">
                                        Gratis Starten
                                    </button>
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[110vh] flex items-center justify-center pt-20 overflow-visible isolate">
                <div className="absolute inset-0 -z-10 bg-white">
                    <div className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                        <PixelBlast variant="square" pixelSize={2} color="#800040" patternScale={4} patternDensity={0.4} speed={0.2} transparent />
                    </div>
                </div>

                <motion.div
                    style={{ y: heroContentY, opacity: heroOpacity }}
                    className="container mx-auto px-6 relative"
                >
                    {/* Floating elements with deep parallax */}
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                        {/* 3D Looking UI Card 1 */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[10%] left-[2%] hidden 2xl:block p-6 rounded-[2.5rem] bg-white shadow-3xl border border-slate-100 z-20 backdrop-blur-sm"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Netto-Gewinn</p>
                                    <p className="text-xl font-black text-slate-950 mt-1">€8.420,00</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-32 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "75%" }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="h-full bg-green-500 rounded-full"
                                />
                            </div>
                        </motion.div>

                        {/* Interactive Invoicing Card 2 */}
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-[20%] right-[5%] hidden 2xl:block p-8 rounded-[3rem] bg-slate-950 text-white shadow-wow z-20"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Check size={20} className="text-[#800040]" /></div>
                                <Sparkles className="text-white/20" size={16} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Rechnung bezahlt</p>
                            <p className="text-3xl font-black tracking-tighter">€4.250,00</p>
                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800" />)}
                                </div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Stripe Sync</span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="max-w-[1200px] mx-auto text-center">
                        <Reveal delay={0.1}>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-slate-200 bg-white/50 text-[#800040] text-[10px] font-black uppercase tracking-[0.3em] mb-12 shadow-sm backdrop-blur-md cursor-default transition-all hover:border-[#800040]/30"
                            >
                                <div className="w-2 h-2 rounded-full bg-[#800040] animate-ping" />
                                Dein Business in einer Hand
                            </motion.div>
                        </Reveal>

                        <Reveal delay={0.2} y={30}>
                            <h1 className="text-[60px] md:text-[120px] lg:text-[180px] font-black tracking-[-0.08em] leading-[0.78] text-slate-950 mb-12 py-4">
                                Arbeite im <br />
                                <span className="relative inline-block">
                                    <span className="text-[#800040] relative z-10 italic">Flow.</span>
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute bottom-[10%] left-0 w-full h-[15%] bg-[#800040]/5 -z-10 origin-left"
                                    />
                                </span>
                            </h1>
                        </Reveal>

                        <Reveal delay={0.4}>
                            <p className="text-xl md:text-4xl text-slate-400 font-bold max-w-3xl mx-auto mb-20 leading-tight">
                                Projekte & Rechnungen steuern. <br className="hidden md:block" />
                                <span className="text-slate-900">Ohne Reibungsverluste. 100% Freelancer.</span>
                            </p>
                        </Reveal>

                        <Reveal delay={0.5}>
                            <div className="flex flex-col sm:flex-row gap-6 items-center justify-center max-w-3xl mx-auto mb-24">
                                <div className="flex-1 w-full bg-white p-2 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center group transition-all focus-within:ring-4 focus-within:ring-[#800040]/5 overflow-hidden">
                                    <input
                                        type="email"
                                        placeholder="Deine E-Mail Adresse"
                                        className="bg-transparent border-none focus:ring-0 w-full px-8 py-4 text-lg font-bold placeholder:text-slate-300"
                                    />
                                    <button className="whitespace-nowrap bg-slate-950 text-white px-12 py-5 rounded-[1.8rem] font-black text-sm uppercase shadow-xl hover:bg-[#800040] transition-all hover:scale-[1.02] active:scale-95 m-1 tracking-widest">
                                        LOSLEGEN
                                    </button>
                                </div>
                            </div>
                        </Reveal>

                        {/* Scrolling tags */}
                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 pb-20">
                            {['IT-Experten', 'Kreative', 'Consultants', 'Entwickler', 'Designer'].map((tag, i) => (
                                <motion.span
                                    key={tag}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.3 }}
                                    transition={{ delay: 1 + i * 0.1 }}
                                    className="hover:text-[#800040] hover:opacity-100 transition-all cursor-default"
                                >
                                    {tag}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* --- SOLUTIONS: THE "INFINITY" GRID --- */}
            <section id="funktionen" className="py-32 relative bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mb-32">
                        <Reveal x={-30}>
                            <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#800040] mb-12">Systemkomponenten</h2>
                            <p className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none mb-12">
                                Dein gesamtes Business, <br /> perfekt synchronisiert.
                            </p>
                            <p className="text-2xl text-slate-400 font-bold max-w-2xl">
                                Keine überladene Software für Agenturen. Wir haben FreelancerTool für die Präzision der Solo-Selbstständigkeit entworfen.
                            </p>
                        </Reveal>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Layout, title: "Projekt-Dashboard", desc: "Zentraler Überblick über alle aktiven Mandate, Budgets und Deadlines in Echtzeit.", delay: 0 },
                            { icon: FileText, title: "Rechnungs-Engine", desc: "Professionelle Rechnungen inkl. Kleinunternehmer-Status und automatischem Versand.", delay: 0.1 },
                            { icon: Search, title: "DATEV-Schnittstelle", desc: "Vollständiger EXTF-Export für deinen Steuerberater. Kompatibel mit allen Kanzlei-Systemen.", delay: 0.2 },
                            { icon: PieChart, title: "Gewinn-Fokus", desc: "Berechnung deiner tatsächlichen Rentabilität pro Stunde nach Abzug aller Kosten.", delay: 0.3 },
                            { icon: Lock, title: "Mahn-Automation", desc: "Dezent, aber konsequent: Automatisierte Zahlungserinnerungen für pünktliche Cashflows.", delay: 0.4 },
                            { icon: ShieldCheck, title: "DSGVO-Sicherheit", desc: "Hosting in Deutschland, Ende-zu-Ende verschlüsselt und 100% datenschutzkonform.", delay: 0.5 },
                        ].map((item, i) => (
                            <Reveal key={i} delay={item.delay} y={40}>
                                <GlowCard className="h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#800040] mb-8 group-hover:scale-110 group-hover:bg-[#800040] group-hover:text-white transition-all duration-500">
                                        <item.icon size={28} />
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-slate-400 font-bold leading-relaxed">{item.desc}</p>
                                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#800040]">Mehr Erfahren</span>
                                        <ChevronRight size={16} className="text-[#800040]" />
                                    </div>
                                </GlowCard>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- THE TAX ENGINE: IMMERSIVE STATS --- */}
            <section id="steuern" className="py-40 relative bg-slate-50/50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-32">
                        <div className="flex-1">
                            <Reveal x={-30}>
                                <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#800040] mb-12">Intelligenz Kern</h3>
                                <h2 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter leading-none mb-12">
                                    Nie wieder Angst vorm Finanzamt.
                                </h2>
                                <p className="text-xl text-slate-500 font-bold mb-16 max-w-xl">
                                    Das FreelancerTool berechnet deine voraussichtliche Einkommen- und Umsatzsteuerbelastung in Echtzeit auf Basis des deutschen Steuertarifs.
                                </p>

                                <div className="space-y-8">
                                    {[
                                        "Automatisierte Steuerrücklagen-Berechnung",
                                        "Umsatzsteuer-Voranmeldung im Blick",
                                        "Berücksichtigung der Kleinunternehmer-Regel",
                                        "Finanzamts-konforme Archivierung"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-6">
                                            <div className="w-6 h-6 rounded-full bg-white border-2 border-[#800040]/20 flex items-center justify-center text-[#800040]">
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                            <span className="text-lg font-black text-slate-950">{text}</span>
                                        </div>
                                    ))}
                                </div>

                                <p className="text-[10px] font-bold text-slate-300 leading-relaxed max-w-md mt-16 italic border-l border-slate-200 pl-6">
                                    * Die Berechnungen stellen keine steuerliche Beratung dar und ersetzen nicht die fachliche Prüfung durch einen qualifizierten Steuerberater.
                                </p>
                            </Reveal>
                        </div>

                        <div className="flex-1 w-full perspective-1000">
                            <Reveal x={30}>
                                <motion.div
                                    whileHover={{ rotateY: -5, rotateX: 5 }}
                                    className="relative p-12 rounded-[5rem] bg-white border border-slate-200 shadow-wow overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#800040]/5 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />

                                    <div className="flex items-center gap-6 mb-16">
                                        <div className="w-16 h-16 rounded-[2rem] bg-slate-950 text-white flex items-center justify-center shadow-xl"><PieChart size={32} /></div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-950">Steuer-Cockpit</h4>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Aktuelles Quartal</p>
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        <div>
                                            <div className="flex justify-between items-end mb-4">
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Einkommensteuer</span>
                                                <span className="text-4xl font-black text-slate-950">€6.420</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: "65%" }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-slate-950 rounded-full"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end mb-4">
                                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Umsatzsteuer (19%)</span>
                                                <span className="text-4xl font-black text-[#800040]">€4.120</span>
                                            </div>
                                            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: "40%" }}
                                                    transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                                                    className="h-full bg-[#800040] rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-20 p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Empfohlene Rücklage</p>
                                        <p className="text-4xl font-black text-slate-950 tracking-tighter">€10.540,00</p>
                                    </div>
                                </motion.div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING & FINAL CTA: THE "GLASS" FINALE --- */}
            <section id="preise" className="py-40 relative overflow-visible">
                <div className="container mx-auto px-6 max-w-5xl text-center">
                    <Reveal y={20}>
                        <h2 className="text-6xl md:text-[140px] font-black mb-32 tracking-[-0.08em] leading-none text-slate-950 py-4">
                            Komm in den <br /> <span className="text-[#800040] italic">Flow.</span>
                        </h2>
                    </Reveal>

                    <Reveal y={40} delay={0.2}>
                        <div className="relative p-12 md:p-24 rounded-[5rem] bg-[#800040] text-white shadow-[0_60px_120px_rgba(128,0,64,0.4)] overflow-hidden text-left flex flex-col lg:flex-row items-center gap-20">

                            {/* Reflective Blobs (Advanced CSS & Motion) */}
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0] }}
                                transition={{ duration: 20, repeat: Infinity }}
                                className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"
                            />
                            <motion.div
                                animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0], y: [0, -50, 0] }}
                                transition={{ duration: 15, repeat: Infinity }}
                                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 pointer-events-none"
                            />

                            {/* Moving Shine Layer */}
                            <motion.div
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                            />

                            <div className="flex-1 text-center md:text-left relative z-10">
                                <h3 className="text-[12px] font-black uppercase text-pink-200/50 tracking-[0.6em] mb-8">Voller Leistungsumfang</h3>
                                <div className="text-[100px] font-black leading-none tracking-tighter mb-6">25€</div>
                                <p className="text-white/40 font-black uppercase tracking-widest text-[11px] mb-12">pro Monat · Professionelle Steuerung inklusive</p>

                                <MagneticButton className="w-full">
                                    <Link href="/register" className="block transform">
                                        <button className="w-full bg-white text-[#800040] py-7 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest hover:bg-pink-50 transition-all shadow-4xl active:scale-95">
                                            GRATIS TESTEN
                                        </button>
                                    </Link>
                                </MagneticButton>

                                <div className="mt-8 flex items-center justify-center md:justify-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <p className="text-white/30 text-[11px] font-black uppercase tracking-widest">Keine Kreditkarte nötig · 14 Tage Proberunde</p>
                                </div>
                            </div>

                            <div className="flex-1 w-full lg:border-l border-white/10 pt-20 lg:pt-0 lg:pl-24 relative z-10">
                                <ul className="space-y-8">
                                    {[
                                        "Alle Management-Module aktiv",
                                        "Unbegrenzte Rechnungen (PDF)",
                                        "Voller DATEV-Export Support",
                                        "Deutsches Hosting & DSGVO",
                                        "Jederzeit monatlich kündbar"
                                    ].map((item, i) => (
                                        <motion.li
                                            key={item}
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.8 }}
                                            className="flex items-center gap-6"
                                        >
                                            <div className="w-8 h-8 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                <Check size={18} className="text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-xl font-black tracking-tight">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* --- FOOTER: FINAL IMPACT --- */}
            <footer className="pt-40 pb-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-32 mb-40">
                        <div className="max-w-md">
                            <Link href="/" className="mb-12 block group">
                                <Image src="/logo.svg" alt="Logo" width={160} height={40} className="h-10 w-auto transition-transform group-hover:scale-105" />
                            </Link>
                            <p className="text-2xl text-slate-400 font-bold leading-relaxed">
                                Wir bauen Software für Freelancer, die ihre Arbeit lieben und ihren Verwaltungsaufwand minimieren wollen.
                            </p>
                            <div className="flex gap-6 mt-12 opacity-30 hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                                <div className="w-10 h-10 rounded-full bg-slate-100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
                            {[
                                { title: 'Produkt', links: ['Funktionen', 'Dashboard', 'Preise', 'DATEV Integration'] },
                                { title: 'Sicherheit', links: ['Impressum', 'Datenschutz', 'AGB', 'Server-Status'] },
                                { title: 'Netzwerk', links: ['Support', 'Twitter (X)', 'LinkedIn', 'Partner'] }
                            ].map((col, i) => (
                                <div key={i}>
                                    <h5 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-900 mb-10">{col.title}</h5>
                                    <ul className="space-y-5">
                                        {col.links.map(l => (
                                            <li key={l}><Link href="#" className="text-slate-400 hover:text-[#800040] text-sm font-bold transition-all block">{l}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-20 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-10">
                        <p className="text-slate-300 text-[11px] font-black uppercase tracking-[0.5em]">
                            © {new Date().getFullYear()} FREELANCERTOOL. GEFERTIGT IN DEUTSCHLAND.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">DSGVO Konform</span>
                            <div className="w-px h-4 bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Keine Datenauswertung</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');
                
                body {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    letter-spacing: -0.01em;
                    background: white;
                    color: #0f172a;
                }

                html {
                    scroll-behavior: smooth;
                }

                .shadow-wow {
                    box-shadow: 0 40px 100px -20px rgba(128,0,64,0.3), 0 20px 40px -10px rgba(0,0,0,0.1);
                }

                .shadow-3xl {
                    box-shadow: 0 50px 100px -20px rgba(0,0,0,0.08);
                }

                ::selection {
                    background-color: #800040;
                    color: white;
                }

                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}
