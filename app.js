(() => {
const sb = getSupabase();
const D = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
let ITEMS = [];
const state = {domains:new Set(), q:"", industry:"", exp:"", sort:"recent", otw:false};
const $ = s => document.querySelector(s);

function fromRow(r){
  return {name:r.name, role:r.title, co:r.company || "Independent", domains:(r.domains||[]).filter(id => D[id]),
    exp:r.years||0, country:r.country||"—", otw:!!r.open_to_work, industry:r.industry||"—",
    url:safeUrl(r.url), added:Date.parse(r.created_at)||0};
}

async function load(){
  if(!sb){
    $("#demoBanner").hidden = false;
    ITEMS = DEMO_DATA.map((d,i) => ({name:d[0],role:d[1],co:d[2],domains:d[3],exp:d[4],country:d[5],otw:d[6],industry:d[7],url:"#",added:DEMO_DATA.length-i}));
    return render();
  }
  const {data, error} = await sb.from("portfolios")
    .select("name,title,company,domains,years,country,open_to_work,industry,url,created_at")
    .eq("status","approved").order("created_at",{ascending:false}).limit(1000);
  if(error){
    $("#grid").innerHTML = `<div class="empty"><h3>Couldn't load portfolios</h3><p>Check your connection and refresh the page.</p></div>`;
    console.error(error);
    return;
  }
  ITEMS = data.map(fromRow).filter(it => it.domains.length);
  render();
}

function hash(str){let h=0;for(const ch of str)h=(h*31+ch.charCodeAt(0))>>>0;return h}
function thumb(it){
  const c=D[it.domains[0]].c, h=hash(it.name), layout=h%3;
  const t1=`color-mix(in oklab, ${c} ${h%2?10:16}%, var(--surface))`;
  const t2=`color-mix(in oklab, ${c} ${layout===1?70:35}%, var(--surface))`;
  const t3=`color-mix(in oklab, ${c} 55%, var(--ink))`;
  let blocks="";
  if(layout===0) blocks=`<div class="blk" style="left:8%;top:54%;width:26%;height:34%"></div><div class="blk" style="left:37%;top:54%;width:26%;height:34%"></div><div class="blk" style="left:66%;top:54%;width:26%;height:34%"></div>`;
  else if(layout===1) blocks=`<div class="blk" style="left:64%;top:22%;width:28%;height:66%;border-radius:14px"></div><div class="blk" style="left:8%;top:56%;width:22%;height:8%;border-radius:20px"></div>`;
  else blocks=`<div class="blk" style="left:8%;top:54%;width:52%;height:34%"></div><div class="blk" style="left:63%;top:54%;width:29%;height:15%"></div><div class="blk" style="left:63%;top:73%;width:29%;height:15%"></div>`;
  return `<div class="thumb" style="--t1:${t1};--t2:${t2};--t3:${t3}">
    <div class="nav"><span style="width:16%"></span><span style="width:30%"></span></div>
    <div class="h"></div><div class="h2"></div>${blocks}
    ${it.otw?'<span class="badge">Open to work</span>':''}</div>`;
}
window.renderCardBody = (it) => {
  const c=D[it.domains[0]].c;
  const initials=it.name.split(/\s+/).map(w=>w[0]||"").slice(0,2).join("").toUpperCase();
  return `${thumb(it)}
    <div class="meta">
      <div class="who"><div class="av" style="background:${c}">${esc(initials)}</div>
        <div style="min-width:0"><h3>${esc(it.name)}</h3><p>${esc(it.role)}</p></div></div>
      <div class="tags">${it.domains.map(id=>`<span class="tag" style="--c:${D[id].c}">${esc(D[id].name)}</span>`).join("")}</div>
      <div class="foot"><span>${esc(it.co)} · ${esc(it.industry)} · ${esc(it.country)}</span><span>${it.exp} yr${it.exp===1?"":"s"}</span></div>
    </div>`;
};
function card(it){
  return `<a class="card" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${renderCardBody(it)}</a>`;
}

function matchesNonDomain(it){
  const q=state.q.trim().toLowerCase();
  if(q && !(`${it.name} ${it.role} ${it.co} ${it.industry}`.toLowerCase().includes(q))) return false;
  if(state.industry && it.industry!==state.industry) return false;
  if(state.exp){const [a,b]=state.exp.split("-").map(Number); if(it.exp<a||it.exp>b) return false;}
  if(state.otw && !it.otw) return false;
  return true;
}
function matches(it){
  if(state.domains.size && !it.domains.some(d=>state.domains.has(d))) return false;
  return matchesNonDomain(it);
}

function renderDomains(){
  const base=ITEMS.filter(matchesNonDomain);
  const count=id=>base.filter(it=>it.domains.includes(id)).length;
  const all=`<button class="dom all" aria-pressed="${state.domains.size===0}" data-id=""><span class="ic">∗</span>All domains <span class="ct">${base.length}</span></button>`;
  $("#domains").innerHTML = all + DOMAINS.map(d=>`<button class="dom" style="--c:${d.c}" aria-pressed="${state.domains.has(d.id)}" data-id="${d.id}"><span class="ic">${d.ic}</span>${esc(d.name)} <span class="ct">${count(d.id)}</span></button>`).join("");
  $("#clearDomains").hidden = state.domains.size===0;
}

function render(){
  renderDomains();
  let list=ITEMS.filter(matches);
  if(state.sort==="exp-desc") list.sort((a,b)=>b.exp-a.exp);
  else if(state.sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>b.added-a.added);
  const names=[...state.domains].map(id=>esc(D[id].name));
  $("#resultLine").innerHTML = `<b>${list.length}</b> portfolio${list.length===1?"":"s"}` + (names.length?` in <b>${names.join(", ")}</b>`:" across all domains");
  $("#grid").innerHTML = list.length ? list.map(card).join("") :
    (ITEMS.length ? `<div class="empty"><h3>No portfolios match yet</h3><p>Try another domain or clear a filter.</p></div>`
                  : `<div class="empty"><h3>The wall is empty for now</h3><p>Be the first: use Submit portfolio above.</p></div>`);
  $("#stats").innerHTML = `<span><b>${ITEMS.length}</b> portfolios</span><span><b>${DOMAINS.length}</b> domains</span><span><b>${ITEMS.filter(i=>i.otw).length}</b> open to work</span>`;
  const h = state.domains.size===1 ? "#"+[...state.domains][0] : "";
  try{ if(location.hash!==h) history.replaceState(null,"",h||location.pathname+location.search); }catch(_){}
}

$("#domains").addEventListener("click",e=>{
  const b=e.target.closest(".dom"); if(!b) return;
  const id=b.dataset.id;
  if(!id) state.domains.clear();
  else state.domains.has(id)?state.domains.delete(id):state.domains.add(id);
  render();
});
$("#clearDomains").onclick=()=>{state.domains.clear();render()};
$("#q").oninput=e=>{state.q=e.target.value;render()};
$("#industry").innerHTML=`<option value="">Any industry</option>`+INDUSTRIES.map(r=>`<option>${esc(r)}</option>`).join("");
$("#industry").onchange=e=>{state.industry=e.target.value;render()};
$("#exp").onchange=e=>{state.exp=e.target.value;render()};
$("#sort").onchange=e=>{state.sort=e.target.value;render()};
$("#otw").onchange=e=>{state.otw=e.target.checked;render()};

function fromHash(){const id=location.hash.slice(1); if(D[id]) state.domains=new Set([id]);}
window.addEventListener("hashchange",()=>{fromHash();render()});

// Submit dialog
const dlg=$("#dlg"), picked=new Set();
$("#f-role").innerHTML=TITLES.map(r=>`<option>${esc(r)}</option>`).join("");
$("#f-ind").innerHTML=INDUSTRIES.map(r=>`<option>${esc(r)}</option>`).join("");
function renderPick(){
  $("#f-domains").innerHTML=DOMAINS.map(d=>`<button type="button" style="--c:${d.c}" data-id="${d.id}" aria-pressed="${picked.has(d.id)}">${esc(d.name)}</button>`).join("");
}
$("#f-domains").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b) return; const id=b.dataset.id;
  if(picked.has(id)) picked.delete(id); else if(picked.size<3) picked.add(id);
  renderPick();
});
$("#openSubmit").onclick=()=>{picked.clear();renderPick();$("#f-err").hidden=true;$("#form").hidden=false;$("#thanks").hidden=true;dlg.showModal()};
$("#cancel").onclick=()=>dlg.close();
$("#thanksClose").onclick=()=>dlg.close();

function showErr(msg){const err=$("#f-err");err.textContent=msg;err.hidden=false}
function showThanks(){$("#form").reset();$("#form").hidden=true;$("#thanks").hidden=false}

$("#form").addEventListener("submit",async e=>{
  e.preventDefault();
  $("#f-err").hidden=true;
  const name=$("#f-name").value.trim(), url=$("#f-url").value.trim();
  if(name.length<2) return showErr("Add your full name so people know whose work this is.");
  if(!/^https:\/\/\S+\.\S+/i.test(url)) return showErr("Add a portfolio link that starts with https://");
  if(!picked.size) return showErr("Pick at least one domain.");
  if($("#f-website").value) return showThanks(); // honeypot: bots fill hidden fields
  const row={name, title:$("#f-role").value, company:$("#f-co").value.trim()||null,
    industry:$("#f-ind").value, country:$("#f-country").value.trim()||null,
    years:Math.min(50,Math.max(0,parseInt($("#f-exp").value)||0)),
    domains:[...picked], url, open_to_work:$("#f-otw").checked, status:"pending"};
  if(!sb){ // demo mode: nothing is saved
    return showThanks();
  }
  const btn=$("#f-submit"); btn.disabled=true; btn.textContent="Submitting…";
  const {error}=await sb.from("portfolios").insert(row);
  btn.disabled=false; btn.textContent="Submit for review";
  if(error){console.error(error); return showErr("We couldn't save that. Check the link and try again in a minute.");}
  showThanks();
});

fromHash(); load();
})();
