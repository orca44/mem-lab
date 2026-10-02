'use client';
import {useEffect,useState} from 'react';
import {PenLine,Search,FlaskConical,ShieldCheck} from 'lucide-react';
import WriteLab from './lab-write';
import RetrieveLab from './lab-retrieve';
import EvaluateLab from './lab-evaluate';
import GovernLab from './lab-govern';
import {PartTabs} from './lab-parts';

// The life of one memory, in order. IDs stay the same so old #labs/... links keep working.
const tabs=[{id:'write',name:'Save',hint:'Check before saving',icon:PenLine},{id:'retrieve',name:'Find',hint:'Pick the right memories',icon:Search},{id:'evaluate',name:'Test',hint:'Does memory help?',icon:FlaskConical},{id:'govern',name:'Forget',hint:'Delete every copy',icon:ShieldCheck}];
export default function LearningLabs(){
 const [tab,setTab]=useState('write');
 useEffect(()=>{const sync=()=>{const value=location.hash.split('/')[1];
  // The queue experiment now lives beside the traffic chart in Design for scale.
  if(value==='capacity'){location.hash='enterprise/bursts';return;}
  setTab(tabs.some(t=>t.id===value)?value:'write');};sync();addEventListener('hashchange',sync);return()=>removeEventListener('hashchange',sync);},[]);
 return <section className="memory-labs"><div className="section-heading"><div><h2>Learning labs</h2></div><span>Real code. Fictional memories.</span></div><p className="compare-lead">Follow one memory through its life: <strong>save</strong> it, <strong>find</strong> it, <strong>test</strong> that it helps, then <strong>forget</strong> it. Every lab uses the same 12 memories about Alex, who works in Riverside Tower, and resets when you leave it.</p><PartTabs label="Memory experiments" parts={tabs} value={tab} onChange={id=>{setTab(id);location.hash=`labs/${id}`;}}/><div className="ml-body" key={tab}>{tab==='write'?<WriteLab/>:tab==='retrieve'?<RetrieveLab/>:tab==='evaluate'?<EvaluateLab/>:<GovernLab/>}</div></section>;
}
