"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, Database, MessageSquareWarning, Timer } from "lucide-react";
import { buildingScenarios, buildingStages, memoryHomes } from "@/lib/buildings";
import { CapacityCharts } from "./visuals";
import { Choice, Intro, LabFooter, More, PartTabs, Steps, Takeaway, TypeChip, type Part } from "./lab-parts";
import { kindIcons } from "./kind-icons";
import { kinds } from "@/lib/memory";
import QueueSimulator from "./queue-simulator";

// One complaint, then the same assistant at a thousand buildings, then the traffic it must survive.
const parts: Part[] = [
  { id: "case", name: "One complaint", hint: "Memory at work in a building", icon: MessageSquareWarning },
  { id: "grow", name: "Grow the estate", hint: "One site to a thousand", icon: Building2 },
  { id: "bursts", name: "Handle bursts", hint: "Averages hide queues", icon: Timer },
];

export default function Enterprise() {
  const [part, setPart] = useState("case");
  const [stageIndex, setStageIndex] = useState(1);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [burst, setBurst] = useState(5);
  const [offline, setOffline] = useState(false);
  const [traced, setTraced] = useState(false);
  const stage = buildingStages[stageIndex];
  const scenario = buildingScenarios[scenarioIndex];
  const dailyRequests = stage.buildings * 100;
  const peak = dailyRequests / 86400 * burst;
  const format = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: n > 0 && n < 0.1 ? 3 : 2 });
  useEffect(() => {
    const sync = () => { const value = location.hash.split("/")[1]; setPart(parts.some(p => p.id === value) ? value : "case"); };
    sync(); addEventListener("hashchange", sync); return () => removeEventListener("hashchange", sync);
  }, []);

  return <section className="enterprise" aria-labelledby="enterprise-title">
    <div className="section-heading"><div><h2 id="enterprise-title">Design for scale</h2></div><span>Fictional buildings. Illustrative numbers.</span></div><p className="compare-lead">You manage Riverside Tower. Watch memory help with <strong>one complaint</strong>, <strong>grow</strong> the same assistant to a thousand buildings, then see why <strong>bursts</strong> of traffic, not averages, decide what it needs.</p>
    <PartTabs label="Design for scale parts" parts={parts} value={part} onChange={id => { setPart(id); location.hash = `enterprise/${id}`; }} />

    <div className="ml-body scale-body" key={part}>
    {part === "case" && <>
      <Intro title="Memory turns a repeat complaint into a head start.">Pick a building problem and compare the assistant’s answer with and without memory. Then walk through the case to see which memory type it uses at each step.</Intro>
      <Steps items={["Pick a situation and compare the two answers. With memory, the assistant knows where to look first.", "Press “Walk through this case”. Each step is labeled with the memory type it uses.", "Tick “Simulate building connection offline” and walk through again. The assistant hands over its uncertainty instead of acting on old readings."]} />
      <Choice label="Building situation" value={String(scenarioIndex)} onChange={v => { setScenarioIndex(+v); setTraced(false); }} options={buildingScenarios.map((s, i) => ({ id: String(i), name: s.name, hint: s.category }))} />
      <div><blockquote className="building-question">“{scenario.prompt}”</blockquote><p className="building-location">Riverside Tower · {scenario.asset}</p></div>
      <div className="building-comparison"><article><h4>Memory off</h4><p>{scenario.without}</p></article><article><h4>Memory on: the building’s history</h4><p>{scenario.with}</p></article></div>
      <div className="trace-controls"><label><input type="checkbox" checked={offline} onChange={e => { setOffline(e.target.checked); setTraced(false); }} /> Simulate building connection offline</label><button className="primary-button" onClick={() => setTraced(true)}>Walk through this case <ArrowRight size={16} /></button></div>
      {traced && <div className="request-trace" role="status"><ol>
        <li><strong>Find the right building.</strong> Verify the operator’s access to Riverside Tower and {scenario.asset}. Use organization, building, and asset IDs on every memory lookup.</li>
        <li><strong>Pick up the conversation.</strong> <TypeChip kind="short" /> <TypeChip kind="working" /> Open case {scenario.caseId}, its recent messages, and its saved investigation progress. {scenario.records[1]}</li>
        <li><strong>Open the reference book and logbook.</strong> <TypeChip kind="semantic" /> <TypeChip kind="episodic" /> {scenario.recall} Read asset facts from {stage.hit ? "a cached copy, checking its version and falling back to the memory database when needed" : "the building’s memory database"}.</li>
        <li><strong>{offline ? "Current readings are unavailable." : "Check what is happening now."}</strong> {offline ? scenario.offline : scenario.current}</li>
        <li><strong>{offline ? "Hand over the uncertainty." : "Use the approved playbook."}</strong>{!offline && <> <TypeChip kind="procedural" /></>} {offline ? "Show the last successful connection time. Mark cached readings as historical. Keep the existing local BMS routines in control; do not queue a setting change based on stale context." : scenario.outcome}</li>
        <li><strong>Leave a useful record for the next shift.</strong> <TypeChip kind="episodic" /> Save the recommendation and verification status now. Append confirmed actions and outcomes when the operator reports them. Do not record an unperformed repair as completed.</li>
      </ol><p className="trace-outcome">{offline ? "Offline outcome: a useful handover with uncertainty made explicit. Current conditions must be verified locally." : "Connected outcome: a specific next step supported by this building’s facts and history, ready for operator review."}</p></div>}
      <More summary="What each memory type holds in this case"><p>The same five types as Explore, as a facilities team would know them: a scratchpad, a conversation, a reference book, a logbook, and a playbook.</p><div className="building-memory-grid">{memoryHomes.map((memory, i) => { const k = kinds[i]; const KIcon = kindIcons[k.id]; return <article key={memory.name} className={`kind-${k.color}`}><span className="building-kind"><span className={`icon-box ${k.color}`}><KIcon size={15} /></span>{memory.name}</span><h4>{memory.meaning}</h4><p>{scenario.records[i]}</p></article>; })}</div>
        <div className="info-callout"><Database size={18} /><div><p><strong>Live readings are a separate input.</strong> {scenario.live}</p><p>Sensor history lives in its own store. The assistant fetches a small, recent slice when needed; it does not keep every sensor sample in memory.</p></div></div></More>
      <Takeaway>memory tells the assistant where to look first, not what is wrong. A past fault is a lead, live readings are fetched fresh, and when the building is offline the assistant hands over its uncertainty instead of acting.</Takeaway>
    </>}

    {part === "grow" && <>
      <Intro title="More buildings change where memory lives, not what it is.">The five memory types stay the same from one building to a thousand. What changes is how they are stored, shared, and kept apart. Pick an estate size and watch the design and the numbers change.</Intro>
      <Steps items={["Pick One building, then Campus, then Global portfolio. The four-step design below changes with each.", "Drag “Peak traffic multiplier”. Peak requests per second rise; daily totals stay the same.", "Open “Assumptions and calculations” to check where every number comes from."]} />
      <Choice label="Deployment scale" value={String(stageIndex)} onChange={v => { setStageIndex(+v); setTraced(false); }} options={buildingStages.map((s, i) => ({ id: String(i), name: s.name, hint: `${format(s.buildings)} ${s.buildings === 1 ? "building" : "buildings"} · ${s.label}` }))} />
      <p>{stage.change}</p>
      <ol className="architecture-flow" aria-label={`${stage.name} memory architecture`}>
        <li><small>1 · CONNECT THE BUILDINGS</small><strong>{stage.route}</strong><p>A gateway is the local bridge from the building management system (BMS) to the platform. Sensor readings go to a timestamped history store.</p></li>
        <li><small>2 · HANDLE THE QUESTION</small><strong>{stage.workers}</strong><p>A worker handles one investigation step, using saved progress so another worker can continue the case.</p></li>
        <li><small>3 · BRING BACK THE RIGHT MEMORY</small><strong>{stage.stores}</strong><p>Look up the exact room and equipment; retrieve a few relevant work orders and the applicable playbook.</p></li>
        <li><small>4 · SAVE THE HANDOVER</small><strong>{stage.updates}</strong><p>The case record is the source of truth. A searchable copy may lag, so read a just-saved note from the case.</p></li>
      </ol>
      <div className="info-callout"><Database size={18} /><p><strong>Why this structure?</strong> {stage.bottleneck}</p></div>
      <div className="scale-numbers"><h3>The numbers for this estate</h3><p>Assume <strong>500 sensor points per building</strong>, read once a minute, and <strong>100 assistant requests per building per day</strong>; a request is one question or follow-up. These are assumptions, not benchmarks.</p><label className="burst-control" htmlFor="peak-burst">Peak traffic multiplier <strong>{burst}× average assistant traffic</strong><input id="peak-burst" type="range" min="1" max="10" value={burst} onChange={e => setBurst(Number(e.target.value))} /></label>
        <div className="scale-metrics" aria-live="polite"><div><strong>{format(stage.buildings * 500 * 1440)}</strong><span>sensor readings / day</span></div><div><strong>{format(dailyRequests)}</strong><span>assistant requests / day</span></div><div><strong>{format(peak)}</strong><span>peak assistant requests / second</span></div><div><strong>{format(dailyRequests * 30 * 2000 / 1e9)} GB</strong><span>30 days of assistant notes</span></div></div></div>
      <CapacityCharts buildings={stage.buildings} burst={burst} hit={stage.hit} />
      <More summary="Assumptions and calculations"><p>Sensor readings/day = buildings × 500 points × 1,440 minutes. Assistant requests/day = buildings × 100. Peak requests/sec = daily requests ÷ 86,400 × the multiplier. This is a planning example, not a measured throughput limit.</p><p>Each request saves one 2 KB note. Thirty days of notes = requests/day × 30 × 2,000 bytes, using decimal GB. This excludes sensor data, conversation transcripts, indexes, backups, and replicas. Metrics below 0.1 use up to three decimals; other metrics use up to two.</p><p>For {stage.name.toLowerCase()}, assume {stage.hit}% of requests find their one asset-record lookup in the cache. That implies about {format(peak * (1 - stage.hit / 100))} asset database reads/sec at peak. Case, search, and telemetry queries are additional; real cache hit rates need measurement.</p></More>
      <More summary="Engineering details for this size"><p>{stage.technical}</p></More>
      <More summary="Three rules that hold at every size"><div className="scale-practices"><article><h3>Keep building identities clear</h3><p>“Room 401” exists at many sites. Include organization, building, and asset IDs in database queries, cache keys, and search filters. Operators see only their assigned sites. A deletion must reach caches and search copies too, as the Forget lab shows.</p></article><article><h3>Keep control close to equipment</h3><p>The existing BMS runs local control routines. The assistant proposes investigations and prepares handovers; equipment commands go through an authorized control interface with operator approval. If the connection drops, gateways buffer readings and the assistant checks current conditions before acting.</p></article><article><h3>Know whether memory is helping</h3><p>Measure how often the right asset and past work order are found, how old retrieved readings are, and whether operators find the handover useful. The Test lab shows why: handing over every memory can make answers worse.</p></article></div></More>
      <Takeaway>measured load and reliability needs, not building count, decide when to add workers, caches, or regions. At every size, keep each memory tied to its organization, building, and asset.</Takeaway>
    </>}

    {part === "bursts" && <>
      <Intro title="Building count is not a capacity test.">The peak rate in “Grow the estate” is an average over a second. Real requests arrive in bunches, and a bunch can overwhelm a queue that copes easily with the average. Here, 60 requests arrive at a steady rate or in bursts.</Intro>
      <QueueSimulator />
      <Takeaway>plan for bursts, not averages. The same average traffic can meet every deadline or miss many, depending on how requests bunch up and how many workers are free.</Takeaway>
    </>}
    </div>
    <LabFooter note="Rooms, equipment, and sensor points are linked the way the Brick schema describes, and the offline behavior follows one edge-gateway design. They inform this design; they do not certify these fictional procedures. The queue serves requests first come, first served, each taking the same time: teaching inputs, not measured model latency." section="scale" />
  </section>;
}
