import path from 'node:path';
export function normalizeFilename(name:string){return path.basename(name).replace(/[^\p{L}\p{N}._ -]/gu,'_').slice(0,120)||'upload'}
export function links(text:string){return [...text.matchAll(/https?:\/\/[^\s)]+/gi)].map(m=>m[0]).slice(0,20)}
