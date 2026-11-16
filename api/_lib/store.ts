import type {VercelRequest,VercelResponse} from "@vercel/node";
export type Level="INFO"|"WARN"|"ERROR"|"DEBUG";
export type Log={id:string;timestamp:string;level:Level;service:string;message:string;metadata:Record<string,unknown>};
export type Span={id:string;traceId:string;parentSpanId:string|null;service:string;operation:string;startTime:number;duration:number;status:"ok"|"error"};
const ago=(s:number)=>new Date(Date.now()-s*1000).toISOString();
export const logs:Log[]=[
{id:"lg-1001",timestamp:ago(8),level:"INFO",service:"api-gateway",message:"Request completed · GET /v1/projects",metadata:{method:"GET",statusCode:200,latency:42,requestId:"req-a81f"}},
{id:"lg-1002",timestamp:ago(19),level:"ERROR",service:"auth-service",message:"Token validation failed: signature mismatch",metadata:{error:"InvalidTokenError",requestId:"req-b72c",retryable:false}},
{id:"lg-1003",timestamp:ago(31),level:"WARN",service:"vector-db",message:"Query latency above p95 threshold",metadata:{latency:284,threshold:250,collection:"embeddings-v2"}},
{id:"lg-1004",timestamp:ago(47),level:"DEBUG",service:"agent-swarm",message:"Planner selected tool: semantic_search",metadata:{agent:"planner-02",tool:"semantic_search",tokens:816}},
{id:"lg-1005",timestamp:ago(63),level:"INFO",service:"auth-service",message:"Session refreshed successfully",metadata:{userId:"usr_8f12",expiresIn:3600}},
{id:"lg-1006",timestamp:ago(88),level:"ERROR",service:"vector-db",message:"Connection pool exhausted",metadata:{poolSize:20,active:20,waiting:7,error:"PoolTimeout"}},
{id:"lg-1007",timestamp:ago(114),level:"INFO",service:"api-gateway",message:"Health check passed",metadata:{statusCode:200,latency:4}},
{id:"lg-1008",timestamp:ago(151),level:"WARN",service:"agent-swarm",message:"Agent response approaching timeout",metadata:{agent:"research-04",elapsed:2800,timeout:3000}},
{id:"lg-1009",timestamp:ago(188),level:"DEBUG",service:"api-gateway",message:"Cache miss · resolving route config",metadata:{cacheKey:"route:v1:projects",region:"fra1"}}];
export const spans:Span[]=[
{id:"sp-01",traceId:"tr-a81f",parentSpanId:null,service:"api-gateway",operation:"GET /v1/answer",startTime:0,duration:486,status:"ok"},
{id:"sp-02",traceId:"tr-a81f",parentSpanId:"sp-01",service:"auth-service",operation:"verifySession()",startTime:12,duration:54,status:"ok"},
{id:"sp-03",traceId:"tr-a81f",parentSpanId:"sp-01",service:"agent-swarm",operation:"orchestrate()",startTime:75,duration:350,status:"ok"},
{id:"sp-04",traceId:"tr-a81f",parentSpanId:"sp-03",service:"vector-db",operation:"similaritySearch()",startTime:118,duration:224,status:"error"},
{id:"sp-05",traceId:"tr-a81f",parentSpanId:"sp-03",service:"agent-swarm",operation:"synthesize()",startTime:360,duration:58,status:"ok"},
{id:"sp-06",traceId:"tr-b72c",parentSpanId:null,service:"api-gateway",operation:"POST /v1/auth/refresh",startTime:0,duration:132,status:"ok"},
{id:"sp-07",traceId:"tr-b72c",parentSpanId:"sp-06",service:"auth-service",operation:"refreshToken()",startTime:18,duration:96,status:"ok"}];
export function json(res:VercelResponse,status:number,data:unknown){res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.status(status).json(data)}
export function guard(req:VercelRequest,res:VercelResponse,methods:string[]){res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods",methods.join(", "));res.setHeader("Access-Control-Allow-Headers","Content-Type");if(req.method==="OPTIONS"){res.status(204).end();return true}if(!req.method||!methods.includes(req.method)){res.setHeader("Allow",methods.join(", "));json(res,405,{error:"Method not allowed"});return true}return false}
export function object(value:unknown):Record<string,unknown>|null{if(typeof value==="string"){try{value=JSON.parse(value)}catch{return null}}return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null}
