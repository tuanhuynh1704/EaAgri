import {createEaAgriScene} from '../dist/eaagri-3d.js';
const farm=document.querySelector('#farm'),stats=document.querySelector('#stats');
const data={source:'demo',treeName:'Sầu riêng',growthStage:'Giai đoạn nuôi trái',moistureTop:68,moistureDeep:61,temperature:28,rainMm:12,pumpOn:false,diseaseNote:'Chạm để mở chẩn đoán'};
let viewer,timer;
function mount(){
  viewer?.destroy();clearInterval(timer);
  stats.textContent='Đang tải mô hình…';
  viewer=createEaAgriScene(farm,{
    assetBaseUrl:new URL('../assets/',import.meta.url).href,
    modelUrl:window.EAAGRI_PREVIEW_ASSETS?.[document.querySelector('#quality').value],
    posterUrl:window.EAAGRI_PREVIEW_ASSETS?.poster||new URL('../assets/poster.png',import.meta.url).href,
    quality:document.querySelector('#quality').value,
    showCards:document.querySelector('#cards').checked,
    showFarmer:document.querySelector('#farmer').checked,
    data,
    onSelect:({label,id})=>{stats.textContent=`Điểm chạm: ${label} · sự kiện eaagri:select → ${id}`;},
    onError:error=>{stats.textContent=`Không tải được: ${error.message}`;console.error(error);}
  });
  viewer.ready.then(result=>{
    if(!result.ok)return;
    const s=viewer.getStats();stats.textContent=`${result.quality==='high'?'Bản chi tiết':'Bản nhẹ'} đã sẵn sàng · 10 trái sầu riêng · 6 điểm tương tác`;
  });
}
document.querySelector('#quality').addEventListener('change',mount);
document.querySelector('#farmer').addEventListener('change',mount);
document.querySelector('#cards').addEventListener('change',e=>viewer.setCardsVisible(e.target.checked));
document.querySelector('#mobile').addEventListener('click',e=>{const compact=document.body.classList.toggle('is-mobile');e.target.textContent=compact?'Khung máy tính':'Khung điện thoại';});
document.querySelector('#download-poster').addEventListener('click',async()=>{
  try {const blob=await viewer.capture({width:1800,height:1600});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='eaagri-durian-preview.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  catch(error){stats.textContent=error.message;}
});
mount();
