import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
import sharp from 'sharp';
import {validate} from './validate.mjs';
validate(JSON.parse(await readFile('jobs.json','utf8')));
await mkdir('dist',{recursive:true});
for(const file of ['app.js','jobs.json'])await copyFile(file,'dist/'+file);
await sharp('social-cover.svg').png().toFile('dist/rocketlane-social-cover-v2.png');
const host=process.env.SITE_URL||(process.env.VERCEL_PROJECT_PRODUCTION_URL?'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL:process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'');
if(process.env.VERCEL&&!host)throw Error('Set SITE_URL to the public HTTPS deployment origin');
let origin='';
if(host){const u=new URL(host);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw Error('SITE_URL must be an HTTPS origin');origin=u.origin;}
const image=origin+'/rocketlane-social-cover-v2.png';
const html=(await readFile('index.html','utf8')).replaceAll('__SOCIAL_IMAGE__',image).replaceAll('__SITE_URL__',origin+'/');
await writeFile('dist/index.html',html);
console.log('Static site built in dist. Social cover: '+image);
