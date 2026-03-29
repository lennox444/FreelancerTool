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
import { wipe } from "@remotion/transitions/wipe";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

// ─── Design Tokens (matched to FreelancerTool app) ────────────────────────────
const SLATE_900 = "#0f172a"; // app sidebar bg
const SLATE_800 = "#1e293b"; // app card/border bg
const SLATE_700 = "#334155"; // subtle borders
const SLATE_400 = "#94a3b8"; // muted text
const WINE = "#800040"; // app primary accent
const WINE_LIGHT = "#b5395f"; // lighter wine for gradients
const WINE_GLOW = "rgba(128, 0, 64, 0.18)";
const TEXT = "#f8fafc"; // slate-50
const MUTED = SLATE_400;
const BORDER = "rgba(255,255,255,0.07)";

// ─── Animation primitives ─────────────────────────────────────────────────────

interface AnimProps {
  delay?: number;
  from?: { opacity?: number; y?: number; x?: number; scale?: number };
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Anim: React.FC<AnimProps> = ({ delay = 0, from = {}, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 24, stiffness: 100 } });

  return (
    <div
      style={{
        opacity: interpolate(p, [0, 1], [from.opacity ?? 0, 1]),
        transform: `translate(${interpolate(p, [0, 1], [from.x ?? 0, 0])}px, ${interpolate(p, [0, 1], [from.y ?? 0, 0])}px) scale(${from.scale != null ? interpolate(p, [0, 1], [from.scale, 1]) : 1})`,
        fontFamily,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const AccentLine: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 120 } });
  return (
    <div
      style={{
        width: interpolate(p, [0, 1], [0, 52]),
        height: 4,
        background: `linear-gradient(90deg, ${WINE}, ${WINE_LIGHT})`,
        borderRadius: 2,
        marginBottom: 18,
      }}
    />
  );
};

// Animated background matching app's slate-900 + subtle wine glow
const Bg: React.FC<{ glowX?: string; glowY?: string }> = ({
  glowX = "60%",
  glowY = "40%",
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 8;
  return (
    <AbsoluteFill
      style={{
        background: SLATE_900,
      }}
    >
      {/* Subtle wine glow */}
      <div
        style={{
          position: "absolute",
          top: glowY,
          left: glowX,
          transform: `translate(-50%, -50%) translate(${drift}px, 0)`,
          width: 700,
          height: 420,
          background: `radial-gradient(ellipse, ${WINE_GLOW} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      {/* Faint slate grid lines for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${SLATE_800}18 1px, transparent 1px), linear-gradient(90deg, ${SLATE_800}18 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

// Browser chrome wrapper (slate-800 toolbar, matches app)
const Browser: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px ${SLATE_700}`,
      ...style,
    }}
  >
    <div
      style={{
        height: 36,
        background: SLATE_800,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 7,
        borderBottom: `1px solid ${SLATE_700}`,
      }}
    >
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div
          key={c}
          style={{ width: 11, height: 11, borderRadius: "50%", background: c }}
        />
      ))}
      <div
        style={{
          flex: 1,
          height: 21,
          background: SLATE_900,
          borderRadius: 5,
          marginLeft: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontFamily,
          color: MUTED,
          letterSpacing: 0.3,
        }}
      >
        freelancertool.app
      </div>
    </div>
    {children}
  </div>
);

// ─── Reusable layout: text left/right + screenshot ────────────────────────────

const Scene: React.FC<{
  bg?: React.ReactNode;
  textSide: "left" | "right";
  title: string;
  body: string;
  bullets?: { icon: string; text: string }[];
  extra?: React.ReactNode;
  screenshotSrc: string;
}> = ({ bg, textSide, title, body, bullets, extra, screenshotSrc }) => {
  const fromText = textSide === "left" ? { x: -40 } : { x: 40 };
  const fromShot = textSide === "left" ? { x: 60 } : { x: -60 };

  const textBlock = (
    <div style={{ flex: "0 0 440px", display: "flex", flexDirection: "column" }}>
      <AccentLine delay={4} />
      <Anim delay={4} from={{ opacity: 0, ...fromText }}>
        <div
          style={{
            fontSize: 46,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.18,
            marginBottom: 16,
            fontFamily,
          }}
        >
          {title}
        </div>
      </Anim>
      <Anim delay={12} from={{ opacity: 0, ...fromText }}>
        <div
          style={{
            fontSize: 18,
            color: MUTED,
            lineHeight: 1.65,
            marginBottom: bullets || extra ? 24 : 0,
            fontFamily,
          }}
        >
          {body}
        </div>
      </Anim>
      {bullets && (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {bullets.map(({ icon, text }, i) => (
            <Anim key={text} delay={18 + i * 7} from={{ opacity: 0, x: fromText.x * 0.5 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 17,
                  fontFamily,
                  color: TEXT,
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span>{text}</span>
              </div>
            </Anim>
          ))}
        </div>
      )}
      {extra}
    </div>
  );

  const shotBlock = (
    <div style={{ flex: 1 }}>
      <Anim delay={8} from={{ opacity: 0, scale: 0.94, ...fromShot }}>
        <Browser>
          <Img
            src={staticFile(screenshotSrc)}
            style={{ width: "100%", display: "block" }}
          />
        </Browser>
      </Anim>
    </div>
  );

  return (
    <AbsoluteFill>
      {bg ?? <Bg />}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 72px",
          gap: 56,
        }}
      >
        {textSide === "left" ? (
          <>
            {textBlock}
            {shotBlock}
          </>
        ) : (
          <>
            {shotBlock}
            {textBlock}
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Individual Scenes ────────────────────────────────────────────────────────

/** 1 — Intro (2.2s) */
const IntroScene: React.FC = () => (
  <AbsoluteFill>
    <Bg glowX="50%" glowY="50%" />
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Anim delay={0} from={{ opacity: 0, scale: 0.82 }}>
        <div
          style={{
            fontSize: 14,
            fontFamily,
            fontWeight: 600,
            color: WINE_LIGHT,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 22,
            textAlign: "center",
          }}
        >
          Dein Business. Organisiert.
        </div>
      </Anim>

      <Anim delay={6} from={{ opacity: 0, y: 44 }}>
        <div
          style={{
            fontSize: 96,
            fontFamily,
            fontWeight: 800,
            color: TEXT,
            lineHeight: 1,
            textAlign: "center",
            letterSpacing: -3,
          }}
        >
          Freelancer
          <span
            style={{
              background: `linear-gradient(135deg, ${WINE}, ${WINE_LIGHT})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tool
          </span>
        </div>
      </Anim>

      <Anim delay={16} from={{ opacity: 0, y: 28 }}>
        <div
          style={{
            fontSize: 24,
            fontFamily,
            color: MUTED,
            textAlign: "center",
            marginTop: 22,
          }}
        >
          Das All-in-One Tool für deutsche Freelancer
        </div>
      </Anim>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** 2 — Kunden anlegen */
const KundenScene: React.FC = () => (
  <Scene
    bg={<Bg glowX="75%" glowY="45%" />}
    textSide="left"
    title="Kunden verwalten"
    body="Lege alle Kunden mit Kontaktdaten und Firmeninfos an – und greife jederzeit auf die komplette Auftragshistorie zu."
    bullets={[
      { icon: "👤", text: "Schnelle Kundenanlage" },
      { icon: "📋", text: "Vollständige Auftragshistorie" },
    ]}
    screenshotSrc="screenshots/customers.png"
  />
);

/** 3 — Angebot erstellen */
const AngeboteScene: React.FC = () => (
  <Scene
    bg={<Bg glowX="25%" glowY="55%" />}
    textSide="right"
    title="Angebote erstellen"
    body="Erstelle in Sekunden professionelle Angebote und sende sie direkt per E-Mail an deinen Kunden."
    bullets={[
      { icon: "📋", text: "Professionelle Angebots-PDFs" },
      { icon: "✉️", text: "Direkter E-Mail-Versand" },
    ]}
    screenshotSrc="screenshots/quotes.png"
  />
);

/** 4 — Angebot → Rechnung + Versand */
const RechnungScene: React.FC = () => (
  <Scene
    bg={<Bg glowX="70%" glowY="35%" />}
    textSide="left"
    title="Rechnungen in einem Klick"
    body="Wandle Angebote direkt in Rechnungen um – mit automatischem Mahnwesen und rechtssicherem PDF."
    bullets={[
      { icon: "📄", text: "Angebot → Rechnung: 1 Klick" },
      { icon: "🔔", text: "Automatisches Mahnwesen" },
    ]}
    screenshotSrc="screenshots/invoices.png"
  />
);

/** 5 — Online-Zahlung & Client Portal */
const ZahlungScene: React.FC = () => (
  <AbsoluteFill>
    <Bg glowX="30%" glowY="50%" />
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 72px",
        gap: 56,
      }}
    >
      <div style={{ flex: 1 }}>
        <Anim delay={6} from={{ opacity: 0, x: -60, scale: 0.94 }}>
          <Browser>
            <Img
              src={staticFile("screenshots/client-portal.png")}
              style={{ width: "100%", display: "block" }}
            />
          </Browser>
        </Anim>
      </div>
      <div style={{ flex: "0 0 440px" }}>
        <AccentLine delay={4} />
        <Anim delay={4} from={{ opacity: 0, x: 40 }}>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.18,
              marginBottom: 16,
              fontFamily,
            }}
          >
            Online bezahlt werden
          </div>
        </Anim>
        <Anim delay={12} from={{ opacity: 0, x: 30 }}>
          <div
            style={{
              fontSize: 18,
              color: MUTED,
              lineHeight: 1.65,
              marginBottom: 24,
              fontFamily,
            }}
          >
            Kunden zahlen direkt über das Client-Portal per Stripe – du
            bekommst das Geld automatisch überwiesen.
          </div>
        </Anim>
        <Anim delay={22} from={{ opacity: 0, y: 18 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 18px",
              background: "rgba(128,0,64,0.15)",
              border: `1px solid rgba(128,0,64,0.35)`,
              borderRadius: 8,
              fontSize: 15,
              fontFamily,
              color: WINE_LIGHT,
              fontWeight: 500,
            }}
          >
            <span>⚡</span>
            <span>Stripe Connect Integration</span>
          </div>
        </Anim>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** 6 — Projekte & Zeiterfassung */
const ProjekteScene: React.FC = () => (
  <Scene
    bg={<Bg glowX="65%" glowY="60%" />}
    textSide="right"
    title="Projekte & Zeiterfassung"
    body="Erfasse Arbeitszeiten sekundengenau per Timer und behalte dein Projektbudget immer im Blick."
    bullets={[
      { icon: "⏱️", text: "Live-Timer & manuelle Einträge" },
      { icon: "💰", text: "Budget-Tracking in Echtzeit" },
    ]}
    screenshotSrc="screenshots/projects.png"
  />
);

/** 7 — Ausgaben & Steuer */
const FinanzenScene: React.FC = () => (
  <AbsoluteFill>
    <Bg glowX="40%" glowY="40%" />
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 72px",
        gap: 56,
      }}
    >
      <div style={{ flex: "0 0 440px" }}>
        <AccentLine delay={4} />
        <Anim delay={4} from={{ opacity: 0, x: -40 }}>
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.18,
              marginBottom: 16,
              fontFamily,
            }}
          >
            Finanzen & Steuern
          </div>
        </Anim>
        <Anim delay={12} from={{ opacity: 0, x: -30 }}>
          <div
            style={{
              fontSize: 18,
              color: MUTED,
              lineHeight: 1.65,
              marginBottom: 24,
              fontFamily,
            }}
          >
            Ausgaben kategorisiert erfassen, Einnahmen vs. Ausgaben auswerten
            – und die Steuerlast automatisch berechnen lassen.
          </div>
        </Anim>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {[
            { icon: "💸", text: "Ausgaben-Tracking", delay: 18 },
            { icon: "🧮", text: "Steuer-Assistent (Grundtarif 2024)", delay: 25 },
            { icon: "💡", text: "Steuer-Spartipps", delay: 32 },
          ].map(({ icon, text, delay }) => (
            <Anim key={text} delay={delay} from={{ opacity: 0, x: -20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 17,
                  fontFamily,
                  color: TEXT,
                }}
              >
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span>{text}</span>
              </div>
            </Anim>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Anim delay={8} from={{ opacity: 0, x: 60, scale: 0.94 }}>
          <Browser>
            <Img
              src={staticFile("screenshots/tax-assistant.png")}
              style={{ width: "100%", display: "block" }}
            />
          </Browser>
        </Anim>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** 8 — CTA */
const CTAScene: React.FC = () => {
  const features = [
    { icon: "👥", label: "Kunden" },
    { icon: "📋", label: "Angebote" },
    { icon: "🧾", label: "Rechnungen" },
    { icon: "💳", label: "Zahlungen" },
    { icon: "⏱️", label: "Zeiterfassung" },
    { icon: "📁", label: "Projekte" },
    { icon: "💸", label: "Ausgaben" },
    { icon: "🧮", label: "Steuer" },
    { icon: "📅", label: "Kalender" },
  ];

  return (
    <AbsoluteFill>
      <Bg glowX="50%" glowY="50%" />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Anim delay={0} from={{ opacity: 0, y: 30 }}>
          <div
            style={{
              fontSize: 14,
              fontFamily,
              fontWeight: 600,
              color: WINE_LIGHT,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Alles in einem Tool
          </div>
        </Anim>

        <Anim delay={6} from={{ opacity: 0, y: 44 }}>
          <div
            style={{
              fontSize: 84,
              fontFamily,
              fontWeight: 800,
              color: TEXT,
              letterSpacing: -3,
              textAlign: "center",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Freelancer
            <span
              style={{
                background: `linear-gradient(135deg, ${WINE}, ${WINE_LIGHT})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Tool
            </span>
          </div>
        </Anim>

        <Anim delay={15} from={{ opacity: 0, y: 28 }}>
          <div
            style={{
              fontSize: 22,
              fontFamily,
              color: MUTED,
              textAlign: "center",
              marginBottom: 44,
            }}
          >
            Dein Business. Organisiert. Professionell.
          </div>
        </Anim>

        {/* Feature icon grid */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 820,
          }}
        >
          {features.map(({ icon, label }, i) => (
            <Anim
              key={label}
              delay={20 + i * 4}
              from={{ opacity: 0, y: 22, scale: 0.78 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  padding: "14px 18px",
                  background: SLATE_800,
                  border: `1px solid ${SLATE_700}`,
                  borderRadius: 10,
                  minWidth: 82,
                  fontFamily,
                }}
              >
                <span style={{ fontSize: 26 }}>{icon}</span>
                <span
                  style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}
                >
                  {label}
                </span>
              </div>
            </Anim>
          ))}
        </div>

        {/* CTA button */}
        <Anim delay={60} from={{ opacity: 0, y: 22, scale: 0.88 }}>
          <div
            style={{
              padding: "18px 48px",
              background: `linear-gradient(135deg, ${WINE}, ${WINE_LIGHT})`,
              borderRadius: 12,
              fontSize: 22,
              fontFamily,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: 0.2,
              boxShadow: `0 0 48px rgba(128,0,64,0.5)`,
            }}
          >
            Jetzt kostenlos testen →
          </div>
        </Anim>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

const T = 15; // transition overlap in frames

export const FreelancerVideo: React.FC = () => (
  <TransitionSeries>
    {/* 1 – Intro (65f ≈ 2.2s) */}
    <TransitionSeries.Sequence durationInFrames={65}>
      <IntroScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: T })}
    />

    {/* 2 – Kunden (100f ≈ 3.3s) */}
    <TransitionSeries.Sequence durationInFrames={100}>
      <KundenScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={springTiming({ config: { damping: 26 }, durationInFrames: T })}
    />

    {/* 3 – Angebote (100f ≈ 3.3s) */}
    <TransitionSeries.Sequence durationInFrames={100}>
      <AngeboteScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={wipe({ direction: "from-left" })}
      timing={linearTiming({ durationInFrames: T })}
    />

    {/* 4 – Rechnung (100f ≈ 3.3s) */}
    <TransitionSeries.Sequence durationInFrames={100}>
      <RechnungScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={slide({ direction: "from-right" })}
      timing={springTiming({ config: { damping: 26 }, durationInFrames: T })}
    />

    {/* 5 – Online-Zahlung / Client Portal (100f ≈ 3.3s) */}
    <TransitionSeries.Sequence durationInFrames={100}>
      <ZahlungScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: T })}
    />

    {/* 6 – Projekte & Zeit (110f ≈ 3.7s) */}
    <TransitionSeries.Sequence durationInFrames={110}>
      <ProjekteScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={wipe({ direction: "from-right" })}
      timing={linearTiming({ durationInFrames: T })}
    />

    {/* 7 – Finanzen & Steuern (110f ≈ 3.7s) */}
    <TransitionSeries.Sequence durationInFrames={110}>
      <FinanzenScene />
    </TransitionSeries.Sequence>

    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: T })}
    />

    {/* 8 – CTA (320f ≈ 10.7s) */}
    <TransitionSeries.Sequence durationInFrames={320}>
      <CTAScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
