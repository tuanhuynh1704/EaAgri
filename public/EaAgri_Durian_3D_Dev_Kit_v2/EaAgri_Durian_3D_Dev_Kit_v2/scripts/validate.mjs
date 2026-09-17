import {readFile,writeFile,stat} from 'node:fs/promises';
import {validateBytes} from 'gltf-validator';
import assert from 'node:assert/strict';
const manifest=JSON.parse(await readFile('assets/model-manifest.json','utf8'));
const reports=[];
for(const entry of manifest.assets){
  const bytes=await readFile('assets/'+entry.file);
  assert.equal(bytes.readUInt32LE(0),0x46546c67,'GLB magic');assert.equal(bytes.readUInt32LE(4),2,'glTF 2.0');assert.equal(bytes.length,bytes.readUInt32LE(8),'GLB declared size');
  const result=await validateBytes(new Uint8Array(bytes),{uri:entry.file,maxIssues:100});
  const jsonSize=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+jsonSize).toString('utf8').trim());
  assert.ok(doc.animations.some(x=>x.name==='Gentle_Breeze'),'Breeze animation is present');
  for(const id of ['overview','soil','weather','disease','irrigation','assistant'])assert.ok(doc.nodes.some(n=>n.name==='Hotspot_'+id),'Hotspot '+id);
  assert.ok(!doc.images?.length,'Geometry-only model has no missing textures');
  const record={file:entry.file,bytes:bytes.length,triangles:entry.triangles,meshes:entry.meshes,errors:result.issues.numErrors,warnings:result.issues.numWarnings,infos:result.issues.numInfos,messages:result.issues.messages};
  reports.push(record);console.log(JSON.stringify(record));
  assert.equal(result.issues.numErrors,0,entry.file+' glTF validation errors');
}
assert.ok((await stat('dist/eaagri-3d.js')).size>0);
assert.ok((await stat('dist/eaagri-3d.css')).size>0);
assert.ok((await stat('preview-offline.html')).size>0);
await writeFile('assets/validation-report.json',JSON.stringify({validatedAt:new Date().toISOString(),validator:'Khronos glTF-Validator',reports,browserQA:'Not completed: cloud browser refused local HTTP and disallowed local file navigation. Runtime target-device testing remains required.'},null,2)+'\n');
console.log('PASS: all 3 GLB assets; animation; named hotspots; self-contained geometry; bundled component.');
