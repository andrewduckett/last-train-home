import React, { useState, useEffect, useCallback } from "react";
import { CONFIG } from "./config.js";
import { SCHEDULE, VENUES, SCAVENGER, SCAVENGER_RULES, LINE } from "./data.js";

/* ------------------- localStorage checklist ------------------- */
const STORE_KEY = "crawl-checks-v1";
function useChecks() {
  const [checks, setChecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(checks)); } catch {}
  }, [checks]);
  const toggle = useCallback((id) =>
    setChecks((c) => ({ ...c, [id]: !c[id] })), []);
  const resetMany = useCallback((ids) =>
    setChecks((c) => { const n = { ...c }; ids.forEach((i) => delete n[i]); return n; }), []);
  return { checks, toggle, resetMany };
}

/* ----------------------- Small pieces ------------------------- */
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"
       strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
);

function TimePill({ children }) {
  return (
    <span className="time-pill inline-flex items-center rounded-md px-2 py-1 text-[15px] font-semibold leading-none">
      {children}
    </span>
  );
}

function QuickLink({ href, label, hint }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="flex-1 rounded-2xl px-4 py-3 flex flex-col items-start justify-center active:scale-[.98] transition"
       style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 2px var(--shadow)" }}>
      <span className="font-display font-semibold text-[17px] tracking-wide" style={{ color: "var(--ink)" }}>{label}</span>
      <span className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{hint}</span>
    </a>
  );
}

/* --------------------------- Views ---------------------------- */
function ScheduleView() {
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <QuickLink href={CONFIG.ventraUrl} label="Ventra" hint="Buy & show your pass" />
        <QuickLink href={CONFIG.metraUrl}  label="Metra"  hint="Live train schedules" />
      </div>

      <section className="rail-track pl-9 pr-1">
        {SCHEDULE.map((s, i) => {
          const isDepart = s.kind === "depart";
          const dotStyle = isDepart
            ? { background: "var(--rail)", borderColor: "var(--rail)" }
            : { background: "var(--surface)", borderColor: "var(--accent)" };
          return (
            <div key={i} className="relative pb-5 last:pb-0">
              <span className="absolute -left-9 top-1 w-[22px] h-[22px] rounded-full border-[3px] grid place-items-center"
                    style={dotStyle}>
                {isDepart && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#fff" }} />}
              </span>

              <div className="rounded-2xl p-3.5"
                   style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 2px var(--shadow)" }}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <TimePill>{s.t}</TimePill>
                  <span className="text-[11px] font-semibold uppercase tracking-[.12em]"
                        style={{ color: isDepart ? "var(--rail)" : "var(--accent-ink)" }}>
                    {isDepart ? "▶ " : "◉ "}{s.tag}
                  </span>
                </div>
                <div className="font-display font-semibold text-[18px] leading-snug" style={{ color: "var(--ink)" }}>
                  {s.title}
                </div>
                {s.sub && <div className="text-[13.5px] mt-0.5" style={{ color: "var(--muted)" }}>{s.sub}</div>}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

function MapView() {
  const notSet = CONFIG.myMapsEmbedUrl.includes("PASTE_YOUR");
  return (
    <div className="space-y-4">
      {notSet && (
        <div className="rounded-xl px-3.5 py-3 text-[13px] leading-relaxed"
             style={{ background: "rgba(201,118,42,.12)", border: "1px solid var(--accent)", color: "var(--accent-ink)" }}>
          <b>Map not set yet.</b> Paste your Google My Maps ID into <code>src/config.js</code>
          {" "}(look for <code>PASTE_YOUR_MY_MAPS_ID_HERE</code>), then run <code>npm run build</code>.
        </div>
      )}
      <div className="rounded-2xl overflow-hidden"
           style={{ border: "1px solid var(--line)", boxShadow: "0 1px 3px var(--shadow)", aspectRatio: "3 / 4" }}>
        <iframe title="Crawl route map" src={CONFIG.myMapsEmbedUrl}
                className="w-full h-full" style={{ border: 0 }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <a href={CONFIG.myMapsAppUrl} target="_blank" rel="noopener noreferrer"
         className="block w-full text-center rounded-2xl px-5 py-4 font-display font-semibold text-[19px] tracking-wide active:scale-[.99] transition"
         style={{ background: "var(--accent)", color: "#1a1206", boxShadow: "0 2px 8px var(--shadow)" }}>
        📍 Open in Google Maps App
      </a>
    </div>
  );
}

function VenuesView() {
  return (
    <div className="space-y-4">
      {VENUES.map((v) => (
        <div key={v.stop} className="rounded-2xl overflow-hidden"
             style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 2px var(--shadow)" }}>
          <div className="flex items-baseline gap-2 px-4 py-2.5"
               style={{ background: "var(--board)", color: "var(--board-ink)" }}>
            <span className="font-display font-bold text-[17px] tracking-wide" style={{ color: "#F2A93B" }}>{v.stop}</span>
            <span className="text-[13px] font-board" style={{ color: "var(--board-muted)" }}>{v.town}</span>
          </div>
          <div className="p-2">
            {v.places.map((p, idx) => (
              <React.Fragment key={p.n}>
                {idx > 0 && (
                  <div className="flex items-center gap-2 px-3 my-1">
                    <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                    <span className="text-[11px] font-semibold tracking-widest" style={{ color: "var(--muted)" }}>OR</span>
                    <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="font-semibold text-[16px] truncate" style={{ color: "var(--ink)" }}>{p.n}</div>
                    <div className="text-[13px]" style={{ color: "var(--muted)" }}>{p.a}</div>
                  </div>
                  <a href={"https://www.google.com/maps/search/?api=1&query=" +
                           encodeURIComponent(`${p.n}, ${p.a}, ${v.town}, IL`)}
                     target="_blank" rel="noopener noreferrer"
                     className="flex-none text-[13px] font-semibold rounded-full px-3 py-1.5 active:scale-95 transition"
                     style={{ color: "var(--accent-ink)", border: "1px solid var(--accent)" }}>
                    Directions
                  </a>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckRow({ item, checked, onToggle }) {
  return (
    <label className={"check-row flex items-start gap-3 px-3.5 py-3 cursor-pointer select-none " + (checked ? "done" : "")}>
      <input type="checkbox" checked={!!checked} onChange={onToggle} />
      <span className="check-box mt-[3px]"><Check /></span>
      <span className="check-label flex-1 min-w-0">
        <span className="block text-[15.5px] font-medium leading-snug" style={{ color: "var(--ink)" }}>{item.t}</span>
        {item.d && (
          <span className="block text-[13px] leading-snug mt-0.5" style={{ color: "var(--muted)" }}>{item.d}</span>
        )}
      </span>
      {"p" in item && (
        <span className="font-board text-[13px] font-semibold flex-none mt-[3px]" style={{ color: checked ? "var(--good)" : "var(--muted)" }}>
          {item.p} pts
        </span>
      )}
    </label>
  );
}

function ChecklistCard({ title, items, checks, toggle, onReset, header }) {
  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 2px var(--shadow)" }}>
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h2 className="font-display font-bold text-[19px] tracking-wide" style={{ color: "var(--ink)" }}>{title}</h2>
        <button onClick={onReset} className="text-[12px] font-semibold px-2 py-1 rounded-md" style={{ color: "var(--muted)" }}>
          Reset
        </button>
      </div>
      {header}
      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {items.map((it) => (
          <CheckRow key={it.id} item={it} checked={checks[it.id]} onToggle={() => toggle(it.id)} />
        ))}
      </div>
    </div>
  );
}

function TasksView({ checks, toggle, resetMany }) {
  const earned = SCAVENGER.reduce((s, i) => s + (checks[i.id] ? i.p : 0), 0);
  const total  = SCAVENGER.reduce((s, i) => s + i.p, 0);
  const pct = Math.round((earned / total) * 100);

  const scavengerHeader = (
    <div className="px-4 pb-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-board text-[13px]" style={{ color: "var(--muted)" }}>{pct}% collected</span>
        <span className="font-display font-bold text-[22px]" style={{ color: "var(--accent-ink)" }}>
          {earned}<span className="text-[14px]" style={{ color: "var(--muted)" }}> / {total} pts</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: "var(--accent)" }} />
      </div>
    </div>
  );

  const reset = (ids) => { if (confirm("Clear these checkmarks?")) resetMany(ids); };
  const albumSet = CONFIG.albumUrl && !CONFIG.albumUrl.includes("PASTE_");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden"
           style={{ background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "0 1px 2px var(--shadow)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--board)" }}>
          <span className="text-[15px]">📸</span>
          <span className="font-display font-bold text-[15px] tracking-wide" style={{ color: "#F2A93B" }}>How to score</span>
        </div>
        <div className="px-4 py-3 space-y-1.5">
          {SCAVENGER_RULES.map((r, i) => (
            <div key={i} className="flex gap-2 text-[13.5px] leading-snug" style={{ color: "var(--ink)" }}>
              <span className="flex-none font-bold" style={{ color: "var(--accent-ink)" }}>•</span>
              <span>{r}</span>
            </div>
          ))}
          {albumSet && (
            <a href={CONFIG.albumUrl} target="_blank" rel="noopener noreferrer"
               className="mt-2 block w-full text-center rounded-xl px-4 py-2.5 font-display font-semibold text-[15px] tracking-wide active:scale-[.99] transition"
               style={{ background: "var(--accent)", color: "#1a1206" }}>
              📷 Open group album
            </a>
          )}
        </div>
      </div>

      <ChecklistCard title="Scavenger Hunt" items={SCAVENGER} checks={checks}
        toggle={toggle} header={scavengerHeader} onReset={() => reset(SCAVENGER.map((i) => i.id))} />
    </div>
  );
}

/* --------------------------- Shell ---------------------------- */
const TABS = [
  { id: "schedule", label: "Schedule", icon: "🕑" },
  { id: "map",      label: "Map",      icon: "🗺️" },
  { id: "venues",   label: "Venues",   icon: "🍺" },
  { id: "tasks",    label: "Tasks",    icon: "✅" },
];
const TITLES = { schedule: "Schedule", map: "Route Map", venues: "Venues", tasks: "Tasks" };

export default function App() {
  const [tab, setTab] = useState("schedule");
  const { checks, toggle, resetMany } = useChecks();

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  return (
    <div className="min-h-screen mx-auto max-w-[520px] flex flex-col">
      {/* Station board header */}
      <header className="sticky top-0 z-20"
              style={{ background: "var(--board)", borderBottom: "1px solid var(--board-line)" }}>
        <div className="px-4 pt-3 pb-2.5" style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}>
          <div className="flex items-center gap-2">
            <span className="text-[19px]">🚆</span>
            <h1 className="font-display font-bold text-[21px] tracking-wide" style={{ color: "var(--board-ink)" }}>
              Last Train Home
            </h1>
          </div>
          <p className="font-board text-[11.5px] mt-0.5 truncate" style={{ color: "var(--board-muted)" }}>{LINE}</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4">
        <h2 className="font-display font-semibold text-[13px] uppercase tracking-[.18em] mb-3" style={{ color: "var(--muted)" }}>
          {TITLES[tab]}
        </h2>
        {tab === "schedule" && <ScheduleView />}
        {tab === "map"      && <MapView />}
        {tab === "venues"   && <VenuesView />}
        {tab === "tasks"    && <TasksView checks={checks} toggle={toggle} resetMany={resetMany} />}
        <div className="h-6" />
      </main>

      {/* Sticky bottom nav (the departures board) */}
      <nav className="sticky bottom-0 z-20 safe-bottom"
           style={{ background: "var(--board)", borderTop: "1px solid var(--board-line)" }}>
        <div className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                      aria-current={active ? "page" : undefined}
                      className="relative flex flex-col items-center gap-0.5 py-2.5 active:scale-95 transition">
                {active && <span className="absolute top-0 h-[3px] w-8 rounded-full" style={{ background: "var(--accent)" }} />}
                <span className="text-[19px] leading-none" style={{ opacity: active ? 1 : .55 }}>{t.icon}</span>
                <span className="text-[11px] font-semibold tracking-wide"
                      style={{ color: active ? "#F2A93B" : "var(--board-muted)" }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
