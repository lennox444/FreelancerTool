import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import StarBorder from "@/components/ui/StarBorder";

export const CTA = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6  relative z-10">
                <div className="max-w-5xl mx-auto bg-[#800040] rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden relative shadow-2xl shadow-pink-900/20">
                    {/* Background Patterns */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Bereit, deine Freelance-Karriere <br className="hidden md:block" /> aufs nächste Level zu heben?
                        </h2>
                        <p className="text-pink-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                            Schließe dich tausenden Freelancern an, die mit FreelanceFlow ihre Finanzen im Griff haben und effizienter arbeiten.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/register">
                                <StarBorder as="button" className="rounded-full group" color="#d946ef" speed="4s">
                                    <div className="bg-white text-[#800040] hover:bg-pink-50 h-14 px-8 text-base font-semibold flex items-center justify-center rounded-full transition-all shadow-lg">
                                        Jetzt kostenlos starten
                                    </div>
                                </StarBorder>
                            </Link>
                            <Link href="/#features">
                                <Button variant="outline" size="lg" className="bg-transparent border-pink-300/50 text-white hover:bg-white/10 h-14 px-8 text-base">
                                    Mehr erfahren <MoveRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                        <p className="mt-8 text-sm text-pink-100/60">
                            Keine Kreditkarte erforderlich • 14 Tage kostenlos testen
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
