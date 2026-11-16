import type{Health,Level,Log,Span}from"../types";
const ago=(s:number)=>new Date(Date.now()-s*1000).toISOString();
const demoLogs:Log[]=[
{id:"demo-1",timestamp:ago(8),level:"INFO",service:"api-gateway",message:"Request completed · GET /v1/projects",metadata:{method:"GET",statusCode:200,latency:42,requestId:"req-a81f"}},
{id:"demo-2",timestamp:ago(19),level:"ERROR",service:"auth-service",message:"Token validation failed: signature mismatch",metadata:{error:"InvalidTokenError",requestId:"req-b72c",retryable:false}},
{id:"demo-3",timestamp:ago(31),level:"WARN",service:"vector-db",message:"Query latency above p95 threshold",metadata:{latency:284,threshold:250,collection:"embeddings-v2"}},
{id:"demo-4",timestamp:ago(47),level:"DEBUG",service:"agent-swarm",message:"Planner selected tool: semantic_search",metadata:{agent:"planner-02",tool:"semantic_search",tokens:816}},
{id:"demo-5",timestamp:ago(63),level:"INFO",service:"auth-service",message:"Session refreshed successfully",metadata:{userId:"usr_8f12",expiresIn:3600}},
{id:"demo-6",timestamp:ago(88),level:"ERROR",service:"vector-db",message:"Connection pool exhausted",metadata:{poolSize:20,active:20,waiting:7,error:"PoolTimeout"}},
{id:"demo-7",timestamp:ago(114),level:"INFO",service:"api-gateway",message:"Health check passed",metadata:{statusCode:200,latency:4}},
{id:"demo-8",timestamp:ago(151),level:"WARN",service:"agent-swarm",message:"Agent response approaching timeout",metadata:{agent:"research-04",elapsed:2800,timeout:3000}},
{id:"demo-9",timestamp:ago(188),level:"DEBUG",service:"api-gateway",message:"Cache miss · resolving route config",metadata:{cacheKey:"route:v1:projects",region:"fra1"}}];
const demoSpans:Span[]=[
{id:"sp-01",traceId:"tr-a81f",parentSpanId:null,service:"api-gateway",operation:"GET /v1/answer",startTime:0,duration:486,status:"ok"},
{id:"sp-02",traceId:"tr-a81f",parentSpanId:"sp-01",service:"auth-service",operation:"verifySession()",startTime:12,duration:54,status:"ok"},
{id:"sp-03",traceId:"tr-a81f",parentSpanId:"sp-01",service:"agent-swarm",operation:"orchestrate()",startTime:75,duration:350,status:"ok"},
{id:"sp-04",traceId:"tr-a81f",parentSpanId:"sp-03",service:"vector-db",operation:"similaritySearch()",startTime:118,duration:224,status:"error"},
{id:"sp-05",traceId:"tr-a81f",parentSpanId:"sp-03",service:"agent-swarm",operation:"synthesize()",startTime:360,duration:58,status:"ok"},
{id:"sp-06",traceId:"tr-b72c",parentSpanId:null,service:"api-gateway",operation:"POST /v1/auth/refresh",startTime:0,duration:132,status:"ok"},
{id:"sp-07",traceId:"tr-b72c",parentSpanId:"sp-06",service:"auth-service",operation:"refreshToken()",startTime:18,duration:96,status:"ok"}];
let localLogs=[...demoLogs],localSpans=[...demoSpans],fallback=false;
async function call<T>(url:string,init?:RequestInit):Promise<T>{const r=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers}});if(!r.ok)throw new Error("API "+r.status);return r.json() as Promise<T>}
export async function telemetry(){try{const d=await call<{logs:Log[];health:Health[]}>("/api/logs");fallback=false;return{logs:d.logs,health:d.health,fallback}}catch{fallback=true;const health=["api-gateway","auth-service","vector-db","agent-swarm"].map(service=>{const a=localLogs.filter(l=>l.service===service);const errors=a.filter(l=>l.level==="ERROR").length;return{service,status:errors>1?"degraded":"healthy",events:a.length,errors}});return{logs:localLogs,health,fallback}}}
export async function traces(){try{const d=await call<{spans:Span[]}>("/api/traces");return d.spans}catch{fallback=true;return localSpans}}
export async function inject(){const service=["auth-service","vector-db","api-gateway","agent-swarm"][Math.floor(Math.random()*4)];const body={level:"ERROR",service,message:"Synthetic exception injected for pipeline verification",metadata:{source:"TracePulse test injector",environment:"demo"}};try{const d=await call<{log:Log}>("/api/logs",{method:"POST",body:JSON.stringify(body)});return d.log}catch{fallback=true;const l:Log={...body,id:"local-"+Date.now(),timestamp:new Date().toISOString(),level:"ERROR"};localLogs=[l,...localLogs].slice(0,100);return l}}
export async function clear(){localLogs=[];try{await call("/api/logs?clear=true",{method:"DELETE"})}catch{fallback=true}}
export async function addTrace(){const span:Span={id:"local-"+Date.now(),traceId:"tr-new",parentSpanId:null,service:"api-gateway",operation:"POST /v1/demo",startTime:0,duration:76,status:"ok"};try{await call("/api/traces",{method:"POST",body:JSON.stringify(span)})}catch{fallback=true;localSpans=[...localSpans,span]}}
