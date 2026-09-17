<script setup>
import {onMounted,onBeforeUnmount,ref,watch} from 'vue';
import {createEaAgriScene} from '../src/viewer.mjs';
import '../src/viewer.css';
const props=defineProps({assetBaseUrl:{type:String,default:'/eaagri-3d/assets/'},quality:{type:String,default:'auto'},data:{type:Object,default:()=>({source:'none'})}});
const emit=defineEmits(['select']);const host=ref(null);let scene;
function mount(){scene?.destroy();scene=createEaAgriScene(host.value,{assetBaseUrl:props.assetBaseUrl,posterUrl:props.assetBaseUrl+'poster.png',quality:props.quality,data:props.data,onSelect:event=>emit('select',event)});}
onMounted(mount);
watch(()=>[props.assetBaseUrl,props.quality],()=>{if(host.value)mount();});
watch(()=>props.data,value=>scene?.setData(value),{deep:true});
onBeforeUnmount(()=>scene?.destroy());
</script>
<template><div ref="host" style="width:100%;height:clamp(400px,44vw,680px)" /></template>
