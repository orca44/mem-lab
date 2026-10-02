"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Brain, Check, Database, MessageSquare, Sparkles } from "lucide-react";
import { countLabel, isPersistent, kinds, lifetimeLabel, type MemoryId, type MemoryStore } from "@/lib/memory";

const colors = ["#bcebc6", "#9cbce8", "#bfabea", "#e2bf8b", "#dea5b1"];
const tint = (color: string) => ({ "--visual-accent": color }) as CSSProperties;

// Lights each step in turn when an example runs, in time with the answer revealing below it.
export const flowStepMs = 260;
export function FlowStrip({ selected, count, enabled, played }: { selected: MemoryId; count: number; enabled: boolean; played: boolean }) {
  const [step, setStep] = useState(-1);
  const used = enabled && count > 0;
  const steps = [
    { title: "Ask", icon: MessageSquare, detail: "Your question" },
    { title: "Recall", icon: Database, detail: !enabled ? "Memory off" : count ? countLabel(count) : "No memories" },
    { title: "Assemble", icon: Brain, detail: used ? "Question + memories" : "Question only" },
    { title: "Respond", icon: Sparkles, detail: used ? "Answer uses your details" : "Generic answer" },
  ];
  useEffect(() => {
    if (!played) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStep(3); return; }
    const timers = steps.map((_, i) => window.setTimeout(() => setStep(i), i * flowStepMs));
    return () => timers.forEach(window.clearTimeout);
  }, [played]);
  return <ol className={`flow-strip ${played ? "played" : ""}`} style={tint(colors[kinds.findIndex(k => k.id === selected)])} aria-label="How the answer was built">{steps.map((s, i) => <li key={s.title} className={`${i <= step ? "done" : ""} ${i === 1 && !used ? "bypassed" : ""}`}><span className="flow-strip-icon"><s.icon size={15} /></span><span><strong>{s.title}</strong><small>{s.detail}</small></span>{i < 3 && <i aria-hidden="true" />}</li>)}</ol>;
}

export function LifetimeChart({ memory, storageSaved }: { memory: MemoryStore; storageSaved: boolean }) {
  const [phase, setPhase] = useState(0);
  const phases = ["This chat", "Next chat", "After reload"];
  const total = kinds.reduce((sum, k) => sum + ((phase > 0 && !isPersistent(k.id)) || (phase === 2 && !storageSaved) ? 0 : memory[k.id].length), 0);
  return <section className="visual-panel lifetime-panel" aria-label="Memory lifetime experiment">
    <div className="visual-heading"><div><span className="visual-kicker">THE LIFETIME EXPERIMENT</span><h3>What stays when the conversation ends?</h3></div><span className="visual-tag">PREVIEW · NOTHING IS DELETED</span></div>
    <div className="lifetime-controls" role="group" aria-label="Preview memory lifetime">{phases.map((label, i) => <button key={label} onClick={() => setPhase(i)} aria-pressed={phase === i}><span>0{i + 1}</span>{label}</button>)}</div>
    <div className="lifetime-chart"><div className="lifetime-axis"><span>Memory type</span>{phases.map(label => <span key={label}>{label}</span>)}</div>{kinds.map((k, i) => {
      const persists = isPersistent(k.id);
      const retained = phase === 0 || (persists && (phase === 1 || storageSaved));
      return <div key={k.id} className="lifetime-row" style={tint(colors[i])}><div><i /><strong>{k.name.replace(" memory", "")}</strong><small>{persists && !storageSaved ? "Not saved: storage unavailable" : lifetimeLabel(k.id)}</small></div><div className={`lifetime-track ${retained ? "" : "cleared"}`}><span style={{ width: persists ? (storageSaved ? "100%" : "66.666%") : "33.333%" }} /><div className="lifetime-markers">{phases.map((_, j) => <span key={j} className={j === phase ? "at-phase" : ""}>{(j === 0 || (persists && (j === 1 || storageSaved))) && memory[k.id].length ? <Check size={14} /> : "–"}</span>)}</div></div><span className="lifetime-value">{retained ? memory[k.id].length : 0}<small>{retained && memory[k.id].length === 1 ? "memory" : "memories"}</small></span></div>;
    })}</div>
    <div className="chart-takeaway" aria-live="polite"><strong>{countLabel(total)} carried forward</strong><span>{phase === 0 ? "All five types can supply context in the current session." : phase === 2 && !storageSaved ? "Saving is unavailable or pending, so no current memories are confirmed saved for a reload. Older saved data may still exist." : "Working and short-term memory clear. Facts, events, and playbooks stay for the next chat, and survive a reload while browser saving works."}</span></div>
    <p className="visual-footnote">Uses your current memories from Explore. After a reload, working and short-term memory start again from the examples.</p>
  </section>;
}

const budget = [
  { name: "Question & instructions", value: 2000, color: colors[0], text: "The current request and the assistant’s basic instructions." },
  { name: "Case summary", value: 2000, color: colors[1], text: "A compact account of the conversation and investigation so far." },
  { name: "Facts & work orders", value: 3000, color: colors[2], text: "Selected asset facts and relevant past events, rather than the entire database." },
  { name: "Approved playbook", value: 1000, color: colors[3], text: "The procedure that guides the next step. Output space is reserved separately." },
];

export function CapacityCharts({ buildings, burst, hit }: { buildings: number; burst: number; hit: number }) {
  const [part, setPart] = useState(2);
  const average = buildings * 100 / 86400;
  const max = average * 10;
  const peak = average * burst;
  const x = (n: number) => 44 + (n - 1) / 9 * 340;
  const y = (n: number) => 176 - n / max * 140;
  const format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
  let offset = 0;
  return <div className="capacity-charts">
    <section className="visual-panel traffic-chart" aria-label="Assistant traffic chart"><div className="visual-heading"><div><span className="visual-kicker">DEMAND, MADE VISIBLE</span><h3>Same daily volume. A busier peak.</h3></div></div><div className="chart-legend"><span><i style={{ background: colors[0] }} />Peak demand</span><span><i style={{ background: colors[1] }} />Daily average</span></div>
      <svg viewBox="0 0 400 220" role="img" aria-label={`At ${burst} times average traffic, ${buildings} buildings produce ${format(peak)} peak assistant requests per second, compared with ${format(average)} on average.`}>
        {[0, .5, 1].map(f => <g key={f}><line x1="44" x2="384" y1={y(max * f)} y2={y(max * f)} className="chart-gridline" /><text x="38" y={y(max * f) + 4} textAnchor="end">{format(max * f)}</text></g>)}
        <text x="44" y="16">Assistant requests / second</text>
        <path d={`M44,176 L44,${y(average)} L384,${y(max)} L384,176 Z`} fill="#bcebc6" opacity=".06" />
        <line x1="44" x2="384" y1={y(average)} y2={y(average)} stroke={colors[1]} strokeDasharray="5 5" />
        <path d={`M44,${y(average)} L384,${y(max)}`} fill="none" stroke={colors[0]} strokeWidth="3" className="draw-line" />
        <line x1={x(burst)} x2={x(burst)} y1="28" y2="176" stroke={colors[0]} opacity=".25" />
        <circle className="chart-point-halo" cx={x(burst)} cy={y(peak)} r="12" fill={colors[0]} opacity=".13" /><circle className="chart-point" cx={x(burst)} cy={y(peak)} r="5" fill={colors[0]} />
        {[1, 3, 5, 7, 10].map(n => <text key={n} x={x(n)} y="194" textAnchor="middle">{n}×</text>)}<text x="214" y="214" textAnchor="middle">Peak traffic multiplier</text>
      </svg><div className="chart-takeaway"><strong>{format(peak)} requests / sec</strong><span>At {burst}× traffic · {format(peak * (1 - hit / 100))} asset database reads / sec with the assumed {hit}% cache hit rate.</span></div><p className="visual-footnote">Move the peak slider above. Calculated from the stated assumptions, not observed traffic.</p>
    </section>
    <section className="visual-panel budget-chart" aria-label="Context budget chart"><div className="visual-heading"><div><span className="visual-kicker">RETRIEVE A LITTLE, NOT EVERYTHING</span><h3>A focused context window</h3></div></div><div className="budget-layout"><div className="donut-wrap"><svg viewBox="0 0 180 180" role="img" aria-label="Illustrative 8,000 input token budget: question and instructions 2,000; case summary 2,000; facts and work orders 3,000; approved playbook 1,000.">{budget.map((b, i) => { const start = offset; offset += b.value / 8000 * 100; return <circle key={b.name} cx="90" cy="90" r="65" fill="none" stroke={b.color} strokeWidth={part === i ? 22 : 15} pathLength="100" strokeDasharray={`${b.value / 8000 * 100 - 1.5} ${100 - b.value / 8000 * 100 + 1.5}`} strokeDashoffset={-start} transform="rotate(-90 90 90)" className="budget-segment" opacity={part === i ? 1 : .45} />; })}<text x="90" y="89" textAnchor="middle" className="donut-total">8,000</text><text x="90" y="108" textAnchor="middle">input tokens</text></svg></div><div className="budget-legend" role="group" aria-label="Inspect context allocation">{budget.map((b, i) => <button key={b.name} style={tint(b.color)} aria-pressed={part === i} onClick={() => setPart(i)}><i /><span>{b.name}</span><strong>{b.value.toLocaleString("en-US")}</strong></button>)}</div></div><div className="budget-detail" aria-live="polite" style={tint(budget[part].color)}><strong>{budget[part].name} · {budget[part].value / 80}%</strong><p>{budget[part].text}</p></div><p className="visual-footnote">An example split, not a model limit. The Find lab’s word budget is the same idea, counted in words: keeping retrieved context small leaves room for what matters, and models can overlook details buried in long inputs.</p></section>
  </div>;
}
