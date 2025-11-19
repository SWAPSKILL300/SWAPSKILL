/* Simple interactive SWAPSKILL logic using localStorage
   - create profiles
   - list profiles
   - select profile, find matches using complementary scoring
   - demo data and import/export
*/

const LS_KEY = "swapskill_profiles_v1";

let profiles = [];
let selectedProfileId = null;

const nameInput = document.getElementById("nameInput");
const teachInput = document.getElementById("teachInput");
const learnInput = document.getElementById("learnInput");
const saveBtn = document.getElementById("saveBtn");
const updateBtn = document.getElementById("updateBtn");
const profilesContainer = document.getElementById("profilesContainer");
const profileSelect = document.getElementById("profileSelect");
const matchList = document.getElementById("matchList");
const selectedCard = document.getElementById("selectedCard");
const demoBtn = document.getElementById("demoBtn");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importModal = document.getElementById("importModal");
const importTextarea = document.getElementById("importTextarea");
const doImport = document.getElementById("doImport");
const closeImport = document.getElementById("closeImport");

function loadProfiles(){
  try{
    profiles = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  }catch(e){
    profiles = [];
  }
}

function saveProfiles(){
  localStorage.setItem(LS_KEY, JSON.stringify(profiles));
}

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function clearForm(){
  nameInput.value = "";
  teachInput.value = "";
  learnInput.value = "";
  updateBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
  selectedProfileId = null;
  selectedCard.innerHTML = "<div class='profile-empty'>No profile selected</div>";
}

function renderProfiles(){
  profilesContainer.innerHTML = "";
  profileSelect.innerHTML = "<option value=''>Select profile...</option>";

  profiles.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = p.name.split(" ")[0].slice(0,2).toUpperCase();

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>${p.name}</strong><span class="karma">⭐ ${p.karma||0}</span></div>
                      <div class="small">Teaches: ${p.teach.join(", ") || "—"}</div>
                      <div class="small">Wants: ${p.learn.join(", ") || "—"}</div>`;

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginLeft = "8px";

    const select = document.createElement("button");
    select.className = "btn";
    select.textContent = "Select";
    select.onclick = ()=> {
      selectProfile(p.id);
      window.scrollTo({top:0, behavior:"smooth"});
    };

    const chat = document.createElement("button");
    chat.className = "btn ghost";
    chat.textContent = "Request Swap";
    chat.onclick = ()=> {
      // minimal mock flow
      p.karma = (p.karma || 0) + 1;
      saveProfiles();
      renderProfiles();
      alert(`Swap request sent to ${p.name} — they have +1 karma`);
    };

    actions.appendChild(select);
    actions.appendChild(chat);

    // combine
    card.appendChild(avatar);
    card.appendChild(body);
    card.appendChild(actions);

    profilesContainer.appendChild(card);

    // option in select
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.text = p.name;
    profileSelect.appendChild(opt);
  });

  // show message if empty
  if(profiles.length === 0){
    profilesContainer.innerHTML = "<div class='profile-empty'>No profiles yet. Click Load Demo or create one.</div>";
  }
}

function selectProfile(id){
  const p = profiles.find(x=>x.id === id);
  if(!p) return;
  selectedProfileId = id;
  selectedCard.innerHTML = `<div style="display:flex;gap:12px;align-items:center">
    <div class="avatar">${p.name.split(" ")[0].slice(0,2).toUpperCase()}</div>
    <div>
      <div style="font-weight:800">${p.name}</div>
      <div class="small">Teaches: ${p.teach.join(", ")}</div>
      <div class="small">Wants: ${p.learn.join(", ")}</div>
      <div class="small">Karma: ${p.karma||0}</div>
    </div>
  </div>`;
  // fill form for quick edit
  nameInput.value = p.name;
  teachInput.value = p.teach.join(", ");
  learnInput.value = p.learn.join(", ");
  saveBtn.style.display = "none";
  updateBtn.style.display = "inline-block";
}

function createProfile(){
  const name = (nameInput.value || "").trim();
  const teach = teachInput.value.split(",").map(s=>s.trim()).filter(Boolean);
  const learn = learnInput.value.split(",").map(s=>s.trim()).filter(Boolean);

  if(!name || teach.length===0 || learn.length===0){
    alert("Please enter name, at least one teach-skill and one learn-skill.");
    return;
  }

  const p = { id: uid(), name, teach, learn, karma:0, created: Date.now() };
  profiles.unshift(p);
  saveProfiles();
  clearForm();
  renderProfiles();
  alert("Profile saved!");
}

function updateProfile(){
  if(!selectedProfileId) return;
  const p = profiles.find(x=>x.id === selectedProfileId);
  if(!p) return;
  p.name = nameInput.value.trim();
  p.teach = teachInput.value.split(",").map(s=>s.trim()).filter(Boolean);
  p.learn = learnInput.value.split(",").map(s=>s.trim()).filter(Boolean);
  saveProfiles();
  clearForm();
  renderProfiles();
  alert("Profile updated!");
}

function findMatchesForProfileById(id){
  const mine = profiles.find(x=>x.id === id);
  if(!mine){ alert("Select a profile first."); return; }

  // compute complementary score for every other user
  const matches = profiles.filter(p => p.id !== id).map(other=>{
    const gives = other.teach.filter(s => mine.learn.map(x=>x.toLowerCase()).includes(s.toLowerCase()));
    const wants = other.learn.filter(s => mine.teach.map(x=>x.toLowerCase()).includes(s.toLowerCase()));
    const score = gives.length + wants.length * 0.8;
    return { other, gives, wants, score };
  }).filter(m=>m.score>0).sort((a,b)=>b.score-a.score);

  // render
  matchList.innerHTML = "";
  if(matches.length===0){
    matchList.innerHTML = "<div class='profile-empty'>No strong matches yet — try adding more skills or Load Demo.</div>";
    return;
  }

  matches.forEach(m=>{
    const card = document.createElement("div");
    card.className = "card";
    const av = document.createElement("div"); av.className="avatar"; av.textContent = m.other.name.split(" ")[0].slice(0,2).toUpperCase();
    const body = document.createElement("div"); body.className="card-body";
    body.innerHTML = `<strong>${m.other.name}</strong> <span class="match-score">${m.score.toFixed(1)}</span>
      <div class="small">They can teach: ${m.gives.join(", ") || "—"}</div>
      <div class="small">They want: ${m.wants.join(", ") || "—"}</div>`;
    const actions = document.createElement("div"); actions.style.display="flex"; actions.style.gap="8px";
    const req = document.createElement("button"); req.className="btn primary"; req.textContent="Request Swap";
    req.onclick = ()=>{
      m.other.karma = (m.other.karma||0)+2;
      saveProfiles(); renderProfiles();
      alert(`Request sent to ${m.other.name}. They gained +2 karma — check People panel.`);
    };
    const view = document.createElement("button"); view.className="btn"; view.textContent="View";
    view.onclick = ()=> selectProfile(m.other.id);
    actions.appendChild(req); actions.appendChild(view);

    card.appendChild(av); card.appendChild(body); card.appendChild(actions);
    matchList.appendChild(card);
  });
}

/* demo data */
function loadDemo(){
  profiles = [
    { id: uid(), name:"Asha (Design)", teach:["Photoshop","Figma","Illustrator"], learn:["Python","SQL"], karma:5 },
    { id: uid(), name:"Ravi (Dev)", teach:["Python","React"], learn:["UI Design","Photoshop"], karma:8 },
    { id: uid(), name:"Meera (Data)", teach:["Excel","SQL"], learn:["Guitar","Photography"], karma:2 },
    { id: uid(), name:"Yash (Music)", teach:["Guitar","Ukulele"], learn:["React","Photoshop"], karma:1 }
  ];
  saveProfiles();
  renderProfiles();
  alert("Demo profiles loaded!");
}

/* export/import */
function exportJSON(){
  const raw = JSON.stringify(profiles, null, 2);
  navigator.clipboard?.writeText(raw).then(()=> alert("Profiles JSON copied to clipboard!"), ()=> {
    const w = window.open();
    w.document.write("<pre>"+raw+"</pre>");
  });
}

function openImport(){
  importModal.classList.remove("hidden");
}

function closeImportModal(){
  importModal.classList.add("hidden");
  importTextarea.value = "";
}

function doImportAction(){
  try{
    const data = JSON.parse(importTextarea.value);
    if(!Array.isArray(data)) throw new Error("JSON must be an array of profiles");
    // normalize and add IDs
    const sanitized = data.map(p=>({
      id: uid(),
      name: p.name || "Unnamed",
      teach: (p.teach || []).map(String),
      learn: (p.learn || []).map(String),
      karma: p.karma || 0
    }));
    profiles = sanitized.concat(profiles);
    saveProfiles();
    renderProfiles();
    closeImportModal();
    alert("Imported "+sanitized.length+" profiles");
  }catch(e){
    alert("Import error: "+e.message);
  }
}

function clearAll(){
  if(!confirm("Clear all profiles? This cannot be undone.")) return;
  profiles = [];
  saveProfiles();
  renderProfiles();
  clearForm();
}

/* events */
saveBtn.onclick = createProfile;
updateBtn.onclick = updateProfile;
document.getElementById("findBtn").onclick = () => {
  const id = profileSelect.value;
  if(!id){ alert("Choose a profile from the select menu"); return; }
  findMatchesForProfileById(id);
};
demoBtn.onclick = loadDemo;
clearBtn.onclick = clearAll;
exportBtn.onclick = exportJSON;
importBtn.onclick = openImport;
closeImport.onclick = closeImportModal;
doImport.onclick = doImportAction;

/* init */
loadProfiles();
renderProfiles();
clearForm();
