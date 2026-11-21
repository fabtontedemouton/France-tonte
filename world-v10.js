/* SHEARING FRANCE WORLD V10
   Add this script immediately before </body> in index.html.
   It uses the existing global data model and the existing sfQueueSync() hook.
*/
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const LANG_KEY = "sf_world_lang_v10";
  let lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "fr";
  let queue = [];
  const tr = (fr, en) => lang === "en" ? en : fr;
  const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().replace(/\s+/g, " ").toLowerCase();
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  function addStyles() {
    if ($("sfwStyles")) return;
    const style = document.createElement("style");
    style.id = "sfwStyles";
    style.textContent = `
      .sfw-hero{display:flex;justify-content:space-between;gap:15px;align-items:center;padding:22px;border-radius:16px;background:linear-gradient(115deg,#111a2a,#263c57);color:white;margin-bottom:14px}
      .sfw-hero h2{margin:5px 0}.sfw-hero p,.sfw-note{color:#aaa;font-size:12px}
      .sfw-k{font-size:10px;letter-spacing:.15em;color:#d9b65f;font-weight:900}
      .sfw-panel{padding:17px;background:#101010;border:1px solid #303030;border-radius:14px;margin:14px 0}
      .sfw-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.sfw-head h3{margin:4px 0}
      .sfw-chip{border:1px solid #66532d;color:#e6c477;padding:5px 9px;border-radius:20px;font-size:11px}
      .sfw-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}
      .sfw-stats div{padding:13px;border:1px solid #333;border-radius:10px;background:#101010}
      .sfw-stats b{display:block;color:#e2bd6c;font-size:24px}.sfw-stats span{color:#aaa;font-size:11px}
      .sfw-filters,.sfw-form{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;margin:12px 0}
      .sfw-form{grid-template-columns:1fr 1fr}
      .sfw-filters label,.sfw-form label{display:grid;gap:5px;color:#aaa;font-size:11px}
      .sfw-filters input,.sfw-filters select,.sfw-form input,.sfw-form textarea{width:100%;padding:10px;border:1px solid #414141;border-radius:8px;background:#080808;color:#f5f2eb}
      .sfw-form .wide,.sfw-submit,.sfw-status{grid-column:1/-1}
      .sfw-columns{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.sfw-columns h4{color:#e1bd6d}
      .sfw-row{display:flex;align-items:center;gap:9px;padding:9px 0;border-bottom:1px solid #292929}
      .sfw-num{width:27px;height:27px;display:grid;place-items:center;border-radius:7px;background:#29241a;color:#e7c477}
      .sfw-grow{flex:1;min-width:0}.sfw-grow b,.sfw-grow small{display:block}
      .sfw-grow small,.sfw-country small{font-size:10px;color:#999}
      .sfw-score{text-align:center;min-width:35px}.sfw-score b{display:block;color:#e7c477}.sfw-score small{font-size:9px;color:#999}
      .sfw-country{padding:9px 0;border-bottom:1px solid #292929}.sfw-country b,.sfw-country small{display:block}
      .sfw-empty{color:#999;font-size:12px;padding:10px 0}
      .sfw-submit{padding:11px;border:0;border-radius:8px;background:#d7ad54;color:#080808;font-weight:900}
      .sfw-status{font-size:12px;color:#d9bd80}
      .sfw-queueitem{padding:12px 0;border-bottom:1px solid #333;display:flex;justify-content:space-between;gap:10px}
      .sfw-queueitem small{display:block;color:#aaa;font-size:11px}
      .sfw-queueitem button,.sfw-lang button{border:1px solid #66532d;background:#161616;color:#e8c77a;border-radius:7px;padding:7px 9px;font-size:11px}
      .sfw-actions{display:flex;gap:6px;align-items:center}.sfw-actions button:last-child{color:#e9a4a4;border-color:#754343}
      .sfw-lang{display:flex;gap:5px}
      @media(max-width:700px){.sfw-hero{display:block}.sfw-lang{margin-top:10px}.sfw-stats{grid-template-columns:1fr}.sfw-filters,.sfw-form,.sfw-columns{grid-template-columns:1fr}.sfw-queueitem{display:block}.sfw-actions{margin-top:8px}}
    `;
    document.head.appendChild(style);
  }

  function buildPage() {
    const nav = $("nav"), main = document.querySelector("main");
    if (!nav || !main || $("world")) return;
    const rank = nav.querySelector('[data-page="rank"]');
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "sf-side-item"; btn.dataset.page = "world";
    btn.innerHTML = "<b>🌍</b><span>WORLD / MONDIAL</span>";
    if (rank) rank.after(btn); else nav.appendChild(btn);

    const page = document.createElement("section");
    page.id = "world"; page.className = "page hidden";
    page.innerHTML = `
      <div class="sfw-hero">
        <div><div class="sfw-k">SHEARING FRANCE · WORLD V10</div><h2 id="sfwTitle"></h2><p id="sfwIntro"></p></div>
        <div class="sfw-lang"><button id="sfwFR" type="button">FR</button><button id="sfwEN" type="button">EN</button></div>
      </div>
      <div class="sfw-stats" id="sfwStats"></div>
      <div class="sfw-panel">
        <div class="sfw-head"><div><div class="sfw-k">WORLD RANKING</div><h3 id="sfwRankTitle"></h3></div><span class="sfw-chip">Machine shearing</span></div>
        <p class="sfw-note" id="sfwRankNote"></p>
        <div class="sfw-filters">
          <label>${tr("Pays","Country")}<select id="sfwCountry"></select></label>
          <label>${tr("Catégorie","Category")}<select id="sfwCategory"><option value="all">${tr("Toutes","All")}</option><option>Open</option><option>Senior</option><option>Junior</option><option>Femmes</option></select></label>
          <label>${tr("Recherche","Search")}<input id="sfwSearch" placeholder="${tr("Nom du tondeur","Shearer name")}"></label>
        </div>
        <div class="sfw-columns">
          <div><h4>${tr("Classement mondial","World ranking")}</h4><div id="sfwWorldList"></div></div>
          <div><h4>${tr("Classements nationaux","National rankings")}</h4><div id="sfwCountryList"></div></div>
        </div>
      </div>
      <div class="sfw-panel">
        <div class="sfw-k">DATA INTAKE & REVIEW</div><h3 id="sfwIntakeTitle"></h3><p class="sfw-note" id="sfwIntakeNote"></p>
        <div class="sfw-form">
          <label>${tr("Nom de la source / compétition","Source / competition name")}<input id="sfwName"></label>
          <label>${tr("Pays","Country")}<input id="sfwCountryInput"></label>
          <label class="wide">${tr("Lien public (facultatif si CSV)","Public URL (optional for CSV)")}<input id="sfwUrl" type="url" placeholder="https://…"></label>
          <label class="wide">${tr("Commentaire","Notes")}<textarea id="sfwNotes" rows="2"></textarea></label>
          <label class="wide">${tr("Fichier CSV","CSV file")}<input id="sfwCsv" type="file" accept=".csv,text/csv"></label>
          <button class="sfw-submit" id="sfwSend" type="button">${tr("Envoyer pour validation","Submit for review")}</button>
          <div class="sfw-status" id="sfwStatus"></div>
        </div>
      </div>
      <div class="sfw-panel"><div class="sfw-head"><h3>${tr("File de validation","Review queue")}</h3><button class="sfw-lang" id="sfwRefresh" type="button">${tr("Actualiser","Refresh")}</button></div><div id="sfwQueue"></div></div>`;
    main.appendChild(page);

    $("sfwFR").onclick = () => setLanguage("fr");
    $("sfwEN").onclick = () => setLanguage("en");
    $("sfwCountry").onchange = renderRanking;
    $("sfwCategory").onchange = renderRanking;
    $("sfwSearch").oninput = renderRanking;
    $("sfwSend").onclick = submitSource;
    $("sfwRefresh").onclick = renderQueue;
    translatePage(); renderRanking(); renderQueue();
  }

  function setLanguage(value) {
    lang = value; localStorage.setItem(LANG_KEY, value);
    if (typeof window.show === "function") window.show("world");
    translatePage(); renderRanking(); renderQueue();
  }
  function translatePage() {
    if (!$("world")) return;
    $("sfwTitle").textContent = tr("Le classement international de la tonte","The international shearing ranking");
    $("sfwIntro").textContent = tr("Une communauté, plusieurs pays, des résultats vérifiés.","One community, multiple countries, verified results.");
    $("sfwRankTitle").textContent = tr("Classement sur 52 semaines glissantes","Rolling 52-week ranking");
    $("sfwRankNote").textContent = tr(
      "Seuls les résultats validés sont comptabilisés. Le classement provisoire utilise les victoires, podiums et concours. Les règles de points officiels restent à définir.",
      "Only validated results count. This provisional ranking uses wins, podiums and events. Official points rules still need approval."
    );
    $("sfwIntakeTitle").textContent = tr("Proposer une source ou importer des résultats","Submit a source or import results");
    $("sfwIntakeNote").textContent = tr(
      "Ajoute un lien public (association, organisateur, PDF) ou importe un CSV. Les données restent en attente jusqu'à vérification par l'administrateur. La collecte directe depuis les réseaux sociaux dépend de leurs accès et autorisations.",
      "Add a public link (association, organiser, PDF) or import a CSV. Data remains pending until administrator review. Direct collection from social networks depends on their access rules and permissions."
    );
  }

  function eventFor(result) {
    return (data.events || []).find(e => String(e.id) === String(result.eventId || "")) || null;
  }
  function resultDate(result) {
    const event = eventFor(result);
    return event?.date || result.eventDate || result.date || result.createdAt || null;
  }
  function getRows(categoryFilter = "all") {
    const cutoff = new Date(Date.now() - 364 * 86400000);
    const unique = new Map();
    (data.results || []).filter(r => r.status === "Validé" && (categoryFilter === "all" || (r.category || "Open") === categoryFilter)).forEach(r => {
      const rawDate = resultDate(r);
      if (!rawDate) return;
      const date = new Date(String(rawDate).slice(0,10) + "T12:00:00");
      if (isNaN(date) || date < cutoff || date > new Date()) return;
      const rider = (data.riders || []).find(x => norm(x.name) === norm(r.name));
      const name = String(r.name || "").trim(), country = r.country || rider?.country || "Non renseigné";
      if (!name) return;
      const key = [norm(name),norm(country),String(r.eventId || "none"),norm(r.category || "Open")].join("|");
      if (!unique.has(key)) unique.set(key,{name,country,rank:Number(r.rank),event:String(r.eventId || "none"),category:r.category || "Open"});
    });
    const people = new Map();
    unique.forEach(r => {
      const key = norm(r.name) + "|" + norm(r.country);
      if (!people.has(key)) people.set(key,{name:r.name,country:r.country,wins:0,podiums:0,events:new Set()});
      const person = people.get(key);
      if (r.rank === 1) person.wins++;
      if (r.rank >= 1 && r.rank <= 3) person.podiums++;
      person.events.add(r.event);
    });
    return [...people.values()].map(x => ({...x,contests:x.events.size}))
      .sort((a,b) => b.wins-a.wins || b.podiums-a.podiums || b.contests-a.contests || a.name.localeCompare(b.name));
  }
  function renderRanking() {
    if (!$("sfwWorldList")) return;
    const all = getRows(category), selectedCountry = $("sfwCountry").value || "all";
    const query = norm($("sfwSearch").value), category = $("sfwCategory").value || "all";
    const countries = [...new Set(all.map(x => x.country))].sort();
    $("sfwCountry").innerHTML = '<option value="all">'+tr("Tous les pays","All countries")+'</option>' +
      countries.map(x => '<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
    $("sfwCountry").value = countries.includes(selectedCountry) ? selectedCountry : "all";
    const rows = all.filter(x => (selectedCountry === "all" || x.country === selectedCountry) &&
      (!query || norm(x.name).includes(query)));
    $("sfwWorldList").innerHTML = rows.map((x,i) =>
      '<div class="sfw-row"><b class="sfw-num">'+(i+1)+'</b><div class="sfw-grow"><b>'+esc(x.name)+'</b><small>'+esc(x.country)+'</small></div>'+
      '<div class="sfw-score"><b>'+x.wins+'</b><small>'+tr("Victoires","Wins")+'</small></div>'+
      '<div class="sfw-score"><b>'+x.podiums+'</b><small>Podiums</small></div>'+
      '<div class="sfw-score"><b>'+x.contests+'</b><small>'+tr("Concours","Events")+'</small></div></div>'
    ).join("") || '<p class="sfw-empty">'+tr("Aucun résultat validé sur les 52 dernières semaines.","No validated results in the last 52 weeks.")+'</p>';
    const groups = {};
    all.forEach(x => { (groups[x.country] ||= []).push(x); });
    $("sfwCountryList").innerHTML = Object.keys(groups).sort()
      .filter(c => selectedCountry === "all" || c === selectedCountry)
      .map(c => '<div class="sfw-country"><b>'+esc(c)+'</b><small>'+groups[c].length+' '+tr("tondeur(s) classé(s)","ranked shearer(s)")+
        ' · '+esc(groups[c].slice(0,3).map(x=>x.name).join(" · "))+'</small></div>').join("") ||
      '<p class="sfw-empty">'+tr("Pas encore de classement national.","No national ranking yet.")+'</p>';
    const totalResults = (data.results || []).filter(r => r.status === "Validé" && resultDate(r) &&
      new Date(String(resultDate(r)).slice(0,10)+"T12:00:00") >= cutoffDate() && new Date(String(resultDate(r)).slice(0,10)+"T12:00:00") <= new Date()).length;
    $("sfwStats").innerHTML = '<div><b>'+all.length+'</b><span>'+tr("Tondeurs classés","Ranked shearers")+
      '</span></div><div><b>'+countries.length+'</b><span>'+tr("Pays représentés","Countries represented")+
      '</span></div><div><b>'+totalResults+'</b><span>'+tr("Résultats validés · 52 sem.","Validated results · 52 weeks")+'</span></div>';
  }
  function cutoffDate(){ return new Date(Date.now()-364*86400000); }

  function parseCsv(text) {
    const lines = text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV vide");
    const parse = line => {
      const out=[]; let value="",quoted=false;
      for(let i=0;i<line.length;i++){const c=line[i];
        if(c==='"'&&line[i+1]==='"'&&quoted){value+='"';i++;}
        else if(c==='"')quoted=!quoted;
        else if((c===","||c===";")&&!quoted){out.push(value.trim());value="";}
        else value+=c;
      }
      out.push(value.trim());return out;
    };
    const headers=parse(lines[0]).map(norm);
    const index=names=>headers.findIndex(x=>names.includes(x));
    const ix={name:index(["name","nom","rider","competitor","tondeur"]),rank:index(["rank","place","position","classement"]),
      country:index(["country","pays"]),event:index(["event","competition","concours"]),date:index(["date"]),
      city:index(["city","ville"]),category:index(["category","categorie","catégorie"]),
      points:index(["points","score"]),url:index(["url","source"])};
    if(ix.name<0||ix.rank<0)throw new Error("Colonnes requises : name/nom et rank/place");
    return lines.slice(1).map(line=>{const a=parse(line),get=k=>ix[k]<0?"":a[ix[k]]||"";
      return {name:get("name"),rank:Number(get("rank")),country:get("country"),event:get("event"),date:get("date"),
        city:get("city"),category:get("category")||"Open",points:get("points")?Number(get("points")):null,url:get("url")};
    }).filter(x=>x.name&&x.rank>0&&Number.isFinite(x.rank));
  }

  async function submitSource() {
    const status=$("sfwStatus"),file=$("sfwCsv").files[0],name=$("sfwName").value.trim(),url=$("sfwUrl").value.trim();
    if(!name){status.textContent=tr("Indique le nom de la source.","Enter a source name.");return;}
    if(url&&!/^https?:\/\//i.test(url)){status.textContent="URL invalide";return;}
    if(!url&&!file){status.textContent=tr("Ajoute un lien ou un CSV.","Add a link or CSV.");return;}
    let records=[];
    try{if(file)records=parseCsv(await file.text());}catch(e){status.textContent=e.message;return;}
    try{
      if(typeof window.sfWorldSubmitSource!=="function")throw new Error(tr("Migration Supabase V10 à appliquer avant l'envoi.","Apply the V10 Supabase migration before submitting."));
      await window.sfWorldSubmitSource({source_name:name,country:$("sfwCountryInput").value.trim(),source_url:url||null,
        notes:$("sfwNotes").value.trim(),records});
      status.textContent=tr("Source envoyée, en attente de validation.","Source submitted, awaiting review.");
      $("sfwName").value="";$("sfwUrl").value="";$("sfwCsv").value="";$("sfwNotes").value="";
      renderQueue();
    }catch(e){status.textContent=e.message||String(e);}
  }

  async function renderQueue() {
    const host=$("sfwQueue");if(!host)return;
    try{
      if(typeof window.sfWorldListQueue!=="function")throw new Error(tr("La file partagée sera disponible après la migration SQL V10.","Shared queue will be available after the V10 SQL migration."));
      queue=await window.sfWorldListQueue();
      const admin=!!window.sfWorldCanReview?.();
      host.innerHTML=queue.map(x=>'<div class="sfw-queueitem"><div><b>'+esc(x.source_name)+'</b><small>'+
        esc(x.country||"")+' · '+esc(x.status)+' · '+(x.records||[]).length+' '+tr("lignes","rows")+
        (x.source_url?' · <a target="_blank" rel="noopener" href="'+esc(x.source_url)+'">Source ↗</a>':'')+
        '</small></div>'+(admin&&x.status==="pending"?'<div class="sfw-actions"><button data-ok="'+esc(x.id)+'">'+tr("Valider","Approve")+
        '</button><button data-no="'+esc(x.id)+'">'+tr("Refuser","Reject")+'</button></div>':"")+'</div>').join("") ||
        '<p class="sfw-empty">'+tr("Aucune source en attente.","No sources pending.")+'</p>';
      host.querySelectorAll("[data-ok]").forEach(b=>b.onclick=()=>review(b.dataset.ok,true));
      host.querySelectorAll("[data-no]").forEach(b=>b.onclick=()=>review(b.dataset.no,false));
    }catch(e){host.innerHTML='<p class="sfw-empty">'+esc(e.message||String(e))+'</p>';}
  }

  async function review(id,approve) {
    const item=queue.find(x=>String(x.id)===String(id));if(!item)return;
    if(approve){
      if(!(item.records||[]).length){alert(tr("Cette source ne contient pas de CSV. Vérifie-la puis importe un CSV.","This source has no CSV records. Verify it and import a CSV."));return;}
      let count=0;
      item.records.forEach(r=>{
        let event=(data.events||[]).find(e=>norm(e.name)===norm(r.event||item.source_name)&&norm(e.country)===norm(r.country||item.country));
        if(!event){event={id:"sfw-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),name:r.event||item.source_name,
          country:r.country||item.country||"",city:r.city||"",date:r.date||"",status:"Terminé",category:r.category||"Open",url:r.url||item.source_url||""};data.events.push(event);}
        const duplicate=(data.results||[]).some(x=>norm(x.name)===norm(r.name)&&String(x.eventId)===String(event.id)&&norm(x.category||"Open")===norm(r.category||"Open"));
        if(!duplicate){data.results.push({id:"sfwr-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),eventId:event.id,
          name:r.name,country:r.country||item.country||"",category:r.category||"Open",rank:r.rank,points:r.points,
          status:"Validé",discipline:"Machine",sourceUrl:r.url||item.source_url||"",createdAt:new Date().toISOString()});count++;}
      });
      localStorage.setItem("sf_v1",JSON.stringify(data));window.sfQueueSync?.();item.imported_count=count;
    }
    try{await window.sfWorldReviewQueue(id,approve?"approved":"rejected",item.imported_count||0);renderQueue();renderRanking();}
    catch(e){alert(e.message||String(e));}
  }

  function init() {
    addStyles();buildPage();
    const original=window.show;
    if(typeof original==="function"&&!original.__worldV10){
      const wrapped=function(page){original(page);if(page==="world"){renderRanking();renderQueue();}};
      wrapped.__worldV10=true;window.show=wrapped;
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();