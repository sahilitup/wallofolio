(() => {
const sb = getSupabase();
const D = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
let ITEMS = [];
let loaded = false;
const state = {domains:new Set(), q:"", industry:"", exp:"", sort:"recent", otw:false};
const $ = s => document.querySelector(s);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Line icons for each domain (24×24, stroked)
const GLYPH = {
  "sales":"<path d='M3 17l6-6 4 4 8-8'/><path d='M15 7h6v6'/>",
  "marketing":"<path d='M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z'/><path d='M17 9a4 4 0 0 1 0 6'/>",
  "founders-office":"<path d='M12 3l2.6 5.6L20 9.5l-4 4 1 5.5-5-2.8L7 19l1-5.5-4-4 5.4-.9z'/>",
  "chief-of-staff":"<path d='M12 3l9 5-9 5-9-5 9-5z'/><path d='M3 13l9 5 9-5'/>",
  "finance":"<path d='M4 20V10'/><path d='M10 20V4'/><path d='M16 20v-7'/><path d='M22 20H2'/>",
  "consulting":"<path d='M12 3a9 9 0 1 0 9 9h-9z'/><path d='M15 3.5A9 9 0 0 1 20.5 9H15z'/>",
  "supply-chain":"<path d='M2 7h11v9H2z'/><path d='M13 10h4l4 3v3h-8'/><circle cx='6' cy='18' r='2'/><circle cx='17' cy='18' r='2'/>",
  "hr":"<circle cx='9' cy='8' r='3.5'/><path d='M2.5 20a6.5 6.5 0 0 1 13 0'/><circle cx='17' cy='9' r='2.5'/><path d='M17 14.5a4.5 4.5 0 0 1 4.5 4.5'/>",
  "others":"<circle cx='6' cy='6' r='1.6'/><circle cx='12' cy='6' r='1.6'/><circle cx='18' cy='6' r='1.6'/><circle cx='6' cy='12' r='1.6'/><circle cx='12' cy='12' r='1.6'/><circle cx='18' cy='12' r='1.6'/><circle cx='6' cy='18' r='1.6'/><circle cx='12' cy='18' r='1.6'/><circle cx='18' cy='18' r='1.6'/>",
};
const icon = id => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPH[id]||GLYPH.others}</svg>`;

function fromRow(r){
  return {name:r.name, role:r.title, co:r.company || "Independent", domains:(r.domains||[]).filter(id => D[id]),
    exp:r.years||0, country:r.country||"—", otw:!!r.open_to_work, industry:r.industry||"—",
    url:safeUrl(r.url), added:Date.parse(r.created_at)||0};
}

async function load(){
  if(!sb){
    $("#demoBanner").hidden = false;
    ITEMS = DEMO_DATA.map((d,i) => ({name:d[0],role:d[1],co:d[2],domains:d[3],exp:d[4],country:d[5],otw:d[6],industry:d[7],url:"#",added:DEMO_DATA.length-i}));
    loaded = true; return render();
  }
  const {data, error} = await sb.from("portfolios")
    .select("name,title,company,domains,years,country,open_to_work,industry,url,created_at")
    .eq("status","approved").order("created_at",{ascending:false}).limit(1000);
  if(error){
    $("#grid").innerHTML = `<div class="empty"><h3>Couldn't load portfolios.</h3><p>Check your connection and refresh the page.</p></div>`;
    console.error(error);
    return;
  }
  ITEMS = data.map(fromRow).filter(it => it.domains.length);
  loaded = true; render();
}

function hash(str){let h=0;for(const ch of str)h=(h*31+ch.charCodeAt(0))>>>0;return h}
function thumb(it){
  const c=D[it.domains[0]].c, h=hash(it.name), layout=h%3;
  const t0=`color-mix(in oklab, ${c} 34%, var(--surface))`;
  const t1=`color-mix(in oklab, ${c} 12%, var(--surface))`;
  const t2=`color-mix(in oklab, ${c} ${layout===1?26:16}%, var(--surface))`;
  const t3=`color-mix(in oklab, ${c} 70%, var(--ink))`;
  let blocks="";
  if(layout===0) blocks=`<div class="blk" style="left:7%;top:48%;width:27%;height:40%"></div><div class="blk" style="left:37%;top:48%;width:27%;height:40%"></div><div class="blk" style="left:67%;top:48%;width:26%;height:40%"></div>`;
  else if(layout===1) blocks=`<div class="blk" style="left:62%;top:18%;width:31%;height:70%;border-radius:12px"></div><div class="blk" style="left:7%;top:48%;width:22%;height:9%;border-radius:20px;background:var(--t3)"></div>`;
  else blocks=`<div class="blk" style="left:7%;top:48%;width:54%;height:40%"></div><div class="blk" style="left:64%;top:48%;width:29%;height:18%"></div><div class="blk" style="left:64%;top:70%;width:29%;height:18%"></div>`;
  return `<div class="thumb" style="--t0:${t0};--t1:${t1};--t2:${t2};--t3:${t3}">
    ${it.otw?'<span class="badge">Open to work</span>':''}
    <div class="win"><div class="tl"><i></i><i></i><i></i></div><div class="h"></div><div class="h2"></div>${blocks}</div></div>`;
}
window.renderCardBody = (it) => {
  const c=D[it.domains[0]].c;
  const initials=it.name.split(/\s+/).map(w=>w[0]||"").slice(0,2).join("").toUpperCase();
  return `${thumb(it)}
    <div class="meta">
      <div class="who"><div class="av" style="background:linear-gradient(140deg,${c},color-mix(in oklab,${c} 60%,#000))">${esc(initials)}</div>
        <div style="min-width:0"><h3>${esc(it.name)}</h3><p>${esc(it.role)} · ${esc(it.co)}</p></div></div>
      <div class="tags">${it.domains.map(id=>`<span class="tag" style="--c:${D[id].c}">${esc(D[id].name)}</span>`).join("")}</div>
      <div class="foot"><span>${esc(it.industry)} · ${esc(it.country)} · ${it.exp} yr${it.exp===1?"":"s"}</span><span class="go">View ›</span></div>
    </div>`;
};
const seen = new Set();
function card(it){
  const key = it.name + "|" + it.url;
  const fresh = !seen.has(key) && !reduceMotion; seen.add(key);
  return `<a class="card${fresh?" reveal":""}" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">${renderCardBody(it)}</a>`;
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

function renderTiles(){
  const count=id=>ITEMS.filter(it=>it.domains.includes(id)).length;
  $("#tiles").innerHTML = DOMAINS.map(d=>{
    const n=count(d.id);
    return `<button class="tile" style="--c:${d.c}" data-id="${d.id}">
      <span class="glyph">${icon(d.id)}</span>
      <svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12L12 4M6 4h6v6"/></svg>
      <div><h3>${esc(d.name)}</h3><p>${loaded ? (n ? `${n} portfolio${n===1?"":"s"}` : esc(d.blurb||"")) : "&nbsp;"}</p></div>
    </button>`;
  }).join("");
}

function renderDomains(){
  const base=ITEMS.filter(matchesNonDomain);
  const count=id=>base.filter(it=>it.domains.includes(id)).length;
  const ct=n=>loaded&&n?` <span class="ct">${n}</span>`:"";
  const all=`<button class="dom all" aria-pressed="${state.domains.size===0}" data-id="">All${ct(base.length)}</button>`;
  $("#domains").innerHTML = all + DOMAINS.map(d=>`<button class="dom" style="--c:${d.c}" aria-pressed="${state.domains.has(d.id)}" data-id="${d.id}"><span class="d"></span>${esc(d.name)}${ct(count(d.id))}</button>`).join("");
}

function countUp(el, to){
  if(reduceMotion || to===0){ el.textContent = to; return; }
  const start=performance.now(), dur=900;
  const step=t=>{const p=Math.min(1,(t-start)/dur); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step);};
  requestAnimationFrame(step);
}
let statsDone=false;
function renderStats(){
  if(statsDone || !loaded) return; statsDone=true;
  // Until the wall has a few entries, show what's true about joining instead of zeros.
  const vals = ITEMS.length >= 3
    ? [[ITEMS.length,"Portfolios"],[DOMAINS.length,"Domains"],[ITEMS.filter(i=>i.otw).length,"Open to work"]]
    : [[DOMAINS.length,"Domains"],["Free","To submit"],["100%","Reviewed by hand"]];
  $("#stats").innerHTML = vals.map(([v,l])=>`<div class="stat"><b>${typeof v==="number"?0:esc(v)}</b><span>${l}</span></div>`).join("");
  $("#stats").querySelectorAll("b").forEach((b,i)=>{ if(typeof vals[i][0]==="number") countUp(b, vals[i][0]); });
}

const io = "IntersectionObserver" in window ? new IntersectionObserver(entries=>{
  let i=0;
  for(const e of entries){ if(!e.isIntersecting) continue;
    const el=e.target; io.unobserve(el);
    setTimeout(()=>el.classList.add("in"), Math.min(i++,6)*70);
  }
},{rootMargin:"0px 0px -40px 0px"}) : null;

function render(){
  renderTiles();
  renderDomains();
  renderStats();
  if(!loaded) return;
  let list=ITEMS.filter(matches);
  if(state.sort==="exp-desc") list.sort((a,b)=>b.exp-a.exp);
  else if(state.sort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  else list.sort((a,b)=>b.added-a.added);
  const names=[...state.domains].map(id=>esc(D[id].name));
  $("#resultLine").innerHTML = ITEMS.length ? `<b>${list.length}</b> portfolio${list.length===1?"":"s"}` + (names.length?` in <b>${names.join(", ")}</b>`:"") : "";
  $("#grid").innerHTML = list.length ? list.map(card).join("") :
    (ITEMS.length ? `<div class="empty"><h3>Nothing here yet.</h3><p>Try another domain, or clear a filter.</p></div>`
                  : `<div class="empty"><div class="orb"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="7" height="16" rx="2"/><rect x="14" y="4" width="7" height="10" rx="2"/><path d="M17.5 17v4M15.5 19h4"/></svg></div>
                      <h3>The wall is waiting.</h3><p>Be one of the first portfolios people see. It takes a minute.</p>
                      <button class="btn btn-primary" data-submit>Submit your portfolio</button></div>`);
  if(io) document.querySelectorAll(".card.reveal:not(.in)").forEach(el=>io.observe(el));
  else document.querySelectorAll(".card.reveal").forEach(el=>el.classList.add("in"));
  const h = state.domains.size===1 ? "#"+[...state.domains][0] : "";
  try{ if(h && location.hash!==h) history.replaceState(null,"",h); else if(!h && D[location.hash.slice(1)]) history.replaceState(null,"",location.pathname+location.search); }catch(_){}
}

$("#domains").addEventListener("click",e=>{
  const b=e.target.closest(".dom"); if(!b) return;
  const id=b.dataset.id;
  if(!id) state.domains.clear();
  else state.domains.has(id)?state.domains.delete(id):state.domains.add(id);
  render();
});
$("#tiles").addEventListener("click",e=>{
  const b=e.target.closest(".tile"); if(!b) return;
  state.domains=new Set([b.dataset.id]);
  render();
  $("#wall").scrollIntoView({behavior:reduceMotion?"auto":"smooth"});
});
$("#q").oninput=e=>{state.q=e.target.value;render()};
$("#industry").innerHTML=`<option value="">Any industry</option>`+INDUSTRIES.map(r=>`<option>${esc(r)}</option>`).join("");
$("#industry").onchange=e=>{state.industry=e.target.value;render()};
$("#exp").onchange=e=>{state.exp=e.target.value;render()};
$("#sort").onchange=e=>{state.sort=e.target.value;render()};
$("#otw").onchange=e=>{state.otw=e.target.checked;render()};

function fromHash(){const id=location.hash.slice(1); if(D[id]) state.domains=new Set([id]);}
window.addEventListener("hashchange",()=>{fromHash();render()});

// Nav hairline appears once you scroll
const nav=$("#nav");
const onScroll=()=>nav.classList.toggle("scrolled", scrollY>8);
addEventListener("scroll",onScroll,{passive:true}); onScroll();

// Submit sheet
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
function openSheet(){
  picked.clear();
  if(state.domains.size===1) picked.add([...state.domains][0]); // preselect the domain being browsed
  renderPick();$("#f-err").hidden=true;$("#form").hidden=false;$("#thanks").hidden=true;dlg.showModal();
}
document.addEventListener("click",e=>{ if(e.target.closest("[data-submit]")) openSheet(); });
$("#cancel").onclick=()=>dlg.close();
$("#thanksClose").onclick=()=>dlg.close();
dlg.addEventListener("click",e=>{ if(e.target===dlg) dlg.close(); }); // tap outside to dismiss

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

fromHash(); render(); load();
})();
