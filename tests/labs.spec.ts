import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {cases,experimentVersion} from '../lib/experiments';

test('write lesson records reviewed corrections and rejects stale revisions',async({page})=>{
 await page.goto('/#labs/write');
 await page.getByLabel('I checked this against its source').check();
 await page.getByText('What if two people edit at once?',{exact:true}).click();
 await page.getByRole('button',{name:'Simulate someone else saving'}).click();
 await page.getByRole('button',{name:'Save to memory'}).click();
 await expect(page.locator('.ml-body').getByRole('status')).toContainText('Version conflict');
 await page.getByRole('button',{name:'Re-read latest version'}).click();
 await page.getByLabel('I checked this against its source').check();
 await page.getByRole('button',{name:'Save to memory'}).click();
 await expect(page.locator('.ml-timeline')).toContainText('70°F');
 await expect(page.locator('.ml-timeline')).toContainText('73°F');
 await page.getByRole('radio',{name:/A suspicious note/}).click();
 await page.getByLabel('I checked this against its source').check();
 await expect(page.getByRole('button',{name:'Save to memory'})).toBeDisabled();
});
test('retrieval changes selected evidence and exposes source attribution',async({page})=>{
 await page.goto('/#labs/retrieve');
 await page.getByRole('radio',{name:/Exact field/}).click();
 await expect(page.locator('.ml-code')).toContainText('[M02] 70°F');
 await expect(page.locator('.ml-code')).not.toContainText('M05');
 await page.getByRole('slider',{name:'Room in the prompt (words)',exact:true}).fill('10');
 await expect(page.locator('.ml-code')).toContainText('Nothing found');
 await page.getByRole('slider',{name:'Room in the prompt (words)',exact:true}).fill('80');
 await page.getByText('More controls',{exact:true}).click();await page.getByLabel('Person').selectOption('Riley');
 await expect(page.locator('.ml-code')).toContainText('[M05] 75°F');
});
test('evaluation exports fixtures, validates measured runs and leaves assessment manual',async({page})=>{
 await page.goto('/#labs/evaluate');await expect(page.locator('.ml-cell')).toHaveCount(18);
 await page.getByText('For developers: test your own model').click();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Export evaluation kit'}).click();
 const kit=JSON.parse(await readFile((await (await pending).path())!,'utf8'));expect(kit.records).toHaveLength(12);expect(kit.cases).toHaveLength(6);
 const run={schema:'memory-lab-run-v1',dataset:experimentVersion,name:'Browser fixture',model:'not a model measurement',environment:'Synthetic test input',results:cases.map(c=>({caseId:c.id,ids:c.targets,answer:c.expected??'Insufficient evidence',latencyMs:1,inputTokens:3,outputTokens:2,costUsd:null}))};
 await page.getByLabel('Import measured run').setInputFiles({name:'run.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(run))});
 await expect(page.getByText('Unmeasured',{exact:true})).toBeVisible();
 await expect(page.getByLabel('Manual answer assessment')).toHaveValue('');
 await page.getByLabel('Manual answer assessment').selectOption('supported');
 await expect(page.locator('.ml-body')).toContainText('1 acceptable / 1 manually reviewed');
 await page.getByLabel('Import measured run').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{}')});
 await expect(page.locator('.ml-body').getByRole('alert')).toContainText('six-case');
 await expect(page.getByText('Browser fixture · not a model measurement')).toBeVisible();
});
test('authoritative gates hide deleted evidence before its search copy is removed',async({page})=>{
 await page.goto('/#labs/govern');
 await page.getByRole('button',{name:'1. Delete the memory'}).click();
 await expect(page.locator('.ml-evidence summary').filter({hasText:'M02'})).toHaveCount(0);
 await page.getByLabel('Safety check: confirm each search result against the main store').uncheck();
 await expect(page.locator('.ml-stage.leak')).toHaveCount(2);
 await expect(page.locator('.ml-evidence summary').filter({hasText:'M02'})).toHaveCount(1);
 await page.getByRole('button',{name:'2. Remove its search copy'}).click();
 await expect(page.locator('.ml-evidence summary').filter({hasText:'M02'})).toHaveCount(0);
});
test('the old capacity link opens the queue in Design for scale, and all four labs fit mobile with navigable URLs',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#labs/capacity');await expect(page).toHaveURL(/#enterprise\/bursts$/);
 await expect(page.getByRole('heading',{name:'Building count is not a capacity test.'})).toBeVisible();
 await page.getByRole('slider',{name:'Burst size',exact:true}).fill('20');
 await expect(page.locator('.ml-stat').filter({hasText:'Deadline misses'})).not.toContainText('0 / 60');
 await page.getByRole('slider',{name:'Workers',exact:true}).fill('8');
 await expect(page.locator('.ml-stat').filter({hasText:'Deadline misses'})).toContainText('0 / 60');
 await page.getByText('Exact request data',{exact:true}).click();await expect(page.locator('.ml-table tbody tr')).toHaveCount(60);
 await page.screenshot({path:'test-results/enterprise-queue-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Learning labs',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Memory experiments'}).getByRole('button')).toHaveCount(4);
 for(const [id,name] of [['write','1. Save'],['retrieve','2. Find'],['evaluate','3. Test'],['govern','4. Forget']]){
  await page.getByRole('navigation',{name:'Memory experiments'}).getByRole('button',{name,exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`#labs/${id}$`));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id).toBe(true);
  await page.screenshot({path:`test-results/lab-${id}-mobile.png`,fullPage:true});
 }
 await page.reload();await expect(page.getByRole('heading',{name:'Forgetting means deleting every copy.'})).toBeVisible();
 await expect(page.locator('.ml-table tbody tr')).toHaveCount(12);expect(errors).toEqual([]);
});
test('old How it works links open Explore',async({page})=>{
 await page.goto('/#guide');await expect(page).toHaveURL(/#explore\/semantic$/);
 await expect(page.getByRole('heading',{name:'Meet the memory types'})).toBeVisible();
});
test('a second tab cannot silently replace another tab’s saved version',async({page,context})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:'Run example'})).toBeEnabled();
 const second=await context.newPage();await second.goto('/');await expect(second.getByRole('button',{name:'Run example'})).toBeEnabled();
 await page.getByLabel('Memory record 1',{exact:true}).fill('Comfort temperature: 68°F from first tab');
 await expect(second.locator('.memory-conflict')).toBeVisible();
 await second.getByLabel('Memory record 1',{exact:true}).fill('Unsaved second tab preference');
 expect(await second.evaluate(()=>localStorage.getItem('memory-lab-v1'))).toContain('68°F from first tab');
 await second.getByRole('button',{name:'Load saved version'}).click();
 await expect(second.getByLabel('Memory record 1',{exact:true})).toHaveValue('Comfort temperature: 68°F from first tab');
 await second.close();
});
