import {Decision} from './models.js';
export interface AuditEvent{requestId:string;event:string;timestamp:string;inputHash:string;policyVersion:string;detectedTypes:string[];detectedCount:number;decision?:Decision;originalStored:false;maskingApplied:boolean}
const events:AuditEvent[]=[];export function record(e:Omit<AuditEvent,'timestamp'|'originalStored'>){events.push({...e,timestamp:new Date().toISOString(),originalStored:false})}export function listAudit(){return events}export function resetAudit(){events.length=0}
