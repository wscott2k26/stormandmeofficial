import { buildResponseInput } from './chat-core.mjs';

const key=()=>{const k=Deno.env.get('OPENAI_API_KEY');if(!k)throw new Error('OPENAI_API_KEY missing');return k};

export async function moderate(input:string){
  const r=await fetch('https://api.openai.com/v1/moderations',{method:'POST',headers:{Authorization:`Bearer ${key()}`,'Content-Type':'application/json'},body:JSON.stringify({model:'omni-moderation-latest',input})});
  if(!r.ok)throw new Error(`Moderation failed ${r.status}`);
  return await r.json();
}

export async function respond(system:string,user:string,history:Array<{role:'user'|'assistant';content:string}>=[]){
  const model=Deno.env.get('OPENAI_MODEL');
  if(!model)throw new Error('OPENAI_MODEL missing');
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key()}`,'Content-Type':'application/json'},body:JSON.stringify({model,store:false,max_output_tokens:900,input:buildResponseInput(system,user,history)})});
  if(!r.ok)throw new Error(`Responses API failed ${r.status}: ${await r.text()}`);
  const data=await r.json();
  return{id:data.id,text:data.output_text??data.output?.flatMap((x:any)=>x.content??[]).find((x:any)=>x.type==='output_text')?.text??'I could not form a response safely.'};
}
