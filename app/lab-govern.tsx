'use client';
import {useState} from 'react';
import {AlertTriangle,Check,Database,MessageSquare,Search,X} from 'lucide-react';
import {records,exclusion,validDate} from '@/lib/experiments';
import {Card,Intro,LabFooter,More,Evidence,Steps,Takeaway,TypeChip} from './lab-parts';

// The search copy starts in sync: memories deleted before the lab began were already removed from it.
const indexed=()=>records.filter(r=>r.state!=='deleted').map(r=>({...r}));
export default function GovernLab(){
 const [store,setStore]=useState(()=>records.map(r=>({...r}))),[index,setIndex]=useState(indexed),[person,setPerson]=useState('Alex'),[date,setDate]=useState('2026-09-26'),[gate,setGate]=useState(true),[message,setMessage]=useState('');
 const eligible=index.filter(r=>{const source=store.find(s=>s.id===r.id);return !gate||!!(validDate(date)&&source&&!exclusion(source,person,date)&&source.value===r.value);});
 const deleted=store.find(r=>r.id==='M02')?.state==='deleted';
 const inIndex=index.some(r=>r.id==='M02'),seen=eligible.some(r=>r.id==='M02');
 const stage=(Icon:typeof Database,name:string,ok:boolean,yes:string,no:string,bad=false)=><div className={`ml-stage ${ok?(bad?'leak':'on'):'off'}`}><Icon size={18}/><strong>{name}</strong><span>{ok?(bad?<AlertTriangle size={14}/>:<Check size={14}/>):<X size={14}/>}{ok?yes:no}</span></div>;
 function forget(){setStore(s=>s.map(r=>r.id==='M02'?{...r,state:'deleted',value:'',quote:'',source:'Deletion marker'}:r));setMessage('Deleted from the main store. Its search copy is still there.');}
 function sync(){setIndex(store.filter(r=>r.state!=='deleted').map(r=>({...r})));setMessage('Search copies rebuilt without deleted memories. In a real system, caches, logs, and backups need the same treatment.');}
 return <><Intro title="Forgetting means deleting every copy.">When a memory is saved, a copy also goes into a search index so it can be found quickly. Deleting the original does not delete that copy. Follow Alex’s 70°F comfort temperature as you delete it.</Intro>
 <Steps items={['Press “1. Delete the memory”. The main store now holds only a marker that says “deleted”, but the search copy remains.','Untick the safety check. The assistant now reads the search copy directly, and the deleted memory leaks back.','Press “2. Remove its search copy”. Now it is gone everywhere, with or without the safety check.']}/>
 <div className="ml-pipeline" aria-live="polite">{stage(Database,'Main store',!deleted,'Saved','Deleted')}<i/>{stage(Search,'Search copy',inIndex,deleted?'Still there':'Present','Removed',deleted)}<i/>{stage(MessageSquare,'Assistant sees it',seen,deleted?'Leaked back':'Yes','No',deleted)}</div>
 <div className="ml-actions"><button disabled={deleted} onClick={forget}>1. Delete the memory</button><button disabled={!deleted||!inIndex} onClick={sync}>2. Remove its search copy</button></div>
 <label className="ml-check"><input type="checkbox" checked={gate} onChange={e=>setGate(e.target.checked)}/>Safety check: confirm each search result against the main store</label>
 {!gate&&<p className="ml-warning">Safety check off: search results are used as they are, so someone else’s, deleted, out-of-date, and untrusted memories can appear. Nothing is executed.</p>}
 {message&&<p role="status" className="ml-note">{message}</p>}
 <Card title="What a search would return">{eligible.map(r=><Evidence key={r.id} record={r}/>)}{!eligible.length&&<p>Nothing.</p>}</Card>
 <More summary="Other ways memories are hidden: person and date"><p>The same safety check also hides memories that belong to someone else, or that are not valid on the date asked about. Set the date to May 2026 and M04, Alex’s May-only workspace, comes back: expired memories are hidden, not erased.</p><div className="ml-controls"><label>Person<select value={person} onChange={e=>setPerson(e.target.value)}><option>Alex</option><option>Riley</option></select></label><label>Check as of<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div><div className="ml-table"><table><thead><tr><th>Memory</th><th>On this date</th><th>Search copy</th></tr></thead><tbody>{store.map(r=><tr key={r.id}><th>{r.id} <TypeChip kind={r.kind}/><small>{r.person}</small></th><td>{validDate(date)?exclusion(r,person,date)??'Shown':'Choose a valid date'}</td><td>{index.some(x=>x.id===r.id)?'Present':'Removed'}</td></tr>)}</tbody></table></div></More>
 <Takeaway>deleting a memory means removing every copy, not just the original. Checking each result against the main store is the safety net for copies you missed.</Takeaway>
 <LabFooter real="decide what people want remembered, who may read it and when it expires, and let them see, correct, and delete it. A saved statement is still only a claim, even when a model wrote it." note="Simulation only: picking a person is not a login, the hostile note is caught by a label we wrote, and deletion here reaches no backups or other systems." section="govern"/></>;
}
