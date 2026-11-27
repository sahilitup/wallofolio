(() => {
const sb = getSupabase();
const $ = s => document.querySelector(s);
const D = Object.fromEntries(DOMAINS.map(d => [d.id, d]));
let current = "pending";

if(!sb){ $("#notConfigured").hidden = false; return; }

// The session comes from onAuthStateChange. Never await Supabase calls inside that
// callback: supabase-js holds its auth lock there, so they deadlock and hang forever.
let session = null;
function refreshAuth(){
  $("#login").hidden = !!session;
  $("#queue").hidden = !session;
  $("#signOut").hidden = !session;
  if(session) loadList();
}

$("#login").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("#email").value.trim(), msg = $("#loginMsg");
  if(!email) return;
  $("#sendLink").disabled = true;
  const {error} = await sb.auth.signInWithOtp({email, options:{emailRedirectTo: location.origin + location.pathname}});
  $("#sendLink").disabled = false;
  msg.hidden = false;
  msg.style.color = error ? "" : "var(--ok)";
  msg.textContent = error ? "Couldn't send the link: " + error.message : "Check your inbox for the sign-in link.";
});
$("#signOut").onclick = () => sb.auth.signOut();
// Fires once on load (INITIAL_SESSION) and on every sign-in/out; defer work out of the callback.
sb.auth.onAuthStateChange((_event, s) => { session = s; setTimeout(refreshAuth, 0); });

$("#tabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if(!b) return;
  current = b.dataset.s;
  document.querySelectorAll("#tabs button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  loadList();
});

function card(r){
  const doms = (r.domains||[]).filter(id => D[id]);
  const actions = [
    r.status !== "approved" ? `<button class="btn btn-primary btn-sm" data-act="approved" data-id="${r.id}">Approve</button>` : "",
    r.status !== "rejected" ? `<button class="btn btn-ghost btn-sm" data-act="rejected" data-id="${r.id}">Reject</button>` : "",
    `<button class="btn btn-ghost btn-sm" data-act="delete" data-id="${r.id}" style="color:var(--bad)">Delete</button>`,
  ].join("");
  const url = safeUrl(r.url);
  return `<div class="card"><div class="meta">
    <span class="status ${r.status}">${r.status}</span>
    <div class="who"><div style="min-width:0"><h3>${esc(r.name)}</h3><p>${esc(r.title)} · ${esc(r.company||"Independent")}</p></div></div>
    <div class="tags">${doms.map(id=>`<span class="tag" style="--c:${D[id].c}">${esc(D[id].name)}</span>`).join("")}</div>
    <p class="hint">${esc(r.industry||"—")} · ${esc(r.country||"—")} · ${r.years} yrs${r.open_to_work?" · open to work":""}</p>
    <p class="hint" style="word-break:break-all">${url==="#" ? esc(r.url) : `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(url)}</a>`}</p>
    <p class="hint">Submitted ${new Date(r.created_at).toLocaleString()}</p>
    <div class="admin-actions">${actions}</div>
  </div></div>`;
}

async function loadList(){
  const list = $("#list");
  list.innerHTML = `<div class="empty"><h3>Loading…</h3></div>`;
  const {data, error} = await sb.from("portfolios").select("*").eq("status", current).order("created_at", {ascending:false}).limit(500);
  if(error){ list.innerHTML = `<div class="empty"><h3>Couldn't load submissions</h3><p>${esc(error.message)}</p></div>`; return; }
  // Non-admins only ever see approved rows, so check admin status when the pending queue looks empty.
  if(current === "pending" && !data.length){
    const {data:isAdmin} = await sb.rpc("is_admin");
    $("#notAdmin").hidden = !!isAdmin;
  }
  list.innerHTML = data.length ? data.map(card).join("") : `<div class="empty"><h3>Nothing ${current}</h3><p>${current==="pending"?"New submissions will show up here.":""}</p></div>`;
}

$("#list").addEventListener("click", async e => {
  const b = e.target.closest("button[data-act]"); if(!b) return;
  const id = b.dataset.id, act = b.dataset.act;
  if(act === "delete" && b.dataset.confirm !== "1"){ b.dataset.confirm = "1"; b.textContent = "Click again to delete"; return; }
  b.disabled = true;
  const q = act === "delete" ? sb.from("portfolios").delete().eq("id", id)
                             : sb.from("portfolios").update({status: act}).eq("id", id);
  const {error} = await q;
  if(error){ b.disabled = false; b.textContent = "Failed, retry"; console.error(error); return; }
  b.closest(".card").remove();
});

})();
