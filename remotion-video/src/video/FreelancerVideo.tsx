import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont } from "@remotion/google-fonts/Inter";
import {
  Users, ClipboardList, FileText, CreditCard,
  Clock, Folder, Receipt, Calculator, Globe,
  CheckCircle2, ArrowRight, Zap,
} from "lucide-react";

const { fontFamily } = loadFont();

const WINE = "#800040";
const WINE_LIGHT = "#b5395f";
const DARK = "#0f172a";
const MUTED = "#64748b";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Anim: React.FC<{
  delay?: number;
  from?: { opacity?: number; y?: number; x?: number; scale?: number };
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, from = {}, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 120 } });
  return (
    <div style={{
      opacity: interpolate(p, [0, 1], [from.opacity ?? 0, 1]),
      transform: `translate(${interpolate(p, [0, 1], [from.x ?? 0, 0])}px,${interpolate(p, [0, 1], [from.y ?? 0, 0])}px) scale(${from.scale != null ? interpolate(p, [0, 1], [from.scale, 1]) : 1})`,
      fontFamily, ...style,
    }}>{children}</div>
  );
};

const Bar: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 130 } });
  return <div style={{ width: interpolate(p, [0, 1], [0, 60]), height: 5, background: `linear-gradient(90deg,${WINE},${WINE_LIGHT})`, borderRadius: 3, marginBottom: 28 }} />;
};

// Browser frame (macOS light style)
const Browser: React.FC<{ src: string }> = ({ src }) => (
  <div style={{
    borderRadius: "16px 16px 0 0",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
    background: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  }}>
    <div style={{
      height: 44, background: "#f5f5f7", flexShrink: 0,
      display: "flex", alignItems: "center", padding: "0 18px", gap: 8,
      borderBottom: "1px solid rgba(0,0,0,0.07)",
    }}>
      {["#ff5f57", "#febc2e", "#28c840"].map(c => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
      ))}
      <div style={{
        flex: 1, height: 26, background: "rgba(0,0,0,0.07)", borderRadius: 7,
        marginLeft: 12, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontFamily, color: MUTED, letterSpacing: 0.3,
      }}>
        freelanceflow.app
      </div>
    </div>
    <div style={{ flex: 1, overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ width: "100%", display: "block" }} />
    </div>
  </div>
);

// Bullet row (large, 1080px canvas)
const Bullet: React.FC<{ icon: React.ReactNode; text: string; delay?: number }> = ({ icon, text, delay = 0 }) => (
  <Anim delay={delay} from={{ opacity: 0, x: -24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: "rgba(128,0,64,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <span style={{ fontSize: 30, fontWeight: 500, color: DARK, lineHeight: 1.3, fontFamily }}>{text}</span>
    </div>
  </Anim>
);

// ─── Scene template: screenshot top (55%) + text bottom (45%) ─────────────────

const FeatureScene: React.FC<{
  title: string;
  body: string;
  bullets?: { icon: React.ReactNode; text: string }[];
  src: string;
  extra?: React.ReactNode;
}> = ({ title, body, bullets, src, extra }) => (
  <AbsoluteFill style={{ background: "#fff" }}>
    {/* Screenshot area — top 70% */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "70%", padding: "24px 24px 0 24px" }}>
      <Anim delay={4} from={{ opacity: 0, y: -20, scale: 0.97 }} style={{ height: "100%" }}>
        <Browser src={src} />
      </Anim>
    </div>

    {/* Text area — bottom 30% */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
      padding: "24px 52px 32px 52px",
      borderTop: "1px solid rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <Bar delay={6} />
      <Anim delay={6} from={{ opacity: 0, y: 20 }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: DARK, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 12, fontFamily }}>
          {title}
        </div>
      </Anim>
      <Anim delay={16} from={{ opacity: 0, y: 16 }}>
        <div style={{ fontSize: 28, color: MUTED, lineHeight: 1.45, fontFamily, marginBottom: bullets || extra ? 18 : 0 }}>
          {body}
        </div>
      </Anim>
      {bullets && (
        <div style={{ display: "flex", gap: 28 }}>
          {bullets.map(({ icon, text }, i) => <Bullet key={text} icon={icon} text={text} delay={26 + i * 8} />)}
        </div>
      )}
      {extra}
    </div>
  </AbsoluteFill>
);

// ─── Scenes ───────────────────────────────────────────────────────────────────

const Intro: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
    {/* Subtle wine glow */}
    <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: "radial-gradient(ellipse, rgba(128,0,64,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

    <Anim delay={0} from={{ opacity: 0, scale: 0.85 }}>
      <div style={{ fontSize: 18, fontFamily, fontWeight: 700, color: WINE, letterSpacing: 6, textTransform: "uppercase", marginBottom: 36, textAlign: "center" }}>
        Dein Business. Organisiert.
      </div>
    </Anim>
    <Anim delay={8} from={{ opacity: 0, y: 48 }}>
      <div style={{ fontSize: 120, fontFamily, fontWeight: 800, color: DARK, lineHeight: 0.92, textAlign: "center", letterSpacing: "-0.04em" }}>
        Freelance
        <span style={{ background: `linear-gradient(135deg,${WINE},${WINE_LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Flow
        </span>
      </div>
    </Anim>
    <Anim delay={22} from={{ opacity: 0, y: 28 }}>
      <div style={{ fontSize: 36, fontFamily, fontWeight: 400, color: MUTED, textAlign: "center", marginTop: 36, letterSpacing: "-0.01em", maxWidth: 800, lineHeight: 1.4 }}>
        Das All-in-One Tool für deutsche Freelancer
      </div>
    </Anim>
  </AbsoluteFill>
);

const Kunden: React.FC = () => (
  <FeatureScene
    src="screenshots/customers.png"
    title="Kunden im Griff"
    body="Kontakte & Auftragshistorie zentral verwalten."
    bullets={[
      { icon: <Users size={26} color={WINE} />, text: "Schnelle Anlage" },
      { icon: <CheckCircle2 size={26} color={WINE} />, text: "Volle Historie" },
    ]}
  />
);

const Angebote: React.FC = () => (
  <FeatureScene
    src="screenshots/quotes.png"
    title="Angebote. Sofort."
    body="PDF in Sekunden – per Klick zur Rechnung."
    bullets={[
      { icon: <ClipboardList size={26} color={WINE} />, text: "PDF-Export" },
      { icon: <ArrowRight size={26} color={WINE} />, text: "1-Klick → Rechnung" },
    ]}
  />
);

const Rechnung: React.FC = () => (
  <FeatureScene
    src="screenshots/invoices.png"
    title="Rechnungen in Sekunden"
    body="Rechtssicher, mit automatischem Mahnwesen."
    bullets={[
      { icon: <FileText size={26} color={WINE} />, text: "PDF-Export" },
      { icon: <CheckCircle2 size={26} color={WINE} />, text: "Auto-Mahnwesen" },
    ]}
  />
);

const Portal: React.FC = () => (
  <FeatureScene
    src="screenshots/client-portal.png"
    title="Dein Kundenportal"
    body="Jede Rechnung bekommt einen Link – Kunden zahlen direkt online, ganz ohne Login."
    bullets={[
      { icon: <Globe size={26} color={WINE} />, text: "Kein Login nötig" },
      { icon: <Zap size={26} color={WINE} />, text: "Online-Zahlung (Stripe)" },
    ]}
  />
);

const Projekte: React.FC = () => (
  <FeatureScene
    src="screenshots/projects.png"
    title="Zeit & Budget"
    body="Live-Timer pro Projekt – kein Budget geht verloren."
    bullets={[
      { icon: <Clock size={26} color={WINE} />, text: "Live-Timer" },
      { icon: <Folder size={26} color={WINE} />, text: "Budget-Tracking" },
    ]}
  />
);

const Finanzen: React.FC = () => (
  <FeatureScene
    src="screenshots/tax-assistant.png"
    title="Finanzen & Steuern"
    body="Ausgaben tracken, Steuerlast automatisch berechnen."
    bullets={[
      { icon: <Receipt size={26} color={WINE} />, text: "Ausgaben-Tracking" },
      { icon: <Calculator size={26} color={WINE} />, text: "Steuer-Assistent" },
    ]}
  />
);

const CTA: React.FC = () => {
  const items = [
    { icon: <Users size={28} color={WINE} />, label: "Kunden" },
    { icon: <ClipboardList size={28} color={WINE} />, label: "Angebote" },
    { icon: <FileText size={28} color={WINE} />, label: "Rechnungen" },
    { icon: <Globe size={28} color={WINE} />, label: "Kundenportal" },
    { icon: <CreditCard size={28} color={WINE} />, label: "Zahlungen" },
    { icon: <Clock size={28} color={WINE} />, label: "Zeiterfassung" },
    { icon: <Folder size={28} color={WINE} />, label: "Projekte" },
    { icon: <Receipt size={28} color={WINE} />, label: "Ausgaben" },
    { icon: <Calculator size={28} color={WINE} />, label: "Steuer" },
  ];

  return (
    <AbsoluteFill style={{ background: "#fff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 56px" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(128,0,64,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Anim delay={0} from={{ opacity: 0, y: 28 }}>
        <div style={{ fontSize: 18, fontFamily, fontWeight: 700, color: WINE, letterSpacing: 6, textTransform: "uppercase", marginBottom: 28, textAlign: "center" }}>Alles in einem Tool</div>
      </Anim>
      <Anim delay={8} from={{ opacity: 0, y: 44 }}>
        <div style={{ fontSize: 110, fontFamily, fontWeight: 800, color: DARK, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 0.92, marginBottom: 28 }}>
          Freelance<span style={{ background: `linear-gradient(135deg,${WINE},${WINE_LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flow</span>
        </div>
      </Anim>

      <div style={{ display: "flex", gap: 14, marginBottom: 52, flexWrap: "wrap", justifyContent: "center", maxWidth: 920 }}>
        {items.map(({ icon, label }, i) => (
          <Anim key={label} delay={20 + i * 4} from={{ opacity: 0, y: 24, scale: 0.78 }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              padding: "20px 24px",
              background: "#f8fafc",
              border: "1px solid rgba(0,0,0,0.07)",
              borderRadius: 18, minWidth: 100,
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              fontFamily,
            }}>
              {icon}
              <span style={{ fontSize: 17, fontWeight: 600, color: DARK }}>{label}</span>
            </div>
          </Anim>
        ))}
      </div>

    </AbsoluteFill>
  );
};

// ─── Composition ──────────────────────────────────────────────────────────────
const T = 18;

export const FreelancerVideo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={95}><Intro /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={200}><Kunden /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 28 }, durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={200}><Angebote /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 28 }, durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={200}><Rechnung /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 28 }, durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={210}><Portal /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 28 }, durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={200}><Projekte /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 28 }, durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={210}><Finanzen /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

    <TransitionSeries.Sequence durationInFrames={380}><CTA /></TransitionSeries.Sequence>
  </TransitionSeries>
);
