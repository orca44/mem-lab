import {test,expect} from '@playwright/test';
import {records,cases,initialWrite,commitWrite,retrieveMemory,retrievalMetrics,exclusion,loadModel,parseMeasurement,experimentVersion} from '../lib/experiments';

test('corrections retain provenance, reject old revisions and deduplicate values',()=>{
 const corrected=commitWrite(initialWrite,'70°F','Conversation B','2026-09-20',1);
 expect(corrected.value).toBe('70°F');expect(corrected.history[0].value).toBe('73°F');
 expect(corrected.revision).toBe(2);
 expect(()=>commitWrite(corrected,'75°F','other','2026-09-21',1)).toThrow(/Version conflict/);
 expect(commitWrite(corrected,' 70°f ','repeat','2026-09-21',2)).toBe(corrected);
 expect(()=>commitWrite(corrected,'75°F','other','2026-02-30',2)).toThrow(/valid date/);
 expect(()=>commitWrite(corrected,'75°F','other','2026-09-01',2)).toThrow(/older/);
});
test('retrieval keeps person and current evidence separate from ranking and word budgets',()=>{
 const r=retrieveMemory(records,'ignored','temperature','exact','Alex','2026-09-26',3,80);
 expect(r.selected.map(x=>x.record.id)).toEqual(['M02']);
 expect(retrieveMemory(records,'ignored','temperature','exact','Alex','2026-09-26',3,10).selected).toHaveLength(0);
 expect(retrieveMemory(records,'ignored','temperature','exact','Riley','2026-09-26',3,80).selected[0].record.id).toBe('M05');
 expect(exclusion(records[3],'Alex','2026-05-31')).toBe('Expired');
 expect(exclusion(records[7],'Alex','2026-09-26')).toBe('Untrusted source');
 expect(retrievalMetrics([],[])).toEqual({precision:null,recall:null});
 expect(retrievalMetrics(['M02','M09'],['M02'])).toEqual({precision:.5,recall:1});
});
test('FIFO simulation has independently calculable burst waits and deadlines',()=>{
 const run=loadModel(10,200,2,4,300);
 expect(run.rows.slice(0,4).map(r=>r.wait)).toEqual([0,0,200,200]);
 expect(run.misses).toBe(30);expect(run.p95).toBe(400);expect(run.utilization).toBe(1);
 expect(loadModel(10,200,4,4,300).misses).toBe(0);
});
test('measured-run contract reject invalid values without fabricating missing cost',()=>{
 const run={schema:'memory-lab-run-v1',dataset:experimentVersion,name:'Fixture',model:'test-only',environment:'Synthetic',results:cases.map(c=>({caseId:c.id,ids:[],answer:'',latencyMs:1,inputTokens:0,outputTokens:0,costUsd:null}))};
 expect(parseMeasurement(JSON.stringify(run)).results[0].costUsd).toBeNull();
 expect(()=>parseMeasurement(JSON.stringify({...run,results:run.results.map(x=>({...x,caseId:'correction'}))}))).toThrow();
 expect(()=>parseMeasurement(JSON.stringify({...run,results:run.results.map(x=>({...x,latencyMs:-1}))}))).toThrow();
});
