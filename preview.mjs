import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const baseArg=process.argv.indexOf('--base');
const basePath=baseArg<0?'/':process.argv[baseArg+1];
if(!basePath||!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(basePath))throw new Error('Use --base /repository-name/');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'&&basePath!=='/'){res.writeHead(302,{Location:basePath});res.end();return;}
  if(!pathname.startsWith(basePath)){res.writeHead(404);res.end('Not found');return;}
  const relative=pathname.slice(basePath.length)||'index.html';
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4317,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4317'+basePath));
