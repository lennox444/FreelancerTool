'use client';

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { MoveRight, Menu, X, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";

export const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                    <Image
                        src="/logo.svg"
                        alt="FreelanceFlow Logo"
                        width={180}
                        height={36}
                        className="h-9 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-pink-700 transition-colors">
                        Funktionen
                    </Link>
                    <Link href="#solutions" className="text-sm font-medium text-slate-600 hover:text-pink-700 transition-colors">
                        Lösungen
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-pink-700 transition-colors">
                        Preise
                    </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {mounted && isAuthenticated ? (
                        <Link href="/dashboard">
                            <Button size="sm" className="gap-2 bg-[var(--primary)] hover:bg-pink-800 text-white shadow-lg shadow-pink-500/20 transition-all">
                                <LayoutDashboard className="w-4 h-4" />
                                Zum Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-pink-700 transition-colors">
                                Anmelden
                            </Link>
                            <Link href="/register">
                                <Button size="sm" className="gap-2 bg-[var(--primary)] hover:bg-pink-800 text-white shadow-lg shadow-pink-500/20 transition-all">
                                    Kostenlos starten <MoveRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-xl"
                    >
                        <div className="container px-4 py-6 flex flex-col gap-4">
                            <Link href="#features" className="text-base font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setIsOpen(false)}>
                                Funktionen
                            </Link>
                            <Link href="#solutions" className="text-base font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setIsOpen(false)}>
                                Lösungen
                            </Link>
                            <Link href="#pricing" className="text-base font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setIsOpen(false)}>
                                Preise
                            </Link>

                            <div className="pt-4 flex flex-col gap-3">
                                {mounted && isAuthenticated ? (
                                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full gap-2 bg-[var(--primary)] hover:bg-pink-800 shadow-lg shadow-pink-500/20">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Zum Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full justify-center">Anmelden</Button>
                                        </Link>
                                        <Link href="/register" className="w-full" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full justify-center bg-[var(--primary)] hover:bg-pink-800 shadow-lg shadow-pink-500/20">Kostenlos starten</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
