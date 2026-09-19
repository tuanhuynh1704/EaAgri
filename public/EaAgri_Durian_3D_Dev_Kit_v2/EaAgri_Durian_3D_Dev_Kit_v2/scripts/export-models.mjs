import {mkdir,writeFile} from 'node:fs/promises';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {createFarmModel} from '../src/model-factory.mjs';

// Exporter needs FileReader for buffers. Models have no image textures.
globalThis.FileReader=class {
  readAsArrayBuffer(blob){blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();});}
  readAsDataURL(blob){blob.arrayBuffer().then(v=>{this.result=`data:${blob.type};base64,${Buffer.from(v).toString('base64')}`;this.onloadend?.();});}
};
await mkdir(new URL('../assets/',import.meta.url),{recursive:true});
const exports=[['eaagri-durian-high.glb','high',false],['eaagri-durian-mobile.glb','mobile',false],['durian-tree-only.glb','high',true]];
const manifest={version:'2.0.0',generator:'EaAgri procedural mesh source',assets:[]};
for(const [name,quality,treeOnly] of exports){
  const {root,clips,anchors}=createFarmModel({quality,treeOnly});
  const array=await new GLTFExporter().parseAsync(root,{binary:true,animations:clips,onlyVisible:true});
  await writeFile(new URL(`../assets/${name}`,import.meta.url),Buffer.from(array));
  let triangles=0,vertices=0,meshes=0;const mats=new Set();
  root.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;mats.add(o.material);}});
  const record={file:name,quality,bytes:array.byteLength,triangles,vertices,meshes,materials:mats.size,animations:clips.map(c=>({name:c.name,duration:c.duration})),hotspots:anchors};
  manifest.assets.push(record);console.log(JSON.stringify(record));
}
await writeFile(new URL('../assets/model-manifest.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
