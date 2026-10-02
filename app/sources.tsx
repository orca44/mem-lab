'use client';
import { useEffect, useState } from "react";
import { ArrowUpRight, BookMarked } from "lucide-react";
import { checkedOn, sections, sources, type SectionId, type SourceId } from "@/lib/sources";

const sectionIds = Object.keys(sections) as SectionId[];
const usedIn = (id: SourceId) => sectionIds.filter(s => (sections[s].ids as readonly SourceId[]).includes(id));

// The one pointer each section shows: references themselves live only on the Sources page.
export function SectionSources({ section }: { section: SectionId }) {
  const count = sections[section].ids.length;
  return <a className="section-sources" href={`#sources/${section}`}><BookMarked size={14} /> Sources for this section · {count}<ArrowUpRight size={13} /></a>;
}

export default function Sources() {
  const [filter, setFilter] = useState<SectionId | "all">("all");
  useEffect(() => {
    const sync = () => { const value = location.hash.split("/")[1] as SectionId; setFilter(sectionIds.includes(value) ? value : "all"); };
    sync(); addEventListener("hashchange", sync); return () => removeEventListener("hashchange", sync);
  }, []);
  const choose = (next: SectionId | "all") => { setFilter(next); history.replaceState(null, "", next === "all" ? "#sources" : `#sources/${next}`); };
  const shown = (Object.keys(sources) as SourceId[]).filter(id => filter === "all" || (sections[filter].ids as readonly SourceId[]).includes(id));
  const group = (type: "Research" | "Documentation") => shown.filter(id => sources[id].type === type);
  return <section className="sources-view" aria-labelledby="sources-title">
    <div className="section-heading"><div><h2 id="sources-title">Sources</h2></div><span>{Object.keys(sources).length} references · links checked {checkedOn}</span></div>
    <p className="compare-lead">Every idea in Memory Lab traces back to one of these. The people, buildings, and numbers are made up: a reference supports the idea, not the example.</p>
    <div className="source-filter" role="group" aria-label="Filter by section"><button aria-pressed={filter === "all"} onClick={() => choose("all")}>All</button>{sectionIds.map(s => <button key={s} aria-pressed={filter === s} onClick={() => choose(s)}>{sections[s].name} <small>{sections[s].ids.length}</small></button>)}</div>
    {(["Research", "Documentation"] as const).map(type => group(type).length > 0 && <div key={type} className="source-group"><h3>{type === "Research" ? "Research papers" : "Standards and documentation"}</h3><ol className="reference-list">{group(type).map(id => <li key={id}><a href={sources[id].url} target="_blank" rel="noreferrer">{sources[id].label}<ArrowUpRight size={14} /></a><p>{sources[id].supports}</p><div className="source-uses">{usedIn(id).map(s => <button key={s} onClick={() => choose(s)}>{sections[s].name}</button>)}</div></li>)}</ol></div>)}
  </section>;
}
