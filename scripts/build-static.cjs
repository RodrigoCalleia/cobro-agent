'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assets=['index.html','cobro-engine.js'];

function buildStatic(root=path.resolve(__dirname,'..')) {
 const output=path.join(root,'dist');
 // Validate all inputs and output entries before replacing any generated asset.
 const files=assets.map(name=>{
  const source=path.join(root,name);
  if(!fs.lstatSync(source).isFile())throw new Error('Expected a regular source file: '+name);
  return {name,bytes:fs.readFileSync(source)};
 });
 if(fs.existsSync(output)){
  if(!fs.lstatSync(output).isDirectory())throw new Error('dist must be a regular directory');
  for(const entry of fs.readdirSync(output)){
   const destination=path.join(output,entry);
   const regular=fs.lstatSync(destination).isFile();
   // A previously observed publish artifact may remain, but only as an exact
   // copy of the repository's public config. Never rewrite or remove it.
   if(entry==='netlify.toml'&&regular){
    const source=path.join(root,entry);
    if(fs.lstatSync(source).isFile()&&fs.readFileSync(destination).equals(fs.readFileSync(source)))continue;
   }
   if(!assets.includes(entry)||!regular)
    throw new Error('Unexpected dist entry; inspect it before rebuilding: '+entry);
  }
 }
 fs.mkdirSync(output,{recursive:true});
 for(const {name,bytes} of files)fs.writeFileSync(path.join(output,name),bytes);
 return output;
}
if(require.main===module){buildStatic();console.log('Static build complete: 2 demo assets in dist');}
module.exports={buildStatic};
