process.env.JWT_SECRET='s'; process.env.ORG_ID='111111111111111111111111'; process.env.CORS_ORIGIN='http://localhost:5173';
const path=require('path'); const calls=[];
const mk=(name)=>new Proxy({}, {get:(_,m)=>(...args)=>{
  const filter=args[0]; calls.push({name,m,filter});
  const cb=args.find(a=>typeof a==='function');
  const q={sort(){return q},select(){return q},lean(){return Promise.resolve([])},then(r,j){return Promise.resolve([]).then(r,j)}};
  if(cb){cb(null,null);return q} return q; }});
const fake={clients:mk('clients'),events:mk('events'),services:mk('services'),users:mk('users'),orgs:mk('orgs')};
require.cache[require.resolve('./models/models')]={id:'m',filename:'m',loaded:true,exports:fake};
const express=require('express'),jwt=require('jsonwebtoken');
const app=express(); app.use(express.json());
app.use('/clients',require('./routes/clients'));app.use('/events',require('./routes/events'));app.use('/services',require('./routes/services'));
app.use((req,res,n)=>n(Object.assign(new Error('Route not found'),{statusCode:404})));
app.use((e,req,res,n)=>res.status(e.statusCode||500).json({error:e.message}));
const OID='aaaaaaaaaaaaaaaaaaaaaaaa';
const tok=(role,orgId=OID)=>jwt.sign({name:'x',role,orgId},'s');
const srv=app.listen(0,async()=>{
  const base='http://localhost:'+srv.address().port; let fail=0;
  const t=async(label,method,url,token,expect)=>{
    const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:method==='GET'?undefined:'{"firstName":"a","org":"bbbbbbbbbbbbbbbbbbbbbbbb","orgs":["bbbbbbbbbbbbbbbbbbbbbbbb"]}'});
    const ok=r.status===expect; if(!ok)fail++; console.log(ok?'PASS':'FAIL',label,'->',r.status,'(want',expect+')');};
  const E='cccccccccccccccccccccccc';
  const reads=['/clients','/clients/id/'+E,'/clients/search?searchBy=name','/clients/byzip','/events','/events/id/'+E,'/events/attendance','/events/attendees/'+E,'/events/client/'+E,'/events/client/'+E+'/not-registered','/events/service/'+E,'/events/search?searchBy=name&name=x','/services','/services/id/'+E,'/services/search?searchBy=name&name=x'];
  for(const u of reads){await t('no token GET '+u,'GET',u,null,401);}
  for(const u of reads){await t('viewer GET '+u,'GET',u,tok('viewer'),u.includes('/id/')||u.includes('attendees/')?404:200);}
  const muts=[['POST','/clients'],['PUT','/clients/update/'+E],['DELETE','/clients/'+E],['POST','/events'],['PUT','/events/update/'+E],['PUT','/events/register?event='+E+'&client='+E],['PUT','/events/deregister?event='+E+'&client='+E],['DELETE','/events/'+E],['POST','/services'],['PUT','/services/update/'+E],['DELETE','/services/'+E]];
  for(const [m,u] of muts){for(const role of ['viewer','guest','']){await t(role+' '+m+' '+u,m,u,tok(role),403);} await t('noorgid token '+m+' '+u,m,u,jwt.sign({name:'x',role:'editor'},'s'),401);}
  calls.length=0;
  for(const [m,u] of muts){await t('editor '+m+' '+u,m,u,tok('editor'),m==='POST'?200:404);}
  // every model call made must be filtered to the token org, never the body's org
  let bad=0;
  for(const c of calls){ if(c.m==='create'){ const d=c.filter; const o=d.org||d.orgs; const v=String(Array.isArray(o)?o[0]:o); if(v!==OID){bad++;console.log('BAD create',c.name,JSON.stringify(d))} continue;}
    if(c.m==='aggregate')continue; const f=JSON.stringify(c.filter); if(!f.includes(OID)){bad++;console.log('UNSCOPED',c.name,c.m,f)} }
  console.log('model calls checked:',calls.length,'unscoped/bad:',bad);
  const ag=calls.length; calls.length=0; await t('byzip','GET','/clients/byzip',tok('viewer'),200);
  console.log('byzip pipeline org:', JSON.stringify(calls[0]&&calls[0].filter));
  console.log(fail||bad?'SOME FAILED':'ALL OK'); srv.close();
});
