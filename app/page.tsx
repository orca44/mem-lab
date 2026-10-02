"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookMarked, BookOpen, Brain, Building2, Check, ChevronRight, CircleHelp, Code2, Database, FlaskConical, GitCompareArrows, History, Layers3, Lightbulb, MessageSquare, MousePointerClick, Plus, RotateCcw, Sparkles, Workflow, X, Zap } from "lucide-react";
import { countLabel, initialMemory, isPersistent, kinds, lifetimeLabel, MemoryId, MemoryStore, simulate, upgradeRetiredSeed } from "@/lib/memory";

import Enterprise from "./enterprise";
import LearningLabs from "./learning-labs";
import Sources, { SectionSources } from "./sources";
import { kindIcons } from "./kind-icons";
import { FlowStrip, flowStepMs, LifetimeChart } from "./visuals";

const icons = kindIcons;
type View = "explore" | "compare" | "enterprise" | "sources" | "labs";
type Run = { response: string; used: string[]; enabled: boolean };
const storageKey = "memory-lab-v1";

export default function Home() {
  const [selected, setSelected] = useState<MemoryId>("semantic");
  const [view, setView] = useState<View>("explore");
  const [memory, setMemory] = useState<MemoryStore>(initialMemory);
  const lastStored = useRef<string|null>(null);
  const [conflict, setConflict] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageState, setStorageState] = useState<"checking" | "saved" | "unavailable">("checking");
  const [enabled, setEnabled] = useState(true);
  const [run, setRun] = useState<Run | null>(null);
  const [runId, setRunId] = useState(0);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [visited, setVisited] = useState<MemoryId[]>([]);
  const kind = kinds.find(k => k.id === selected)!;
  const Icon = icons[selected];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      lastStored.current = raw;
      if (raw) {
        const saved: unknown = JSON.parse(raw);
        if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("Invalid saved memory");
        const next = initialMemory();
        let invalidRecords = false;
        for (const k of kinds) {
          if (!isPersistent(k.id)) continue;
          const records = (saved as Record<string, unknown>)[k.id];
          if (!Array.isArray(records) || !records.every((v: unknown) => typeof v === "string")) { invalidRecords = true; continue; }
          next[k.id] = upgradeRetiredSeed(k.id, records.slice(0, 30).map((v: string) => v.slice(0, 300)));
        }
        setMemory(next);
        if (invalidRecords) setNotice("Some saved records were invalid. Usable examples were retained; affected examples use starter records.");
      }
    } catch { setStorageState("unavailable"); setNotice("Saved memories could not be loaded. Starter examples are shown; browser storage may be blocked or contain invalid data."); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || conflict) return;
    let cancelled = false;
    const save = () => {
      if (cancelled) return;
      try {
        const current = localStorage.getItem(storageKey);
        if (current !== lastStored.current) { setConflict(true); setStorageState("checking"); return; }
        const next = JSON.stringify(Object.fromEntries(kinds.filter(k => isPersistent(k.id)).map(k => [k.id, memory[k.id]])));
        localStorage.setItem(storageKey, next); lastStored.current = next; setStorageState("saved");
      } catch { setStorageState("unavailable"); }
    };
    if (navigator.locks) void navigator.locks.request(storageKey + "-write", save).catch(() => setStorageState("unavailable"));
    else save();
    return () => { cancelled = true; };
  }, [memory, ready, conflict]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if ((event.key === storageKey || event.key === null) && event.storageArea === localStorage && event.newValue !== lastStored.current) {
        setConflict(true); setStorageState("checking");
      }
    };
    const route = () => {
      const [next, type] = location.hash.slice(1).split("/");
      if (["explore", "compare", "enterprise", "sources", "labs"].includes(next)) setView(next as View);
      // How it works was folded into Explore, the labs, and Sources.
      else if (next === "guide") { location.hash = `explore/${selected}`; return; }
      else setView("explore");
      if (next === "explore" && kinds.some(k => k.id === type)) { setSelected(type as MemoryId); setRun(null); }
    };
    route(); addEventListener("hashchange", route); addEventListener("storage", changed);
    return () => { removeEventListener("hashchange", route); removeEventListener("storage", changed); };
  }, []);
  function navigate(next: View) { setView(next); location.hash = next === "explore" ? `explore/${selected}` : next; }
  function resolveConflict(loadSaved: boolean) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (loadSaved) {
        const saved: unknown = raw === null ? {semantic:[],episodic:[],procedural:[]} : JSON.parse(raw);
        if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("Invalid saved data. Choose “Keep this tab’s version” to replace it.");
        const next = {...memory};
        for (const k of kinds.filter(k => isPersistent(k.id))) {
          const values = (saved as Record<string, unknown>)[k.id];
          if (!Array.isArray(values) || values.length > 30 || values.some(v => typeof v !== "string" || v.length > 300)) throw new Error("Invalid saved records; no changes applied.");
          next[k.id] = values;
        }
        setMemory(next); setRun(null);
      } else setMemory(m => ({...m}));
      lastStored.current = raw; setConflict(false); setNotice("");
    } catch (error) { setNotice((error as Error).message); }
  }

  function choose(id: MemoryId) { setSelected(id); setRun(null); setDraft(""); setNotice(""); setView("explore"); location.hash = `explore/${id}`; }
  function newConversation() { setMemory(m => ({ ...m, working: [], short: [] })); setRun(null); setNotice("New conversation started. Working and short-term memory cleared; long-term memories retained."); }
  function execute() { setRun({ response: simulate(selected, memory[selected], enabled), used: enabled ? [...memory[selected]] : [], enabled }); setRunId(id => id + 1); setVisited(v => v.includes(selected) ? v : [...v, selected]); }
  function addRecord(e: React.FormEvent) { e.preventDefault(); if (!draft.trim() || memory[selected].length >= 30) return; setMemory(m => ({ ...m, [selected]: [...m[selected], draft.trim()] })); setDraft(""); setRun(null); }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={() => navigate("explore")}><span className="brand-icon"><Brain size={24} /></span>memory<span className="brand-light">lab</span><span className="brand-dot">.</span></a>
      <div className="workspace-label">AN INTERACTIVE FIELD GUIDE</div>
      <nav aria-label="Main navigation">
        <button className={`nav-item ${view === "explore" ? "active" : ""}`} onClick={() => navigate("explore")}><Layers3 size={18} /> Explore memory</button>
        <button className={`nav-item ${view === "compare" ? "active" : ""}`} onClick={() => navigate("compare")}><GitCompareArrows size={18} /> Compare types</button>
        <button className={`nav-item ${view === "labs" ? "active" : ""}`} onClick={() => navigate("labs")}><FlaskConical size={18} /> Learning labs</button>
        <button className={`nav-item ${view === "enterprise" ? "active" : ""}`} onClick={() => navigate("enterprise")}><Building2 size={18} /> Design for scale</button>
        <button className={`nav-item ${view === "sources" ? "active" : ""}`} onClick={() => navigate("sources")}><BookMarked size={18} /> Sources</button>
      </nav>
      <div className="sidebar-divider" />
      <div className="section-label">MEMORY TYPES</div>
      <div className="type-nav">{kinds.map(k => { const KIcon = icons[k.id]; return <button key={k.id} onClick={() => choose(k.id)} className={selected === k.id && view === "explore" ? "selected" : ""}><KIcon size={16} className={`text-${k.color}`} />{k.name}{visited.includes(k.id) && <Check size={13} className="nav-end" />}</button>; })}</div>
      <div className="sidebar-bottom"><div className="local-status"><span /> Runs locally. No API key needed.</div></div>
    </aside>

    <main>
      <header className="topbar"><div className="breadcrumb">Memory Lab <ChevronRight size={13} /> <span>{view === "labs" ? "Learning labs" : view === "explore" ? "Explore memory" : view === "compare" ? "Compare types" : view === "enterprise" ? "Design for scale" : "Sources"}</span></div></header>
      <div className="content">
        {view === "explore" && <section className="intro"><div className="eyebrow"><span /> A LITTLE CONTEXT GOES A LONG WAY</div><h1>How does an AI assistant<br /><span>use memory?</span></h1><p>Explore the different ways AI remembers, with fictional smart-building examples<br className="desktop-break" /> you can change and rerun. Every idea links to the research behind it.</p><div className="intro-badges"><span><span className="tiny-dot" /> 5 memory types</span><span><FlaskConical size={13} /> Edit, run, compare</span><span><Code2 size={14} /> Simulated · no AI model calls</span></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="brain-center"><Brain size={49} strokeWidth={1.2} /></div><span className="orbit-node node-one"><Database size={18} /></span><span className="orbit-node node-two"><Zap size={17} /></span><span className="orbit-node node-three"><History size={18} /></span><span className="orbit-node node-four"><Workflow size={17} /></span><span className="orbit-point" /></div></section>}

        {storageState === "unavailable" && <div className="storage-warning" role="alert">Browser saving is unavailable. Edits and clearing apply to this session; previously saved data may remain. Reload may lose changes.</div>}
        {conflict && <div className="memory-conflict" role="alert"><strong>Another tab changed the saved memories.</strong><p>Saving is paused. Load the saved version, or deliberately replace it with this tab’s current records.</p><button onClick={() => resolveConflict(true)}>Load saved version</button><button onClick={() => resolveConflict(false)}>Keep this tab’s version</button>{notice && <p>{notice}</p>}</div>}
        {view === "labs" ? <LearningLabs /> : view === "sources" ? <Sources /> : view === "enterprise" ? <Enterprise /> : view === "explore" ? <>
          <div className="section-heading"><div><h2>Meet the memory types</h2></div><span>Different memories. Different jobs.</span></div>
          <div className="memory-grid">{kinds.map(k => { const KIcon = icons[k.id]; return <button key={k.id} className={`memory-card ${k.color} ${selected === k.id ? "chosen" : ""}`} onClick={() => choose(k.id)} aria-pressed={selected === k.id}><div className="card-top"><span className={`icon-box ${k.color}`}><KIcon size={21} /></span><span className="selection-mark">{selected === k.id ? <Check size={12} /> : <ArrowUpRight size={15} />}</span></div><h3>{k.name}</h3><p>{k.description}</p><div className="card-footer">{k.tag}</div></button>; })}</div>
          <section className="playground">
            <div className="playground-title"><div className="scenario-title"><span className={`icon-box ${kind.color}`}><Icon size={21} /></span><div><div className="scenario-kicker">{kind.name}</div><h3>{kind.scenario}</h3></div></div><div className="playground-actions"><button className="quiet-button" onClick={() => { setMemory(m => ({ ...m, [selected]: [...kind.seed] })); setRun(null); setNotice("Example restored to its starter memories."); }}><RotateCcw size={13} /> Reset example</button><span className="simulation-badge">SIMULATED · NO LLM</span></div></div><FlowStrip key={`${selected}-${runId}`} selected={selected} count={memory[selected].length} enabled={enabled} played={!!run} />
            <div className="playground-columns">
              <div className="chat-panel"><div className="panel-heading"><span><MessageSquare size={14} /> The conversation</span><button className="quiet-button" onClick={newConversation}><Plus size={13} /> New chat</button></div><div className="chat-user"><div className="avatar user-avatar">YOU</div><div><span className="message-name">You</span><p>{kind.prompt}</p></div></div><div className="chat-assistant"><div className="avatar assistant-avatar"><Sparkles size={17} /></div><div><span className="message-name">Memory Lab <span className="assistant-label">DEMO</span></span>{run ? <p className="response" aria-live="polite">{run.response.split("\n").map((line, i, lines) => <span key={`${runId}-${i}`} className="response-line" style={{ animationDelay: `${3 * flowStepMs + i * 90}ms` }}>{line}{i < lines.length - 1 ? "\n" : ""}</span>)}</p> : <div className="empty-response"><p>What happens when an assistant<br />has a little context?</p><span>Run this example to find out.</span></div>}</div></div>{run && run.used.length > 0 && <div className="contrast-answer" key={`contrast-${runId}`}><span>Same question, memory off</span><p>{kind.without}</p></div>}{run && <div className="retrieval-result"><span className={run.used.length ? "retrieval-dot" : "retrieval-dot muted-dot"} />{run.used.length ? `${countLabel(run.used.length)} included in this response` : "Answered without stored memory"}</div>}<div className="chat-actions"><div className="toggle-wrap"><button role="switch" aria-checked={enabled} aria-label="Use memory" className={`switch ${enabled ? "on" : ""}`} onClick={() => { setEnabled(v => !v); setRun(null); }}><span /></button><span>Use memory</span><span className="toggle-state">{enabled ? "ON" : "OFF"}</span></div><button className="primary-button" onClick={execute} disabled={!ready}>Run example <ArrowRight size={16} /></button></div><div className="next-step"><MousePointerClick size={14} /><span>{!run ? "Press Run example to see how these memories shape the answer." : run.enabled ? "Now edit a memory on the right, or add one, and run again." : "Memory is off, so the assistant only has your question. Switch it on and run again."}</span></div></div>
              <div className="memory-panel"><div className="panel-heading"><span><Database size={14} /> Inside the memory</span><span className="record-count">{countLabel(memory[selected].length)}</span></div><div className="storage-label"><span className={`tiny-dot ${isPersistent(selected) ? "" : "temporary"}`} />{isPersistent(selected) ? (storageState === "saved" ? "Saved in this browser · survives new chats" : storageState === "checking" ? "Checking browser storage…" : "Session only · browser saving unavailable") : "Cleared by a new chat"}</div><div className="memory-records">{memory[selected].map((record, i) => <div className={`memory-record ${run?.enabled ? "recalled" : ""}`} style={{ animationDelay: `${flowStepMs + i * 120}ms` }} key={`${selected}-${i}`}><span className="record-index">{String(i + 1).padStart(2, "0")}</span><textarea aria-label={`Memory record ${i + 1}`} value={record} maxLength={300} rows={2} onChange={e => { const value = e.target.value; setMemory(m => ({ ...m, [selected]: m[selected].map((r, j) => j === i ? value : r) })); setRun(null); }} /><button aria-label={`Delete memory ${i + 1}`} onClick={() => { setMemory(m => ({ ...m, [selected]: m[selected].filter((_, j) => j !== i) })); setRun(null); }}><X size={13} /></button></div>)}{memory[selected].length === 0 && <div className="no-memory"><Database size={25} /><p>A clean slate.</p><span>Add a memory or reset the example.</span></div>}</div><form className="add-memory" onSubmit={addRecord}><input aria-label="New memory" placeholder="Add something to remember…" value={draft} onChange={e => setDraft(e.target.value)} maxLength={300} /><button aria-label="Add memory" disabled={!draft.trim() || memory[selected].length >= 30}><Plus size={17} /></button></form><div className="memory-note"><Lightbulb size={14} /><span>Edit any line, then run again to see the answer change.</span></div></div>
            </div>
            <div className="analogy"><Lightbulb size={16} /><span><strong>Think of it like this:</strong> {kind.analogy}</span></div>
          </section>
          {notice && <div className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button></div>}
          <div className="lesson-grid"><div><span className="lesson-icon"><CircleHelp size={18} /></span><div><h3>What’s happening here?</h3><p>{kind.lesson}</p><SectionSources section="explore" /></div></div><div><span className="lesson-icon"><Code2 size={18} /></span><div><h3>In a real system</h3><p>{kind.implementation} Stored memories can be wrong or out of date, so the system should show where each one came from.</p></div></div></div>
        </> : view === "compare" ? <section className="compare-view"><div className="section-heading"><div><h2>Compare memory types</h2></div><span>What it holds. How long it lasts.</span></div><p className="compare-lead">Memory can be described by two separate questions: <strong>what does it hold</strong>, and <strong>how long does it last</strong>? Semantic, episodic, and procedural describe what a memory holds; short-term and long-term describe how long it lasts. Working memory overlaps with the conversation.</p><LifetimeChart memory={memory} storageSaved={storageState === "saved"} /><div className="table-scroll"><table className="compare-table"><thead><tr><th>Memory type</th><th>What it holds</th><th>Lasts in this demo</th><th>Smart-building example</th></tr></thead><tbody>{kinds.map(k => { const KIcon = icons[k.id]; return <tr key={k.id}><td><span className="compare-type"><span className={`icon-box ${k.color}`}><KIcon size={16} /></span><strong>{k.name}</strong></span></td><td>{k.contains}</td><td><span className={`tiny-dot ${isPersistent(k.id) ? "" : "temporary"}`} /> {lifetimeLabel(k.id)}</td><td><button className="quiet-button" onClick={() => choose(k.id)}>{k.scenario} <ArrowRight size={14} /></button></td></tr>; })}</tbody></table></div><p className="visual-footnote">These lifetimes are this demo’s choices. A real system can keep a conversation for as long as it needs and can save working state partway through a task.</p><SectionSources section="compare" /></section> : null}
        <footer><span><Brain size={15} /> Memory Lab <span className="footer-divider">/</span> Built for curious minds.</span><span>Learn it. Tweak it. Make it stick. <Sparkles size={13} /></span></footer>
      </div>
    </main>
  </div>;
}
