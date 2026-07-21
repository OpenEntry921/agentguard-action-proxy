import crypto from 'node:crypto';import {Evidence} from './models.js';import {loadPolicy} from './config.js';
export const sha256=(s:Buffer|string)=>crypto.createHash('sha256').update(s).digest('hex');
export function buildEvidence(input:Buffer|string):Evidence{const p=loadPolicy();return{evidenceId:`ev-${crypto.randomUUID()}`,inputHash:sha256(input),policyVersion:p.policyVersion,scannerVersion:p.scannerVersion,timestamp:new Date().toISOString(),originalContentStored:false}}
