const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

// Minimal DOM adapter: checks module wiring/rendered strings, not browser behavior.
function setup(){
  const nodes=new Map(),events={},values=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,textContent:'',innerHTML:'',dataset:{},classList:{toggle(){}},addEventListener(){}});return nodes.get(id);};
  const document={getElementById:node,querySelector:s=>node(s),querySelectorAll:()=>[],addEventListener(){}};
  const context=vm.createContext({console,TextEncoder,document,setTimeout,clearTimeout});
  context.window=context;
  context.addEventListener=(name,fn)=>events[name]=fn;
  context.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const load=file=>vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),context,{filename:file});
  for(const file of ['content.js','rules.js','storage.js','ui.js'])load(file);
  return {g:context.Game,node,load,events,values};
}
test('app registers startup and initializes the title screen',()=>{
  const {load,events,node}=setup();load('app.js');
  assert.equal(typeof events.DOMContentLoaded,'function');events.DOMContentLoaded();
  assert.equal(node('home').hidden,false);assert.match(node('save-status').textContent,/离线/);
});
test('HUD uses numeric resource values for bar widths',()=>{
  const {g,node}=setup(),s=g.createState({seed:12});s.player.hp=50;s.player.inf=25;
  g.ui.render(s,g.storage.empty());const hud=node('hud').innerHTML;
  assert.ok(!hud.includes('NaN'));assert.match(hud,/width:50%/);assert.match(hud,/width:25%/);
});
test('explicit import and backup restoration use exported write',()=>{
  const {g,values}=setup();const env=g.storage.empty();env.slots.auto={state:g.createState({name:'恢复测试'})};
  g.storage.write(g.storage.importText(JSON.stringify(env)));
  assert.equal(g.storage.load().envelope.slots.auto.state.player.name,'恢复测试');
  values.set(g.storage.BACKUP,JSON.stringify(env));values.set(g.storage.KEY,'{broken');
  g.storage.write(g.storage.load().envelope);
  assert.equal(g.storage.load().recovered,undefined);
});
test('ending each day advances to its own boundary and settles supplies once',()=>{
  const {g}=setup();let s=g.dispatch(g.createState({seed:12}),{type:'RECEIVE_BROADCAST'}).state;
  s=g.dispatch(s,{type:'END_DAY'}).state;assert.equal(s.clock.slotIndex,5);assert.equal(s.inventory.water,1);
  s=g.dispatch(s,{type:'END_DAY'}).state;assert.equal(s.clock.slotIndex,10);assert.equal(s.inventory.water,0);assert.equal(s.outcome.reason,'错过撤离窗口');
});
test('aim survives its turn and is consumed by the next shot',()=>{
  const {g}=setup();let s=g.createState({seed:12});
  for(const [type,payload] of [['RECEIVE_BROADCAST',{}],['MOVE',{to:'tunnel'}],['CHOOSE',{choiceId:'tunnel_fight'}],['COMBAT_ACTION',{action:'aim'}]])s=g.dispatch(s,{type,payload}).state;
  assert.equal(s.combat.aimBonus,15);s.combat.enemyHp=100;
  s=g.dispatch(s,{type:'COMBAT_ACTION',payload:{action:'shoot'}}).state;
  assert.equal(s.combat.aimBonus,0);
});
