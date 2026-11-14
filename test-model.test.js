import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {bloggers,cpm,summary,filterBloggers} from './src/model.js';

test('all demo rows are synthetic and contain no links',()=>{
  assert.equal(bloggers.length,15);
  for(const [index,b] of bloggers.entries()){
    assert.equal(b.sku,`SYN-${String(index+1).padStart(3,'0')}`);
    assert.match(b.name,/^Демо-автор \d{2}$/);
    assert.equal(b.link,'');
    assert.equal(b.geo,'Условная аудитория');
    assert.ok(Math.abs(cpm(b)-b.sourceCpm)<1e-8);
  }
});
test('summary totals use reach-weighted CPM',()=>{
  const items=[{cost:1000,reach:100,views:300,product:40,status:'Результаты получены'},{cost:4000,reach:400,views:200,product:50,status:'Согласование'}];
  const result=summary(items);
  assert.deepEqual(result,{count:2,cost:5000,reach:500,views:500,product:90,cpm:10000,complete:1});
  assert.equal(summary([]).cpm,null);
});
test('filters apply together including case-insensitive search',()=>{
  const b=bloggers[0];
  assert.equal(filterBloggers(bloggers,{search:b.sku.toLowerCase(),platform:b.platform,status:b.status,budget:b.budget}).length,1);
  assert.equal(filterBloggers(bloggers,{search:b.sku,platform:'VK'}).length,0);
  assert.equal(filterBloggers(bloggers,{platform:'Telegram'}).length,5);
});
test('zero reach has no CPM',()=>{
  assert.equal(cpm({cost:100,reach:0}),null);
  assert.equal(summary([{cost:100,reach:0}]).cpm,null);
});
test('application sources contain no external resource addresses',async()=>{
  for(const file of ['index.html','src/style.css','src/main.jsx','src/data.json']){
    const text=await readFile(file,'utf8');
    assert.doesNotMatch(text,/https?:\/\//i,`${file} should not load external resources`);
  }
});
