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
