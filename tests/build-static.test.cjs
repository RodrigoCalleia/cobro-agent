const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {buildStatic}=require('../scripts/build-static.cjs');

function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'cobro-static-test-'));
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.writeFileSync(path.join(root,'index.html'),'<script src="./cobro-engine.js"></script>');
 fs.writeFileSync(path.join(root,'cobro-engine.js'),'globalThis.CobroEngine={};');
 return root;
}
test('publishes only demo assets and preserves their exact bytes',t=>{
 const root=fixture(t);
 fs.writeFileSync(path.join(root,'README.md'),'fixture: documentation');
 fs.mkdirSync(path.join(root,'tests'));
 fs.writeFileSync(path.join(root,'tests','fixture.cjs'),'fixture: test only');
 const output=buildStatic(root);
 assert.deepEqual(fs.readdirSync(output).sort(),['cobro-engine.js','index.html']);
 for(const name of fs.readdirSync(output))assert.deepEqual(fs.readFileSync(path.join(output,name)),fs.readFileSync(path.join(root,name)));
});
test('rebuild updates only the known generated assets',t=>{
 const root=fixture(t),output=buildStatic(root);
 fs.writeFileSync(path.join(root,'index.html'),'<h1>Updated fixture</h1>');
 buildStatic(root);
 assert.equal(fs.readFileSync(path.join(output,'index.html'),'utf8'),'<h1>Updated fixture</h1>');
});
test('missing engine fails before changing existing output',t=>{
 const root=fixture(t),output=buildStatic(root),before=fs.readFileSync(path.join(output,'index.html'));
 fs.writeFileSync(path.join(root,'index.html'),'new fixture');
 fs.unlinkSync(path.join(root,'cobro-engine.js'));
 assert.throws(()=>buildStatic(root),/ENOENT/);
 assert.deepEqual(fs.readFileSync(path.join(output,'index.html')),before);
});
test('unexpected output files stop the build and remain intact',t=>{
 const root=fixture(t),output=buildStatic(root);
 fs.writeFileSync(path.join(output,'unexpected.txt'),'fixture: inspect me');
 assert.throws(()=>buildStatic(root),/Unexpected dist entry/);
 assert.equal(fs.readFileSync(path.join(output,'unexpected.txt'),'utf8'),'fixture: inspect me');
});
test('a symlinked publish directory cannot redirect writes',t=>{
 const root=fixture(t),outside=path.join(root,'outside');
 fs.mkdirSync(outside);fs.symlinkSync(outside,path.join(root,'dist'));
 assert.throws(()=>buildStatic(root),/dist must be a regular directory/);
 assert.deepEqual(fs.readdirSync(outside),[]);
});
test('symlinked output asset cannot overwrite another file',t=>{
 const root=fixture(t),output=buildStatic(root),target=path.join(root,'target.txt');
 fs.writeFileSync(target,'fixture: preserve me');fs.unlinkSync(path.join(output,'index.html'));
 fs.symlinkSync(target,path.join(output,'index.html'));
 assert.throws(()=>buildStatic(root),/Unexpected dist entry/);
 assert.equal(fs.readFileSync(target,'utf8'),'fixture: preserve me');
});
test('symlinked source asset cannot pull an external file into publication',t=>{
 const root=fixture(t),target=path.join(root,'target.txt');
 fs.writeFileSync(target,'fixture: exclude me');fs.unlinkSync(path.join(root,'index.html'));
 fs.symlinkSync(target,path.join(root,'index.html'));
 assert.throws(()=>buildStatic(root),/Expected a regular source file/);
 assert.equal(fs.existsSync(path.join(root,'dist')),false);
});

test('an exact regular config copy survives repeated builds without being rewritten',t=>{
 const root=fixture(t),output=buildStatic(root);
 const config='[build]\n  publish = "dist"\n';
 fs.writeFileSync(path.join(root,'netlify.toml'),config);
 const copy=path.join(output,'netlify.toml');
 fs.writeFileSync(copy,config);
 fs.utimesSync(copy,new Date('2020-01-01'),new Date('2020-01-01'));
 const before=fs.statSync(copy);
 fs.writeFileSync(path.join(root,'index.html'),'updated fixture');
 buildStatic(root);buildStatic(root);
 assert.equal(fs.readFileSync(path.join(output,'index.html'),'utf8'),'updated fixture');
 assert.deepEqual(fs.readdirSync(output).sort(),['cobro-engine.js','index.html','netlify.toml']);
 assert.equal(fs.readFileSync(copy,'utf8'),config);
 const after=fs.statSync(copy);
 assert.equal(after.ino,before.ino);assert.equal(after.mtimeMs,before.mtimeMs);
});

for(const variant of ['different bytes','missing source','source directory','source symlink','copy directory','copy symlink','dangling copy symlink','another unexpected entry']){
 test('config exception rejects '+variant+' before changing either demo asset',t=>{
  const root=fixture(t),output=buildStatic(root);
  const names=['index.html','cobro-engine.js'];
  const before=names.map(name=>fs.readFileSync(path.join(output,name)));
  const source=path.join(root,'netlify.toml'),copy=path.join(output,'netlify.toml');
  const config='[build]\n  publish = "dist"\n';
  fs.writeFileSync(source,config);fs.writeFileSync(copy,config);
  for(const name of names)fs.writeFileSync(path.join(root,name),'updated fixture '+name);
  if(variant==='different bytes')fs.writeFileSync(copy,config.replace(/\n/g,'\r\n'));
  if(variant==='missing source')fs.unlinkSync(source);
  if(variant==='source directory'){fs.unlinkSync(source);fs.mkdirSync(source);}
  if(variant==='source symlink'){
   fs.unlinkSync(source);fs.symlinkSync(copy,source);
  }
  if(variant==='copy directory'){fs.unlinkSync(copy);fs.mkdirSync(copy);}
  if(variant==='copy symlink'){
   fs.unlinkSync(copy);fs.symlinkSync(source,copy);
  }
  if(variant==='dangling copy symlink'){
   fs.unlinkSync(copy);fs.symlinkSync(path.join(root,'absent-config'),copy);
  }
  if(variant==='another unexpected entry')fs.writeFileSync(path.join(output,'unexpected.txt'),'preserve fixture');
  assert.throws(()=>buildStatic(root),/Unexpected dist entry|ENOENT/);
  for(let i=0;i<names.length;i++)assert.deepEqual(fs.readFileSync(path.join(output,names[i])),before[i]);
  assert.equal(fs.lstatSync(copy).isSymbolicLink(),variant==='copy symlink'||variant==='dangling copy symlink');
  if(variant==='different bytes')assert.equal(fs.readFileSync(copy,'utf8'),config.replace(/\n/g,'\r\n'));
  if(variant==='another unexpected entry')assert.equal(fs.readFileSync(path.join(output,'unexpected.txt'),'utf8'),'preserve fixture');
 });
}
