const V='kb-core-v2', PK='kb-packs-v1';
const CORE=['./','index.html','ScheherazadeNew-Regular.woff2','GentiumBookPlus-Regular.woff2','sterne.svg','moschee.webp','icon-192.png','manifest.webmanifest'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==PK).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){
      e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(V).then(x=>x.put('index.html',c)); } return res; }).catch(()=>caches.match('index.html')));
      return;
    }
    if(/\/pack\/\w\/00[234]-/.test(u.pathname)) return; // lange Suren landen in der App-Datenbank
    const store=u.pathname.includes('/pack/')?PK:V;
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(store).then(x=>x.put(r,c)); } return res; })));
    return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>{ const f=fetch(r).then(res=>{ caches.open(V).then(x=>x.put(r,res.clone())); return res; }).catch(()=>m); return m||f; }));
  }
});
