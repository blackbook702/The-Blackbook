const fs=require('fs');
const s=fs.readFileSync('index.html','utf8');
// collect image constants
const consts={};
for(const m of s.matchAll(/const ([A-Z_]+_IMG)="data:image\/(\w+);base64,([A-Za-z0-9+\/=]+)"/g)){
  const ext=m[2]==='jpeg'?'jpg':m[2];const f=m[1].toLowerCase().replace(/_img$/,'')+'.'+ext;
  fs.writeFileSync('fb-catalog/images/'+f,Buffer.from(m[3],'base64'));consts[m[1]]=f;}
const j=s.indexOf('const PRODUCTS=[');const e=s.indexOf('\n];',j);
const code=s.slice(j,e+3).replace('const PRODUCTS=','PRODUCTS=');
const ctx={};for(const k of Object.keys(consts)) ctx[k]='@'+consts[k];
const P=new Function(...Object.keys(ctx),'let PRODUCTS;'+code+';return PRODUCTS;')(...Object.values(ctx));
const RAW='https://raw.githubusercontent.com/blackbook702/the-blackbook/master/fb-catalog/images/';
const brands=['Aveeno','AVEENO','Banana Boat','Body Fortress','CeraVe','Dove','Gillette','Gold Bond','Neutrogena','Johnson','Kleenex','Lotrimin','Mueller','Old Spice','Oral-B','Prevail','Puffs','Puff','Renu','Revlon','Softsoap','Stayfree','Suave','Zest','Caldrea','Cascade','Clorox','Drano','Duracell','Family Guard','finish','Glade','Granite Gold','Hallmark','IAMS','Lysol','Method','Micro Gold','MicroGold','Microban','Mrs. Meyer','MRS. MEYER','OXO','Pledge','Purex','Quilted Northern','Scott','Seventh Generation','Shout','Snuggle','Suavitel','Tide','True','Vanity Fair','Woolite','Ace','Hydro Boost','E-Wheels'];
const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
const rows=[['id','title','description','availability','condition','price','sale_price','link','image_link','brand','product_type']];
const skipped=[];
for(const p of P){
  if(p.p==null||p.cat==='Local Businesses'){skipped.push(p.n);continue;}
  const img0=p.photo?(p.photo.startsWith('@')?RAW+p.photo.slice(1):null):p.img;
  const img=img0&&img0.replace(/-\d+x\d+(\.\w+)$/,'$1');
  if(!img){skipped.push(p.n+' (no photo)');continue;}
  const used=/used/i.test(p.n);
  let b=brands.find(x=>p.n.toLowerCase().startsWith(x.toLowerCase()));
  b=b?b.replace(/^AVEENO$/,'Aveeno').replace(/^MRS\. MEYER$/,'Mrs. Meyer\'s').replace(/^Mrs\. Meyer$/,"Mrs. Meyer's").replace(/^finish$/,'Finish').replace(/^Johnson$/,"Johnson's"):'The Black Market';
  const link=p.url||'https://www.theblackbook.directory/#black-market';
  const id='BM-'+(p.url?p.url.replace(/\/$/,'').split('/').pop():p.n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40));
  const title=p.n.length>150?p.n.slice(0,147).replace(/\s+\S*$/,'')+'…':p.n;
  const desc=`${p.d?p.d+' ':p.n+'. '}${used?'Pre-owned, in working condition. ':''}Sold by The Black Market, the online store of The BlackBook Black business directory in Las Vegas. Questions: 702-415-1303.`;
  const price=(p.was&&p.was>p.p)?p.was:p.p;
  const sale=(p.was&&p.was>p.p)?p.p.toFixed(2)+' USD':'';
  rows.push([id,title,desc,p.stock===0?'out of stock':'in stock',used?'used':'new',price.toFixed(2)+' USD',sale,link,img,b,p.cat]);
}
fs.writeFileSync('fb-catalog/black-market-facebook-catalog.csv',rows.map(r=>r.map(q).join(',')).join('\n')+'\n');
console.log('products',rows.length-1,'skipped',skipped);console.log(consts);
