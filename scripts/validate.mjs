import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function validate(data){
 if(data.source!=='https://careers.kula.ai/rocketlane'||!/^\d{4}-\d{2}-\d{2}$/.test(data.checkedOn)||!Array.isArray(data.jobs)||!data.jobs.length)throw Error('Invalid or empty snapshot');
 const ids=new Set(),urls=new Set();
 for(const j of data.jobs){
   if(!/^\d+$/.test(j.id)||ids.has(j.id)||urls.has(j.url))throw Error('Duplicate or invalid ID: '+j.id);
   if(![j.title,j.department,j.employment,j.workplace].every(x=>typeof x==='string'&&x.trim())||!Array.isArray(j.locations)||!j.locations.length||!j.locations.every(x=>typeof x==='string'&&x.trim()))throw Error('Missing job fields: '+j.id);
   const u=new URL(j.url);
   if(u.origin!=='https://careers.kula.ai'||u.search||u.hash||!new RegExp('^/rocketlane/'+j.id+'-[a-z0-9-]+$').test(u.pathname))throw Error('Invalid direct job URL: '+j.url);
   ids.add(j.id);urls.add(j.url);
 }
 return data.jobs.length;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const n=validate(JSON.parse(await readFile('jobs.json','utf8')));console.log('Validated '+n+' distinct official job URLs.');}
