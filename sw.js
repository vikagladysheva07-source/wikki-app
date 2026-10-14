// wikki.app · офлайн-кэш. Страница — мгновенно из кэша, свежая версия в фоне; остальное — кэш первым.
const V='tw-v90';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png','./ocean.jpg','./shark.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;
  if(u.hostname.endsWith('supabase.co'))return;
  const isPage=e.request.mode==='navigate'||(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('index.html')));
  if(isPage){
    // мгновенно из кэша, свежая версия — в фоне
    const net=fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(V).then(x=>{x.put('./',c.clone());x.put('./index.html',c)})}return r});
    e.waitUntil(net.catch(()=>{}));
    e.respondWith(caches.match('./',{ignoreSearch:true}).then(r=>r||caches.match('./index.html')).then(r=>r||net));
    return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&(u.origin===location.origin||/fonts|jsdelivr/.test(u.hostname))){const c=res.clone();caches.open(V).then(x=>x.put(e.request,c))}return res})));
});
// пуш-уведомления: {title, body, tab}
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'wikki.app',{body:d.body||'',icon:'./icon-512.png',badge:'./icon-180.png',tag:d.tab||'tw',renotify:true,data:{tab:d.tab||'home'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const tab=(e.notification.data||{}).tab||'home',url=new URL('./?tab='+tab,self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('focus' in w){w.postMessage({tab});return w.focus()}}return self.clients.openWindow(url)}))});
