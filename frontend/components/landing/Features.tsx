import { Zap, Shield, Clock, BarChart3, Bell, FileText } from "lucide-react";
import SpotlightCard from "@/components/ui/SpotlightCard";

const features = [
    {
        icon: <Clock className="w-6 h-6 text-[#800040]" />,
        title: "Zeitsparende Workflows",
        description: "Automatisiere administrative Aufgaben und fokussiere dich auf das, was wirklich zählt: Deine Arbeit.",
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-pink-600" />,
        title: "Finanzielle Übersicht",
        description: "Behalte deine Einnahmen, Ausgaben und offenen Posten jederzeit im Blick mit intuitiven Dashboards.",
    },
    {
        icon: <Shield className="w-6 h-6 text-emerald-600" />,
        title: "Sichere Daten",
        description: "Deine Daten sind bei uns sicher. Wir nutzen modernste Verschlüsselungstechnologien.",
    },
    {
        icon: <Bell className="w-6 h-6 text-amber-600" />,
        title: "Automatisierte Erinnerungen",
        description: "Nie wieder Fristen verpassen. Unser System erinnert dich und deine Kunden automatisch.",
    },
    {
        icon: <FileText className="w-6 h-6 text-purple-600" />,
        title: "Angebote & Rechnungen",
        description: "Erstelle professionelle Dokumente in Sekunden und versende sie direkt aus der App.",
    },
    {
        icon: <Zap className="w-6 h-6 text-rose-600" />,
        title: "Schnelle Einrichtung",
        description: "In wenigen Minuten startklar. Keine komplizierte Konfiguration nötig.",
    }
];

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        Alles was du brauchst, <br /> um dein Business zu skalieren
                    </h2>
                    <p className="text-lg text-slate-600">
                        Wir haben FreelanceFlow entwickelt, um die nervigsten Probleme des Freelancer-Alltags zu lösen.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <SpotlightCard
                            key={idx}
                            className="group p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            spotlightColor="rgba(128, 0, 64, 0.2)"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-pink-50 transition-colors relative z-10">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-[#800040] transition-colors relative z-10">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed relative z-10">
                                {feature.description}
                            </p>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
};
