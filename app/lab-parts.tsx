import type {ReactNode} from 'react';
import {Lightbulb,SlidersHorizontal,type LucideIcon} from 'lucide-react';
import {SectionSources} from './sources';
import {kindIcons} from './kind-icons';
import {kinds,type MemoryId} from '@/lib/memory';
import type {SectionId} from '@/lib/sources';
import type {RecordItem} from '@/lib/experiments';

export const percent=(value:number|null)=>value===null?'N/A':`${(value*100).toFixed(1)}%`;
export function Card({title,children}:{title:string;children:ReactNode}){return <section className="ml-card"><h3>{title}</h3>{children}</section>;}
export function Intro({title,children}:{title:string;children:ReactNode}){return <div className="ml-intro"><h3>{title}</h3><p>{children}</p></div>;}
// The one sentence to remember from a lab.
export function Takeaway({children}:{children:ReactNode}){return <p className="ml-takeaway"><Lightbulb size={16}/><span><strong>The point:</strong> {children}</span></p>;}
// Secondary controls stay one click away so the main experiment reads first.
export function More({summary,children}:{summary:string;children:ReactNode}){return <details className="ml-more"><summary><SlidersHorizontal size={14}/>{summary}</summary><div>{children}</div></details>;}
// A row of mutually exclusive options, each with a plain one-line explanation.
export function Choice<T extends string>({label,value,options,onChange}:{label:string;value:T;options:readonly {id:T;name:string;hint:string}[];onChange:(v:T)=>void}){return <div className="ml-choice" role="radiogroup" aria-label={label}>{options.map(o=><button key={o.id} role="radio" aria-checked={value===o.id} onClick={()=>onChange(o.id)}><strong>{o.name}</strong><small>{o.hint}</small></button>)}</div>;}
// What each lab leaves out, then the research behind it: the same order as Explore's lesson.
export function LabFooter({note,section,real}:{note:string;section:SectionId;real?:ReactNode}){return <div className="ml-footer">{real&&<p className="ml-real"><strong>In a real system:</strong> {real}</p>}<p className="visual-footnote">{note}</p><SectionSources section={section}/></div>;}
export function Stat({label,value,note}:{label:string;value:string;note?:string}){return <div className="ml-stat"><span>{label}</span><strong>{value}</strong>{note&&<small>{note}</small>}</div>;}
export function Bar({label,value}:{label:string;value:number|null}){return <div className="ml-bar"><span>{label}</span><div aria-hidden="true"><i style={{width:`${(value??0)*100}%`}}/></div><strong>{percent(value)}</strong></div>;}
export function Range({label,value,onChange,min,max,step=1}:{label:string;value:number;onChange:(n:number)=>void;min:number;max:number;step?:number}){return <label className="ml-range">{label}<span className="ml-range-value">{value}</span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)}/></label>;}
export function TypeChip({kind}:{kind:MemoryId}){const k=kinds.find(x=>x.id===kind)!;const Icon=kindIcons[kind];return <span className={`ml-type ${k.color}`}><Icon size={11}/>{k.name.replace(' memory','')}</span>;}
export function Evidence({record}:{record:RecordItem}){return <details className="ml-evidence"><summary>{record.id} <TypeChip kind={record.kind}/> {record.key} · {record.value}</summary><blockquote>{record.quote}</blockquote><p>From {record.source} · {record.person} · {record.date}<br/>Status: {record.state} · Trust: {record.trust} · Expires: {record.expires??'never'}</p></details>;}
export function Steps({items}:{items:ReactNode[]}){return <div className="ml-try"><span className="ml-kicker">Try this</span><ol className="ml-steps" aria-label="Try this">{items.map((item,i)=><li key={i} style={{animationDelay:`${i*110}ms`}}><span>{i+1}</span><p>{item}</p></li>)}</ol></div>;}
// Numbered parts of a section, shared by Learning labs and Design for scale.
export type Part={id:string;name:string;hint:string;icon:LucideIcon};
export function PartTabs({label,parts,value,onChange}:{label:string;parts:Part[];value:string;onChange:(id:string)=>void}){return <nav className="ml-tabs" aria-label={label}>{parts.map((t,i)=><button key={t.id} aria-pressed={value===t.id} aria-label={`${i+1}. ${t.name}`} onClick={()=>onChange(t.id)}><span className="ml-tab-number">{i+1}</span><t.icon size={17}/><span className="ml-tab-text"><strong>{t.name}</strong><small>{t.hint}</small></span></button>)}</nav>;}
