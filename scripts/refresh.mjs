// Run npm install, npx playwright install chromium, then npm run refresh.
// Reads the public careers board, not candidate data or private APIs.
import { chromium } from 'playwright';
import { writeFile, rename } from 'node:fs/promises';
import { validate } from './validate.mjs';
const source = 'https://careers.kula.ai/rocketlane';
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage();
  await page.goto(source,{waitUntil:'domcontentloaded',timeout:60000});
  const links = page.locator('a[href]').filter({hasText:/Apply Now/i});
  await links.first().waitFor({timeout:30000});
  // Wait for count to stabilize after client-side hydration.
  let prior=-1, stable=0;
  for(let i=0;i<20;i++){const n=await links.count();stable=n===prior?stable+1:0;prior=n;if(stable>=3)break;await page.waitForTimeout(700);}
  const result=await links.evaluateAll((anchors,source)=>{
    const jobs=[],errors=[];
    for(const a of anchors){
      const u=new URL(a.href,source);
      const match=u.pathname.match(/^\/rocketlane\/(\d+)-[a-z0-9-]+\/?$/);
      if(u.origin!==new URL(source).origin||!match){errors.push('Non-specific job URL: '+u.href);continue;}
      let found;
      for(let node=a.parentElement;node&&node!==document.body;node=node.parentElement){
        const lines=node.innerText.split(/\n/).map(s=>s.trim()).filter(Boolean);
        const work=lines.findIndex(s=>/^(Full[ -]time|Part[ -]time|Contract|Internship|Temporary)\s*[•·]\s*(On-Site|Hybrid|Remote)$/i.test(s));
        if(work<3)continue;
        const unique=new Set([...node.querySelectorAll('a[href]')].map(x=>x.href).filter(x=>/\/rocketlane\/\d+-/.test(x)));
        if(unique.size!==1)break;
        const [employment,workplace]=lines[work].split(/\s*[•·]\s*/);
        const [department,title,...locs]=lines.slice(0,work);
        const locations=locs.join(' ').split(';').map(s=>s.trim()).filter(Boolean);
        if(department&&title&&locations.length){found={id:match[1],title,department,locations,employment,workplace,url:u.origin+u.pathname.replace(/\/$/,'')};break;}
      }
      if(found)jobs.push(found);else errors.push('Cannot parse card: '+u.href);
    }
    return {jobs,errors};
  },source);
  if(result.errors.length)throw Error(result.errors.join('\n'));
  const dedup=[...new Map(result.jobs.map(j=>[j.id,j])).values()];
  const data={source,checkedOn:new Date().toISOString().slice(0,10),jobs:dedup};
  validate(data);
  // Confirm the title on every specific official role page before replacing the snapshot.
  const detail=await browser.newPage();
  for(const job of data.jobs){
    await detail.goto(job.url,{waitUntil:'domcontentloaded',timeout:60000});
    const heading=detail.getByRole('heading',{level:1}).first();
    await heading.waitFor({timeout:15000});
    const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
    if(normalize(await heading.innerText())!==normalize(job.title))throw Error('Role title mismatch: '+job.url);
    const apply=detail.getByRole('button',{name:/apply for this position|application form/i}).first();
    await apply.waitFor({timeout:15000});
    await detail.waitForTimeout(400);
  }
  await writeFile('jobs.json.tmp',JSON.stringify(data,null,2)+'\n');
  await rename('jobs.json.tmp','jobs.json');
  console.log('Refreshed '+data.jobs.length+' role-specific listings.');
}finally{await browser.close();}
