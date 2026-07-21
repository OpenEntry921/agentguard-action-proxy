import fs from 'node:fs';import path from 'node:path';
export const rootDir=process.cwd();
export const policyPath=path.join(rootDir,'policies','input-control-policy.json');
export function loadPolicy(){return JSON.parse(fs.readFileSync(policyPath,'utf8'))}
export const port=Number(process.env.PORT||8100);
