const {test}=require('node:test'),assert=require('node:assert/strict');
require('../sport/fish-education.js');const config=require('../pro/config.json');
test('Every configured fish has a named, sourced introduction',()=>{for(const fish of config.fish){const entry=FishEducation[fish.id];assert(entry,fish.id);assert.equal(entry.name,fish.name);assert.equal(entry.scientificName,fish.scientificName);assert.equal(entry.paragraphs.length,3);assert(entry.paragraphs.every(p=>typeof p==='string'&&p.length>20));assert(entry.source.startsWith('https://'));}});
