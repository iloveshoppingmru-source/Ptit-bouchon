import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const FONTS = ["Playfair Display","Georgia","Merriweather","Cormorant Garamond","Lora","Libre Baskerville","EB Garamond","Crimson Text","Montserrat","Raleway","Poppins","Nunito","Josefin Sans","Dancing Script","Pacifico","Abril Fatface"];
const BODY_FONTS = ["Lato","Open Sans","Roboto","Source Sans Pro","Nunito","Quicksand","PT Sans","Karla","Mulish","Work Sans"];
const CAT_ICONS = ["🍽️","🏖️","🛒","🤿","👁️","🥐","🏧","⛽","🏥","🍹","☕","🌴","🎭","🏄","🚤","🎣","🌺","🏋️","🎪","🗺️","🎯","🎨","🏊","🚴","🌊","🛖","🏰","⛪","🌿","🎋"];
const CAT_COLORS = ["#e07b54","#4a90d9","#5dab5d","#7b5ea7","#d4a843","#c47a3a","#607d8b","#ef5350","#e53935","#00acc1","#f06292","#66bb6a","#ff7043","#26c6da","#ab47bc","#ffa726"];
const PAGE_ICONS = ["🏡","📖","🌴","🏖️","🍽️","🚗","🔑","📋","ℹ️","🗺️","🎉","🌊","🌿","💡","🚿","🛁","📺","📶","🎵","🌺","🌅","🏝️","🦋","🌙"];
const generateId = () => Math.random().toString(36).substr(2, 9);

// ─────────────────────────────────────────────
// ANALYTICS HELPERS
// ─────────────────────────────────────────────
const trackVisit = () => {
  try {
    const now = new Date();
    const dayKey = now.toISOString().slice(0,10);
    const monthKey = now.toISOString().slice(0,7);
    const yearKey = String(now.getFullYear());
    const raw = localStorage.getItem("pb_analytics") || "{}";
    const a = JSON.parse(raw);
    a.days = a.days || {}; a.months = a.months || {}; a.years = a.years || {};
    a.days[dayKey] = (a.days[dayKey] || 0) + 1;
    a.months[monthKey] = (a.months[monthKey] || 0) + 1;
    a.years[yearKey] = (a.years[yearKey] || 0) + 1;
    a.total = (a.total || 0) + 1;
    localStorage.setItem("pb_analytics", JSON.stringify(a));
  } catch {}
};
const getAnalytics = () => {
  try { return JSON.parse(localStorage.getItem("pb_analytics") || "{}"); } catch { return {}; }
};

// ─────────────────────────────────────────────
// RATINGS HELPERS
// ─────────────────────────────────────────────
const getRatings = () => { try { return JSON.parse(localStorage.getItem("pb_ratings") || "{}"); } catch { return {}; } };
const saveRating = (itemId, stars) => {
  try {
    const r = getRatings();
    if (!r[itemId]) r[itemId] = { total: 0, count: 0 };
    r[itemId].total += stars; r[itemId].count += 1;
    localStorage.setItem("pb_ratings", JSON.stringify(r));
  } catch {}
};
const getUserRatings = () => { try { return JSON.parse(localStorage.getItem("pb_user_ratings") || "{}"); } catch { return {}; } };
const saveUserRating = (itemId, stars) => {
  try { const r = getUserRatings(); r[itemId] = stars; localStorage.setItem("pb_user_ratings", JSON.stringify(r)); } catch {}
};

// ─────────────────────────────────────────────
// DEFAULT DATA
// ─────────────────────────────────────────────
const DEFAULT_DATA = {
  settings: {
    propertyName: "P'tit Bouchon",
    phone: "+596 696 00 00 00",
    email: "contact@ptitbouchon.com",
    website: "www.ptitbouchon.com",
    headerBg: "#1a3a2a", headerText: "#f5e6c8",
    footerBg: "#1a3a2a", footerText: "#f5e6c8",
    accentColor: "#c8a96e",
    bodyBg: "#faf7f2", bodyText: "#2d2d2d", cardBg: "#ffffff",
    fontFamily: "Playfair Display", bodyFont: "Lato",
    // backgrounds
    headerBgType: "color", headerBgImage: "",
    footerBgType: "color", footerBgImage: "",
    bodyBgType: "color", bodyBgImage: "",
  },
  pages: [
    { id: "welcome", titleFr: "Bienvenue", titleEn: "Welcome", icon: "🏡", contentFr: "Bienvenue au P'tit Bouchon ! Nous sommes ravis de vous accueillir dans notre villa.", contentEn: "Welcome to P'tit Bouchon! We are delighted to welcome you to our villa.", align: "center", valign: "center", image: "", video: "", type: "welcome" },
  ],
  categories: [
    { id: "restaurants", nameFr: "Restaurants", nameEn: "Restaurants", icon: "🍽️", color: "#e07b54", items: [{ id: "r1", nameFr: "Le Belem", nameEn: "Le Belem", descFr: "Cuisine créole raffinée au bord de l'eau. Idéal pour un dîner romantique.", descEn: "Refined Creole cuisine by the water. Perfect for a romantic dinner.", address: "12 Rue du Port, Le Marin", phone: "+596 696 11 22 33", mapLink: "https://maps.google.com/?q=Le+Marin+Martinique", image: "" }] },
    { id: "plages", nameFr: "Les Plages", nameEn: "Beaches", icon: "🏖️", color: "#4a90d9", items: [{ id: "p1", nameFr: "Plage des Salines", nameEn: "Salines Beach", descFr: "La plus belle plage de Martinique. Eau turquoise et sable blanc fin.", descEn: "The most beautiful beach in Martinique. Turquoise water and fine white sand.", address: "Les Salines, Sainte-Anne", phone: "", mapLink: "https://maps.google.com/?q=Plage+des+Salines+Martinique", image: "" }] },
    { id: "supermarches", nameFr: "Supermarchés", nameEn: "Supermarkets", icon: "🛒", color: "#5dab5d", items: [{ id: "s1", nameFr: "Carrefour Market", nameEn: "Carrefour Market", descFr: "Grand supermarché avec large choix de produits locaux et importés.", descEn: "Large supermarket with wide selection of local and imported products.", address: "Route Nationale, Le François", phone: "+596 596 54 32 10", mapLink: "https://maps.google.com/?q=Carrefour+Le+Francois+Martinique", image: "" }] },
    { id: "activites", nameFr: "Activités", nameEn: "Activities", icon: "🤿", color: "#7b5ea7", items: [{ id: "a1", nameFr: "Snorkeling aux îlets", nameEn: "Snorkeling at the islets", descFr: "Découvrez les fonds marins cristallins et la faune sous-marine colorée.", descEn: "Discover the crystal clear seabed and colorful marine life.", address: "Ilets de Sainte-Anne", phone: "+596 696 44 55 66", mapLink: "https://maps.google.com/?q=Ilets+Sainte-Anne+Martinique", image: "" }] },
    { id: "voir", nameFr: "Les Endroits à Voir", nameEn: "Places to See", icon: "👁️", color: "#d4a843", items: [{ id: "v1", nameFr: "La Montagne Pelée", nameEn: "Mount Pelée", descFr: "Volcan emblématique de Martinique. Vue panoramique exceptionnelle.", descEn: "Iconic volcano of Martinique. Exceptional panoramic view.", address: "Saint-Pierre, Martinique", phone: "", mapLink: "https://maps.google.com/?q=Montagne+Pelee+Martinique", image: "" }] },
    { id: "boulangeries", nameFr: "Pâtisseries / Boulangeries", nameEn: "Bakeries / Pastry Shops", icon: "🥐", color: "#c47a3a", items: [{ id: "b1", nameFr: "Boulangerie Ti'Pain", nameEn: "Ti'Pain Bakery", descFr: "Pains frais et pâtisseries créoles chaque matin dès 6h.", descEn: "Fresh breads and Creole pastries every morning from 6am.", address: "Rue Victor Hugo, Le Marin", phone: "+596 596 78 90 12", mapLink: "https://maps.google.com/?q=Boulangerie+Le+Marin+Martinique", image: "" }] },
  ],
  subcategories: [
    { id: "atm", nameFr: "ATM", nameEn: "ATM", icon: "🏧", color: "#607d8b", items: [{ id: "atm1", nameFr: "Crédit Agricole ATM", nameEn: "Crédit Agricole ATM", descFr: "Distributeur disponible 24h/24.", descEn: "ATM available 24/7.", address: "Centre Commercial Le Marin", phone: "", mapLink: "https://maps.google.com/?q=ATM+Le+Marin+Martinique", image: "" }] },
    { id: "essence", nameFr: "Stations Essence", nameEn: "Gas Stations", icon: "⛽", color: "#ef5350", items: [{ id: "e1", nameFr: "Total Energies", nameEn: "Total Energies", descFr: "Station ouverte 24h/24. Carburants, boutique et services.", descEn: "24/7 gas station. Fuels, shop and services.", address: "RN5, Le Marin", phone: "", mapLink: "https://maps.google.com/?q=Total+Station+Le+Marin+Martinique", image: "" }] },
    { id: "hopitaux", nameFr: "Hôpitaux / Docteurs", nameEn: "Hospitals / Doctors", icon: "🏥", color: "#e53935", items: [{ id: "h1", nameFr: "CHU de Martinique", nameEn: "Martinique University Hospital", descFr: "Urgences 24h/24. En cas d'urgence composez le 15.", descEn: "24/7 Emergency. In case of emergency call 15.", address: "Hôpital Pierre Zobda-Quitman, Fort-de-France", phone: "15 / +596 596 55 20 00", mapLink: "https://maps.google.com/?q=CHU+Martinique", image: "" }] },
  ],
  gallery: [],
};

const loadData = () => { try { const s = localStorage.getItem("ptitbouchon_v3"); if (s) return JSON.parse(s); } catch {} return JSON.parse(JSON.stringify(DEFAULT_DATA)); };
const saveData = (d) => { try { localStorage.setItem("ptitbouchon_v3", JSON.stringify(d)); } catch {} };

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState(null);
  const [mode, setMode] = useState("guest");
  const [data, setData] = useState(() => loadData());
  const [activeSection, setActiveSection] = useState("welcome");
  const [adminTab, setAdminTab] = useState("settings");
  const [adminPass, setAdminPass] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => { if (lang) trackVisit(); }, [lang]);
  useEffect(() => { saveData(data); }, [data]);

  const updateData = useCallback((fn) => setData(prev => {
    const next = JSON.parse(JSON.stringify(prev)); fn(next); return next;
  }), []);

  const { settings } = data;

  useEffect(() => {
    const f = encodeURIComponent(`${settings.fontFamily}:ital,wght@0,400;0,700;1,400&family=${settings.bodyFont}:wght@300;400;700`);
    const ex = document.getElementById("gf-link"); if (ex) ex.remove();
    const link = document.createElement("link"); link.id="gf-link"; link.rel="stylesheet";
    link.href=`https://fonts.googleapis.com/css2?family=${f}&display=swap`;
    document.head.appendChild(link);
  }, [settings.fontFamily, settings.bodyFont]);

  const cssVars = {
    "--hbg": settings.headerBg, "--htx": settings.headerText,
    "--fbg": settings.footerBg, "--ftx": settings.footerText,
    "--acc": settings.accentColor, "--bbg": settings.bodyBg,
    "--btx": settings.bodyText, "--cbg": settings.cardBg,
    "--hfont": `'${settings.fontFamily}',Georgia,serif`,
    "--bfont": `'${settings.bodyFont}',sans-serif`,
  };

  const handleAdminLogin = () => {
    if (adminPass === "admin123") { setMode("admin"); setShowAdminLogin(false); setAdminPass(""); }
    else alert(lang === "fr" ? "Mot de passe incorrect" : "Wrong password");
  };

  if (!lang) return <LangSelector setLang={setLang} s={settings} cssVars={cssVars} />;
  if (mode === "admin") return <AdminPanel data={data} updateData={updateData} setMode={setMode} cssVars={cssVars} adminTab={adminTab} setAdminTab={setAdminTab} />;
  return <GuestGuide data={data} lang={lang} setLang={setLang} setMode={setMode} activeSection={activeSection} setActiveSection={setActiveSection} cssVars={cssVars} showAdminLogin={showAdminLogin} setShowAdminLogin={setShowAdminLogin} adminPass={adminPass} setAdminPass={setAdminPass} handleAdminLogin={handleAdminLogin} />;
}

// ─────────────────────────────────────────────
// BG STYLE HELPER
// ─────────────────────────────────────────────
function bgStyle(type, color, imageUrl) {
  if (type === "image" && imageUrl) {
    return { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" };
  }
  return { background: color };
}

// ─────────────────────────────────────────────
// LANGUAGE SELECTOR
// ─────────────────────────────────────────────
function LangSelector({ setLang, s, cssVars }) {
  const hbg = bgStyle(s.headerBgType, s.headerBg, s.headerBgImage);
  return (
    <div style={{ ...cssVars, minHeight:"100vh", ...hbg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:`'${s.fontFamily}',Georgia,serif`, position:"relative" }}>
      {s.headerBgType==="image"&&s.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)"}}/>}
      <div style={{ textAlign:"center", padding:"40px 24px", maxWidth:480, width:"100%", position:"relative", zIndex:1 }}>
        <div style={{ fontSize:80, marginBottom:16 }}>🏡</div>
        <h1 style={{ color:s.accentColor, fontSize:"clamp(30px,7vw,60px)", fontWeight:700, margin:"0 0 6px", letterSpacing:2, textShadow:"0 2px 20px rgba(0,0,0,0.4)" }}>{s.propertyName}</h1>
        <p style={{ color:s.headerText, opacity:0.55, fontSize:11, letterSpacing:5, textTransform:"uppercase", marginBottom:52, fontFamily:`'${s.bodyFont}',sans-serif` }}>Villa Guest Guide</p>
        <div style={{ display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap" }}>
          {[{code:"fr",label:"Français",flag:"🇫🇷",sub:"Voir le guide"},{code:"en",label:"English",flag:"🇬🇧",sub:"View the guide"}].map(l=>(
            <button key={l.code} onClick={()=>setLang(l.code)}
              style={{ background:"rgba(255,255,255,0.08)", border:`2px solid ${s.accentColor}`, borderRadius:20, padding:"28px 44px", cursor:"pointer", color:s.headerText, minWidth:170, transition:"all 0.3s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=s.accentColor;e.currentTarget.style.color="#1a1a1a";}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color=s.headerText;}}>
              <div style={{fontSize:52,marginBottom:8}}>{l.flag}</div>
              <div style={{fontSize:22,fontWeight:700,fontFamily:`'${s.fontFamily}',Georgia,serif`}}>{l.label}</div>
              <div style={{fontSize:12,opacity:0.6,marginTop:4,fontFamily:`'${s.bodyFont}',sans-serif`}}>{l.sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STAR RATING COMPONENT
// ─────────────────────────────────────────────
function StarRating({ itemId, compact = false }) {
  const [ratings, setRatings] = useState(() => getRatings());
  const [userRatings, setUserRatings] = useState(() => getUserRatings());
  const [hover, setHover] = useState(0);
  const [justRated, setJustRated] = useState(false);

  const r = ratings[itemId] || { total: 0, count: 0 };
  const avg = r.count > 0 ? (r.total / r.count) : 0;
  const userRating = userRatings[itemId] || 0;

  const handleRate = (stars) => {
    if (userRating === stars) return;
    saveRating(itemId, stars);
    saveUserRating(itemId, stars);
    const newR = getRatings(); setRatings(newR);
    const newU = getUserRatings(); setUserRatings(newU);
    setJustRated(true); setTimeout(() => setJustRated(false), 1800);
  };

  const displayStars = hover || userRating || avg;
  const filled = Math.round(displayStars);

  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop: compact ? 0 : 8 }}>
      <div style={{ display:"flex", gap:2 }}>
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => handleRate(s)}
            onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            title={`${s} étoile${s>1?"s":""}`}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"1px", fontSize: compact ? 14 : 18, color: s <= filled ? "#f5a623" : "#ddd", transition:"color 0.15s, transform 0.1s", transform: hover===s ? "scale(1.3)" : "scale(1)" }}>
            ★
          </button>
        ))}
      </div>
      {!compact && (
        <div style={{ fontSize:12, color:"#888" }}>
          {r.count > 0 ? <span>{avg.toFixed(1)} <span style={{opacity:0.6}}>({r.count} {r.count>1?"avis":"avis"})</span></span> : <span style={{opacity:0.5}}>Pas encore noté</span>}
        </div>
      )}
      {justRated && <span style={{ fontSize:11, color:"#5dab5d", fontWeight:700 }}>✓ Merci !</span>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ITEM CARD (rich card with photo)
// ─────────────────────────────────────────────
function ItemCard({ item, cat, lang, t }) {
  const [expanded, setExpanded] = useState(false);
  const hasImage = !!item.image;
  const desc = lang==="fr" ? item.descFr : item.descEn;
  const name = lang==="fr" ? item.nameFr : item.nameEn;

  return (
    <div style={{ background:"var(--cbg)", borderRadius:18, marginBottom:16, boxShadow:"0 3px 18px rgba(0,0,0,0.08)", overflow:"hidden", border:`1px solid ${cat.color}18`, transition:"box-shadow 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,0.14)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 3px 18px rgba(0,0,0,0.08)"}>
      
      {/* Card layout: image left + info right on desktop, stacked on mobile */}
      <div style={{ display:"flex", flexDirection:"row", minHeight: hasImage ? 160 : "auto" }}>
        
        {/* IMAGE */}
        {hasImage && (
          <div style={{ width:"38%", minWidth:130, maxWidth:220, flexShrink:0, position:"relative", overflow:"hidden" }}>
            <img src={item.image} alt={name}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.4s" }}
              onMouseEnter={e=>e.target.style.transform="scale(1.06)"}
              onMouseLeave={e=>e.target.style.transform="scale(1)"}
              onError={e=>{e.target.parentElement.style.display="none";}} />
            {/* color tag top-left */}
            <div style={{ position:"absolute", top:8, left:8, background:cat.color, borderRadius:20, padding:"2px 10px", fontSize:11, color:"white", fontWeight:700 }}>{cat.icon} {lang==="fr"?cat.nameFr:cat.nameEn}</div>
          </div>
        )}

        {/* INFO */}
        <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
              <h3 style={{ fontFamily:"var(--hfont)", fontSize:"clamp(15px,2.5vw,19px)", color:"var(--btx)", margin:0, lineHeight:1.3 }}>{name}</h3>
              {!hasImage && <span style={{ background:cat.color, borderRadius:20, padding:"2px 10px", fontSize:11, color:"white", fontWeight:700, flexShrink:0 }}>{cat.icon}</span>}
            </div>
            
            <StarRating itemId={item.id} />

            {desc && (
              <p style={{ fontSize:13, color:"#666", lineHeight:1.6, margin:"8px 0 0", display:"-webkit-box", WebkitLineClamp: expanded?99:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {desc}
              </p>
            )}
            {desc && desc.length > 80 && (
              <button onClick={()=>setExpanded(!expanded)} style={{ background:"none", border:"none", color:cat.color, fontSize:12, cursor:"pointer", padding:"3px 0", fontWeight:600 }}>
                {expanded ? "▲ Moins" : "▼ Plus"}
              </button>
            )}
          </div>

          {/* ACTIONS ROW */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:12, alignItems:"center" }}>
            {item.address && (
              <span style={{ fontSize:12, color:"#888", background:"#f4f4f4", borderRadius:20, padding:"4px 11px", display:"flex", alignItems:"center", gap:4 }}>
                📍 <span style={{ maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.address}</span>
              </span>
            )}
            {item.phone && (
              <a href={`tel:${item.phone}`} style={{ fontSize:12, color:cat.color, background:`${cat.color}18`, borderRadius:20, padding:"4px 11px", textDecoration:"none", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                📞 {item.phone}
              </a>
            )}
            {item.mapLink && (
              <a href={item.mapLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:12, color:"white", background:"#4285f4", borderRadius:20, padding:"5px 13px", textDecoration:"none", fontWeight:700, display:"flex", alignItems:"center", gap:4, boxShadow:"0 2px 8px #4285f440" }}>
                🗺️ {t("Google Maps","Google Maps")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GUEST GUIDE
// ─────────────────────────────────────────────
function GuestGuide({ data, lang, setLang, setMode, activeSection, setActiveSection, cssVars, showAdminLogin, setShowAdminLogin, adminPass, setAdminPass, handleAdminLogin }) {
  const { settings, pages, categories, subcategories, gallery } = data;
  const [selectedCat, setSelectedCat] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (fr, en) => lang === "fr" ? fr : en;
  const allCats = [...categories, ...subcategories];

  const navTo = (section) => { setActiveSection(section); setSelectedCat(null); setMenuOpen(false); };

  const bodyBgStyle = bgStyle(settings.bodyBgType, settings.bodyBg, settings.bodyBgImage);
  const headerBgStyle = bgStyle(settings.headerBgType, settings.headerBg, settings.headerBgImage);
  const footerBgStyle = bgStyle(settings.footerBgType, settings.footerBg, settings.footerBgImage);

  const navItems = [
    { id:"welcome", icon:"🏡", label:t("Accueil","Home") },
    { id:"pages", icon:"📖", label:t("Pages","Pages") },
    { id:"gallery", icon:"📷", label:t("Galerie","Gallery") },
    { id:"contact", icon:"📞", label:"Contact" },
  ];

  return (
    <div style={{ ...cssVars, minHeight:"100vh", ...bodyBgStyle, fontFamily:"var(--bfont)", color:"var(--btx)", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--acc);border-radius:3px}
        .nb:hover{background:rgba(255,255,255,0.14)!important}
        .nb.act{background:var(--acc)!important;color:#1a1a1a!important}
        .cc:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,0.13)!important}
        @media(max-width:640px){.dn{display:none!important}}
        @media(min-width:641px){.mob{display:none!important}}
        @media(max-width:500px){.item-row{flex-direction:column!important}.item-row .item-img{width:100%!important;max-width:100%!important;height:180px!important}}
      `}</style>

      {/* HEADER */}
      <header style={{ ...headerBgStyle, color:"var(--htx)", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight:60, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 24px rgba(0,0,0,0.3)" }}>
        {settings.headerBgType==="image"&&settings.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.38)"}}/>}
        <button onClick={()=>navTo("welcome")} style={{ background:"transparent", border:"none", display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"4px 0", position:"relative", zIndex:1 }}>
          <span style={{fontSize:24}}>🏡</span>
          <span style={{ fontFamily:"var(--hfont)", fontSize:"clamp(14px,2.5vw,21px)", fontWeight:700, color:"var(--acc)" }}>{settings.propertyName}</span>
        </button>
        <div style={{ display:"flex", gap:5, alignItems:"center", position:"relative", zIndex:1 }}>
          <nav className="dn" style={{display:"flex",gap:3}}>
            {navItems.map(n=>(
              <button key={n.id} className={`nb ${activeSection===n.id?"act":""}`} onClick={()=>navTo(n.id)}
                style={{ background:"transparent", border:"none", color:"var(--htx)", padding:"7px 12px", borderRadius:8, cursor:"pointer", fontFamily:"var(--bfont)", fontSize:13, transition:"all 0.2s" }}>
                {n.icon} {n.label}
              </button>
            ))}
            <button onClick={()=>setLang(lang==="fr"?"en":"fr")} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"var(--htx)", padding:"6px 10px", borderRadius:8, cursor:"pointer", fontSize:12, fontFamily:"var(--bfont)" }}>
              {lang==="fr"?"🇬🇧 EN":"🇫🇷 FR"}
            </button>
          </nav>
          <button className="mob" onClick={()=>setMenuOpen(!menuOpen)} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"var(--htx)", width:40, height:40, borderRadius:8, cursor:"pointer", fontSize:20, display:"none" }}>
            {menuOpen?"✕":"☰"}
          </button>
        </div>
      </header>

      {menuOpen&&(
        <div style={{ ...headerBgStyle, padding:"8px 12px 14px", borderBottom:"2px solid var(--acc)", zIndex:99, position:"relative" }}>
          {settings.headerBgType==="image"&&settings.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>}
          <div style={{position:"relative",zIndex:1}}>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>navTo(n.id)} style={{ display:"block", width:"100%", background:activeSection===n.id?"var(--acc)":"transparent", border:"none", color:activeSection===n.id?"#1a1a1a":"var(--htx)", padding:"11px 14px", borderRadius:8, cursor:"pointer", fontFamily:"var(--bfont)", fontSize:14, textAlign:"left", marginBottom:3 }}>
                {n.icon} {n.label}
              </button>
            ))}
            <button onClick={()=>{setLang(lang==="fr"?"en":"fr");setMenuOpen(false);}} style={{ display:"block", width:"100%", background:"rgba(255,255,255,0.1)", border:"none", color:"var(--htx)", padding:"10px 14px", borderRadius:8, cursor:"pointer", fontFamily:"var(--bfont)", fontSize:13, textAlign:"left" }}>
              {lang==="fr"?"🇬🇧 Switch to English":"🇫🇷 Passer en Français"}
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main style={{ flex:1, maxWidth:900, width:"100%", margin:"0 auto", padding:"20px 14px" }}>

        {/* WELCOME */}
        {activeSection==="welcome"&&(
          <div>
            <div style={{ ...headerBgStyle, borderRadius:22, padding:"44px 28px", textAlign:"center", marginBottom:28, position:"relative", overflow:"hidden" }}>
              {settings.headerBgType==="image"&&settings.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)"}}/>}
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:58,marginBottom:12}}>🌴</div>
                <h1 style={{ fontFamily:"var(--hfont)", color:"var(--acc)", fontSize:"clamp(26px,5vw,46px)", fontWeight:700, marginBottom:8 }}>{t("Bienvenue !","Welcome!")}</h1>
                <h2 style={{ fontFamily:"var(--hfont)", color:"var(--htx)", fontSize:"clamp(16px,2.5vw,24px)", fontWeight:400, fontStyle:"italic", marginBottom:22, opacity:0.85 }}>{settings.propertyName}</h2>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <a href={`tel:${settings.phone}`} style={{ background:"var(--acc)", color:"#1a1a1a", padding:"9px 18px", borderRadius:28, textDecoration:"none", fontWeight:700, fontSize:13 }}>📞 {settings.phone}</a>
                  <a href={`mailto:${settings.email}`} style={{ background:"rgba(255,255,255,0.1)", color:"var(--htx)", padding:"9px 18px", borderRadius:28, textDecoration:"none", fontSize:13 }}>✉️ {settings.email}</a>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily:"var(--hfont)", fontSize:22, marginBottom:14, color:"var(--btx)" }}>{t("Explorer","Explore")}</h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(135px,1fr))", gap:10, marginBottom:28 }}>
              {allCats.map(cat=>(
                <button key={cat.id} className="cc" onClick={()=>{setSelectedCat(cat.id);setActiveSection("category");}}
                  style={{ background:"var(--cbg)", border:`2px solid ${cat.color}25`, borderRadius:16, padding:"18px 10px", cursor:"pointer", textAlign:"center", transition:"all 0.3s", boxShadow:"0 3px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{fontSize:34,marginBottom:7}}>{cat.icon}</div>
                  <div style={{fontWeight:700,fontSize:12,color:cat.color,fontFamily:"var(--bfont)",lineHeight:1.3}}>{lang==="fr"?cat.nameFr:cat.nameEn}</div>
                  <div style={{fontSize:10,color:"#bbb",marginTop:3}}>{cat.items?.length||0} {t("lieux","places")}</div>
                </button>
              ))}
            </div>

            {pages.filter(p=>p.type!=="welcome").length>0&&(
              <>
                <h2 style={{fontFamily:"var(--hfont)",fontSize:22,marginBottom:14,color:"var(--btx)"}}>{t("Informations","Information")}</h2>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10}}>
                  {pages.filter(p=>p.type!=="welcome").map(p=>(
                    <button key={p.id} onClick={()=>setActiveSection("page_"+p.id)}
                      style={{background:"var(--cbg)",border:"2px solid var(--acc)22",borderRadius:14,padding:"18px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(0,0,0,0.05)",transition:"all 0.2s"}}>
                      <div style={{fontSize:26,marginBottom:7}}>{p.icon}</div>
                      <div style={{fontFamily:"var(--hfont)",fontWeight:700,fontSize:15,color:"var(--btx)"}}>{lang==="fr"?p.titleFr:p.titleEn}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* CUSTOM PAGE */}
        {activeSection.startsWith("page_")&&(()=>{
          const pid=activeSection.replace("page_",""); const page=pages.find(p=>p.id===pid); if(!page)return null;
          const aMap={left:"flex-start",center:"center",right:"flex-end"};
          return(
            <div>
              <BackBtn onClick={()=>setActiveSection("welcome")} t={t}/>
              <div style={{background:"var(--cbg)",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.07)"}}>
                {page.image&&<img src={page.image} alt="" style={{width:"100%",height:260,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
                {page.video&&<VideoEmbed url={page.video}/>}
                <div style={{padding:"28px 22px",display:"flex",flexDirection:"column",alignItems:aMap[page.align]||"flex-start",minHeight:150}}>
                  <h1 style={{fontFamily:"var(--hfont)",fontSize:"clamp(20px,4vw,34px)",color:"var(--btx)",marginBottom:14,textAlign:page.align||"left"}}>{page.icon} {lang==="fr"?page.titleFr:page.titleEn}</h1>
                  <div style={{fontSize:15,lineHeight:1.85,color:"var(--btx)",opacity:0.82,textAlign:page.align||"left",maxWidth:660,whiteSpace:"pre-wrap"}}>{lang==="fr"?page.contentFr:page.contentEn}</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PAGES LIST */}
        {activeSection==="pages"&&(
          <div>
            <h1 style={{fontFamily:"var(--hfont)",fontSize:28,marginBottom:18,color:"var(--btx)"}}>📖 {t("Toutes les pages","All Pages")}</h1>
            {pages.map(p=>(
              <button key={p.id} onClick={()=>setActiveSection("page_"+p.id)}
                style={{display:"flex",alignItems:"center",gap:14,width:"100%",background:"var(--cbg)",border:"2px solid #eee",borderRadius:13,padding:"15px 17px",cursor:"pointer",marginBottom:10,textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.04)",transition:"all 0.2s"}}>
                <span style={{fontSize:26}}>{p.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"var(--hfont)",fontWeight:700,fontSize:17,color:"var(--btx)"}}>{lang==="fr"?p.titleFr:p.titleEn}</div>
                  <div style={{fontSize:12,color:"#aaa",marginTop:2}}>{(lang==="fr"?p.contentFr:p.contentEn)?.slice(0,70)}…</div>
                </div>
                <span style={{color:"var(--acc)",fontSize:20}}>›</span>
              </button>
            ))}
          </div>
        )}

        {/* CATEGORY */}
        {activeSection==="category"&&(()=>{
          const cat=allCats.find(c=>c.id===selectedCat); if(!cat)return null;
          return(
            <div>
              <BackBtn onClick={()=>{setActiveSection("welcome");setSelectedCat(null);}} t={t}/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:14,background:`${cat.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{cat.icon}</div>
                <h1 style={{fontFamily:"var(--hfont)",fontSize:"clamp(20px,4vw,32px)",color:cat.color,margin:0}}>{lang==="fr"?cat.nameFr:cat.nameEn}</h1>
              </div>
              {(!cat.items||cat.items.length===0)&&<div style={{textAlign:"center",padding:"48px 0",color:"#bbb"}}>{t("Aucun lieu pour l'instant","No places yet")}</div>}
              {cat.items?.map(item=>(
                <div key={item.id} className="item-row" style={{display:"flex",flexDirection:"row"}}>
                  <ItemCard item={item} cat={cat} lang={lang} t={t}/>
                </div>
              ))}
            </div>
          );
        })()}

        {/* GALLERY */}
        {activeSection==="gallery"&&(
          <div>
            <h1 style={{fontFamily:"var(--hfont)",fontSize:28,marginBottom:18,color:"var(--btx)"}}>📷 {t("Galerie Photos","Photo Gallery")}</h1>
            {gallery.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#bbb"}}>{t("Aucune photo pour l'instant","No photos yet")}</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10}}>
              {gallery.map((img,i)=>(
                <div key={i} onClick={()=>setLightboxIdx(i)} style={{borderRadius:12,overflow:"hidden",cursor:"pointer",aspectRatio:"1",boxShadow:"0 3px 14px rgba(0,0,0,0.1)",transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  <img src={img.url} alt={img.caption||""} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                </div>
              ))}
            </div>
            {lightboxIdx!==null&&(
              <div onClick={()=>setLightboxIdx(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <img src={gallery[lightboxIdx]?.url} alt="" style={{maxWidth:"100%",maxHeight:"88vh",borderRadius:10,objectFit:"contain"}} onClick={e=>e.stopPropagation()}/>
                <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
                  {lightboxIdx>0&&<button onClick={e=>{e.stopPropagation();setLightboxIdx(lightboxIdx-1);}} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"white",width:44,height:44,borderRadius:22,cursor:"pointer",fontSize:22}}>‹</button>}
                  {lightboxIdx<gallery.length-1&&<button onClick={e=>{e.stopPropagation();setLightboxIdx(lightboxIdx+1);}} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"white",width:44,height:44,borderRadius:22,cursor:"pointer",fontSize:22}}>›</button>}
                  <button onClick={()=>setLightboxIdx(null)} style={{background:"rgba(255,255,255,0.18)",border:"none",color:"white",width:44,height:44,borderRadius:22,cursor:"pointer",fontSize:22}}>✕</button>
                </div>
                {gallery[lightboxIdx]?.caption&&<div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"white",background:"rgba(0,0,0,0.6)",padding:"6px 16px",borderRadius:20,fontSize:13}}>{gallery[lightboxIdx].caption}</div>}
              </div>
            )}
          </div>
        )}

        {/* CONTACT */}
        {activeSection==="contact"&&(
          <div>
            <h1 style={{fontFamily:"var(--hfont)",fontSize:28,marginBottom:18,color:"var(--btx)"}}>📞 Contact</h1>
            <div style={{background:"var(--cbg)",borderRadius:20,padding:"28px 20px",boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
              {[{icon:"📞",label:t("Téléphone","Phone"),val:settings.phone,href:`tel:${settings.phone}`},{icon:"✉️",label:"Email",val:settings.email,href:`mailto:${settings.email}`},{icon:"🌐",label:t("Site web","Website"),val:settings.website,href:`https://${settings.website}`}].map(c=>(
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  style={{display:"flex",alignItems:"center",gap:14,padding:"15px 18px",background:"var(--bbg)",borderRadius:12,textDecoration:"none",color:"var(--btx)",border:"1px solid #eee",marginBottom:10,transition:"all 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="var(--acc)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="#eee"}>
                  <span style={{fontSize:26}}>{c.icon}</span>
                  <div><div style={{fontSize:11,color:"#aaa",marginBottom:2}}>{c.label}</div><div style={{fontWeight:600,color:"var(--acc)",fontSize:15}}>{c.val}</div></div>
                </a>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{ ...footerBgStyle, color:"var(--ftx)", padding:"18px 16px", textAlign:"center", marginTop:"auto", position:"relative" }}>
        {settings.footerBgType==="image"&&settings.footerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/>}
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:"var(--hfont)",fontSize:15,color:"var(--acc)",marginBottom:3}}>{settings.propertyName}</div>
          <div style={{fontSize:11,opacity:0.5,fontFamily:"var(--bfont)"}}>{settings.phone} · {settings.email}</div>
          <button onClick={()=>setShowAdminLogin(!showAdminLogin)} style={{marginTop:10,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.3)",padding:"3px 10px",borderRadius:20,cursor:"pointer",fontSize:10}}>⚙️</button>
          {showAdminLogin&&(
            <div style={{marginTop:10,display:"flex",gap:7,justifyContent:"center",alignItems:"center"}}>
              <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()} placeholder={t("Mot de passe","Password")} style={{padding:"5px 10px",borderRadius:7,border:"1px solid rgba(255,255,255,0.18)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:13,outline:"none",width:130}}/>
              <button onClick={handleAdminLogin} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"5px 12px",borderRadius:7,cursor:"pointer",fontWeight:700}}>OK</button>
              <button onClick={()=>setShowAdminLogin(false)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────
function AdminPanel({ data, updateData, setMode, cssVars, adminTab, setAdminTab }) {
  const tabs = [
    {id:"settings",icon:"🎨",label:"Apparence"},
    {id:"contact",icon:"📞",label:"Contact"},
    {id:"pages",icon:"📄",label:"Pages"},
    {id:"categories",icon:"🗂️",label:"Catégories"},
    {id:"subcategories",icon:"📌",label:"Sous-catégories"},
    {id:"gallery",icon:"🖼️",label:"Galerie"},
    {id:"analytics",icon:"📊",label:"Statistiques"},
  ];
  return (
    <div style={{...cssVars,minHeight:"100vh",background:"#0d1a10",color:"#dde8dd",fontFamily:"var(--bfont)"}}>
      <style>{`*{box-sizing:border-box} input,textarea,select{background:#192b1e;color:#dde8dd;border:1px solid #2e4a34;border-radius:8px;padding:8px 12px;width:100%;font-size:14px;outline:none;font-family:inherit} input:focus,textarea:focus,select:focus{border-color:var(--acc)} label{font-size:11px;color:#7a9e7a;display:block;margin-bottom:3px;margin-top:10px;text-transform:uppercase;letter-spacing:0.5px}`}</style>
      <div style={{background:"#162018",padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #243428",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>⚙️</span>
          <span style={{fontFamily:"var(--hfont)",color:"var(--acc)",fontSize:19,fontWeight:700}}>Admin Backend</span>
          <span style={{fontSize:11,color:"#5a7a5a",background:"#192b1e",padding:"2px 9px",borderRadius:20}}>{data.settings.propertyName}</span>
        </div>
        <button onClick={()=>setMode("guest")} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>👁️ Voir le guide</button>
      </div>
      <div style={{display:"flex",minHeight:"calc(100vh - 50px)"}}>
        <div style={{width:190,background:"#0f1a12",padding:"14px 10px",flexShrink:0,borderRight:"1px solid #1a2c1e",overflowY:"auto"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setAdminTab(t.id)}
              style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:adminTab===t.id?"var(--acc)":"transparent",border:"none",color:adminTab===t.id?"#1a1a1a":"#6a9a6a",padding:"9px 11px",borderRadius:8,cursor:"pointer",fontSize:13,marginBottom:3,textAlign:"left",fontWeight:adminTab===t.id?700:400,transition:"all 0.2s"}}>
              {t.icon} {t.label}
            </button>
          ))}
          <div style={{marginTop:24,padding:"10px",background:"#192b1e",borderRadius:8,fontSize:11,color:"#4a6a4a",lineHeight:1.5}}>
            <div style={{marginBottom:4,fontWeight:700,color:"#6a9a6a"}}>🔐 Mot de passe</div>
            <div>Défaut: <strong style={{color:"var(--acc)"}}>admin123</strong></div>
          </div>
        </div>
        <div style={{flex:1,padding:"22px",overflowY:"auto"}}>
          {adminTab==="settings"&&<SettingsTab data={data} updateData={updateData}/>}
          {adminTab==="contact"&&<ContactTab data={data} updateData={updateData}/>}
          {adminTab==="pages"&&<PagesTab data={data} updateData={updateData}/>}
          {adminTab==="categories"&&<CategoriesTab data={data} updateData={updateData} field="categories" title="Catégories"/>}
          {adminTab==="subcategories"&&<CategoriesTab data={data} updateData={updateData} field="subcategories" title="Sous-catégories"/>}
          {adminTab==="gallery"&&<GalleryTab data={data} updateData={updateData}/>}
          {adminTab==="analytics"&&<AnalyticsTab data={data}/>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS TAB
// ─────────────────────────────────────────────
function AnalyticsTab({ data }) {
  const [analytics, setAnalytics] = useState(() => getAnalytics());
  const [ratings, setRatings] = useState(() => getRatings());
  const [view, setView] = useState("days"); // days | months | years
  const [refreshed, setRefreshed] = useState(false);
  const allCats = [...(data.categories||[]), ...(data.subcategories||[])];

  const refresh = () => { setAnalytics(getAnalytics()); setRatings(getRatings()); setRefreshed(true); setTimeout(()=>setRefreshed(false),1200); };

  const a = analytics;
  const today = new Date().toISOString().slice(0,10);
  const thisMonth = new Date().toISOString().slice(0,7);
  const thisYear = String(new Date().getFullYear());

  const todayCount = a.days?.[today] || 0;
  const monthCount = a.months?.[thisMonth] || 0;
  const yearCount = a.years?.[thisYear] || 0;
  const totalCount = a.total || 0;

  // Get last 14 days
  const last14 = Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-13+i);
    const key = d.toISOString().slice(0,10);
    return { key, label: key.slice(5), count: a.days?.[key]||0 };
  });
  const last12Months = Array.from({length:12},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-11+i);
    const key = d.toISOString().slice(0,7);
    const label = new Date(key+"-01").toLocaleDateString("fr-FR",{month:"short"});
    return { key, label, count: a.months?.[key]||0 };
  });
  const years = Object.entries(a.years||{}).sort((x,y)=>x[0].localeCompare(y[0])).map(([k,v])=>({key:k,label:k,count:v}));

  const chartData = view==="days" ? last14 : view==="months" ? last12Months : years;
  const maxVal = Math.max(1, ...chartData.map(d=>d.count));

  // Ratings summary
  const ratedItems = allCats.flatMap(cat=>
    (cat.items||[]).map(item => {
      const r = ratings[item.id]; if(!r||r.count===0) return null;
      return { name: item.nameFr, catIcon: cat.icon, avg: r.total/r.count, count: r.count };
    }).filter(Boolean)
  ).sort((a,b)=>b.avg-a.avg);

  return (
    <div style={{maxWidth:780}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{color:"var(--acc)",fontFamily:"var(--hfont)",fontSize:22}}>📊 Statistiques de visites</h2>
        <button onClick={refresh} style={{background:refreshed?"#2a5a30":"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,transition:"background 0.3s"}}>
          {refreshed?"✓ Actualisé":"🔄 Actualiser"}
        </button>
      </div>

      {/* KPI CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        {[{label:"Aujourd'hui",val:todayCount,icon:"📅",color:"#4a90d9"},{label:"Ce mois",val:monthCount,icon:"📆",color:"#7b5ea7"},{label:"Cette année",val:yearCount,icon:"🗓️",color:"#5dab5d"},{label:"Total",val:totalCount,icon:"∞",color:"var(--acc)"}].map(k=>(
          <div key={k.label} style={{background:"#162018",border:`1px solid ${k.color}40`,borderRadius:14,padding:"18px 16px",textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:6}}>{k.icon}</div>
            <div style={{fontSize:32,fontWeight:800,color:k.color,fontFamily:"var(--hfont)"}}>{k.val}</div>
            <div style={{fontSize:12,color:"#5a7a5a",marginTop:3}}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div style={{background:"#162018",border:"1px solid #243428",borderRadius:16,padding:"20px",marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{color:"var(--acc)",fontSize:15}}>Historique des visites</h3>
          <div style={{display:"flex",gap:6}}>
            {[{v:"days",l:"14 jours"},{v:"months",l:"12 mois"},{v:"years",l:"Années"}].map(b=>(
              <button key={b.v} onClick={()=>setView(b.v)} style={{background:view===b.v?"var(--acc)":"#1e2d23",border:"none",color:view===b.v?"#1a1a1a":"#7a9a7a",padding:"5px 11px",borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:view===b.v?700:400}}>{b.l}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:120,overflowX:"auto",paddingBottom:4}}>
          {chartData.map(d=>(
            <div key={d.key} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"1 0 auto",minWidth:view==="days"?30:22,maxWidth:50}}>
              <div style={{fontSize:10,color:"#5a7a5a",marginBottom:3}}>{d.count>0?d.count:""}</div>
              <div style={{width:"100%",background:`var(--acc)`,borderRadius:"4px 4px 0 0",height:`${Math.max(2,(d.count/maxVal)*90)}px`,transition:"height 0.4s",opacity:d.key===today||d.key===thisMonth||d.key===thisYear?1:0.7}}/>
              <div style={{fontSize:9,color:"#4a6a4a",marginTop:3,transform:"rotate(-30deg)",transformOrigin:"top center",whiteSpace:"nowrap"}}>{d.label}</div>
            </div>
          ))}
        </div>
        {totalCount===0&&<div style={{textAlign:"center",color:"#4a6a4a",padding:"20px 0",fontSize:13}}>Aucune visite enregistrée. Les visites sont comptées quand les utilisateurs sélectionnent leur langue.</div>}
      </div>

      {/* RATINGS SUMMARY */}
      <div style={{background:"#162018",border:"1px solid #243428",borderRadius:16,padding:"20px"}}>
        <h3 style={{color:"var(--acc)",fontSize:15,marginBottom:14}}>⭐ Notes des lieux ({ratedItems.length} noté{ratedItems.length>1?"s":""})</h3>
        {ratedItems.length===0&&<div style={{color:"#4a6a4a",fontSize:13,textAlign:"center",padding:"20px 0"}}>Aucun lieu n'a encore été noté par les visiteurs.</div>}
        {ratedItems.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #1e2d23"}}>
            <div style={{fontSize:20,minWidth:28}}>{item.catIcon}</div>
            <div style={{flex:1,fontSize:14,fontWeight:600}}>{item.name}</div>
            <div style={{display:"flex",gap:2}}>
              {[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(item.avg)?"#f5a623":"#333",fontSize:16}}>★</span>)}
            </div>
            <div style={{fontSize:13,color:"var(--acc)",fontWeight:700,minWidth:36}}>{item.avg.toFixed(1)}</div>
            <div style={{fontSize:11,color:"#5a7a5a"}}>{item.count} avis</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS TAB
// ─────────────────────────────────────────────
function BgPicker({ label, typeKey, colorKey, imageKey, settings, updateData }) {
  const type = settings[typeKey] || "color";
  const color = settings[colorKey] || "#000";
  const image = settings[imageKey] || "";
  const set = (k,v) => updateData(d => { d.settings[k]=v; });
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontWeight:700,color:"#9ab89a",fontSize:12,marginBottom:6,display:"block"}}>{label}</label>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <button onClick={()=>set(typeKey,"color")} style={{flex:1,background:type==="color"?"var(--acc)":"#192b1e",border:"none",color:type==="color"?"#1a1a1a":"#7a9e7a",padding:"6px 10px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:type==="color"?700:400}}>🎨 Couleur</button>
        <button onClick={()=>set(typeKey,"image")} style={{flex:1,background:type==="image"?"var(--acc)":"#192b1e",border:"none",color:type==="image"?"#1a1a1a":"#7a9e7a",padding:"6px 10px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:type==="image"?700:400}}>🖼️ Photo</button>
      </div>
      {type==="color"&&(
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <input type="color" value={color} onChange={e=>set(colorKey,e.target.value)} style={{width:44,height:34,padding:2,cursor:"pointer",borderRadius:6,flexShrink:0}}/>
          <input value={color} onChange={e=>set(colorKey,e.target.value)} style={{flex:1}}/>
        </div>
      )}
      {type==="image"&&(
        <div>
          <input value={image} onChange={e=>set(imageKey,e.target.value)} placeholder="URL de l'image (https://...)"/>
          {image&&<img src={image} alt="" style={{width:"100%",height:80,objectFit:"cover",borderRadius:8,marginTop:6}} onError={e=>e.target.style.display="none"}/>}
        </div>
      )}
    </div>
  );
}

function SettingsTab({data,updateData}){
  const s=data.settings;
  const set=(k,v)=>updateData(d=>{d.settings[k]=v;});
  return(
    <div style={{maxWidth:720}}>
      <ASection title="🎨 Arrière-plans">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          <BgPicker label="Header (bandeau haut)" typeKey="headerBgType" colorKey="headerBg" imageKey="headerBgImage" settings={s} updateData={updateData}/>
          <BgPicker label="Footer (bandeau bas)" typeKey="footerBgType" colorKey="footerBg" imageKey="footerBgImage" settings={s} updateData={updateData}/>
          <BgPicker label="Fond général (corps)" typeKey="bodyBgType" colorKey="bodyBg" imageKey="bodyBgImage" settings={s} updateData={updateData}/>
        </div>
      </ASection>
      <ASection title="🖍️ Couleurs">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
          {[["Texte header","headerText"],["Texte footer","footerText"],["Couleur accent","accentColor"],["Texte général","bodyText"],["Fond cartes","cardBg"]].map(([label,key])=>(
            <div key={key} style={{marginBottom:6}}>
              <label>{label}</label>
              <div style={{display:"flex",gap:7,alignItems:"center"}}>
                <input type="color" value={s[key]} onChange={e=>set(key,e.target.value)} style={{width:44,height:34,padding:2,cursor:"pointer",borderRadius:6,flexShrink:0}}/>
                <input value={s[key]} onChange={e=>set(key,e.target.value)} style={{flex:1}}/>
              </div>
            </div>
          ))}
        </div>
      </ASection>
      <ASection title="🔤 Typographie">
        <label>Police des titres (display)</label>
        <select value={s.fontFamily} onChange={e=>set("fontFamily",e.target.value)} style={{marginBottom:10}}>
          {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        <div style={{fontFamily:`'${s.fontFamily}',Georgia,serif`,fontSize:26,color:"var(--acc)",marginBottom:14,padding:"10px",background:"#0d1a10",borderRadius:8}}>P'tit Bouchon — Aperçu</div>
        <label>Police du corps</label>
        <select value={s.bodyFont} onChange={e=>set("bodyFont",e.target.value)}>
          {BODY_FONTS.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
        <div style={{fontFamily:`'${s.bodyFont}',sans-serif`,fontSize:14,marginTop:8,color:"#7a9e7a",padding:"8px",background:"#0d1a10",borderRadius:8}}>Bienvenue dans notre villa — Welcome to our villa</div>
      </ASection>
    </div>
  );
}

function ContactTab({data,updateData}){
  const s=data.settings; const set=(k,v)=>updateData(d=>{d.settings[k]=v;});
  return(<div style={{maxWidth:480}}><ASection title="📞 Informations de contact">{[["Nom de la propriété","propertyName"],["Téléphone","phone"],["Email","email"],["Site web","website"]].map(([label,key])=>(<div key={key}><label>{label}</label><input value={s[key]} onChange={e=>set(key,e.target.value)}/></div>))}</ASection></div>);
}

function PagesTab({data,updateData}){
  const [editing,setEditing]=useState(null);
  const pages=data.pages;
  const ALIGNS=[{v:"left",l:"← Gauche"},{v:"center",l:"⬛ Centre"},{v:"right",l:"→ Droite"}];
  const VALIGNS=[{v:"top",l:"↑ Haut"},{v:"center",l:"⬛ Milieu"},{v:"bottom",l:"↓ Bas"}];
  const addPage=()=>{const np={id:generateId(),titleFr:"Nouvelle page",titleEn:"New page",icon:"📖",contentFr:"",contentEn:"",align:"left",valign:"top",image:"",video:"",type:"custom"};updateData(d=>d.pages.push(np));setEditing(np.id);};
  const del=(id)=>{if(window.confirm("Supprimer ?"))updateData(d=>{d.pages=d.pages.filter(p=>p.id!==id);});};
  const upd=(id,k,v)=>updateData(d=>{const p=d.pages.find(x=>x.id===id);if(p)p[k]=v;});
  const move=(id,dir)=>updateData(d=>{const i=d.pages.findIndex(p=>p.id===id);const ni=i+dir;if(ni<0||ni>=d.pages.length)return;[d.pages[i],d.pages[ni]]=[d.pages[ni],d.pages[i]];});
  const dup=(p)=>{const c={...JSON.parse(JSON.stringify(p)),id:generateId(),titleFr:p.titleFr+" (copie)",titleEn:p.titleEn+" (copy)"};updateData(d=>d.pages.push(c));};
  const ep=editing?pages.find(p=>p.id===editing):null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{color:"var(--acc)",fontFamily:"var(--hfont)",fontSize:20}}>📄 Gestion des Pages</h2>
        {!ep&&<button onClick={addPage} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700}}>+ Ajouter</button>}
      </div>
      {!ep&&pages.map((p,i)=>(
        <div key={p.id} style={{background:"#162018",border:"1px solid #243428",borderRadius:11,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>{p.icon}</span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{p.titleFr} / {p.titleEn}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{p.type==="welcome"?"Accueil":"Personnalisée"}</div></div>
          <div style={{display:"flex",gap:5}}>
            <IBtn onClick={()=>move(p.id,-1)} disabled={i===0}>↑</IBtn>
            <IBtn onClick={()=>move(p.id,1)} disabled={i===pages.length-1}>↓</IBtn>
            <IBtn onClick={()=>dup(p)}>⧉</IBtn>
            <IBtn onClick={()=>setEditing(p.id)} accent>✎ Éditer</IBtn>
            <IBtn onClick={()=>del(p.id)} danger>🗑</IBtn>
          </div>
        </div>
      ))}
      {ep&&(
        <div>
          <button onClick={()=>setEditing(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"7px 14px",borderRadius:8,cursor:"pointer",marginBottom:18}}>← Retour</button>
          <div style={{background:"#162018",border:"1px solid #243428",borderRadius:14,padding:"20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label>Titre (Français)</label><input value={ep.titleFr} onChange={e=>upd(ep.id,"titleFr",e.target.value)}/></div>
              <div><label>Title (English)</label><input value={ep.titleEn} onChange={e=>upd(ep.id,"titleEn",e.target.value)}/></div>
            </div>
            <label>Icône</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{PAGE_ICONS.map(ic=><button key={ic} onClick={()=>upd(ep.id,"icon",ic)} style={{fontSize:22,background:ep.icon===ic?"var(--acc)":"#192b1e",border:"none",borderRadius:7,width:40,height:40,cursor:"pointer"}}>{ic}</button>)}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label>Alignement horizontal</label><div style={{display:"flex",gap:5}}>{ALIGNS.map(a=><button key={a.v} onClick={()=>upd(ep.id,"align",a.v)} style={{flex:1,background:ep.align===a.v?"var(--acc)":"#192b1e",border:"none",borderRadius:6,padding:"6px 3px",cursor:"pointer",color:ep.align===a.v?"#1a1a1a":"#7a9e7a",fontSize:12}}>{a.l}</button>)}</div></div>
              <div><label>Alignement vertical</label><div style={{display:"flex",gap:5}}>{VALIGNS.map(a=><button key={a.v} onClick={()=>upd(ep.id,"valign",a.v)} style={{flex:1,background:ep.valign===a.v?"var(--acc)":"#192b1e",border:"none",borderRadius:6,padding:"6px 3px",cursor:"pointer",color:ep.valign===a.v?"#1a1a1a":"#7a9e7a",fontSize:12}}>{a.l}</button>)}</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div><label>Contenu (Français)</label><textarea value={ep.contentFr} onChange={e=>upd(ep.id,"contentFr",e.target.value)} rows={6} style={{resize:"vertical"}}/></div>
              <div><label>Content (English)</label><textarea value={ep.contentEn} onChange={e=>upd(ep.id,"contentEn",e.target.value)} rows={6} style={{resize:"vertical"}}/></div>
            </div>
            <label>URL de l'image</label><input value={ep.image} onChange={e=>upd(ep.id,"image",e.target.value)} placeholder="https://..."/>
            <label>URL vidéo (YouTube, Vimeo…)</label><input value={ep.video} onChange={e=>upd(ep.id,"video",e.target.value)} placeholder="https://youtube.com/watch?v=..."/>
            {ep.video&&<div style={{marginTop:10}}><VideoEmbed url={ep.video}/></div>}
            {ep.image&&<img src={ep.image} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8,marginTop:8}} onError={e=>e.target.style.display="none"}/>}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({data,updateData,field,title}){
  const [selCat,setSelCat]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const cats=data[field];
  const addCat=()=>{const nc={id:generateId(),nameFr:"Nouvelle catégorie",nameEn:"New category",icon:"📍",color:"#888",items:[]};updateData(d=>d[field].push(nc));setSelCat(nc.id);};
  const delCat=(id)=>{if(window.confirm("Supprimer ?"))updateData(d=>{d[field]=d[field].filter(c=>c.id!==id);});setSelCat(null);};
  const updCat=(id,k,v)=>updateData(d=>{const c=d[field].find(x=>x.id===id);if(c)c[k]=v;});
  const addItem=(cid)=>{const ni={id:generateId(),nameFr:"Nouveau lieu",nameEn:"New place",descFr:"",descEn:"",address:"",phone:"",mapLink:"",image:""};updateData(d=>{const c=d[field].find(x=>x.id===cid);if(c)c.items.push(ni);});setEditItem(ni.id);};
  const delItem=(cid,iid)=>{if(window.confirm("Supprimer ?"))updateData(d=>{const c=d[field].find(x=>x.id===cid);if(c)c.items=c.items.filter(i=>i.id!==iid);});};
  const updItem=(cid,iid,k,v)=>updateData(d=>{const c=d[field].find(x=>x.id===cid);const i=c?.items?.find(x=>x.id===iid);if(i)i[k]=v;});
  const moveItem=(cid,iid,dir)=>updateData(d=>{const c=d[field].find(x=>x.id===cid);if(!c)return;const idx=c.items.findIndex(i=>i.id===iid);const ni=idx+dir;if(ni<0||ni>=c.items.length)return;[c.items[idx],c.items[ni]]=[c.items[ni],c.items[idx]];});
  const cat=selCat?cats.find(c=>c.id===selCat):null;
  const item=cat&&editItem?cat.items.find(i=>i.id===editItem):null;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{color:"var(--acc)",fontFamily:"var(--hfont)",fontSize:20}}>🗂️ {title}</h2>
        {!selCat&&<button onClick={addCat} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700}}>+ Ajouter</button>}
      </div>
      {!selCat&&cats.map(c=>(
        <div key={c.id} style={{background:"#162018",border:`1px solid ${c.color}35`,borderRadius:11,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:26}}>{c.icon}</span>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14}}>{c.nameFr} / {c.nameEn}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{c.items?.length||0} lieu(x)</div></div>
          <div style={{display:"flex",gap:5}}><IBtn onClick={()=>{setSelCat(c.id);setEditItem(null);}} accent>✎ Éditer</IBtn><IBtn onClick={()=>delCat(c.id)} danger>🗑</IBtn></div>
        </div>
      ))}
      {cat&&!item&&(
        <div>
          <button onClick={()=>setSelCat(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"7px 14px",borderRadius:8,cursor:"pointer",marginBottom:18}}>← Retour</button>
          <div style={{background:"#162018",border:"1px solid #243428",borderRadius:14,padding:"18px",marginBottom:16}}>
            <h3 style={{color:"var(--acc)",marginBottom:12,fontSize:14}}>Paramètres</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label>Nom (Français)</label><input value={cat.nameFr} onChange={e=>updCat(cat.id,"nameFr",e.target.value)}/></div>
              <div><label>Name (English)</label><input value={cat.nameEn} onChange={e=>updCat(cat.id,"nameEn",e.target.value)}/></div>
            </div>
            <label>Icône</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{CAT_ICONS.map(ic=><button key={ic} onClick={()=>updCat(cat.id,"icon",ic)} style={{fontSize:22,background:cat.icon===ic?"var(--acc)":"#192b1e",border:"none",borderRadius:7,width:40,height:40,cursor:"pointer"}}>{ic}</button>)}</div>
            <label>Couleur</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,alignItems:"center"}}>
              {CAT_COLORS.map(col=><button key={col} onClick={()=>updCat(cat.id,"color",col)} style={{width:34,height:34,background:col,border:cat.color===col?"3px solid white":"none",borderRadius:7,cursor:"pointer"}}/>)}
              <input type="color" value={cat.color} onChange={e=>updCat(cat.id,"color",e.target.value)} style={{width:34,height:34,padding:2,cursor:"pointer"}}/>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h3 style={{color:"var(--acc)",fontSize:15}}>Lieux ({cat.items?.length||0})</h3>
            <button onClick={()=>addItem(cat.id)} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"6px 12px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:13}}>+ Ajouter un lieu</button>
          </div>
          {cat.items?.map((it,i)=>(
            <div key={it.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"11px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}>
              {it.image&&<img src={it.image} alt="" style={{width:52,height:52,objectFit:"cover",borderRadius:8,flexShrink:0}} onError={e=>e.target.style.display="none"}/>}
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{it.nameFr}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{it.address}</div></div>
              <div style={{display:"flex",gap:4}}>
                <IBtn onClick={()=>moveItem(cat.id,it.id,-1)} disabled={i===0}>↑</IBtn>
                <IBtn onClick={()=>moveItem(cat.id,it.id,1)} disabled={i===cat.items.length-1}>↓</IBtn>
                <IBtn onClick={()=>setEditItem(it.id)} accent>✎</IBtn>
                <IBtn onClick={()=>delItem(cat.id,it.id)} danger>🗑</IBtn>
              </div>
            </div>
          ))}
        </div>
      )}
      {item&&(
        <div>
          <button onClick={()=>setEditItem(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"7px 14px",borderRadius:8,cursor:"pointer",marginBottom:18}}>← Retour à {cat.nameFr}</button>
          <div style={{background:"#162018",border:"1px solid #243428",borderRadius:14,padding:"20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label>Nom (Français)</label><input value={item.nameFr} onChange={e=>updItem(cat.id,item.id,"nameFr",e.target.value)}/></div>
              <div><label>Name (English)</label><input value={item.nameEn} onChange={e=>updItem(cat.id,item.id,"nameEn",e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label>Description (FR)</label><textarea value={item.descFr} onChange={e=>updItem(cat.id,item.id,"descFr",e.target.value)} rows={4} style={{resize:"vertical"}}/></div>
              <div><label>Description (EN)</label><textarea value={item.descEn} onChange={e=>updItem(cat.id,item.id,"descEn",e.target.value)} rows={4} style={{resize:"vertical"}}/></div>
            </div>
            <label>Adresse</label><input value={item.address} onChange={e=>updItem(cat.id,item.id,"address",e.target.value)} placeholder="123 Rue…, Ville"/>
            <label>Téléphone</label><input value={item.phone} onChange={e=>updItem(cat.id,item.id,"phone",e.target.value)} placeholder="+596 696…"/>
            <label>🗺️ Lien Google Maps</label>
            <input value={item.mapLink} onChange={e=>updItem(cat.id,item.id,"mapLink",e.target.value)} placeholder="https://maps.google.com/?q=…"/>
            {item.mapLink&&<a href={item.mapLink} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:5,fontSize:12,color:"#4285f4"}}>🔗 Tester le lien</a>}
            <label>📸 URL de la photo du lieu</label>
            <input value={item.image} onChange={e=>updItem(cat.id,item.id,"image",e.target.value)} placeholder="https://…"/>
            <div style={{fontSize:11,color:"#5a7a5a",marginTop:3}}>💡 Conseil : utilisez une photo du lieu (façade, plage, plat…) pour que les visiteurs reconnaissent l'endroit</div>
            {item.image&&<img src={item.image} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:8,marginTop:8}} onError={e=>e.target.style.display="none"}/>}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryTab({data,updateData}){
  const gallery=data.gallery;
  const add=()=>updateData(d=>d.gallery.push({id:generateId(),url:"",caption:""}));
  const del=(id)=>updateData(d=>{d.gallery=d.gallery.filter(g=>g.id!==id);});
  const upd=(id,k,v)=>updateData(d=>{const g=d.gallery.find(x=>x.id===id);if(g)g[k]=v;});
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <h2 style={{color:"var(--acc)",fontFamily:"var(--hfont)",fontSize:20}}>🖼️ Galerie Photos</h2>
        <button onClick={add} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700}}>+ Ajouter</button>
      </div>
      {gallery.length===0&&<div style={{textAlign:"center",padding:40,color:"#4a6a4a"}}>Aucune photo. Cliquez sur + Ajouter.</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
        {gallery.map(g=>(
          <div key={g.id} style={{background:"#162018",border:"1px solid #243428",borderRadius:12,overflow:"hidden"}}>
            {g.url&&<img src={g.url} alt="" style={{width:"100%",height:150,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
            <div style={{padding:"10px"}}>
              <label>URL image</label><input value={g.url} onChange={e=>upd(g.id,"url",e.target.value)} placeholder="https://…"/>
              <label>Légende</label><input value={g.caption} onChange={e=>upd(g.id,"caption",e.target.value)} placeholder="Description…"/>
              <button onClick={()=>del(g.id)} style={{marginTop:7,background:"#4a1515",border:"none",color:"#ff8080",padding:"5px 10px",borderRadius:6,cursor:"pointer",fontSize:12}}>🗑 Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────────
function VideoEmbed({url}){
  if(!url)return null;
  let src=url;
  const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vm=url.match(/vimeo\.com\/(\d+)/);
  if(yt)src=`https://www.youtube.com/embed/${yt[1]}`;
  else if(vm)src=`https://player.vimeo.com/video/${vm[1]}`;
  return(<div style={{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:12,marginBottom:14}}><iframe src={src} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title="video"/></div>);
}
function BackBtn({onClick,t}){return(<button onClick={onClick} style={{background:"transparent",border:"1px solid var(--acc)",color:"var(--acc)",padding:"7px 14px",borderRadius:20,cursor:"pointer",fontSize:13,marginBottom:18,display:"inline-flex",alignItems:"center",gap:5}}>← {t("Retour","Back")}</button>);}
function ASection({title,children}){return(<div style={{background:"#162018",border:"1px solid #243428",borderRadius:14,padding:"18px",marginBottom:18}}><h3 style={{color:"var(--acc)",marginBottom:14,fontSize:15}}>{title}</h3>{children}</div>);}
function IBtn({onClick,children,accent,danger,disabled,title}){return(<button onClick={onClick} disabled={disabled} title={title} style={{background:danger?"#4a1515":accent?"#1a3020":"#192b1e",border:`1px solid ${danger?"#7a2020":accent?"var(--acc)":"#2e4a34"}`,color:danger?"#ff8080":accent?"var(--acc)":"#6a9a6a",padding:"5px 9px",borderRadius:6,cursor:disabled?"not-allowed":"pointer",fontSize:12,opacity:disabled?0.4:1,whiteSpace:"nowrap"}}>{children}</button>);}
