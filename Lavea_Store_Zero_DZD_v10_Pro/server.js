const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname, DATA=path.join(ROOT,'data','store.json'), UPLOADS=path.join(ROOT,'images','uploads'), PORT=process.env.PORT||3000, INITIAL_ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'Lavea@2026';
const wilayas=["01 - أدرار","02 - الشلف","03 - الأغواط","04 - أم البواقي","05 - باتنة","06 - بجاية","07 - بسكرة","08 - بشار","09 - البليدة","10 - البويرة","11 - تمنراست","12 - تبسة","13 - تلمسان","14 - تيارت","15 - تيزي وزو","16 - الجزائر","17 - الجلفة","18 - جيجل","19 - سطيف","20 - سعيدة","21 - سكيكدة","22 - سيدي بلعباس","23 - عنابة","24 - قالمة","25 - قسنطينة","26 - المدية","27 - مستغانم","28 - المسيلة","29 - معسكر","30 - ورقلة","31 - وهران","32 - البيض","33 - إليزي","34 - برج بوعريريج","35 - بومرداس","36 - الطارف","37 - تندوف","38 - تيسمسيلت","39 - الوادي","40 - خنشلة","41 - سوق أهراس","42 - تيبازة","43 - ميلة","44 - عين الدفلى","45 - النعامة","46 - عين تموشنت","47 - غرداية","48 - غليزان","49 - تيميمون","50 - برج باجي مختار","51 - أولاد جلال","52 - بني عباس","53 - عين صالح","54 - عين قزام","55 - تقرت","56 - جانت","57 - المغير","58 - المنيعة"];
fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.mkdirSync(UPLOADS,{recursive:true});
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(e){return {settings:{},products:[],orders:[]}}}
let db=load();
db.settings=db.settings||{};db.settings.enabledWilayas=db.settings.enabledWilayas?.length?db.settings.enabledWilayas:wilayas;db.settings.deliveryByWilaya=db.settings.deliveryByWilaya||{};db.settings.deliveryHomeDefault=Number(db.settings.deliveryHomeDefault??600);db.settings.deliveryOfficeDefault=Number(db.settings.deliveryOfficeDefault??500);db.settings.currency=db.settings.currency||'دج';db.settings.storeAddress=db.settings.storeAddress||'الجزائر';
db.settings.storeCity=db.settings.storeCity||'سطيف';
db.settings.storeDescription=db.settings.storeDescription||'متجر جزائري بتجربة شراء عصرية.';
db.settings.email=db.settings.email||'';
db.settings.instagram=db.settings.instagram||'';
db.settings.facebook=db.settings.facebook||'';
db.settings.orderPrefix=db.settings.orderPrefix||'LV';
db.settings.lowStockThreshold=Number(db.settings.lowStockThreshold??5);db.settings.heroImage=db.settings.heroImage||'images/hero.jpg';db.settings.metaPixelId=db.settings.metaPixelId||'';db.settings.tiktokPixelId=db.settings.tiktokPixelId||'';db.settings.googleAnalyticsId=db.settings.googleAnalyticsId||'';
function hashPassword(password,salt=crypto.randomBytes(16).toString('hex')){return salt+':'+crypto.pbkdf2Sync(String(password),salt,120000,32,'sha256').toString('hex')}
function verifyPassword(password,stored){if(!stored)return false;const [salt,hash]=String(stored).split(':');if(!salt||!hash)return false;const test=crypto.pbkdf2Sync(String(password),salt,120000,32,'sha256').toString('hex');return crypto.timingSafeEqual(Buffer.from(hash,'hex'),Buffer.from(test,'hex'))}
if(!db.settings.adminPasswordHash) db.settings.adminPasswordHash=hashPassword(INITIAL_ADMIN_PASSWORD);
save();
function save(){fs.writeFileSync(DATA,JSON.stringify(db,null,2),'utf8')}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data:; img-src 'self' https: data: blob:; connect-src 'self' https:;",'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});res.end(type==='application/json'?JSON.stringify(data):data)}
function jsonBody(req,max=8e6){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>max){req.destroy();reject(new Error('payload too large'))}});req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}});req.on('error',reject)})}
function rawBody(req,max=12e6){return new Promise((resolve,reject)=>{const chunks=[];let n=0;req.on('data',c=>{n+=c.length;if(n>max){req.destroy();reject(new Error('file too large'));return}chunks.push(c)});req.on('end',()=>resolve(Buffer.concat(chunks)));req.on('error',reject)})}
const LOGIN_WINDOW=15*60*1000, LOGIN_MAX=8, SESSION_TTL=12*60*60*1000;
const loginAttempts=new Map();
function auth(req){
  const t=req.headers.authorization?.replace(/^Bearer\s+/,'');
  const x=t&&sessions.get(t);
  if(!x)return false;
  if(Date.now()-x.createdAt>SESSION_TTL){sessions.delete(t);return false}
  return true
}
function token(){return crypto.randomBytes(32).toString('hex')}
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim()}
function loginAllowed(req){
  const k=clientIp(req), now=Date.now(), a=(loginAttempts.get(k)||[]).filter(t=>now-t<LOGIN_WINDOW);
  loginAttempts.set(k,a); return a.length<LOGIN_MAX;
}
function recordLoginFailure(req){
  const k=clientIp(req), a=(loginAttempts.get(k)||[]).filter(t=>Date.now()-t<LOGIN_WINDOW); a.push(Date.now()); loginAttempts.set(k,a);
}
function sanitizeOrder(o){return {id:o.id,name:o.name,phone:o.phone,wilaya:o.wilaya,deliveryType:o.deliveryType,address:o.address,note:o.note,items:o.items,total:o.total,subtotal:o.subtotal,shipping:o.shipping,status:o.status,createdAt:o.createdAt}}
const sessions=new Map();
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,`http://${req.headers.host}`),p=u.pathname;
if(req.method==='OPTIONS'){res.writeHead(204,{'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self' https: 'unsafe-inline' 'unsafe-eval' data:; img-src 'self' https: data: blob:; connect-src 'self' https:;",'Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});return res.end()}
if(p==='/api/login'&&req.method==='POST'){const b=await jsonBody(req);if(!loginAllowed(req))return send(res,429,{error:'محاولات دخول كثيرة. حاول بعد 15 دقيقة.'});
if(!verifyPassword(b.password,db.settings.adminPasswordHash)){recordLoginFailure(req);return send(res,401,{error:'كلمة المرور غير صحيحة'});}const t=token();sessions.set(t,Date.now());return send(res,200,{token:t})}
if(p==='/api/store'&&req.method==='GET')return send(res,200,{settings:db.settings,products:db.products,delivery:wilayas.map(w=>({wilaya:w,enabled:db.settings.enabledWilayas.includes(w),home:db.settings.deliveryByWilaya[w]?.home??db.settings.deliveryHomeDefault,office:db.settings.deliveryByWilaya[w]?.office??db.settings.deliveryOfficeDefault}))});
if(p==='/api/orders'&&req.method==='POST'){const b=await jsonBody(req);if(!b.name||!b.phone||!b.wilaya||!b.deliveryType||!b.address||!Array.isArray(b.items)||!b.items.length)return send(res,400,{error:'معلومات الطلب ناقصة'});const phone=String(b.phone).replace(/\s/g,'');if(!/^0[567][0-9]{8}$/.test(phone))return send(res,400,{error:'رقم الهاتف غير صالح'});if(!db.settings.enabledWilayas.includes(b.wilaya))return send(res,400,{error:'التوصيل غير متاح لهذه الولاية'});const key=b.deliveryType==='home'?'home':'office';const shipping=Number(db.settings.deliveryByWilaya[b.wilaya]?.[key]??(key==='home'?db.settings.deliveryHomeDefault:db.settings.deliveryOfficeDefault));const subtotal=b.items.reduce((s,i)=>s+(Number(i.price)||0)*(Number(i.quantity)||1),0);const order={id:'LV-'+Date.now().toString(36).toUpperCase(),name:b.name.trim(),phone,wilaya:b.wilaya,deliveryType:key,address:b.address.trim(),note:(b.note||'').trim(),items:b.items.map(i=>({id:i.id,name:i.name,price:Number(i.price)||0,quantity:Number(i.quantity)||1})),subtotal,shipping,total:subtotal+shipping,status:'جديد',createdAt:new Date().toISOString()};db.orders.unshift(order);for(const it of order.items){const pr=db.products.find(x=>String(x.id)===String(it.id));if(pr&&Number.isFinite(Number(pr.stock)))pr.stock=Math.max(0,Number(pr.stock)-it.quantity)}save();return send(res,201,{order:sanitizeOrder(order)})}
if(p.startsWith('/api/')&&!auth(req))return send(res,401,{error:'غير مصرح'});
if(p==='/api/admin/upload'&&req.method==='POST'){const ct=req.headers['content-type']||'';if(!ct.startsWith('image/'))return send(res,400,{error:'الملف يجب أن يكون صورة'});const ext=({ 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','image/avif':'.avif'})[ct];if(!ext)return send(res,400,{error:'صيغة الصورة غير مدعومة'});const buf=await rawBody(req);const name=Date.now()+'-'+crypto.randomBytes(4).toString('hex')+ext;fs.writeFileSync(path.join(UPLOADS,name),buf);return send(res,201,{url:'images/uploads/'+name})}
if(p==='/api/admin/products'&&req.method==='POST'){const b=await jsonBody(req);if(!String(b.name||'').trim())return send(res,400,{error:'اسم المنتج مطلوب'});if(Number(b.price)<0)return send(res,400,{error:'السعر غير صالح'});const product={...b,id:Date.now(),price:Number(b.price)||0,oldPrice:Number(b.oldPrice)||0,rating:Number(b.rating)||5,stock:Number.isFinite(Number(b.stock))?Math.max(0,Number(b.stock)):0,active:b.active!==false,landingEnabled:b.landingEnabled!==false,slug:b.slug||String(b.name||'product').trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-')};db.products.unshift(product);save();return send(res,201,product)}
if(p.startsWith('/api/admin/products/')&&req.method==='PUT'){const id=Number(p.split('/').pop()),i=db.products.findIndex(x=>x.id===id);if(i<0)return send(res,404,{error:'المنتج غير موجود'});const b=await jsonBody(req);db.products[i]={...db.products[i],...b,id,price:Number(b.price??db.products[i].price)||0,oldPrice:Number(b.oldPrice??db.products[i].oldPrice)||0,stock:Number(b.stock??db.products[i].stock)||0};save();return send(res,200,db.products[i])}
if(p.startsWith('/api/admin/products/')&&req.method==='DELETE'){const id=Number(p.split('/').pop());db.products=db.products.filter(x=>x.id!==id);save();return send(res,200,{ok:true})}
if(p==='/api/admin/password'&&req.method==='PUT'){const b=await jsonBody(req);if(!b.currentPassword||!b.newPassword)return send(res,400,{error:'أدخل كلمة المرور الحالية والجديدة'});if(String(b.newPassword).length<8)return send(res,400,{error:'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'});if(!verifyPassword(b.currentPassword,db.settings.adminPasswordHash))return send(res,401,{error:'كلمة المرور الحالية غير صحيحة'});db.settings.adminPasswordHash=hashPassword(b.newPassword);save();sessions.clear();return send(res,200,{ok:true})}
if(p==='/api/admin/export'&&req.method==='GET'){
  const payload={exportedAt:new Date().toISOString(),settings:db.settings,products:db.products,orders:db.orders};
  return send(res,200,payload);
}
if(p==='/api/admin/settings'&&req.method==='PUT'){const b=await jsonBody(req);db.settings={...db.settings,...b};if(Array.isArray(b.enabledWilayas))db.settings.enabledWilayas=b.enabledWilayas;if(b.deliveryByWilaya)db.settings.deliveryByWilaya=b.deliveryByWilaya;save();return send(res,200,db.settings)}
if(p==='/api/admin/orders'&&req.method==='GET')return send(res,200,db.orders.map(sanitizeOrder));
if(p.startsWith('/api/admin/orders/')&&req.method==='PUT'){const id=p.split('/').pop(),o=db.orders.find(x=>x.id===id);if(!o)return send(res,404,{error:'الطلب غير موجود'});const b=await jsonBody(req);if(b.status)o.status=b.status;save();return send(res,200,sanitizeOrder(o))}
let file=p==='/'?'/index.html':p;if(file==='/admin')file='/admin.html';const fp=path.normalize(path.join(ROOT,file));if(!fp.startsWith(ROOT))return send(res,403,{error:'forbidden'});fs.readFile(fp,(e,d)=>{if(e)return send(res,404,{error:'not found'});const ext=path.extname(fp),types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.svg':'image/svg+xml','.ico':'image/x-icon'};send(res,200,d,types[ext]||'application/octet-stream')});
}catch(e){console.error(e);send(res,500,{error:'حدث خطأ في الخادم'})}});
server.listen(PORT,()=>console.log(`Lavéa running on http://localhost:${PORT}`));
