import { useState, useEffect, useCallback } from "react";

// ==========================================
// CONSTANTS
// ==========================================
const FONTS = ["Playfair Display","Cormorant Garamond","Lora","Merriweather","Montserrat","Raleway","Poppins","Nunito","Dancing Script","Pacifico","Georgia"];
const BODY_FONTS = ["Lato","Open Sans","Roboto","Source Sans Pro","Nunito","Quicksand","Work Sans","Karla"];
const CAT_ICONS = ["🍽️","🏖️","🛒","🤿","👁️","🥐","🏧","⛽","🏥","🍹","☕","🌴","🎭","🏄","🚤","🎣","🌺","🎪","🗺️","🎯","🎨","🏊","🚴","🌊","🛖","🏰","⛪","🌿","🦀","🎵","🛍️","🧘","🪂","🌋","🦋"];
const CAT_COLORS = ["#e07b54","#2e86ab","#5dab5d","#7b5ea7","#d4a843","#c47a3a","#607d8b","#ef5350","#e53935","#00acc1","#f06292","#66bb6a","#ff7043","#26c6da","#ab47bc","#ffa726"];
const PAGE_ICONS = ["🏡","📖","🌴","🏖️","🍽️","🚗","🔑","📋","ℹ️","🗺️","🎉","🌊","🌿","💡","🚿","🛁","📺","📶","🎵","🌺","🌅","🏝️","🦋","🌙","🧹","🔐","🌡️","🐾","👶","♿","🎁","🍾"];
const generateId = () => Math.random().toString(36).substr(2,9);

// -- EMOJI ANIMATION MAP -----------------
const EMOJI_ANIM={
  "🍽️":"anim-wobble","🏖️":"anim-float","🛒":"anim-rubber","🤿":"anim-flip",
  "👁️":"anim-pulse","🥐":"anim-bounce","🏧":"anim-shake","⛽":"anim-spin",
  "🏥":"anim-heart","🍹":"anim-swing","☕":"anim-float","🌴":"anim-swing",
  "🎭":"anim-tada","🏄":"anim-wobble","🚤":"anim-float","🎣":"anim-bounce",
  "🌺":"anim-pulse","🎪":"anim-jello","🗺️":"anim-float","🎯":"anim-zoom",
  "🎨":"anim-rubber","🏊":"anim-float","🚴":"anim-spin","🌊":"anim-float",
  "🛖":"anim-wobble","🏰":"anim-zoom","⛪":"anim-pulse","🌿":"anim-swing",
  "🦀":"anim-shake","🎵":"anim-bounce","🛍️":"anim-rubber","🧘":"anim-float",
  "🪂":"anim-float","🌋":"anim-pulse","🦋":"anim-flip",
  // quick actions
  "🔑":"anim-shake","🌅":"anim-float","❤️":"anim-heart","📷":"anim-flip",
  "📞":"anim-bounce","🎬":"anim-flip","🏡":"anim-float",
  // defaults
};

// ==========================================
// THEME - Bord de mer
// ==========================================
const SEA = {
  navy:    "#0a2342",
  ocean:   "#1b6ca8",
  sky:     "#4fc3f7",
  sand:    "#f5e6c8",
  sandDark:"#e8d5a3",
  white:   "#ffffff",
  offWhite:"#f8fbff",
  cardBg:  "#ffffff",
  text:    "#0d2137",
  sub:     "#6b8caa",
  border:  "#ddeeff",
  accent:  "#1b6ca8",
  coral:   "#e8734a",
  teal:    "#00b4d8",
  gold:    "#f0a500",
};

// ==========================================
// STORAGE HELPERS
// ==========================================
const LS = {
  get:(k,fb={})=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};
const trackVisit=()=>{
  const now=new Date(),day=now.toISOString().slice(0,10),mon=now.toISOString().slice(0,7),yr=String(now.getFullYear());
  const a=LS.get("pb_analytics",{days:{},months:{},years:{},total:0,devices:{mobile:0,desktop:0}});
  if(!a.days)a.days={};
  if(!a.months)a.months={};
  if(!a.years)a.years={};
  if(!a.devices)a.devices={mobile:0,desktop:0};
  a.days[day]=(a.days[day]||0)+1;
  a.months[mon]=(a.months[mon]||0)+1;
  a.years[yr]=(a.years[yr]||0)+1;
  a.total=(a.total||0)+1;
  const dev=/Mobi|Android/i.test(navigator.userAgent)?"mobile":"desktop";
  a.devices[dev]=(a.devices[dev]||0)+1;
  LS.set("pb_analytics",a);
};
const getRatings=()=>LS.get("pb_ratings",{});
const saveRating=(id,stars)=>{const r=getRatings();if(!r[id])r[id]={total:0,count:0};r[id].total+=stars;r[id].count+=1;LS.set("pb_ratings",r);};
const getUserRatings=()=>LS.get("pb_user_ratings",{});
const saveUserRating=(id,stars)=>{const r=getUserRatings();r[id]=stars;LS.set("pb_user_ratings",r);};
const getFavorites=()=>LS.get("pb_favorites",[]);
const toggleFavorite=(id)=>{const f=getFavorites();const i=f.indexOf(id);if(i>=0)f.splice(i,1);else f.push(id);LS.set("pb_favorites",f);return[...f];};
const bgStyle=(type,color,img)=>type==="image"&&img?{backgroundImage:`url(${img})`,backgroundSize:"cover",backgroundPosition:"center"}:{background:color};

// ==========================================
// DEFAULT DATA
// ==========================================
const DEFAULT={
  settings:{
    propertyName:"P'tit Bouchon", tagline:"Villa face à la mer - Île Maurice",
    phone:"+230 5250 7300", email:"cdesign@intnet.mu",
    website:"", whatsapp:"+23052507300", instagram:"",
    checkIn:"08:00", checkOut:"11:00",
    address:"Public Beach Road, Plaine Magnien, Grand Port, Mauritius 52404",
    villaLat:"-20.4310", villaLng:"57.6659",
    headerBg:SEA.navy, headerText:SEA.sand,
    footerBg:SEA.navy, footerText:SEA.sand,
    accentColor:SEA.ocean,
    cardBorderColor:SEA.border,
    cardLabelColor:SEA.ocean,
    emojiSize:32,
    quickEmojiSize:36,
    cardFontSize:10,
    heroFontSize:52,
    letterSpacing:2,
    bodyBg:SEA.offWhite, bodyText:SEA.text, cardBg:SEA.cardBg,
    fontFamily:"Cormorant Garamond", bodyFont:"Montserrat",
    headerBgType:"image", headerBgImage:"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg",
    footerBgType:"color", footerBgImage:"",
    bodyBgType:"color", bodyBgImage:"",
  },
  checkin:{
    wifiName:"PtitBouchon_5G", wifiPass:"bienvenue2024",
    accessCode:"1234", lockboxCode:"5678",
    checkIn:"08:00", checkOut:"11:00",
    instructions:[
      {id:"c1",icon:"✈️",titleFr:"Arrivée depuis l'aéroport",titleEn:"Arriving from the airport",textFr:"L'aéroport SSR est à seulement 8 minutes de la villa. En sortant de l'aéroport, prenez la direction de Mahébourg puis suivez les indications vers Plaine Magnien - Public Beach Road.",textEn:"SSR Airport is only 8 minutes from the villa. Exiting the airport, head towards Mahébourg then follow signs to Plaine Magnien - Public Beach Road."},
      {id:"c2",icon:"🔑",titleFr:"Self Check-in - Boîtier à clé",titleEn:"Self Check-in - Lockbox",textFr:"Pas besoin de nous attendre ! La clé se trouve dans le boîtier sécurisé à côté de la porte principale. Le code vous sera communiqué par message avant votre arrivée.",textEn:"No need to wait for us! The key is in the secure lockbox next to the main door. The code will be sent to you by message before your arrival."},
      {id:"c3",icon:"🔐",titleFr:"Système d'alarme",titleEn:"Alarm system",textFr:"La villa est équipée d'un système d'alarme. Les instructions de désactivation se trouvent dans le guide d'accueil à l'intérieur de la villa.",textEn:"The villa has an alarm system. Deactivation instructions are in the welcome guide inside the villa."},
      {id:"c4",icon:"📱",titleFr:"Contactez-nous",titleEn:"Contact us",textFr:"Envoyez-nous un message WhatsApp dès votre arrivée. Charles répond dans l'heure, 7j/7. Taux de réponse : 100%.",textEn:"Send us a WhatsApp message upon arrival. Charles responds within the hour, 7 days a week. Response rate: 100%."},
    ],
  },
  houseRules:[
    {id:"r1",icon:"🕗",titleFr:"Check-in",titleEn:"Check-in",textFr:"Check-in : 8h00 - 21h00. Self check-in via boîtier à clé.",textEn:"Check-in: 8:00 AM - 9:00 PM. Self check-in via lockbox."},
    {id:"r2",icon:"🕙",titleFr:"Check-out",titleEn:"Check-out",textFr:"Départ avant 11h00.",textEn:"Checkout before 11:00 AM."},
    {id:"r3",icon:"👥",titleFr:"Capacité maximale",titleEn:"Maximum capacity",textFr:"6 personnes maximum.",textEn:"6 guests maximum."},
    {id:"r4",icon:"🚭",titleFr:"Non-fumeur",titleEn:"No smoking",textFr:"Il est strictement interdit de fumer à l'intérieur de la villa.",textEn:"Smoking is strictly prohibited inside the villa."},
    {id:"r5",icon:"🏊",titleFr:"Piscine privée",titleEn:"Private pool",textFr:"La piscine est privée. Pas de portail ou de verrou - vigilance requise avec les enfants.",textEn:"Pool is private. No gate or lock - supervision required with children."},
    {id:"r6",icon:"📹",titleFr:"Caméras de sécurité",titleEn:"Security cameras",textFr:"La villa est équipée d'un système de vidéosurveillance extérieure 24h/24.",textEn:"The villa has exterior CCTV security cameras operating 24/7."},
    {id:"r7",icon:"🔒",titleFr:"Système d'alarme",titleEn:"Alarm system",textFr:"La villa est protégée par un système d'alarme. Instructions fournies à l'arrivée.",textEn:"The villa is protected by an alarm system. Instructions provided on arrival."},
    {id:"r8",icon:"✈️",titleFr:"Idéalement situé",titleEn:"Ideal location",textFr:"L'aéroport est à seulement 8 minutes de la villa - idéal pour les arrivées et départs.",textEn:"The airport is only 8 minutes from the villa - ideal for arrivals and departures."},
    {id:"r9",icon:"🌿",titleFr:"Écologie",titleEn:"Eco-friendly",textFr:"L'eau chaude est produite par panneau solaire pour une approche plus écologique.",textEn:"Hot water is solar-powered for a more ecological approach."},
    {id:"r10",icon:"🧹",titleFr:"Propreté",titleEn:"Cleanliness",textFr:"Merci de laisser la villa propre à votre départ. Le linge est inclus sans frais supplémentaires.",textEn:"Please leave the villa clean on departure. Laundry is included at no extra cost."},
  ],
  amenities:[
    {id:"a1",icon:"🌊",nameFr:"Vue sur la mer",nameEn:"Sea view"},
    {id:"a2",icon:"🏖️",nameFr:"Accès plage privée",nameEn:"Private beach access"},
    {id:"a3",icon:"🏊",nameFr:"Piscine privée",nameEn:"Private pool"},
    {id:"a4",icon:"🛏️",nameFr:"3 chambres (6 pers.)",nameEn:"3 bedrooms (6 guests)"},
    {id:"a5",icon:"🚿",nameFr:"2 salles de bain privatives",nameEn:"2 private bathrooms"},
    {id:"a6",icon:"📶",nameFr:"WiFi rapide - 54 Mb/s",nameEn:"Fast WiFi - 54 Mb/s"},
    {id:"a7",icon:"🍳",nameFr:"Cuisine équipée",nameEn:"Fully equipped kitchen"},
    {id:"a8",icon:"🧺",nameFr:"Lave-linge (inclus)",nameEn:"Washing machine (included)"},
    {id:"a9",icon:"❄️",nameFr:"Climatisation",nameEn:"Air conditioning"},
    {id:"a10",icon:"☀️",nameFr:"Terrasse vue mer",nameEn:"Sea-view terrace"},
    {id:"a11",icon:"🌿",nameFr:"Eau chaude solaire",nameEn:"Solar hot water"},
    {id:"a12",icon:"📹",nameFr:"Vidéosurveillance ext.",nameEn:"Exterior CCTV"},
    {id:"a13",icon:"🔒",nameFr:"Système d'alarme",nameEn:"Alarm system"},
    {id:"a14",icon:"🔑",nameFr:"Self check-in (boîtier)",nameEn:"Self check-in (lockbox)"},
    {id:"a15",icon:"✈️",nameFr:"8 min de l'aéroport",nameEn:"8 min from airport"},
    {id:"a16",icon:"🏅",nameFr:"Superhost ★ 4.99 (149 avis)",nameEn:"Superhost ★ 4.99 (149 reviews)"},
  ],
  faqs:[
    {id:"f1",qFr:"À quelle heure est le check-in ?",qEn:"What time is check-in?",aFr:"Le check-in est entre 8h00 et 21h00. C'est un self check-in via boîtier à clé - pas besoin de nous attendre sur place !",aEn:"Check-in is between 8:00 AM and 9:00 PM. It's a self check-in via lockbox - no need to wait for us!"},
    {id:"f2",qFr:"À quelle heure est le check-out ?",qEn:"What time is checkout?",aFr:"Le départ est avant 11h00. Pour un départ tardif, contactez-nous à l'avance.",aEn:"Checkout is before 11:00 AM. For a late checkout, contact us in advance."},
    {id:"f3",qFr:"Combien de personnes peuvent séjourner ?",qEn:"How many guests can stay?",aFr:"La villa accueille jusqu'à 6 personnes dans ses 3 chambres.",aEn:"The villa accommodates up to 6 guests in its 3 bedrooms."},
    {id:"f4",qFr:"La villa est-elle proche de l'aéroport ?",qEn:"Is the villa close to the airport?",aFr:"Oui ! L'aéroport international Sir Seewoosagur Ramgoolam est à seulement 8 minutes - idéal pour les arrivées tardives et les départs matinaux.",aEn:"Yes! Sir Seewoosagur Ramgoolam International Airport is only 8 minutes away - ideal for late arrivals and early departures."},
    {id:"f5",qFr:"La piscine est-elle privée ?",qEn:"Is the pool private?",aFr:"Oui, la piscine est exclusivement réservée aux occupants de la villa. Attention : pas de portail de sécurité, surveillance recommandée avec les enfants.",aEn:"Yes, the pool is exclusively for villa guests. Note: no safety gate, supervision recommended with children."},
    {id:"f6",qFr:"Y a-t-il de l'eau chaude ?",qEn:"Is there hot water?",aFr:"Oui, la villa dispose d'un chauffe-eau solaire pour une approche écologique. Eau chaude disponible en continu.",aEn:"Yes, the villa has a solar water heater for an eco-friendly approach. Hot water available continuously."},
    {id:"f7",qFr:"Le linge de maison est-il fourni ?",qEn:"Is household linen provided?",aFr:"Oui, le linge de lit et les serviettes sont fournis. L'utilisation du lave-linge est incluse sans frais supplémentaires.",aEn:"Yes, bed linen and towels are provided. Use of the washing machine is included at no extra cost."},
    {id:"f8",qFr:"Y a-t-il des caméras de sécurité ?",qEn:"Are there security cameras?",aFr:"Des caméras de vidéosurveillance extérieure sont présentes sur la propriété et fonctionnent 24h/24. Elles couvrent uniquement les extérieurs.",aEn:"Exterior security cameras are present on the property and operate 24/7. They cover exterior areas only."},
  ],
  alerts:[],
  pages:[
    {id:"welcome",titleFr:"Bienvenue",titleEn:"Welcome",icon:"🏡",contentFr:"Bienvenue au P'tit Bouchon !",contentEn:"Welcome to P'tit Bouchon!",align:"center",valign:"center",image:"",video:"",type:"welcome"},
    {id:"villa",titleFr:"La Villa",titleEn:"The Villa",icon:"🌊",align:"left",valign:"top",
     image:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png",
     video:"",type:"custom",
     contentFr:"Villa P'tit Bouchon - Face à la Mer\n\nFace au lagon, avec une vue extraordinaire sur la mer et la plage publique, cette superbe villa accueille jusqu'à 6 personnes dans ses 3 chambres et sa piscine privée.\n\n🏠 L'espace\nRez-de-chaussée : salon, salle à manger intérieure/extérieure, cuisine ouverte, WC, une chambre avec vue piscine.\n\nPremier étage : chambre master avec grand dressing, terrasse et salle de bain privative. Deuxième chambre avec dressing, WC et salle de bain. Toutes les chambres du 1er étage ont vue sur la mer.\n\nℹ️ À savoir\n• Piscine privée\n• Aéroport à 8 minutes\n• Vidéosurveillance extérieure 24h/24\n• Eau chaude solaire\n• Linge inclus sans frais\n\n⭐ Superhost - Note 4.99/5 · 149 avis",
     contentEn:"Villa P'tit Bouchon - Facing the Sea\n\nFacing the lagoon, with extraordinary views of the sea and the public beach, this stunning villa accommodates up to 6 guests in its 3 bedrooms and private pool.\n\n🏠 The Space\nGround floor: living room, indoor/outdoor dining room, open kitchen, WC, one bedroom with pool view.\n\nFirst floor: master bedroom with large walk-in wardrobe, terrace and private bathroom. Second bedroom with wardrobe, WC and bathroom. All first floor rooms have sea views.\n\nℹ️ Good to know\n• Private pool\n• Airport 8 minutes away\n• Exterior CCTV 24/7\n• Solar hot water\n• Laundry included free\n\n⭐ Superhost - Rating 4.99/5 · 149 reviews"},
  ],
  videos:[
    {id:"v1",titleFr:"Visite de la villa",titleEn:"Villa tour",url:"",thumbFr:"",thumbEn:""},
  ],
  villaPhotos:[
    "https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/9a649f48-0524-4b61-8a22-551339452624.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/dd8ce4b6-f209-4f4a-b3a7-75210beffcd2.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/8118c41b-9ddc-41e4-a5bb-fcc376265c5a.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/d5d4fbd3-efd0-47f9-8d56-b685a1666e39.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/48ca3363-09cf-41cf-88d8-982ef9f19d07.png",
    "https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/4e1315c5-f830-4fdf-a0bf-3bcc8c465b10.jpeg",
  ],
  itineraries:[
    {id:"i1",icon:"🏖️",nameFr:"Journée Plages",nameEn:"Beach Day",descFr:"Le meilleur des plages mauriciennes en une journée",descEn:"The best Mauritian beaches in one day",color:"#1b6ca8",
     steps:[{timeFr:"8h",timeEn:"8am",textFr:"Petit-déjeuner à la Boulangerie Blé D'or (Plaine Magnien)",textEn:"Breakfast at Blé D'or Bakery (Plaine Magnien)"},{timeFr:"9h30",timeEn:"9:30am",textFr:"Blue Bay Beach - eau cristalline, parc marin protégé (20 min)",textEn:"Blue Bay Beach - crystal water, protected marine park (20 min)"},{timeFr:"12h",timeEn:"12pm",textFr:"Déjeuner au restaurant Les Copains d'Abord (vue mer)",textEn:"Lunch at Les Copains d'Abord (sea view)"},{timeFr:"14h",timeEn:"2pm",textFr:"Snorkeling - Angel Cruises Speedboat aux îlets",textEn:"Snorkeling - Angel Cruises Speedboat to the islets"},{timeFr:"17h",timeEn:"5pm",textFr:"Pointe D'Esny Beach - coucher de soleil magique",textEn:"Pointe D'Esny Beach - magical sunset"},{timeFr:"19h30",timeEn:"7:30pm",textFr:"Apéritif sur la terrasse de la villa face au lagon",textEn:"Aperitif on the villa terrace facing the lagoon"}]},
    {id:"i2",icon:"🌿",nameFr:"Nature & Cascades",nameEn:"Nature & Waterfalls",descFr:"Forêts tropicales, cascades et panoramas de l'Île Maurice",descEn:"Tropical forests, waterfalls and panoramas of Mauritius",color:"#2e7d32",
     steps:[{timeFr:"7h",timeEn:"7am",textFr:"Départ matinal - pique-nique et chaussures de rando",textEn:"Early start - picnic and hiking shoes"},{timeFr:"9h",timeEn:"9am",textFr:"Lion Mountain Trail - randonnée panoramique (2h30)",textEn:"Lion Mountain Trail - panoramic hike (2h30)"},{timeFr:"12h",timeEn:"12pm",textFr:"Déjeuner à Mahebourg Waterfront",textEn:"Lunch at Mahebourg Waterfront"},{timeFr:"14h",timeEn:"2pm",textFr:"Tamarind Falls / 7 Cascades - baignade naturelle",textEn:"Tamarind Falls / 7 Cascades - natural swimming"},{timeFr:"17h",timeEn:"5pm",textFr:"La Vallée de Ferney - faune et flore endémiques",textEn:"Ferney Valley - endemic fauna and flora"}]},
    {id:"i3",icon:"🍹",nameFr:"Rhum & Gastronomie",nameEn:"Rum & Gastronomy",descFr:"Culture mauricienne, rhum et saveurs locales",descEn:"Mauritian culture, rum and local flavors",color:"#c47a3a",
     steps:[{timeFr:"9h",timeEn:"9am",textFr:"Mahebourg Market - fruits, épices et artisanat local",textEn:"Mahebourg Market - fruits, spices and local crafts"},{timeFr:"11h",timeEn:"11am",textFr:"Bois Chéri Tea Factory - visite guidée + dégustation thé",textEn:"Bois Chéri Tea Factory - guided tour + tea tasting"},{timeFr:"13h",timeEn:"1pm",textFr:"Déjeuner au restaurant Bois Chéri, vue panoramique",textEn:"Lunch at Bois Chéri restaurant, panoramic view"},{timeFr:"15h",timeEn:"3pm",textFr:"La Vanille Nature Park - tortues géantes et crocodiles",textEn:"La Vanille Nature Park - giant tortoises and crocodiles"},{timeFr:"18h",timeEn:"6pm",textFr:"Dégustation rhum mauricien à la villa",textEn:"Mauritian rum tasting at the villa"}]},
  ],
  categories:[{id:"restaurants",nameFr:"Restaurants",nameEn:"Restaurants",icon:"🍽️",color:"#e07b54",items:[{"id": "5u99mtyl", "nameFr": "Tasty Wave Restaurant & Shop", "nameEn": "Tasty Wave Restaurant & Shop", "descFr": "Cuisine mauricienne et internationale dans un cadre décontracté face à la mer. Fruits de mer frais et cocktails maison recommandés.", "descEn": "Mauritian and international cuisine in a relaxed seafront setting. Fresh seafood and homemade cocktails highly recommended.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4649777,57.6790912", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyBmQXKbFtl6_aR5WuJee_L5-rJCazgpkrG2uTET3T40HofC7OUVPsw5iL1313GMGQuAkOWLp-6l-mAtNu8s88RDvnWnBM0-ScW9MRYikUnIdFx9Qts7OTnwJafcJdtXfHqpN7WXd6wIdt484NW_aHA0C5SvHvi0I_4D7ocWy9fneH0O2C8Or0ISvF9E_t9TTl76IJZE-o794sHA-FkVsIua1FtfLyTmD28F3RYHKq-joBKz2H-COykZYA?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "rg1vbsp4", "nameFr": "The Viking Resto", "nameEn": "The Viking Resto", "descFr": "Restaurant populaire de Mahebourg proposant une cuisine locale généreuse. Poissons grillés et currys mauriciens à prix abordables.", "descEn": "Popular Mahebourg restaurant offering generous local cuisine. Grilled fish and Mauritian curries at affordable prices.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4675284,57.6803021", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx5rCpRT-I_if-0nrnxyyjb11hhSNAz2K8qN7JxegPHvPnzs4joKdzkj6XkCsIxV8FzH4PE0R5k9jESEO4RTnmzsFQkP2uA9nigjWY0j5F7sZTCcWk-u2fueJNpcnU2o9zQ7FkOvh0oEFDl41x0WLemYrv7xdKZCEHI7LgBVzQ79MxPB5Blwhy85Phi1cB19mkLY6NL3fHB?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "j0dj5hsa", "nameFr": "Blue Bamboo", "nameEn": "Blue Bamboo", "descFr": "Ambiance asiatique fusion dans un cadre soigné. Cuisine sino-mauricienne raffinée, idéale pour un dîner en amoureux.", "descEn": "Asian fusion atmosphere in a refined setting. Sophisticated Sino-Mauritian cuisine, ideal for a romantic dinner.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4398928,57.7224388", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwggWhYGphFqQ-kTvo1tO6WWEDxWhb1nxfdc--WjFhHwcuXQej-yBUvmaq8lZ6u4V1VlWkbZm0GU6_XnlslXpr-HnSuiXwLphGEAVy4kmcBBb9h7u3QW_aR1jvNIMb8CZ7DjSOzDRW7jMkC3SazVRutdjalBz2aHib5DIsWjz0kVt7GkOnfnbnVyMx9UdsEFVX9FiSXkR47QQ?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "o958lxwv", "nameFr": "Les Copains d'Abord", "nameEn": "Les Copains d'Abord", "descFr": "Restaurant emblématique de Mahebourg avec vue sur le lagon. Fruits de mer frais et cuisine créole authentique dans une ambiance conviviale.", "descEn": "Iconic Mahebourg restaurant overlooking the lagoon. Fresh seafood and authentic Creole cuisine in a warm atmosphere.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4086472,57.7099861", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyfMZLsa7k3VLL9aby6kvAKde6YmjwK0EMbw94VjEiv2ZR5gAVWtxSrxALMqcEvGNk-WJ_9BFjJaFakxCGYE7pGDojqfmGL3HSN7bFNbGzSxbYxZlDIw6yWdk1xxAaK1qYojDKTOo1Tt-ai-DQNjkfPr32hUpgCL73IlIYPhz26bnSdlWRrlmiPdc1A3wlLDjFGs8z32CYH?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "r9w1hp3m", "nameFr": "Le Bazilic", "nameEn": "Le Bazilic", "descFr": "Cuisine créole et internationale dans un cadre tropical luxuriant. Steaks, grillades et spécialités locales dans une ambiance chaleureuse.", "descEn": "Creole and international cuisine in a lush tropical setting. Steaks, grills and local specialties in a warm atmosphere.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4078267,57.7072607", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxOl16mlKVeLo0il8UHjsaZKBwP4Xi_aNOwitllmKgzm7e6tmNOQzkZ5gr7jiagsE4ttETo8FnjI1oNI3nS_E-TaqjeBGbZjgUVUbTugLKrXag64A-l22TKZ3SnbRzqFX4qF0iP-lHeZrjnDktEIItsO22eudT7fGCc2MdsdE5BHNFTkkQ-_DBJh1B1xWDb5Sq7dWaJOV-F0Q?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "t2uqho27", "nameFr": "Taste of Freedom", "nameEn": "Taste of Freedom", "descFr": "Restaurant animé avec une carte variée, burgers et plats mauriciens. Ambiance festive et service décontracté.", "descEn": "Lively restaurant with a varied menu, burgers and Mauritian dishes. Festive atmosphere and relaxed service.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4200524,57.712124", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwM87jqemKHhbZKbjqXCxMskmSziXuJc8bwwhnPXrfuFVgV6jMQeXJdBiuAZF_P2erXMhGx-oUyXg4RyPRiQeqxM_WcxFoTZ8OK8nx4GXA8CUToHFYo9d8GHoAiDmcRYKe1x9S_X5zldrslpft6bCGoYTChbmIPwwI9H08m_XAN3qDcZdz1EsdxiEcci42nPuFP_-19XOlraHuLKBskMiDjg__ES_2Mct56BeO-qcIJRAoQ69h3oFiHQW0?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "xbxuy9m4", "nameFr": "Le Jardin de Beau Vallon", "nameEn": "Le Jardin de Beau Vallon", "descFr": "Dîner romantique dans un jardin tropical exceptionnel. Cuisine mauricienne et internationale raffinée dans un cadre enchanteur.", "descEn": "Romantic dining in an exceptional tropical garden. Refined Mauritian and international cuisine in an enchanting setting.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4247573,57.7011188", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwBFW6c5b57W2hEMTSyoxYHNK9fpeveYl07p4vHfOn91FT_yuxse_3DZ0X_iZJT99B0oLUrhCFvkT60kEVAbKHCNsUFGJAw77dPQvULaB1ujRcHs1rNWa0guscE8dxVfuwBKvMpUG03dpN5H8em7__4oRkTQF5Nl_HhmGOlJLIlOt6UegGl7gsGe2KGetqMRt1IlqljUDMyi8o-0kgebnzAEK94TVp58jHrTITh98gyh5JRMbOuC_c2How?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "0xg2upzz", "nameFr": "Karay Mario", "nameEn": "Karay Mario", "descFr": "Spécialiste du karay mauricien, ouvert uniquement le midi. Recettes familiales authentiques, très prisé des locaux.", "descEn": "Mauritian karay specialist, open for lunch only. Authentic family recipes, very popular with locals.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4221666,57.7011904", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzVFBj5r3qXXqAhGKqZr60y8Jr79Ymuk-QzgP-rDxq2DpvWYpe3ieYKJoIUh7Efj0PZaXv0-HajATPY79kLTl9-89mR6TnccPrCJb7yuvf3dNssGPYTIbjmocSm8mxsEmy1-knX6DUMbzcopeuhkbQOetxKK7fAKD2jDxLPjExn9CpswY_ErUmAcoXToWjJTA6qvsX5B4E1?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "yu099poo", "nameFr": "Casse Croute", "nameEn": "Casse Croute", "descFr": "Petit restaurant local sans prétention pour goûter la vraie cuisine mauricienne. Mine frite, bol renversé et dholl puri maison.", "descEn": "Unpretentious local eatery to taste real Mauritian food. Fried noodles, bol renverse and homemade dholl puri.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4063472,57.7074128", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gze-OLA1vXb_IokFkhZ_Jf_mbM5qdNizUSBhT0NKGTfMawO1E7onvOs_6_ugWReDHRWdRm_0XNE3pRuGUVoCRZZz_iniZbPT2D09WNzICbsYK3kcdpNb_vk5xwH3IXESazNXVylBKrYP2kd644MhmUZZ3iriJOI6i5IqR34vgIjbC6dWeIyveAPKWPy0HtqtiRzWXYDzz62?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "uhurw6i7", "nameFr": "Esco Burgers", "nameEn": "Esco Burgers", "descFr": "Burgers artisanaux généreux et frites fraîches. Concept street food moderne dans une ambiance jeune et décontractée.", "descEn": "Generous craft burgers and fresh fries. Modern street food concept with a young, relaxed vibe.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4431869,57.7175653", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwrHGKH4NH6Az0ZBF-v1r_fzq3PjZyPnNN8O4aZapJV1imENY-5zgPmvPLBqVQ1C-qVEt-HSIemg16sfIdHRuTSHWATLbLg5r5qeSnJEuVA76NiOoUtCXd7WcYa1A0RF--q5q8a-L14mV36JqZO3DlhgJFUveH1LUPBXKHMiyfeNm_UAnp0qNyMi18zvbC8LxNTjHAUuuiv?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "c4hxn8yz", "nameFr": "Kot Nini Pizza & Delivery", "nameEn": "Kot Nini Pizza & Delivery", "descFr": "Pizzas artisanales avec livraison disponible. Idéal pour une soirée tranquille à la villa.", "descEn": "Pizzas artisanales avec livraison disponible. Idéal pour une soirée tranquille à la villa.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4086937,57.708871", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GztArj-_q0ZXDMxZrBTlbMfYGSgdLbgE_5QTBbMSxmakOJWn7c32sVNx_T_cwWrhdV4alw1E6beILbTbjDRhM7McPLPh3MGZQmYZ_nEy7mF3HntE2gIYw_0LrphGe2MV0srvLS8EqqR-2YfmuBcNjqC40NG3448ZzfrISvTjtFY1Rt5tvkYX8NDGhLEH4Aql2G-4QnsvshX?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "pb3e3c1g", "nameFr": "Ferney Falaise Rouge Restaurant", "nameEn": "Ferney Falaise Rouge Restaurant", "descFr": "Restaurant niché dans la vallée de Ferney, cadre naturel exceptionnel. Cuisine créole et grillades dans un environnement verdoyant.", "descEn": "Restaurant nestled in Ferney Valley with an exceptional natural setting. Creole cuisine and grills in a lush green environment.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.38372,57.7027746", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwRhGTClhlmODONm7YZEOc7xMXviXYEVeGk4iGeZRwNz7Dqi_2h1vMT4D5SEhsTEq_4JOiSdQm0S82l1KAlvGaYcJz7Klmhzp0mAiycqKm4lq_A5M2ZDlqZLYEjIYKcJZwha5O2vgaK3A49cUB47VIA8FaedLPQdDOoqM7qv8pLYBQ-FA6r2NEqLhA7vWnSpyAgSdEBHmlg?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "tvp0mhja", "nameFr": "Chez Patrick", "nameEn": "Chez Patrick", "descFr": "Restaurant familial très apprécié pour ses fruits de mer frais et sa cuisine mauricienne authentique. Service chaleureux et prix raisonnables.", "descEn": "Highly regarded family restaurant known for fresh seafood and authentic Mauritian cuisine. Warm service and reasonable prices.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4147416,57.7048917", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyNAV-_8S8DUTlSp98qxNsat1XRbCdRFaQ2A5uGzIYWj742WULylFiKvZt3Wp2hvpteTKL5NkA1OJ1c94NL575ajIWmoTGPWgDkil7ZAQw7tfN3XwZE3ldYwTAiPQ0Io1Dch_v8SRD0k_LBht_dK8nRQpe3suFYxtrC8awXmmvCNiGdMghO3SIv7u37Ko_oZqTIbLfa7OgOkS9rrplsrleGsxED3iiRoy5r1REAJPTe3QbBLYgCowuVSDg?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "kohwiumx", "nameFr": "Saveurs de Shin", "nameEn": "Saveurs de Shin", "descFr": "Restaurant sino-mauricien proposant spécialités chinoises et créoles. Cadre simple, portions généreuses et saveurs authentiques.", "descEn": "Sino-Mauritian restaurant offering Chinese and Creole specialties. Simple setting, generous portions and authentic flavours.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4089579,57.7092873", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzPKko6lVFBfhU1nNO8OLeo-1YvKlWVEkb8KOAWC9sHUts6XlD8sYOLmHer1cVC9g2jXPyWqIV-bQSweQUmWeuYGLCp85ivh_f3Zwbf91D9cayyN5MkKo55ZONeUlAREJBSHctc0Q5Ox5ZLDbzJgkgclOicigPhPm-Wu3t6YzCBGBmV6tPxIREghZ92eoaOdV4u4r5guhl2?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "zojlgm9o", "nameFr": "Nayaz Briyani", "nameEn": "Nayaz Briyani", "descFr": "Le meilleur briani de Mahebourg selon les locaux. Cuisine halal, riz basmati parfumé et viandes mijotées.", "descEn": "The best biryani in Mahebourg according to locals. Halal cuisine, fragrant basmati rice and slow-cooked meats.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4317525,57.6591153", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxY-GJVjKgIxMZrVBlysN85vDe9GFotOi_FE5Dd-ipd_p9gjyNTKADCEAAvNb7N3c5_VQpRtq7PapHGDRrK39omcFC5EtHoZTmimBgRoReoDIf2xBCwPgF8EzrEYFUvfIS43FQb1x-eywU4ok6CNDcUsuSFJ88mxOPjXcSDgtqpyHvoif_XhyaxKz96pvuWLOe9yRwyo0_z?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "yehbhqrx", "nameFr": "Bois Chéri", "nameEn": "Bois Chéri", "descFr": "Restaurant panoramique au coeur des plantations de thé. Vue imprenable sur le sud de l ile et cuisine mauricienne raffinee.", "descEn": "Panoramic restaurant in the heart of the tea plantations. Breathtaking views over the south of the island and refined Mauritian cuisine.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4281959,57.5223388", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxximfaEcSAB7yxgorGADnKtNTdJY8ic5TyT45OIKkOZWLtegwV0-z9USzsDIy65wa1Cj3rAREh3gxamSap8YTK-ac6msV8vNY_vmKYO3IcTee4ZacD3YcUdBYgwXKvdsaiioP6fbv3YxHUkXOsfoLFHADxnXGi8_MWFWaDnQIJAXjcNun5q2-RPKCo5hiizJiYXRWYPU_FyFq0EFwoUXVIjihEUXD_q_RXpWw4q-C00znuHRmbLM7Unek?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "6i349gef", "nameFr": "Shandrani Beachcomber Resort & Spa", "nameEn": "Shandrani Beachcomber Resort & Spa", "descFr": "Resort 5 étoiles tout-inclus sur une presqu'île privée. Plusieurs restaurants gastronomiques, plages privées et spa de luxe.", "descEn": "5-star all-inclusive resort on a private peninsula. Several gourmet restaurants, private beaches and luxury spa.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4487013,57.7066407", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "pivrbetw", "nameFr": "Anantara Iko Mauritius Resort & Villas", "nameEn": "Anantara Iko Mauritius Resort & Villas", "descFr": "Resort de luxe contemporain face au lagon de Blue Bay. Cuisine internationale raffinée, villas avec piscine privée et spa.", "descEn": "Contemporary luxury resort facing the Blue Bay lagoon. Refined international cuisine, pool villas and spa.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4514196,57.7003115", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "xh41dkrt", "nameFr": "Restaurant Le Bougainville", "nameEn": "Restaurant Le Bougainville", "descFr": "Restaurant créole avec terrasse vue mer et ambiance authentique. Spécialités de poissons grillés et currys locaux.", "descEn": "Creole restaurant with sea-view terrace and authentic atmosphere. Grilled fish specialties and local curries.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4446519,57.7179472", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "dkl5ff57", "nameFr": "McDonald's Beau Vallon", "nameEn": "McDonald's Beau Vallon", "descFr": "McDonald's dans le centre commercial de Beau Vallon. Repas rapide et accessible pour toute la famille.", "descEn": "McDonald's at Beau Vallon shopping centre. Quick and accessible meals for the whole family.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4240075,57.6988851", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "k4j67zpn", "nameFr": "KFC Mahebourg", "nameEn": "KFC Mahebourg", "descFr": "KFC au coeur de Mahebourg. Poulet croustillant et menus rapides pour toute la famille.", "descEn": "KFC in the heart of Mahebourg. Crispy chicken and quick meals for the whole family.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4064426,57.7081528", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "2sez6c74", "nameFr": "l'Ajoupa Pub - Restaurant", "nameEn": "l'Ajoupa Pub - Restaurant", "descFr": "Pub et restaurant convivial avec ambiance locale. Bières fraîches, grillades et cuisine mauricienne.", "descEn": "Pub et restaurant convivial avec ambiance locale. Bières fraîches, grillades et cuisine mauricienne.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4102622,57.7098741", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwPXHf4GfgP1m_KvO7nc8g1qyIarLYnTVKk04UEmUcVlliUKrW4YxgMWJ_GYXpS9MiErEmtMCoQ3JfdGcVR50HllSoWdC6KfqA-dqBFN4BcmdMTC7uMPq1ZWqQEv9xHZSiHRn1KZNN0pYuX6ZADLvH5XF578QIg9TztiXXSYGkzz_pvJ0Jxq9nYrnMphD94slArS25OnYbS?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "e41jy9ge", "nameFr": "Avalon Golf Estate", "nameEn": "Avalon Golf Estate", "descFr": "Domaine de golf haut de gamme dans un cadre tropical. Parcours 9 trous et restaurant avec vue panoramique.", "descEn": "Upscale golf estate in a tropical setting. 9-hole course and restaurant with panoramic views.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4369266,57.5141254", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxhEHD3jfK0UIwK76Zs1gNw86mm-FRknrH6MjH1GWc0A33dIkoSa64Cx3FgwvX1lHY9oqaAuRyLDdavxg5LrHcEbvHBScyB7KxXOf0jleOdM-wDN9LAADXQOKs1huVna-ZR_-JBgxN2dVXL1mNNJavybr_FLbg_oHMTBo0lhCQ8GPQFgWYgu-rqzCtGbSJvzOyV7HFGI1SZBglCXfYDOde9da8rTt1wybO7eZtt3RNtzJ8-skwfVWyrH_w?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"plages",nameFr:"Les Plages",nameEn:"Beaches",icon:"🏖️",color:"#1b6ca8",items:[{"id": "9xpsj165", "nameFr": "La Cambuse Beach", "nameEn": "La Cambuse Beach", "descFr": "Plage sauvage et préservée face au lagon turquoise. Idéale pour se baigner loin des foules, avec une vue imprenable sur l'horizon.", "descEn": "Unspoilt wild beach facing the turquoise lagoon. Perfect for swimming away from the crowds, with stunning views to the horizon.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4534568,57.6995888", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzTKnB0CDq1pC0x2tqfdreOSsibgwBSU6JCRN31W8lkLZq53QM0oAme3L-rztLdEzvqqUkUKcbDQwVDmLMwJZABCNyz13Sy3z-E0z_2nwC9n3-ufYMAS6nzFrOOBSvwDSyxlgI9uhOWJFd69ywN_TcFXdD-4-4-VyiIfmmkedyj-qTSKopDAKC0Q-CewY_SyoAXcG9u0o-jIQ?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "e0qvml9z", "nameFr": "Shandrani Beach", "nameEn": "Shandrani Beach", "descFr": "Plage privée 5 étoiles bordée de filaos. Eaux calmes et cristallines, cadre tropical exceptionnel.", "descEn": "Plage privée 5 étoiles bordée de filaos. Eaux calmes et cristallines, cadre tropical exceptionnel.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4453272,57.7029955", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx6F3sHaVuFgAzxWv3yADbwcGD3eana1YUpKYz30UUhT9FWeVUvJNBtjSD9E0cSQOT4pc3RqwCHxlEuW9QPA9Ye3MIhaB3jmq6AwjotcB6iFDF-dw1bsH4z0pQ7WV1YgAF75wPIEQGYXVuP5158b0MyLReF1Aa0zRiDnC2gDLiHiYCVJQnhH8ZftgKVdQdhkNrAoA24bqQ5Bddmhr5wGQTeWBSayXiGRykeOPIpXUDPkKYwk1osyFWBhgY?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "51dynmfh", "nameFr": "Blue Bay Beach", "nameEn": "Blue Bay Beach", "descFr": "L'une des plus belles plages de l'Île Maurice, aux eaux d'un bleu lagon extraordinaire. Porte d'entrée du parc marin protégé.", "descEn": "One of Mauritius's most beautiful beaches with extraordinary lagoon-blue waters. Gateway to the protected marine park.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4441928,57.7164692", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzilvNpqAUTreFEc7rLqQ5X3DIzCI7LyQVtzMqcbomUZW1K5o1B8tBPkee4uO3k18sDU7qaWmIO_Ik4E6UTHcWQ5b-7K0Xu8Jvzaqs6rUZBYPddYns_5WRSsSotv85Le2ufwOyi61Ux2p7vGyB_lh_EL_02EcO40BAI7FT11fXURKKNUksFY2164lsXhQli94O10vk7wAu-?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "jtal4nlj", "nameFr": "Pointe D'esny Beach", "nameEn": "Pointe D'esny Beach", "descFr": "Plage tranquille classée parmi les plus belles de l'ile. Couchers de soleil magiques et eau transparente.", "descEn": "Plage tranquille classée parmi les plus belles de l'ile. Couchers de soleil magiques et eau transparente.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4265134,57.7263732", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzcIXjZtLhSMGzk3unzYOhdUft828au4WPQ8AViox0biCm8QyOfPLRW3jYh5g68IZhqm3X8U8r6Jdfjawh9OHTgfyjoY5wZIFFPGNon7376e8p3OBhzmk5fXkrtwYswpKrZq7Qo6Twj5y1QZiUiMA2qBFkHaiQgj73HnG7FmHkrlq1NKUVylkhX--MlPq4hNFHJ1w4OjkLd?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "533il2qg", "nameFr": "Pomponette Plage Publique", "nameEn": "Pomponette Plage Publique", "descFr": "Plage publique authentique dans le sud de l'île, prisée des locaux. Sable blanc, eau calme et ambiance détendue.", "descEn": "Authentic public beach in the south of the island, popular with locals. White sand, calm water and a relaxed atmosphere.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.5164027,57.4766148", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxCGtrkauBvskq-06pWWSw-4PnCcq3r1BXaAVwCHAUlcaUNoKK2Kl9Xxydkmfw-RFusDShBpvbv1SRAyNKuMxaIvbIXbmzjPCA19O2VqelKrKjNKxqwsQf1EXtSI-fhaaJDiymg1SIfpHlfIHKNpNBWKL81awtoM847venye-bjNX_0UZT7aXHqbystujXaKrGAU4zhFlS6Kw?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"supermarches",nameFr:"Supermarchés",nameEn:"Supermarkets",icon:"🛒",color:"#2e7d32",items:[{"id": "25vii6um", "nameFr": "Bo'Valon Mall", "nameEn": "Bo'Valon Mall", "descFr": "Centre commercial moderne avec supermarché, boutiques et restauration rapide. Idéal pour vos courses à Beau Vallon.", "descEn": "Modern shopping centre with supermarket, shops and fast food. Ideal for your shopping in Beau Vallon.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4239324,57.6976711", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "hdpvyt7v", "nameFr": "Winner's Plaine Magnien", "nameEn": "Winner's Plaine Magnien", "descFr": "Supermarché bien achalandé à quelques minutes de la villa. Large choix de produits locaux et importés.", "descEn": "Well-stocked supermarket a few minutes from the villa. Wide choice of local and imported products.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4310008,57.6658883", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "4s7zh9ih", "nameFr": "Small Shop / Petite Boutique", "nameEn": "Small Shop / Petite Boutique", "descFr": "Petite épicerie de proximité pour les achats de dépannage. Boissons, snacks et produits essentiels.", "descEn": "Small convenience store for emergency shopping. Drinks, snacks and essential products.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4627449,57.6785882", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "fssqpdgc", "nameFr": "London Way", "nameEn": "London Way", "descFr": "Boutique locale proposant produits alimentaires et articles divers. Pratique pour les petites courses rapides.", "descEn": "Local shop offering food products and various items. Convenient for quick small purchases.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4175219,57.7100261", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "e4wrj7hm", "nameFr": "Market / Bazar", "nameEn": "Market / Bazar", "descFr": "Marché local animé avec fruits, légumes et épices frais de Maurice. Ambiance authentique et prix imbattables.", "descEn": "Lively local market with fresh Mauritian fruits, vegetables and spices. Authentic atmosphere and unbeatable prices.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4070303,57.7078519", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyOZcoF3DUsaq4Z4boHQLr81DggZY-0BbiZoEsXCTc77kgUUIfQddQ_e8ZSfcy3MxCEoU1Zf2b8Z5yvy5n8gZHRIplw-ZcH8FluGp8-AKzMT2UqBVtumxakkPC7d8REVZ5TU38tudGZ4CCBqaS9L5Y_3rQAjqs7dZEFz9wOcKPdg5IsV7r5GTdx8dJCd9hzVyeIc8y1j7G6?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "bzh4bdpq", "nameFr": "Shopping Market", "nameEn": "Shopping Market", "descFr": "Supermarché de quartier avec bon choix de produits alimentaires locaux et importés.", "descEn": "Neighbourhood supermarket with a good selection of local and imported food products.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4067477,57.708482", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "oc1800kl", "nameFr": "Loyeung Supermarket", "nameEn": "Loyeung Supermarket", "descFr": "Supermarché sino-mauricien bien fourni avec spécialités asiatiques. Produits frais et épices exotiques.", "descEn": "Well-stocked Sino-Mauritian supermarket with Asian specialties. Fresh produce and exotic spices.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4098151,57.7094238", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxWdxncA54G3oSD2IxTFHOlvYjn3KnwriGDZpipnYkl2M6PorxK6E6O0EtR2d8-eWuIxNMJ4rstzgGNim3KMr0sLHzWDVNirv_4vYJqvZWaNsN2TwHVz1hUGwWl_0bbUpYQ2ROlk0a1pt6eK9dr0NR9i8f3TIW_QdBhFssB615ZyzADvKreDk0AEAZGL9ybB-lHA1s-WVeKaXsnqVePoEe7UngwGbZuAXXSbC5cXfhHSSvS37A0DBR6DaE?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "zk1xorej", "nameFr": "Plaisance Shopping Village", "nameEn": "Plaisance Shopping Village", "descFr": "Centre commercial proche de l'aéroport avec grandes enseignes. Pratique pour les dernières courses avant le départ.", "descEn": "Shopping centre near the airport with major brands. Handy for last-minute shopping before departure.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.400411,57.598659", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gwx6ueT483tfsPSwDea-GjRIxGzaNM2ldAFYTkAt087c-l6OSPXV8eMNyW5Mt2TX99sDLWki9qbnpMzerg99meT_p_b3lJoBXrylKZEThUouWDsh7lbBKa5Kdx4VbO8qsnLnL1S6QqQfbXi6q9zEs2xYeoTqiFWTN220Ykn2OM6a2fNCpAX8O-OA8yeH9a2vVPqnCuGIjixHg0hxEyK08QfQ63WFa-gbD-ODYeIFNRqc4VN5Ig66iO7UJM?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "10rdqodt", "nameFr": "Intermart - Rose Belle Mall", "nameEn": "Intermart - Rose Belle Mall", "descFr": "Grand supermarché dans le mall de Rose Belle. Vaste choix de produits, boucherie et boulangerie.", "descEn": "Large supermarket in Rose Belle mall. Wide product range, butcher and bakery.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.3989692,57.5980038", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxeMRUe_bJss4tYjtCjAd72OlVl-eYsl-cMlYVNlCm2dLh-r5ExZ3_flI4Qx12ebPF7PdglytUBd2BO7c0ir0qBObGv9m2T4FtYjvjDv1-dWLHdDhKavZtF3C9v39egaEl_OTbOc3dVnoxENvsCTIAdWggmidO0b30VVAD__Rc5ne85exBABTZqBVEOXTA4CbnB34BwQ3NR410d_TGzDW0oY5SgAleSrazOeWk7vg-8xCqYfkv-zHzLIwU?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"activites",nameFr:"Activités",nameEn:"Activities",icon:"🤿",color:"#7b5ea7",items:[{"id": "ahmyl2ka", "nameFr": "Angel Cruises Speedboat", "nameEn": "Angel Cruises Speedboat", "descFr": "Excursions en speedboat vers Blue Bay, Ile aux Cerfs et les ilots. Snorkeling, barbecue sur plage privée et observation des dauphins.", "descEn": "Speedboat excursions to Blue Bay, Ile aux Cerfs and the islets. Snorkelling, barbecue on a private beach and dolphin watching.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4473342,57.7060676", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx2LWFmOktOE9EAuEiEiVIBMu7o0ZtVSgkolRsvc-Q7acdpjhb7wOnM_Akvo5Fcm_s3r9yErAdiNQf3VeuND46iu2mlsAIcdFrxX8RNei9tiMnv-Y1nbo4QIkVu4ImiYOI4jM03erG_Z8vSC0QSca94Re1nqqUsHfyX35RydViVg0CFOfeFkC_4irstoHF0-FUvz9tobZULWg?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "h72cpgat", "nameFr": "Quad Bike - Pont Naurel Quad Bike", "nameEn": "Quad Bike - Pont Naurel Quad Bike", "descFr": "Aventure en quad à travers les champs de canne à sucre jusqu'au Pont Naturel. Sensations fortes et paysages sauvages.", "descEn": "Quad bike adventure through sugar cane fields to Pont Naturel. Thrills and wild landscapes in the south.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4533487,57.6799323", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzexASM1bw7ivdxISByJ87eyqWhLHH6DBCa2KiYtbaxeTMc0UEWBfLfu7QAr1Mjo1yVq_4QGEPfnPWkSnkCB3Nhhmcf30Pqscip7vEtHTTsCESe1cawhwHh7khIc2VQhRSINI70NpaDuFUuTJ5vW67AlmUkAwhSnuMDI3845xRNhssqN1Ugs265AjZPLEcMMC8H8Mf2JeL8dw?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "o5xghn2r", "nameFr": "DS Adventures", "nameEn": "DS Adventures", "descFr": "Activités d'aventure et excursions sur mesure dans le sud de Maurice. Randonnées, kayak et découverte de la nature locale.", "descEn": "Adventure activities and tailor-made excursions in the south of Mauritius. Hiking, kayaking and local nature discovery.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4513559,57.6514577", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyxWuQ0yzAfvQjaDJNcHqjXVaN77y6tZKG9mctPciJbyL33w36DyuvPaBn89NGiobdM9YzuCQHCyav9dLsoiIo6FJnXB8DXLUUYKMtsppipH6urq2-_AIvV9la26DtpuHzCn9echXQJRKK9SEKv3IaoR-BHZeW05tQMVjxrKMGGKPQbA1rFehrrpKXFkIpT5d0kru1TkYwR?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "ltzoq45z", "nameFr": "Specialised Kiteboarding", "nameEn": "Specialised Kiteboarding", "descFr": "Ecole et club de kitesurf dans les meilleures conditions de vent de l'ile. Cours débutants et location de matériel.", "descEn": "Kitesurfing school and club in the island's best wind conditions. Beginner lessons and equipment rental.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4200943,57.7209395", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyhrL2miylmCvFC3UCQXPmM41YNS0W0u19yQTqahNXPpdxjJrAPz4HAsKa0uJofTcaEWi1P_OBWVFeD_0H0fgDdmgk4Uljt3tqpEGVgOV3sYAczNAKd1fkA8hugM7dGfn-G6O9FtQELFt0OM-r4DFxi8qB-kTtcFLN48KM2dLZPrB37AWmaOcAhhvcZaQade__zKOjU1RqV?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "ibrtyy74", "nameFr": "Avalon Golf Estate", "nameEn": "Avalon Golf Estate", "descFr": "Domaine de golf haut de gamme dans un cadre tropical. Parcours 9 trous et restaurant avec vue panoramique.", "descEn": "Upscale golf estate in a tropical setting. 9-hole course and restaurant with panoramic views.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4369266,57.5141254", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxoPiUSG5iqg3eJ4Hyt0HUr39VLoTRJRl55zFaG-XVcBdV__c3jWcsB1fU6X0Vy35kBJIdfQC9xo3tz6Q0OABMmx_I0K3uTzG6R9HzLIiuw0l18TqBnHkz6-41XKycWmDkpGcrV16BstZdIyRAgyYuOim-CUIwFhHLS0jVavGtqlG8kKBPEjL07mHNjtQ9DLQfsQwyndnPBjVTbLCuQe0x4hi_jx1NkAxpYUniYpr-5Ms3ZkeG_Lv6XWKQ?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"voir",nameFr:"Les Endroits à Voir",nameEn:"Places to See",icon:"👁️",color:"#f0a500",items:[{"id": "juu1gw72", "nameFr": "Pont Naturel", "nameEn": "Pont Naturel", "descFr": "Arche naturelle spectaculaire sculptée par l'océan dans les roches volcaniques du sud. Site géologique unique et sauvage.", "descEn": "Spectacular natural arch sculpted by the ocean in the volcanic rocks of the south. Unique and wild geological site.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.480442,57.6693878", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwhPxxwYCnkabBPX35-hak3r_NAj5Jsl2l366ZF1E_b8qiIZgESeJrUaVQnPVKQp9KaheDpPwFc3BZgIE9IW0fMERoIIZLQ11XuFIgV9B8pH_tR8qWO6t9LdghTq418yypxeDDy3U5r_zzkYiBUPT_y2WOERVOd4GRJi3OmJlX5ycgd0OQ4gA4LGtzNij3WmhDmVxS7TcQH?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "clm2cndx", "nameFr": "Blue Bay Marine Park", "nameEn": "Blue Bay Marine Park", "descFr": "Parc marin protégé avec 38 espèces de coraux et 72 espèces de poissons. Idéal pour le snorkeling et les balades en bateau à fond de verre.", "descEn": "Protected marine park with 38 coral species and 72 fish species. Ideal for snorkelling and glass-bottom boat trips.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4448478,57.709801", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwR5y0YBNUBGEaPxiLznAESMfHUfyDP6qk1h4lxR8hsX0QJv2dPaCcqJ5L14-OcmT4L5DJpUjKOsnhP2Aqoc6XmWlIOxZ1eVucpByClxziZQU9ENGOZqg_w28vzu8DbIwcVHanOqNTmtQT0cvvTunWyF7sasDRrRjkrsu6KS5UKqTWPzBPf82x3HPZX61VJJTwJMcsSsxvD?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "iz7hbxf8", "nameFr": "La Vallée de Ferney", "nameEn": "La Vallée de Ferney", "descFr": "Réserve naturelle de 200 hectares préservant la forêt endémique de l'île. Randonnées guidées, faune sauvage et paysages verdoyants.", "descEn": "200-hectare nature reserve preserving the island's endemic forest. Guided hikes, wildlife and lush landscapes.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.3620088,57.7056026", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gwf2-gD-A0T6OUqxNQWlFakZmEJtdWW7voSiyavSGMEkWr7E1rtlskRwcfly8izhdMXnPZ_IbItXcU78c__e6jplj-rVo3o0e53QQDWF-2oG2mYDH1Gnu4pDdVgCG5VpRQ3wbkK6Gnk2hHD_0N8nqjI4HhpUERoH0geMQLA5JTWd8H-XfTeC5ghI2cVeL1kq0WFinGWlcG8?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "iwpp4lg0", "nameFr": "Mahebourg Museum", "nameEn": "Mahebourg Museum", "descFr": "Musée historique retraçant la bataille de Grand Port de 1810. Cartes anciennes, objets coloniaux et maquettes de navires.", "descEn": "Historical museum telling the story of the 1810 Battle of Grand Port. Ancient maps, colonial artefacts and ship models.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4163245,57.7033301", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "k8vfv2kt", "nameFr": "Mahebourg Waterfront", "nameEn": "Mahebourg Waterfront", "descFr": "Promenade balnéaire animée avec vue sur les îlots de la baie. Restaurants, artisanat local et couchers de soleil magnifiques.", "descEn": "Lively seaside promenade with views over the bay's islets. Restaurants, local crafts and magnificent sunsets.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4050275,57.7097567", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gykl3fgfZGdqFcU25UeT9tlhUww7dBFm6DW2NsGIFpOr3zQ9Od3nHMm6QSlM_siVSG_cOYpZMEK4HZK66vFQKk_LyRqVMCMoRv-BWA_CfSb37xhYzcBW8Xt8WaYv_myWus-mQzuhBlWpSANMnfoAtoVByw7N69I-t1nMl8_d9U-rMEFEoYLO5VunpffyHpH2j_UNygUPK25?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "56cdnt2v", "nameFr": "La Vanille Nature Park", "nameEn": "La Vanille Nature Park", "descFr": "Parc naturel avec tortues géantes, crocodiles du Nil et lémuriens. Cadre tropical luxuriant, accessible à toute la famille.", "descEn": "Nature park with giant tortoises, Nile crocodiles and lemurs. Lush tropical setting, perfect for the whole family.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.499475,57.563272", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyRIBW24NW7wja3SXyuqtFHFptZIl9OYeIPhFaPpI8oj35J-b6mTuzJuQvlQFOf_l31X-yO_3XkPy7DtQE2-hmzTpLxPJDp5vTxzjwemjLkT8JBlwkhURchdyPTgLRxzEijAWPW_7QyE1VjTgbohMfCJFg8JBhx1ZZgFblh9_5uEvxAEuAEYwuI5MC5cWC5TNC6qJjCNm4jWqxXfR2CRnZdpDZkhP2sntiXojjyHgfvsv4NzbbEub83Oi4?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "aokfyybg", "nameFr": "Vallée Adventure Park", "nameEn": "Vallée Adventure Park", "descFr": "Parc d'aventure avec tyrolienne et quad dans la vallée de Ferney. Adrénaline garantie dans un cadre verdoyant.", "descEn": "Adventure park with zip-line and quad bikes in the Ferney Valley. Guaranteed thrills in a lush green setting.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4579232,57.4844716", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gw38D8pahIwbUmEaHDmcM_KtxK7v6isOW-EvDAKI-7nHLwO9hjs3mpd6ij_pzKwmonrxkpbTwtG16rd32V8gEM5dW3lnKQSxwLoDTJo5L2MJDc78C6roY52VUJgRUJOR1Q8Db4KHxKnUQq9xGHvy2qHftZZvwx0wme8x-P4v2V6A_tPeFQebNxfBKyMZg5uExK5f0tTqvFUNvE5tJXcOLrV6u3EWnPsqYmWDUtEn6D-s6iIfoDnmFYVAYg?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "snenyzdt", "nameFr": "Casela Nature Parks | Ile Maurice", "nameEn": "Casela Nature Parks | Ile Maurice", "descFr": "Le parc nature numéro 1 de Maurice avec lions, zèbres et rhinocéros. Marche avec les lions et safari en bus pour toute la famille.", "descEn": "Mauritius's number 1 nature park with lions, zebras and rhinos. Walk with lions and bus safari for the whole family.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.2911477,57.4039949", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gz0d4-A426eM8rTW6df1wEAxkvSSeUKq8Jvyh5DvTcVN7BJJsOqLPVVKcilOU1jhY7pKQSl0gVia9Mp97IZPoJuW7JZWmXXHughQPWoeBjgKvijugkI7zk4pM_HYWd37uVZlo2rf-wJAo4_IQj41BTTUBWIHAuz_7Acq_25j2y5yYGSczeEtmrBxPv_il5pZqgL8QxltZhfD97dj976dfvos49zpyqepLoaYvmm0yCMg4q5dNnkTzCmYJ8?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "jhuuxm7e", "nameFr": "Ile Des Deux Cocos", "nameEn": "Ile Des Deux Cocos", "descFr": "Ilot privé classé Ramsar, accessible en bateau depuis Blue Bay. Eaux turquoises, snorkeling et pique-nique créole.", "descEn": "Private Ramsar-listed islet, accessible by boat from Blue Bay. Turquoise waters, snorkelling and Creole picnic.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4487075,57.7109832", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzXhjRPamX_Uv0820p4rfWK6FdaaQxkfUpUoTt_IG_bdQyG_nBQ9jKQI0Dy7EVg-NJuiMxeJ_NZrZYtGXVDU5W7h58aABCHuDFfYnfqwo7OFXKJGkPwl-iGmrQZOlCGGxErrGCNBHnCCCwuWRLtjyb57vUarQX51tTm2PWN8PGCTzV3iaEYGhEuxQIrWBu7Eher6c-rpBWW?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "vuw75xi8", "nameFr": "Lion Mountain hiking trail", "nameEn": "Lion Mountain hiking trail", "descFr": "Randonnée emblématique (564m) avec vue panoramique sur le lagon de Mahebourg. Environ 3h aller-retour, niveau modéré.", "descEn": "Iconic hike (564m) with panoramic views over the Mahebourg lagoon. About 3 hours return, moderate difficulty.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.3720852,57.7270345", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyRT9tuhhj8U4H0p8RbSywbOsP_QGdMMJWQ_h3s8Xn8F-klH-rxUsSIr-AL9XXNQnBqOzbqJN405wQfuJ586ZsRWAHff_XItsQHbuM-Cq2dpPViFsysCNNCDe3oPOgzzmzggcq71ZFxyZh8K1pZLBKN-HIP8Uawaa9Tpy9scI8qEmbFDkFx4QK2p99aaERZgq15irsipTwH3A?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "b0xsat7t", "nameFr": "Ile aux Aigrettes", "nameEn": "Ile aux Aigrettes", "descFr": "Ile-réserve naturelle de 26 hectares préservant l'écosystème original de Maurice. Tortues géantes et oiseaux endémiques.", "descEn": "26-hectare nature reserve island preserving Mauritius's original ecosystem. Giant tortoises and endemic birds.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.417984,57.7311238", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzWzy4m9hnOqen4aPXcC33xKPs1d2OgR79SyKWX3d3cURLHPmlnEUMwp4Fbl8aQgdDZKDb8qmMjQt6TWK42SsOI2pxjajbAbySzG1G3FqIq__fSfqXBWv2w1qElaaZ8AvfYjaHuT8RJDI7Jh40TNlyWzprPjaLlFSI6I6h260vkdC15gklbqikIe6IF4uDLw-6vos1XQRfA?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "xm312fgq", "nameFr": "Île aux Cerfs", "nameEn": "Île aux Cerfs", "descFr": "Ile paradisiaque dans le lagon de l'est, destination phare de Maurice. Eaux cristallines, sports nautiques et restaurants de bord de mer.", "descEn": "Paradise island in the eastern lagoon, Mauritius's flagship destination. Crystal-clear waters, water sports and beachside restaurants.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.2723538,57.8041107", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx6QkNuckObr6X4HDaG3Eg8AMupN6HXZg1CNHI_GkLs1JkOeXLdXD21nXrRUWGXqye5ZBUobxh_y_7abe486M7fwnHHZR-0R_yQfpOJGeILHMK4HpBcwllhgO9j2xa9xh9ipveZ0Esd6EqKey2s6VExkZWkVcbHkAaXpxB06XadlnuIhfWgaaBK9dWfqTFJvOwpBTniUr-A?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "zpwbhqzd", "nameFr": "Old Light House (île au phare)", "nameEn": "Old Light House (île au phare)", "descFr": "Phare historique sur un ilot du lagon de Mahebourg. Accessible en bateau, panorama exceptionnel et couchers de soleil.", "descEn": "Historic lighthouse on a small islet in Mahebourg lagoon. Accessible by boat, exceptional panorama and sunsets.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.3957788,57.7773863", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GziRetpFH8HQlM09C1gYsPUr3frNXJvY5hE7aNa7Z0Z7FF23HesIpb8_OW5pfG9BvdkyJtiLkZO8qEi0qgWWMIYo380AgTtN6SJhB-x2a2GN4liZHm7ofhdMZkLzHrbLA2-08ezimn1mSAk__hlphIsrcgOqd5ujZPnpJaLbhCxNc1rojwHPrHYhlVZ-axuSB4UXDp_azlLLA?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "2lzxzsz8", "nameFr": "Cascade Rochester", "nameEn": "Cascade Rochester", "descFr": "Cascade unique aux dalles volcaniques rectangulaires ressemblant à des colonnes de basalte. Paysage minéral et sauvage dans le sud.", "descEn": "Unique waterfall with rectangular volcanic slabs resembling basalt columns. Wild, mineral landscape in the south.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.5029835,57.5168288", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwKkTFka5SGSsxRAHaOWb1QX9795UL79jfCsk9UG7NkL6ery4ROHGswGQZ3oGiVNVU7O-qiQRcmAsiJonOvYKBOWX75ahBynbiMCVIq9D_ChhKNTHoQAYqCraMzWkI8w-o0Xk6Fb-VDkCZnISN1PNwwf8ORauinwLkWGdNK0UfgzkBy8cBcpUfOJnoPX2pUBGFWEoNwpvzjzW3vOjAmwa66rqqpzRN4Pj9ef-CeZKMp8qfoCK_E5OT6Fzc?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "mjadw6ct", "nameFr": "Grand Bassin Temple", "nameEn": "Grand Bassin Temple", "descFr": "Lac volcanique sacré et lieu de pèlerinage hindou le plus important de Maurice. Ambiance spirituelle intense et décor naturel.", "descEn": "Sacred volcanic lake and most important Hindu pilgrimage site in Mauritius. Intense spiritual atmosphere and natural setting.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4183273,57.4934292", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwoYRcUFxY1UcGHnVarKBAuarAfoXdcegYfNZch0t_kxrtnD_gqbAKbBCsxjlVOOsTvKwSDVVZgVSFsrlAqTobB4UdfosE5L04NJyqjw4cGTfHR-_1UmGitTmCMuwhXP3tIjDkWs2mTF7tTqyznSb1rMEh579sKn0UQtpy-VXF-DTefgLW27SkVfwi_SMSeD-5oyj7NmpCMJ5CYPMI4xk2aRJCmwtowMrRogh9piiL7uLVBEb-a-Z5JtUY?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "wa7ng6jl", "nameFr": "Tamarind Falls / 7 Cascades", "nameEn": "Tamarind Falls / 7 Cascades", "descFr": "Les célèbres 7 Cascades en pleine forêt tropicale. Randonnée et baignade dans des piscines naturelles, une expérience inoubliable.", "descEn": "The famous 7 Cascades in tropical forest. Hiking and swimming in natural pools — an unforgettable experience.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.3547247,57.4664171", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwCg36cBJO8eSo5BZs7BeZIIi7edHuYaSv2n0Beo08Dlsu35bygTedonn9WhmWKLkWDBa0z59gPsRfYPedJBdmxRRB2XB7mqhLXaCa_IxcKD6kpgMlOBSrRFEmIp-8ZpKRR60kiyNi_AfRq46GqPVwT9JbFOMgiIp-2ZdvOsrWmqKGFaVr182op54nWMM6BwEGw9hFVJi-iVYTyvcO0i4FOqH5Iril-TO5Fan32TGqbQuTkVzTYQtC6F7k?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "244t90pu", "nameFr": "Bois Cheri Tea Factory", "nameEn": "Bois Cheri Tea Factory", "descFr": "La plus ancienne plantation de thé de Maurice, en activité depuis 1892. Visite guidée, dégustation et restaurant panoramique.", "descEn": "Mauritius's oldest tea plantation, in operation since 1892. Guided tour, tasting and panoramic restaurant.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4263291,57.5256586", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzvX_A_K6qq16-4QZgNyKLT6jRC4D7p64VstHDxUXkzfkXO42HsqmmN6dY8m7u40NwtBFreifFvAqFLOEt28aJqOvcdL9kBAe9dIORfRj1wl4mzZ1kxTbxdNbSOEgHbO-sPjRUGVOqJQ7GiLF6KUu_myU2bGFbWai2oGSyCY5WX4jxkCeIB9_dtXZOCnKJDm1qPPR9foPje90BezqHf1K2xqffSzjzkW8RJBOWude3AyJpmuASOXkA1erQ?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "rxpcqjn2", "nameFr": "Gris Gris Beach", "nameEn": "Gris Gris Beach", "descFr": "Plage sauvage du sud battue par les vagues de l'océan Indien. Paysage dramatique et grandiose pour les amateurs de nature brute.", "descEn": "Wild southern beach battered by Indian Ocean waves. Dramatic, grand landscape for nature lovers.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.5243899,57.5322158", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwqYecLn2LdOeRYbM8XNQSyWgYfD23mIe8Mzd7Gvk_YtqtIl3FLPlyggXybC94xCBEIiU92V111S4lyyaaMWGsbmztiSMli3XUGWGyqQLUzfSd5BVKzFpj7IzoPTAOn-VyzJfvS81fgKxFSkdhAtkgtXXbB4HK1vJyWMGTuPQAN7EiSXaknt8ubsXoNXvmnfWF0uwQsc18kvIbh4nB9-Thr2rVCuM_HseyrHEjsy6o5rMvHwSky0u0Robc?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"boulangeries",nameFr:"Pâtisseries / Boulangeries",nameEn:"Bakeries / Pastry Shops",icon:"🥐",color:"#c47a3a",items:[{"id": "ljbiima5", "nameFr": "Blé D'or Boulangerie et Patisserie", "nameEn": "Blé D'or Boulangerie et Patisserie", "descFr": "Boulangerie artisanale mauricienne avec pains chauds, viennoiseries et gâteaux locaux. Idéale pour le petit-déjeuner.", "descEn": "Mauritian artisan bakery with warm breads, pastries and local cakes. Perfect for breakfast.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4319106,57.6613918", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxC0c-g3F5dfvmzmnPBPZGu1grmyQ9h4zZMGfeO-S-5wKE8anzwtR_w2L7gAHopUe_Hz7mpcEsUDDmdRghzkaic0N8Nfvh4QsDSD5sffaj3Jz58lbSpF-CcbENmUEm8bo6nFmOeRpU2ouEcB7Leka5-oCHalo7CjOkqPF3T7wWOQzbqhSYidV8AgBoHlMPJn-IpQ8xz7gep?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]}],
  subcategories:[{id:"atm",nameFr:"ATM",nameEn:"ATM",icon:"🏧",color:"#607d8b",items:[{"id": "jye9g10j", "nameFr": "Atm MCB", "nameEn": "Atm MCB", "descFr": "Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.", "descEn": "MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4321291,57.6604822", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "xhv3tkfs", "nameFr": "Atm Sbm Plaine Magnien", "nameEn": "Atm Sbm Plaine Magnien", "descFr": "Distributeur SBM disponible 24h/24 à Plaine Magnien.", "descEn": "SBM ATM available 24/7 in Plaine Magnien.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4318909,57.6613197", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "uf9zhfnr", "nameFr": "MCB ATM", "nameEn": "MCB ATM", "descFr": "Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.", "descEn": "MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4089123,57.7055942", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "kg7enusk", "nameFr": "Absa | Atm | Beau Vallon", "nameEn": "Absa | Atm | Beau Vallon", "descFr": "Distributeur Absa à Beau Vallon, disponible 24h/24.", "descEn": "Absa ATM at Beau Vallon, available 24/7.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.423759,57.697941", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "9b4juqnw", "nameFr": "ATM MCB", "nameEn": "ATM MCB", "descFr": "Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.", "descEn": "MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4175259,57.7100349", "image": "", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"essence",nameFr:"Stations Essence",nameEn:"Gas Stations",icon:"⛽",color:"#e53935",items:[{"id": "azk43ium", "nameFr": "Engen Filling Station", "nameEn": "Engen Filling Station", "descFr": "Station Engen avec carburants SP95, diesel et boutique. Ouverte 7j/7.", "descEn": "Engen station with SP95, diesel and shop. Open 7 days a week.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4308445,57.6666288", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "7tl6ughl", "nameFr": "Shell Filling Station", "nameEn": "Shell Filling Station", "descFr": "Station Shell complète avec carburants, boutique et services auto.", "descEn": "Full Shell station with fuel, shop and car services.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4321922,57.6607249", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "76gwts41", "nameFr": "SHELL", "nameEn": "SHELL", "descFr": "Station Shell avec carburants, boutique et gonflage des pneus.", "descEn": "Shell station with fuel, shop and tyre inflation.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4059505,57.7034222", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "kc3mnogt", "nameFr": "TotalEnergies Mahebourg", "nameEn": "TotalEnergies Mahebourg", "descFr": "Station TotalEnergies à Mahebourg avec carburants et boutique.", "descEn": "TotalEnergies station in Mahebourg with fuel and shop.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.407917,57.705783", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "o8d3jlw2", "nameFr": "Indian Oil", "nameEn": "Indian Oil", "descFr": "Station Indian Oil avec carburants et services. Ouverte 7j/7.", "descEn": "Indian Oil station with fuel and services. Open 7 days a week.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4059061,57.7079899", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "0y6jw8br", "nameFr": "Shell", "nameEn": "Shell", "descFr": "Station Shell avec carburants, boutique et gonflage des pneus.", "descEn": "Shell station with fuel, shop and tyre inflation.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4073509,57.708267", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "muljb2wb", "nameFr": "Shell Filling Station", "nameEn": "Shell Filling Station", "descFr": "Station Shell complète avec carburants, boutique et services auto.", "descEn": "Full Shell station with fuel, shop and car services.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4109873,57.6171261", "image": "", "distance": "", "priceLevel": "", "openHours": ""}]},
    {id:"hopitaux",nameFr:"Hôpitaux / Docteurs",nameEn:"Hospitals / Doctors",icon:"🏥",color:"#c62828",items:[{"id": "w8uucpt9", "nameFr": "Dr Vishnu Appiah", "nameEn": "Dr Vishnu Appiah", "descFr": "Médecin généraliste disponible pour consultations. Contacter pour les horaires et urgences.", "descEn": "General practitioner available for consultations. Contact for hours and emergencies.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.411324,57.7057728", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "jy79vave", "nameFr": "Mahebourg Hospital", "nameEn": "Mahebourg Hospital", "descFr": "Hôpital public de Mahebourg avec urgences 24h/24. SAMU : 114, Pompiers : 115.", "descEn": "Mahebourg public hospital with 24/7 emergency. SAMU: 114, Fire: 115.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4108034,57.7033526", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "8pb9w3f7", "nameFr": "Jawaharlal Nehru Hospital", "nameEn": "Jawaharlal Nehru Hospital", "descFr": "Grand hôpital public de Rose Belle avec service des urgences 24h/24.", "descEn": "Large public hospital in Rose Belle with 24/7 emergency department.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4045471,57.5929609", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "4ehtmosz", "nameFr": "Clinique Darné Curepipe", "nameEn": "Clinique Darné Curepipe", "descFr": "Clinique privée réputée à Curepipe avec spécialistes et urgences. Soins de qualité 24h/24.", "descEn": "Reputed private clinic in Curepipe with specialists and emergency care. Quality 24/7 care.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.287858,57.4188589", "image": "", "distance": "", "priceLevel": "", "openHours": ""}, {"id": "zshw6q0l", "nameFr": "C-Lab Beau Vallon", "nameEn": "C-Lab Beau Vallon", "descFr": "Laboratoire d'analyses médicales à Beau Vallon. Prises de sang, examens et résultats rapides.", "descEn": "Medical testing laboratory in Beau Vallon. Blood tests, examinations and quick results.", "address": "", "phone": "", "mapLink": "https://maps.google.com/?q=-20.4222299,57.7013828", "image": "https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxqjzVIvNzbN3K0SGztRDfVITd3CLtMVwD73hr_RyIacmNDTOZAvwFufr2tu1M7vAA0xsTZ_HNSJMdq0g-6jPigfN6KzwTJXFqScRRvKO-UhMXzGoTaPa_UMy25k9u7PT9uzVubmH8zEKW2dRUNSapDQ0wvrGAOET61Et1hVjopIuHYXGVs5biGRmkWOd3iyXTMl6nZ9yAXpDwQjBkz1TMYDIq75XoOLnYuhYXru0CuucokoWSLfiz6H0o?authuser=0&fife=s16383", "distance": "", "priceLevel": "", "openHours": ""}]}],
  gallery:[
    {id:"g1",url:"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg",caption:"Villa P'tit Bouchon - Vue mer"},
    {id:"g2",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/9a649f48-0524-4b61-8a22-551339452624.png",caption:"Piscine privée"},
    {id:"g3",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/dd8ce4b6-f209-4f4a-b3a7-75210beffcd2.png",caption:"Salon & séjour"},
    {id:"g4",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png",caption:"Terrasse vue lagon"},
    {id:"g5",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/8118c41b-9ddc-41e4-a5bb-fcc376265c5a.png",caption:"Cuisine équipée"},
    {id:"g6",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/d5d4fbd3-efd0-47f9-8d56-b685a1666e39.png",caption:"Chambre master - lit queen, vue mer, dressing"},
    {id:"g7",url:"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/48ca3363-09cf-41cf-88d8-982ef9f19d07.png",caption:"Chambre 2 - lit double"},
    {id:"g8",url:"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/4e1315c5-f830-4fdf-a0bf-3bcc8c465b10.jpeg",caption:"Chambre 3 - lit queen"},
  ],
};

const BACKUP_DATA=JSON.parse(atob("eyJzZXR0aW5ncyI6eyJwcm9wZXJ0eU5hbWUiOiJQJ3RpdCBCb3VjaG9uIiwidGFnbGluZSI6IlZpbGxhIGZhY2UgXHUwMGUwIGxhIG1lciAtIFx1MDBjZWxlIE1hdXJpY2UiLCJwaG9uZSI6IisyMzAgNTI1MCA3MzAwIiwiZW1haWwiOiJjZGVzaWduQGludG5ldC5tdSIsIndlYnNpdGUiOiIiLCJ3aGF0c2FwcCI6IisyMzA1MjUwNzMwMCIsImluc3RhZ3JhbSI6IiIsImNoZWNrSW4iOiIwODowMCIsImNoZWNrT3V0IjoiMTE6MDAiLCJhZGRyZXNzIjoiUHVibGljIEJlYWNoIFJvYWQsIFBsYWluZSBNYWduaWVuLCBHcmFuZCBQb3J0LCBNYXVyaXRpdXMgNTI0MDQiLCJ2aWxsYUxhdCI6Ii0yMC40MzEwIiwidmlsbGFMbmciOiI1Ny42NjU5IiwiaGVhZGVyQmciOiIjMGEyMzQyIiwiaGVhZGVyVGV4dCI6IiNmNWU2YzgiLCJmb290ZXJCZyI6IiMwYTIzNDIiLCJmb290ZXJUZXh0IjoiI2Y1ZTZjOCIsImFjY2VudENvbG9yIjoiIzFiNmNhOCIsImNhcmRCb3JkZXJDb2xvciI6IiNkZGVlZmYiLCJjYXJkTGFiZWxDb2xvciI6IiMxYjZjYTgiLCJlbW9qaVNpemUiOjMyLCJxdWlja0Vtb2ppU2l6ZSI6MzYsImNhcmRGb250U2l6ZSI6MTAsImhlcm9Gb250U2l6ZSI6IjUwIiwibGV0dGVyU3BhY2luZyI6MiwiYm9keUJnIjoiI2Y4ZmJmZiIsImJvZHlUZXh0IjoiIzBkMjEzNyIsImNhcmRCZyI6IiNmZmZmZmYiLCJmb250RmFtaWx5IjoiQ29ybW9yYW50IEdhcmFtb25kIiwiYm9keUZvbnQiOiJNb250c2VycmF0IiwiaGVhZGVyQmdUeXBlIjoiaW1hZ2UiLCJoZWFkZXJCZ0ltYWdlIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvbWlzby9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2VjM2Q5OTZjLWI0YzQtNGVlYy04MDFlLWU3NDUyN2RhNGQ5OS5qcGVnIiwiZm9vdGVyQmdUeXBlIjoiY29sb3IiLCJmb290ZXJCZ0ltYWdlIjoiIiwiYm9keUJnVHlwZSI6ImNvbG9yIiwiYm9keUJnSW1hZ2UiOiIifSwiY2hlY2tpbiI6eyJ3aWZpTmFtZSI6IlRlbGVjb20tbXM0cCIsIndpZmlQYXNzIjoiRXM5OHNKbmkiLCJhY2Nlc3NDb2RlIjoiIiwibG9ja2JveENvZGUiOiI0IGxhc3QgUGhvbmUgbnVtYmVyIGRpZ2l0cyAtIDQgZGVybmllcnMgbnVtZXJvIHRcdTAwZTlsXHUwMGU5cGhvbm5lIiwiY2hlY2tJbiI6IjA4OjAwIiwiY2hlY2tPdXQiOiIxMTowMCIsImluc3RydWN0aW9ucyI6W3siaWQiOiJjMSIsImljb24iOiJcdWQ4M2RcdWRkMTEiLCJ0aXRsZUZyIjoiVHJvdXZlciBsYSBWaWxsYSIsInRpdGxlRW4iOiJGaW5kIHRoZSBWaWxsYSIsInRleHRGciI6IkxhIG1laWxsZXVyZSBmYVx1MDBlN29uIGRlIHNlIHJlbmRyZSBcdTAwZTAgbGEgVmlsbGEgZXN0IGQnYWxsZXIganVzcXUnXHUwMGUwIGxhIHBsYWdlIGR1IEJvdWNob24uIERcdTAwZThzIHF1ZSB2b3VzIFx1MDBlYXRlcyBlbiBmYWNlIGRlIGxhIHBsYWdlLCBwcmVuZXogXHUwMGUwIGdhdWNoZSBldCB2b3VzIGRldnJpZXogdm9pciB1bmUgcGV0aXRlIG1haXNvbiBhdmVjIHVuIHRvaXQgYmxldSAoYydlc3QgbGVzIHRvaWxldHRlcyBwdWJsaXF1ZXMpLlxuXG5FbnZpcm9uIDE1IG1cdTAwZTh0cmVzIGFwclx1MDBlOHMgbGVzIHRvaWxldHRlcywgdm91cyB2ZXJyZXogdW5lIHBldGl0ZSBlbnRyXHUwMGU5ZSBzdXIgdm90cmUgZ2F1Y2hlIGFwclx1MDBlOHMgbGVzIGdyb3Mgcm9jaGVycy4gUHJlbmV6IGwnZW50clx1MDBlOWUgZXQgXHUwMGU3YSBzZXJhIGxhIGRldXhpXHUwMGU4bWUgVmlsbGEgZGVycmlcdTAwZThyZS5cblxuWSdhdXJhIHVuIGdyYW5kIG11ciBhdmVjIGRldXggZW50clx1MDBlOWVzLiBMJ2VudHJcdTAwZTllIGRlIGdhdWNoZSBlc3QgYmVhdWNvdXAgcGx1cyBsYXJnZSAoUGx1cyBhY2Nlc3NpYmxlIHBvdXIgbGVzIHZvaXR1cmUpLlxuXG5MJ2FkcmVzc2UgYydlc3QgTGUgQm91Y2hvbiBQdWJsaWMgQkVBQ0giLCJ0ZXh0RW4iOiJUaGUgYmVzdCB3YXkgdG8gZ2V0IHRvIHRoZSBWaWxsYSBpcyB0byBoZWFkIHRvd2FyZHMgQm91Y2hvbiBCZWFjaC4gT25jZSB5b3UncmUgZmFjaW5nIHRoZSBiZWFjaCwgdHVybiBsZWZ0LCBhbmQgeW91IHNob3VsZCBzZWUgYSBzbWFsbCBob3VzZSB3aXRoIGEgYmx1ZSByb29mICh0aGlzIGlzIHRoZSBwdWJsaWMgcmVzdHJvb20pLlxuXG5BYm91dCAxNSBtZXRlcnMgcGFzdCB0aGUgcmVzdHJvb20sIHlvdSdsbCBub3RpY2UgYSBzbWFsbCBlbnRyYW5jZSBvbiB5b3VyIGxlZnQsIGFmdGVyIHRoZSBsYXJnZSByb2Nrcy4gVGFrZSB0aGF0IGVudHJhbmNlLCBhbmQgaXQgd2lsbCBiZSB0aGUgc2Vjb25kIFZpbGxhIGJlaGluZC5cblxuVGhlcmUgd2lsbCBiZSBhIGxhcmdlIHdhbGwgd2l0aCB0d28gZW50cmFuY2VzLiBUaGUgbGVmdCBlbnRyYW5jZSBpcyBtdWNoIHdpZGVyIChtb3JlIGFjY2Vzc2libGUgZm9yIGNhcnMpLlxuXG5UaGUgYWRkcmVzcyBpcyBMZSBCb3VjaG9uIFB1YmxpYyBCZWFjaCBQbGFpbmUgTWFnbmllbi4ifSx7ImlkIjoiYzIiLCJpY29uIjoiXHVkODNkXHVkZDExIiwidGl0bGVGciI6IlNlbGYgQ2hlY2staW4gLSBCb1x1MDBlZXRpZXIgXHUwMGUwIGNsXHUwMGU5IiwidGl0bGVFbiI6IlNlbGYgQ2hlY2staW4gLSBMb2NrYm94IiwidGV4dEZyIjoiUGFzIGJlc29pbiBkZSBub3VzIGF0dGVuZHJlICEgTGEgY2xcdTAwZTkgc2UgdHJvdXZlIGRhbnMgbGUgYm9cdTAwZWV0aWVyIHNcdTAwZTljdXJpc1x1MDBlOSBcdTAwZTAgY1x1MDBmNHRcdTAwZTkgZGUgbGEgcG9ydGUgcHJpbmNpcGFsZS4gTGUgY29kZSB2b3VzIHNlcmEgY29tbXVuaXF1XHUwMGU5IHBhciBtZXNzYWdlIGF2YW50IHZvdHJlIGFycml2XHUwMGU5ZS4iLCJ0ZXh0RW4iOiJObyBuZWVkIHRvIHdhaXQgZm9yIHVzISBUaGUga2V5IGlzIGluIHRoZSBzZWN1cmUgbG9ja2JveCBuZXh0IHRvIHRoZSBtYWluIGRvb3IuIFRoZSBjb2RlIHdpbGwgYmUgc2VudCB0byB5b3UgYnkgbWVzc2FnZSBiZWZvcmUgeW91ciBhcnJpdmFsLiJ9LHsiaWQiOiJjMyIsImljb24iOiJcdWQ4M2RcdWRkMTAiLCJ0aXRsZUZyIjoiU3lzdFx1MDBlOG1lIGQnYWxhcm1lIiwidGl0bGVFbiI6IkFsYXJtIHN5c3RlbSIsInRleHRGciI6IkxhIHZpbGxhIGVzdCBcdTAwZTlxdWlwXHUwMGU5ZSBkJ3VuIHN5c3RcdTAwZThtZSBkJ2FsYXJtZS4gTGVzIGluc3RydWN0aW9ucyBkZSBkXHUwMGU5c2FjdGl2YXRpb24gc2UgdHJvdXZlbnQgZGFucyBsZSBndWlkZSBkJ2FjY3VlaWwgXHUwMGUwIGwnaW50XHUwMGU5cmlldXIgZGUgbGEgdmlsbGEuIiwidGV4dEVuIjoiVGhlIHZpbGxhIGhhcyBhbiBhbGFybSBzeXN0ZW0uIERlYWN0aXZhdGlvbiBpbnN0cnVjdGlvbnMgYXJlIGluIHRoZSB3ZWxjb21lIGd1aWRlIGluc2lkZSB0aGUgdmlsbGEuIn0seyJpZCI6ImM0IiwiaWNvbiI6Ilx1ZDgzZFx1ZGNmMSIsInRpdGxlRnIiOiJDb250YWN0ZXotbm91cyIsInRpdGxlRW4iOiJDb250YWN0IHVzIiwidGV4dEZyIjoiRW52b3llei1ub3VzIHVuIG1lc3NhZ2UgV2hhdHNBcHAgZFx1MDBlOHMgdm90cmUgYXJyaXZcdTAwZTllLiBDaGFybGVzIHJcdTAwZTlwb25kIGRhbnMgbCdoZXVyZSwgN2ovNy4gVGF1eCBkZSByXHUwMGU5cG9uc2UgOiAxMDAlLiIsInRleHRFbiI6IlNlbmQgdXMgYSBXaGF0c0FwcCBtZXNzYWdlIHVwb24gYXJyaXZhbC4gQ2hhcmxlcyByZXNwb25kcyB3aXRoaW4gdGhlIGhvdXIsIDcgZGF5cyBhIHdlZWsuIFJlc3BvbnNlIHJhdGU6IDEwMCUuIn1dfSwiaG91c2VSdWxlcyI6W3siaWQiOiJyMSIsImljb24iOiJcdWQ4M2RcdWRkNTciLCJ0aXRsZUZyIjoiQ2hlY2staW4iLCJ0aXRsZUVuIjoiQ2hlY2staW4iLCJ0ZXh0RnIiOiJDaGVjay1pbiA6IDhoMDAgLSAyMWgwMC4gU2VsZiBjaGVjay1pbiB2aWEgYm9cdTAwZWV0aWVyIFx1MDBlMCBjbFx1MDBlOS4iLCJ0ZXh0RW4iOiJDaGVjay1pbjogODowMCBBTSAtIDk6MDAgUE0uIFNlbGYgY2hlY2staW4gdmlhIGxvY2tib3guIn0seyJpZCI6InIyIiwiaWNvbiI6Ilx1ZDgzZFx1ZGQ1OSIsInRpdGxlRnIiOiJDaGVjay1vdXQiLCJ0aXRsZUVuIjoiQ2hlY2stb3V0IiwidGV4dEZyIjoiRFx1MDBlOXBhcnQgYXZhbnQgMTFoMDAuIiwidGV4dEVuIjoiQ2hlY2tvdXQgYmVmb3JlIDExOjAwIEFNLiJ9LHsiaWQiOiJyMyIsImljb24iOiJcdWQ4M2RcdWRjNjUiLCJ0aXRsZUZyIjoiQ2FwYWNpdFx1MDBlOSBtYXhpbWFsZSIsInRpdGxlRW4iOiJNYXhpbXVtIGNhcGFjaXR5IiwidGV4dEZyIjoiNiBwZXJzb25uZXMgbWF4aW11bS4iLCJ0ZXh0RW4iOiI2IGd1ZXN0cyBtYXhpbXVtLiJ9LHsiaWQiOiJyNCIsImljb24iOiJcdWQ4M2RcdWRlYWQiLCJ0aXRsZUZyIjoiTm9uLWZ1bWV1ciIsInRpdGxlRW4iOiJObyBzbW9raW5nIiwidGV4dEZyIjoiSWwgZXN0IHN0cmljdGVtZW50IGludGVyZGl0IGRlIGZ1bWVyIFx1MDBlMCBsJ2ludFx1MDBlOXJpZXVyIGRlIGxhIHZpbGxhLiIsInRleHRFbiI6IlNtb2tpbmcgaXMgc3RyaWN0bHkgcHJvaGliaXRlZCBpbnNpZGUgdGhlIHZpbGxhLiJ9LHsiaWQiOiJyNSIsImljb24iOiJcdWQ4M2NcdWRmY2EiLCJ0aXRsZUZyIjoiUGlzY2luZSBwcml2XHUwMGU5ZSIsInRpdGxlRW4iOiJQcml2YXRlIHBvb2wiLCJ0ZXh0RnIiOiJMYSBwaXNjaW5lIGVzdCBwcml2XHUwMGU5ZS4gUGFzIGRlIHBvcnRhaWwgb3UgZGUgdmVycm91IC0gdmlnaWxhbmNlIHJlcXVpc2UgYXZlYyBsZXMgZW5mYW50cy4iLCJ0ZXh0RW4iOiJQb29sIGlzIHByaXZhdGUuIE5vIGdhdGUgb3IgbG9jayAtIHN1cGVydmlzaW9uIHJlcXVpcmVkIHdpdGggY2hpbGRyZW4uIn0seyJpZCI6InI2IiwiaWNvbiI6Ilx1ZDgzZFx1ZGNmOSIsInRpdGxlRnIiOiJDYW1cdTAwZTlyYXMgZGUgc1x1MDBlOWN1cml0XHUwMGU5IiwidGl0bGVFbiI6IlNlY3VyaXR5IGNhbWVyYXMiLCJ0ZXh0RnIiOiJMYSB2aWxsYSBlc3QgXHUwMGU5cXVpcFx1MDBlOWUgZCd1biBzeXN0XHUwMGU4bWUgZGUgdmlkXHUwMGU5b3N1cnZlaWxsYW5jZSBleHRcdTAwZTlyaWV1cmUgMjRoLzI0LiIsInRleHRFbiI6IlRoZSB2aWxsYSBoYXMgZXh0ZXJpb3IgQ0NUViBzZWN1cml0eSBjYW1lcmFzIG9wZXJhdGluZyAyNC83LiJ9LHsiaWQiOiJyNyIsImljb24iOiJcdWQ4M2RcdWRkMTIiLCJ0aXRsZUZyIjoiU3lzdFx1MDBlOG1lIGQnYWxhcm1lIiwidGl0bGVFbiI6IkFsYXJtIHN5c3RlbSIsInRleHRGciI6IkxhIHZpbGxhIGVzdCBwcm90XHUwMGU5Z1x1MDBlOWUgcGFyIHVuIHN5c3RcdTAwZThtZSBkJ2FsYXJtZS4gSW5zdHJ1Y3Rpb25zIGZvdXJuaWVzIFx1MDBlMCBsJ2Fycml2XHUwMGU5ZS4iLCJ0ZXh0RW4iOiJUaGUgdmlsbGEgaXMgcHJvdGVjdGVkIGJ5IGFuIGFsYXJtIHN5c3RlbS4gSW5zdHJ1Y3Rpb25zIHByb3ZpZGVkIG9uIGFycml2YWwuIn0seyJpZCI6InI4IiwiaWNvbiI6Ilx1MjcwOFx1ZmUwZiIsInRpdGxlRnIiOiJJZFx1MDBlOWFsZW1lbnQgc2l0dVx1MDBlOSIsInRpdGxlRW4iOiJJZGVhbCBsb2NhdGlvbiIsInRleHRGciI6IkwnYVx1MDBlOXJvcG9ydCBlc3QgXHUwMGUwIHNldWxlbWVudCA4IG1pbnV0ZXMgZGUgbGEgdmlsbGEgLSBpZFx1MDBlOWFsIHBvdXIgbGVzIGFycml2XHUwMGU5ZXMgZXQgZFx1MDBlOXBhcnRzLiIsInRleHRFbiI6IlRoZSBhaXJwb3J0IGlzIG9ubHkgOCBtaW51dGVzIGZyb20gdGhlIHZpbGxhIC0gaWRlYWwgZm9yIGFycml2YWxzIGFuZCBkZXBhcnR1cmVzLiJ9LHsiaWQiOiJyOSIsImljb24iOiJcdWQ4M2NcdWRmM2YiLCJ0aXRsZUZyIjoiXHUwMGM5Y29sb2dpZSIsInRpdGxlRW4iOiJFY28tZnJpZW5kbHkiLCJ0ZXh0RnIiOiJMJ2VhdSBjaGF1ZGUgZXN0IHByb2R1aXRlIHBhciBwYW5uZWF1IHNvbGFpcmUgcG91ciB1bmUgYXBwcm9jaGUgcGx1cyBcdTAwZTljb2xvZ2lxdWUuIiwidGV4dEVuIjoiSG90IHdhdGVyIGlzIHNvbGFyLXBvd2VyZWQgZm9yIGEgbW9yZSBlY29sb2dpY2FsIGFwcHJvYWNoLiJ9LHsiaWQiOiJyMTAiLCJpY29uIjoiXHVkODNlXHVkZGY5IiwidGl0bGVGciI6IlByb3ByZXRcdTAwZTkiLCJ0aXRsZUVuIjoiQ2xlYW5saW5lc3MiLCJ0ZXh0RnIiOiJNZXJjaSBkZSBsYWlzc2VyIGxhIHZpbGxhIHByb3ByZSBcdTAwZTAgdm90cmUgZFx1MDBlOXBhcnQuIExlIGxpbmdlIGVzdCBpbmNsdXMgc2FucyBmcmFpcyBzdXBwbFx1MDBlOW1lbnRhaXJlcy4iLCJ0ZXh0RW4iOiJQbGVhc2UgbGVhdmUgdGhlIHZpbGxhIGNsZWFuIG9uIGRlcGFydHVyZS4gTGF1bmRyeSBpcyBpbmNsdWRlZCBhdCBubyBleHRyYSBjb3N0LiJ9XSwiYW1lbml0aWVzIjpbeyJpZCI6ImExIiwiaWNvbiI6Ilx1ZDgzY1x1ZGYwYSIsIm5hbWVGciI6IlZ1ZSBzdXIgbGEgbWVyIiwibmFtZUVuIjoiU2VhIHZpZXcifSx7ImlkIjoiYTIiLCJpY29uIjoiXHVkODNjXHVkZmQ2XHVmZTBmIiwibmFtZUZyIjoiQWNjXHUwMGU4cyBwbGFnZSBwcml2XHUwMGU5ZSIsIm5hbWVFbiI6IlByaXZhdGUgYmVhY2ggYWNjZXNzIn0seyJpZCI6ImEzIiwiaWNvbiI6Ilx1ZDgzY1x1ZGZjYSIsIm5hbWVGciI6IlBpc2NpbmUgcHJpdlx1MDBlOWUiLCJuYW1lRW4iOiJQcml2YXRlIHBvb2wifSx7ImlkIjoiYTQiLCJpY29uIjoiXHVkODNkXHVkZWNmXHVmZTBmIiwibmFtZUZyIjoiMyBjaGFtYnJlcyAoNiBwZXJzLikiLCJuYW1lRW4iOiIzIGJlZHJvb21zICg2IGd1ZXN0cykifSx7ImlkIjoiYTUiLCJpY29uIjoiXHVkODNkXHVkZWJmIiwibmFtZUZyIjoiMiBzYWxsZXMgZGUgYmFpbiBwcml2YXRpdmVzIiwibmFtZUVuIjoiMiBwcml2YXRlIGJhdGhyb29tcyJ9LHsiaWQiOiJhNiIsImljb24iOiJcdWQ4M2RcdWRjZjYiLCJuYW1lRnIiOiJXaUZpIHJhcGlkZSAtIDU0IE1iL3MiLCJuYW1lRW4iOiJGYXN0IFdpRmkgLSA1NCBNYi9zIn0seyJpZCI6ImE3IiwiaWNvbiI6Ilx1ZDgzY1x1ZGY3MyIsIm5hbWVGciI6IkN1aXNpbmUgXHUwMGU5cXVpcFx1MDBlOWUiLCJuYW1lRW4iOiJGdWxseSBlcXVpcHBlZCBraXRjaGVuIn0seyJpZCI6ImE4IiwiaWNvbiI6Ilx1ZDgzZVx1ZGRmYSIsIm5hbWVGciI6IkxhdmUtbGluZ2UgKGluY2x1cykiLCJuYW1lRW4iOiJXYXNoaW5nIG1hY2hpbmUgKGluY2x1ZGVkKSJ9LHsiaWQiOiJhOSIsImljb24iOiJcdTI3NDRcdWZlMGYiLCJuYW1lRnIiOiJDbGltYXRpc2F0aW9uIiwibmFtZUVuIjoiQWlyIGNvbmRpdGlvbmluZyJ9LHsiaWQiOiJhMTAiLCJpY29uIjoiXHUyNjAwXHVmZTBmIiwibmFtZUZyIjoiVGVycmFzc2UgdnVlIG1lciIsIm5hbWVFbiI6IlNlYS12aWV3IHRlcnJhY2UifSx7ImlkIjoiYTExIiwiaWNvbiI6Ilx1ZDgzY1x1ZGYzZiIsIm5hbWVGciI6IkVhdSBjaGF1ZGUgc29sYWlyZSIsIm5hbWVFbiI6IlNvbGFyIGhvdCB3YXRlciJ9LHsiaWQiOiJhMTIiLCJpY29uIjoiXHVkODNkXHVkY2Y5IiwibmFtZUZyIjoiVmlkXHUwMGU5b3N1cnZlaWxsYW5jZSBleHQuIiwibmFtZUVuIjoiRXh0ZXJpb3IgQ0NUViJ9LHsiaWQiOiJhMTMiLCJpY29uIjoiXHVkODNkXHVkZDEyIiwibmFtZUZyIjoiU3lzdFx1MDBlOG1lIGQnYWxhcm1lIiwibmFtZUVuIjoiQWxhcm0gc3lzdGVtIn0seyJpZCI6ImExNCIsImljb24iOiJcdWQ4M2RcdWRkMTEiLCJuYW1lRnIiOiJTZWxmIGNoZWNrLWluIChib1x1MDBlZXRpZXIpIiwibmFtZUVuIjoiU2VsZiBjaGVjay1pbiAobG9ja2JveCkifSx7ImlkIjoiYTE1IiwiaWNvbiI6Ilx1MjcwOFx1ZmUwZiIsIm5hbWVGciI6IjggbWluIGRlIGwnYVx1MDBlOXJvcG9ydCIsIm5hbWVFbiI6IjggbWluIGZyb20gYWlycG9ydCJ9LHsiaWQiOiJhMTYiLCJpY29uIjoiXHVkODNjXHVkZmM1IiwibmFtZUZyIjoiU3VwZXJob3N0IFx1MjYwNSA0Ljk5ICgxNDkgYXZpcykiLCJuYW1lRW4iOiJTdXBlcmhvc3QgXHUyNjA1IDQuOTkgKDE0OSByZXZpZXdzKSJ9XSwiZmFxcyI6W3siaWQiOiJmMSIsInFGciI6Ilx1MDBjMCBxdWVsbGUgaGV1cmUgZXN0IGxlIGNoZWNrLWluID8iLCJxRW4iOiJXaGF0IHRpbWUgaXMgY2hlY2staW4/IiwiYUZyIjoiTGUgY2hlY2staW4gZXN0IGVudHJlIDhoMDAgZXQgMjFoMDAuIEMnZXN0IHVuIHNlbGYgY2hlY2staW4gdmlhIGJvXHUwMGVldGllciBcdTAwZTAgY2xcdTAwZTkgLSBwYXMgYmVzb2luIGRlIG5vdXMgYXR0ZW5kcmUgc3VyIHBsYWNlICEiLCJhRW4iOiJDaGVjay1pbiBpcyBiZXR3ZWVuIDg6MDAgQU0gYW5kIDk6MDAgUE0uIEl0J3MgYSBzZWxmIGNoZWNrLWluIHZpYSBsb2NrYm94IC0gbm8gbmVlZCB0byB3YWl0IGZvciB1cyEifSx7ImlkIjoiZjIiLCJxRnIiOiJcdTAwYzAgcXVlbGxlIGhldXJlIGVzdCBsZSBjaGVjay1vdXQgPyIsInFFbiI6IldoYXQgdGltZSBpcyBjaGVja291dD8iLCJhRnIiOiJMZSBkXHUwMGU5cGFydCBlc3QgYXZhbnQgMTFoMDAuIFBvdXIgdW4gZFx1MDBlOXBhcnQgdGFyZGlmLCBjb250YWN0ZXotbm91cyBcdTAwZTAgbCdhdmFuY2UuIiwiYUVuIjoiQ2hlY2tvdXQgaXMgYmVmb3JlIDExOjAwIEFNLiBGb3IgYSBsYXRlIGNoZWNrb3V0LCBjb250YWN0IHVzIGluIGFkdmFuY2UuIn0seyJpZCI6ImYzIiwicUZyIjoiQ29tYmllbiBkZSBwZXJzb25uZXMgcGV1dmVudCBzXHUwMGU5am91cm5lciA/IiwicUVuIjoiSG93IG1hbnkgZ3Vlc3RzIGNhbiBzdGF5PyIsImFGciI6IkxhIHZpbGxhIGFjY3VlaWxsZSBqdXNxdSdcdTAwZTAgNiBwZXJzb25uZXMgZGFucyBzZXMgMyBjaGFtYnJlcy4iLCJhRW4iOiJUaGUgdmlsbGEgYWNjb21tb2RhdGVzIHVwIHRvIDYgZ3Vlc3RzIGluIGl0cyAzIGJlZHJvb21zLiJ9LHsiaWQiOiJmNCIsInFGciI6IkxhIHZpbGxhIGVzdC1lbGxlIHByb2NoZSBkZSBsJ2FcdTAwZTlyb3BvcnQgPyIsInFFbiI6IklzIHRoZSB2aWxsYSBjbG9zZSB0byB0aGUgYWlycG9ydD8iLCJhRnIiOiJPdWkgISBMJ2FcdTAwZTlyb3BvcnQgaW50ZXJuYXRpb25hbCBTaXIgU2Vld29vc2FndXIgUmFtZ29vbGFtIGVzdCBcdTAwZTAgc2V1bGVtZW50IDggbWludXRlcyAtIGlkXHUwMGU5YWwgcG91ciBsZXMgYXJyaXZcdTAwZTllcyB0YXJkaXZlcyBldCBsZXMgZFx1MDBlOXBhcnRzIG1hdGluYXV4LiIsImFFbiI6IlllcyEgU2lyIFNlZXdvb3NhZ3VyIFJhbWdvb2xhbSBJbnRlcm5hdGlvbmFsIEFpcnBvcnQgaXMgb25seSA4IG1pbnV0ZXMgYXdheSAtIGlkZWFsIGZvciBsYXRlIGFycml2YWxzIGFuZCBlYXJseSBkZXBhcnR1cmVzLiJ9LHsiaWQiOiJmNSIsInFGciI6IkxhIHBpc2NpbmUgZXN0LWVsbGUgcHJpdlx1MDBlOWUgPyIsInFFbiI6IklzIHRoZSBwb29sIHByaXZhdGU/IiwiYUZyIjoiT3VpLCBsYSBwaXNjaW5lIGVzdCBleGNsdXNpdmVtZW50IHJcdTAwZTlzZXJ2XHUwMGU5ZSBhdXggb2NjdXBhbnRzIGRlIGxhIHZpbGxhLiBBdHRlbnRpb24gOiBwYXMgZGUgcG9ydGFpbCBkZSBzXHUwMGU5Y3VyaXRcdTAwZTksIHN1cnZlaWxsYW5jZSByZWNvbW1hbmRcdTAwZTllIGF2ZWMgbGVzIGVuZmFudHMuIiwiYUVuIjoiWWVzLCB0aGUgcG9vbCBpcyBleGNsdXNpdmVseSBmb3IgdmlsbGEgZ3Vlc3RzLiBOb3RlOiBubyBzYWZldHkgZ2F0ZSwgc3VwZXJ2aXNpb24gcmVjb21tZW5kZWQgd2l0aCBjaGlsZHJlbi4ifSx7ImlkIjoiZjYiLCJxRnIiOiJZIGEtdC1pbCBkZSBsJ2VhdSBjaGF1ZGUgPyIsInFFbiI6IklzIHRoZXJlIGhvdCB3YXRlcj8iLCJhRnIiOiJPdWksIGxhIHZpbGxhIGRpc3Bvc2UgZCd1biBjaGF1ZmZlLWVhdSBzb2xhaXJlIHBvdXIgdW5lIGFwcHJvY2hlIFx1MDBlOWNvbG9naXF1ZS4gRWF1IGNoYXVkZSBkaXNwb25pYmxlIGVuIGNvbnRpbnUuIiwiYUVuIjoiWWVzLCB0aGUgdmlsbGEgaGFzIGEgc29sYXIgd2F0ZXIgaGVhdGVyIGZvciBhbiBlY28tZnJpZW5kbHkgYXBwcm9hY2guIEhvdCB3YXRlciBhdmFpbGFibGUgY29udGludW91c2x5LiJ9LHsiaWQiOiJmNyIsInFGciI6IkxlIGxpbmdlIGRlIG1haXNvbiBlc3QtaWwgZm91cm5pID8iLCJxRW4iOiJJcyBob3VzZWhvbGQgbGluZW4gcHJvdmlkZWQ/IiwiYUZyIjoiT3VpLCBsZSBsaW5nZSBkZSBsaXQgZXQgbGVzIHNlcnZpZXR0ZXMgc29udCBmb3VybmlzLiBMJ3V0aWxpc2F0aW9uIGR1IGxhdmUtbGluZ2UgZXN0IGluY2x1c2Ugc2FucyBmcmFpcyBzdXBwbFx1MDBlOW1lbnRhaXJlcy4iLCJhRW4iOiJZZXMsIGJlZCBsaW5lbiBhbmQgdG93ZWxzIGFyZSBwcm92aWRlZC4gVXNlIG9mIHRoZSB3YXNoaW5nIG1hY2hpbmUgaXMgaW5jbHVkZWQgYXQgbm8gZXh0cmEgY29zdC4ifSx7ImlkIjoiZjgiLCJxRnIiOiJZIGEtdC1pbCBkZXMgY2FtXHUwMGU5cmFzIGRlIHNcdTAwZTljdXJpdFx1MDBlOSA/IiwicUVuIjoiQXJlIHRoZXJlIHNlY3VyaXR5IGNhbWVyYXM/IiwiYUZyIjoiRGVzIGNhbVx1MDBlOXJhcyBkZSB2aWRcdTAwZTlvc3VydmVpbGxhbmNlIGV4dFx1MDBlOXJpZXVyZSBzb250IHByXHUwMGU5c2VudGVzIHN1ciBsYSBwcm9wcmlcdTAwZTl0XHUwMGU5IGV0IGZvbmN0aW9ubmVudCAyNGgvMjQuIEVsbGVzIGNvdXZyZW50IHVuaXF1ZW1lbnQgbGVzIGV4dFx1MDBlOXJpZXVycy4iLCJhRW4iOiJFeHRlcmlvciBzZWN1cml0eSBjYW1lcmFzIGFyZSBwcmVzZW50IG9uIHRoZSBwcm9wZXJ0eSBhbmQgb3BlcmF0ZSAyNC83LiBUaGV5IGNvdmVyIGV4dGVyaW9yIGFyZWFzIG9ubHkuIn1dLCJhbGVydHMiOltdLCJwYWdlcyI6W3siaWQiOiJ3ZWxjb21lIiwidGl0bGVGciI6IkJpZW52ZW51ZSIsInRpdGxlRW4iOiJXZWxjb21lIiwiaWNvbiI6Ilx1ZDgzY1x1ZGZlMSIsImNvbnRlbnRGciI6IkJpZW52ZW51ZSBhdSBQJ3RpdCBCb3VjaG9uICEiLCJjb250ZW50RW4iOiJXZWxjb21lIHRvIFAndGl0IEJvdWNob24hIiwiYWxpZ24iOiJjZW50ZXIiLCJ2YWxpZ24iOiJjZW50ZXIiLCJpbWFnZSI6IiIsInZpZGVvIjoiIiwidHlwZSI6IndlbGNvbWUifSx7ImlkIjoidmlsbGEiLCJ0aXRsZUZyIjoiTGEgVmlsbGEiLCJ0aXRsZUVuIjoiVGhlIFZpbGxhIiwiaWNvbiI6Ilx1ZDgzY1x1ZGYwYSIsImFsaWduIjoibGVmdCIsInZhbGlnbiI6InRvcCIsImltYWdlIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2M4MjdjODBlLTViMWQtNDk5NC1hOGFjLWJiZmRkNTAyZDM1ZS5wbmciLCJ2aWRlbyI6IiIsInR5cGUiOiJjdXN0b20iLCJjb250ZW50RnIiOiJWaWxsYSBQJ3RpdCBCb3VjaG9uIC0gRmFjZSBcdTAwZTAgbGEgTWVyXG5cbkZhY2UgYXUgbGFnb24sIGF2ZWMgdW5lIHZ1ZSBleHRyYW9yZGluYWlyZSBzdXIgbGEgbWVyIGV0IGxhIHBsYWdlIHB1YmxpcXVlLCBjZXR0ZSBzdXBlcmJlIHZpbGxhIGFjY3VlaWxsZSBqdXNxdSdcdTAwZTAgNiBwZXJzb25uZXMgZGFucyBzZXMgMyBjaGFtYnJlcyBldCBzYSBwaXNjaW5lIHByaXZcdTAwZTllLlxuXG5cdWQ4M2NcdWRmZTAgTCdlc3BhY2VcblJlei1kZS1jaGF1c3NcdTAwZTllIDogc2Fsb24sIHNhbGxlIFx1MDBlMCBtYW5nZXIgaW50XHUwMGU5cmlldXJlL2V4dFx1MDBlOXJpZXVyZSwgY3Vpc2luZSBvdXZlcnRlLCBXQywgdW5lIGNoYW1icmUgYXZlYyB2dWUgcGlzY2luZS5cblxuUHJlbWllciBcdTAwZTl0YWdlIDogY2hhbWJyZSBtYXN0ZXIgYXZlYyBncmFuZCBkcmVzc2luZywgdGVycmFzc2UgZXQgc2FsbGUgZGUgYmFpbiBwcml2YXRpdmUuIERldXhpXHUwMGU4bWUgY2hhbWJyZSBhdmVjIGRyZXNzaW5nLCBXQyBldCBzYWxsZSBkZSBiYWluLiBUb3V0ZXMgbGVzIGNoYW1icmVzIGR1IDFlciBcdTAwZTl0YWdlIG9udCB2dWUgc3VyIGxhIG1lci5cblxuXHUyMTM5XHVmZTBmIFx1MDBjMCBzYXZvaXJcblx1MjAyMiBQaXNjaW5lIHByaXZcdTAwZTllXG5cdTIwMjIgQVx1MDBlOXJvcG9ydCBcdTAwZTAgOCBtaW51dGVzXG5cdTIwMjIgVmlkXHUwMGU5b3N1cnZlaWxsYW5jZSBleHRcdTAwZTlyaWV1cmUgMjRoLzI0XG5cdTIwMjIgRWF1IGNoYXVkZSBzb2xhaXJlXG5cdTIwMjIgTGluZ2UgaW5jbHVzIHNhbnMgZnJhaXNcblxuXHUyYjUwIFN1cGVyaG9zdCAtIE5vdGUgNC45OS81IFx1MDBiNyAxNDkgYXZpcyIsImNvbnRlbnRFbiI6IlZpbGxhIFAndGl0IEJvdWNob24gLSBGYWNpbmcgdGhlIFNlYVxuXG5GYWNpbmcgdGhlIGxhZ29vbiwgd2l0aCBleHRyYW9yZGluYXJ5IHZpZXdzIG9mIHRoZSBzZWEgYW5kIHRoZSBwdWJsaWMgYmVhY2gsIHRoaXMgc3R1bm5pbmcgdmlsbGEgYWNjb21tb2RhdGVzIHVwIHRvIDYgZ3Vlc3RzIGluIGl0cyAzIGJlZHJvb21zIGFuZCBwcml2YXRlIHBvb2wuXG5cblx1ZDgzY1x1ZGZlMCBUaGUgU3BhY2Vcbkdyb3VuZCBmbG9vcjogbGl2aW5nIHJvb20sIGluZG9vci9vdXRkb29yIGRpbmluZyByb29tLCBvcGVuIGtpdGNoZW4sIFdDLCBvbmUgYmVkcm9vbSB3aXRoIHBvb2wgdmlldy5cblxuRmlyc3QgZmxvb3I6IG1hc3RlciBiZWRyb29tIHdpdGggbGFyZ2Ugd2Fsay1pbiB3YXJkcm9iZSwgdGVycmFjZSBhbmQgcHJpdmF0ZSBiYXRocm9vbS4gU2Vjb25kIGJlZHJvb20gd2l0aCB3YXJkcm9iZSwgV0MgYW5kIGJhdGhyb29tLiBBbGwgZmlyc3QgZmxvb3Igcm9vbXMgaGF2ZSBzZWEgdmlld3MuXG5cblx1MjEzOVx1ZmUwZiBHb29kIHRvIGtub3dcblx1MjAyMiBQcml2YXRlIHBvb2xcblx1MjAyMiBBaXJwb3J0IDggbWludXRlcyBhd2F5XG5cdTIwMjIgRXh0ZXJpb3IgQ0NUViAyNC83XG5cdTIwMjIgU29sYXIgaG90IHdhdGVyXG5cdTIwMjIgTGF1bmRyeSBpbmNsdWRlZCBmcmVlXG5cblx1MmI1MCBTdXBlcmhvc3QgLSBSYXRpbmcgNC45OS81IFx1MDBiNyAxNDkgcmV2aWV3cyJ9XSwidmlkZW9zIjpbeyJpZCI6ImRybnl2Z2J2bCIsInRpdGxlRnIiOiJWaXNpdGUgZHUgU3VkICIsInRpdGxlRW4iOiJWaXNpdCBvZiB0aGUgU291dGgiLCJkZXNjRnIiOiIiLCJkZXNjRW4iOiIiLCJ1cmwiOiJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PUVrVkpCSExMNmxVIn0seyJpZCI6ImwyM2UyMXhlZCIsInRpdGxlRnIiOiJWaXNpdGUgZGUgTCdFc3QiLCJ0aXRsZUVuIjoiVmlzaXQgb2YgdGhlIEVhc3QiLCJkZXNjRnIiOiIiLCJkZXNjRW4iOiIiLCJ1cmwiOiJodHRwczovL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PXo3YnR1ZExMeUtJIn0seyJpZCI6IjdyNnV0NjZjMSIsInRpdGxlRnIiOiJWaXNpdGUgZGUgTCdvdWVzdCIsInRpdGxlRW4iOiJWaXNpdCBvZiB0aGUgV2VzdCIsImRlc2NGciI6IiIsImRlc2NFbiI6IiIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9czQzTmdFQ1BYUFEifSx7ImlkIjoiaGtmc2lkbXBsIiwidGl0bGVGciI6IlZpc2l0ZSBkdSBOb3JkIiwidGl0bGVFbiI6IlZpc2l0IG9mIHRoZSBOb3J0aCIsImRlc2NGciI6IiIsImRlc2NFbiI6IiIsInVybCI6Imh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9WnZCMDJhYUM3OTAifV0sInZpbGxhUGhvdG9zIjpbImh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL21pc28vSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC9lYzNkOTk2Yy1iNGM0LTRlZWMtODAxZS1lNzQ1MjdkYTRkOTkuanBlZyIsImh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL2hvc3RpbmcvSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC85YTY0OWY0OC0wNTI0LTRiNjEtOGEyMi01NTEzMzk0NTI2MjQucG5nIiwiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2RkOGNlNGI2LWYyMDktNGY0YS1iM2E3LTc1MjEwYmVmZmNkMi5wbmciLCJodHRwczovL2EwLm11c2NhY2hlLmNvbS9pbS9waWN0dXJlcy9ob3N0aW5nL0hvc3RpbmctNTQxNTM5NzIvb3JpZ2luYWwvYzgyN2M4MGUtNWIxZC00OTk0LWE4YWMtYmJmZGQ1MDJkMzVlLnBuZyIsImh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL2hvc3RpbmcvSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC84MTE4YzQxYi05ZGRjLTQxZTQtYTViYi1mY2MzNzYyNjVjNWEucG5nIiwiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2Q1ZDRmYmQzLWVmZDAtNDdmOS04ZDU2LWI2ODVhMTY2NmUzOS5wbmciLCJodHRwczovL2EwLm11c2NhY2hlLmNvbS9pbS9waWN0dXJlcy9ob3N0aW5nL0hvc3RpbmctNTQxNTM5NzIvb3JpZ2luYWwvNDhjYTMzNjMtMDljZi00MWNmLTg4ZDgtOTgyZWY5ZjE5ZDA3LnBuZyIsImh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL21pc28vSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC80ZTEzMTVjNS1mODMwLTRmZGYtYTBiZi0zYmNjOGM0NjViMTAuanBlZyJdLCJpdGluZXJhcmllcyI6W3siaWQiOiJpMSIsImljb24iOiJcdWQ4M2NcdWRmZDZcdWZlMGYiLCJuYW1lRnIiOiJKb3Vyblx1MDBlOWUgUGxhZ2VzIiwibmFtZUVuIjoiQmVhY2ggRGF5IiwiZGVzY0ZyIjoiTGUgbWVpbGxldXIgZGVzIHBsYWdlcyBtYXVyaWNpZW5uZXMgZW4gdW5lIGpvdXJuXHUwMGU5ZSIsImRlc2NFbiI6IlRoZSBiZXN0IE1hdXJpdGlhbiBiZWFjaGVzIGluIG9uZSBkYXkiLCJjb2xvciI6IiMxYjZjYTgiLCJzdGVwcyI6W3sidGltZUZyIjoiOGgiLCJ0aW1lRW4iOiI4YW0iLCJ0ZXh0RnIiOiJQZXRpdC1kXHUwMGU5amV1bmVyIFx1MDBlMCBsYSBCb3VsYW5nZXJpZSBCbFx1MDBlOSBEJ29yIChQbGFpbmUgTWFnbmllbikiLCJ0ZXh0RW4iOiJCcmVha2Zhc3QgYXQgQmxcdTAwZTkgRCdvciBCYWtlcnkgKFBsYWluZSBNYWduaWVuKSJ9LHsidGltZUZyIjoiOWgzMCIsInRpbWVFbiI6Ijk6MzBhbSIsInRleHRGciI6IkJsdWUgQmF5IEJlYWNoIC0gZWF1IGNyaXN0YWxsaW5lLCBwYXJjIG1hcmluIHByb3RcdTAwZTlnXHUwMGU5ICgyMCBtaW4pIiwidGV4dEVuIjoiQmx1ZSBCYXkgQmVhY2ggLSBjcnlzdGFsIHdhdGVyLCBwcm90ZWN0ZWQgbWFyaW5lIHBhcmsgKDIwIG1pbikifSx7InRpbWVGciI6IjEyaCIsInRpbWVFbiI6IjEycG0iLCJ0ZXh0RnIiOiJEXHUwMGU5amV1bmVyIGF1IHJlc3RhdXJhbnQgTGVzIENvcGFpbnMgZCdBYm9yZCAodnVlIG1lcikiLCJ0ZXh0RW4iOiJMdW5jaCBhdCBMZXMgQ29wYWlucyBkJ0Fib3JkIChzZWEgdmlldykifSx7InRpbWVGciI6IjE0aCIsInRpbWVFbiI6IjJwbSIsInRleHRGciI6IlNub3JrZWxpbmcgLSBBbmdlbCBDcnVpc2VzIFNwZWVkYm9hdCBhdXggXHUwMGVlbGV0cyIsInRleHRFbiI6IlNub3JrZWxpbmcgLSBBbmdlbCBDcnVpc2VzIFNwZWVkYm9hdCB0byB0aGUgaXNsZXRzIn0seyJ0aW1lRnIiOiIxN2giLCJ0aW1lRW4iOiI1cG0iLCJ0ZXh0RnIiOiJQb2ludGUgRCdFc255IEJlYWNoIC0gY291Y2hlciBkZSBzb2xlaWwgbWFnaXF1ZSIsInRleHRFbiI6IlBvaW50ZSBEJ0VzbnkgQmVhY2ggLSBtYWdpY2FsIHN1bnNldCJ9LHsidGltZUZyIjoiMTloMzAiLCJ0aW1lRW4iOiI3OjMwcG0iLCJ0ZXh0RnIiOiJBcFx1MDBlOXJpdGlmIHN1ciBsYSB0ZXJyYXNzZSBkZSBsYSB2aWxsYSBmYWNlIGF1IGxhZ29uIiwidGV4dEVuIjoiQXBlcml0aWYgb24gdGhlIHZpbGxhIHRlcnJhY2UgZmFjaW5nIHRoZSBsYWdvb24ifV19LHsiaWQiOiJpMiIsImljb24iOiJcdWQ4M2NcdWRmM2YiLCJuYW1lRnIiOiJOYXR1cmUgJiBDYXNjYWRlcyIsIm5hbWVFbiI6Ik5hdHVyZSAmIFdhdGVyZmFsbHMiLCJkZXNjRnIiOiJGb3JcdTAwZWF0cyB0cm9waWNhbGVzLCBjYXNjYWRlcyBldCBwYW5vcmFtYXMgZGUgbCdcdTAwY2VsZSBNYXVyaWNlIiwiZGVzY0VuIjoiVHJvcGljYWwgZm9yZXN0cywgd2F0ZXJmYWxscyBhbmQgcGFub3JhbWFzIG9mIE1hdXJpdGl1cyIsImNvbG9yIjoiIzJlN2QzMiIsInN0ZXBzIjpbeyJ0aW1lRnIiOiI3aCIsInRpbWVFbiI6IjdhbSIsInRleHRGciI6IkRcdTAwZTlwYXJ0IG1hdGluYWwgLSBwaXF1ZS1uaXF1ZSBldCBjaGF1c3N1cmVzIGRlIHJhbmRvIiwidGV4dEVuIjoiRWFybHkgc3RhcnQgLSBwaWNuaWMgYW5kIGhpa2luZyBzaG9lcyJ9LHsidGltZUZyIjoiOWgiLCJ0aW1lRW4iOiI5YW0iLCJ0ZXh0RnIiOiJMaW9uIE1vdW50YWluIFRyYWlsIC0gcmFuZG9ublx1MDBlOWUgcGFub3JhbWlxdWUgKDJoMzApIiwidGV4dEVuIjoiTGlvbiBNb3VudGFpbiBUcmFpbCAtIHBhbm9yYW1pYyBoaWtlICgyaDMwKSJ9LHsidGltZUZyIjoiMTJoIiwidGltZUVuIjoiMTJwbSIsInRleHRGciI6IkRcdTAwZTlqZXVuZXIgXHUwMGUwIE1haGVib3VyZyBXYXRlcmZyb250IiwidGV4dEVuIjoiTHVuY2ggYXQgTWFoZWJvdXJnIFdhdGVyZnJvbnQifSx7InRpbWVGciI6IjE0aCIsInRpbWVFbiI6IjJwbSIsInRleHRGciI6IlRhbWFyaW5kIEZhbGxzIC8gNyBDYXNjYWRlcyAtIGJhaWduYWRlIG5hdHVyZWxsZSIsInRleHRFbiI6IlRhbWFyaW5kIEZhbGxzIC8gNyBDYXNjYWRlcyAtIG5hdHVyYWwgc3dpbW1pbmcifSx7InRpbWVGciI6IjE3aCIsInRpbWVFbiI6IjVwbSIsInRleHRGciI6IkxhIFZhbGxcdTAwZTllIGRlIEZlcm5leSAtIGZhdW5lIGV0IGZsb3JlIGVuZFx1MDBlOW1pcXVlcyIsInRleHRFbiI6IkZlcm5leSBWYWxsZXkgLSBlbmRlbWljIGZhdW5hIGFuZCBmbG9yYSJ9XX0seyJpZCI6ImkzIiwiaWNvbiI6Ilx1ZDgzY1x1ZGY3OSIsIm5hbWVGciI6IlJodW0gJiBHYXN0cm9ub21pZSIsIm5hbWVFbiI6IlJ1bSAmIEdhc3Ryb25vbXkiLCJkZXNjRnIiOiJDdWx0dXJlIG1hdXJpY2llbm5lLCByaHVtIGV0IHNhdmV1cnMgbG9jYWxlcyIsImRlc2NFbiI6Ik1hdXJpdGlhbiBjdWx0dXJlLCBydW0gYW5kIGxvY2FsIGZsYXZvcnMiLCJjb2xvciI6IiNjNDdhM2EiLCJzdGVwcyI6W3sidGltZUZyIjoiOWgiLCJ0aW1lRW4iOiI5YW0iLCJ0ZXh0RnIiOiJNYWhlYm91cmcgTWFya2V0IC0gZnJ1aXRzLCBcdTAwZTlwaWNlcyBldCBhcnRpc2FuYXQgbG9jYWwiLCJ0ZXh0RW4iOiJNYWhlYm91cmcgTWFya2V0IC0gZnJ1aXRzLCBzcGljZXMgYW5kIGxvY2FsIGNyYWZ0cyJ9LHsidGltZUZyIjoiMTFoIiwidGltZUVuIjoiMTFhbSIsInRleHRGciI6IkJvaXMgQ2hcdTAwZTlyaSBUZWEgRmFjdG9yeSAtIHZpc2l0ZSBndWlkXHUwMGU5ZSArIGRcdTAwZTlndXN0YXRpb24gdGhcdTAwZTkiLCJ0ZXh0RW4iOiJCb2lzIENoXHUwMGU5cmkgVGVhIEZhY3RvcnkgLSBndWlkZWQgdG91ciArIHRlYSB0YXN0aW5nIn0seyJ0aW1lRnIiOiIxM2giLCJ0aW1lRW4iOiIxcG0iLCJ0ZXh0RnIiOiJEXHUwMGU5amV1bmVyIGF1IHJlc3RhdXJhbnQgQm9pcyBDaFx1MDBlOXJpLCB2dWUgcGFub3JhbWlxdWUiLCJ0ZXh0RW4iOiJMdW5jaCBhdCBCb2lzIENoXHUwMGU5cmkgcmVzdGF1cmFudCwgcGFub3JhbWljIHZpZXcifSx7InRpbWVGciI6IjE1aCIsInRpbWVFbiI6IjNwbSIsInRleHRGciI6IkxhIFZhbmlsbGUgTmF0dXJlIFBhcmsgLSB0b3J0dWVzIGdcdTAwZTlhbnRlcyBldCBjcm9jb2RpbGVzIiwidGV4dEVuIjoiTGEgVmFuaWxsZSBOYXR1cmUgUGFyayAtIGdpYW50IHRvcnRvaXNlcyBhbmQgY3JvY29kaWxlcyJ9LHsidGltZUZyIjoiMThoIiwidGltZUVuIjoiNnBtIiwidGV4dEZyIjoiRFx1MDBlOWd1c3RhdGlvbiByaHVtIG1hdXJpY2llbiBcdTAwZTAgbGEgdmlsbGEiLCJ0ZXh0RW4iOiJNYXVyaXRpYW4gcnVtIHRhc3RpbmcgYXQgdGhlIHZpbGxhIn1dfV0sImNhdGVnb3JpZXMiOlt7ImlkIjoicmVzdGF1cmFudHMiLCJuYW1lRnIiOiJSZXN0YXVyYW50cyIsIm5hbWVFbiI6IlJlc3RhdXJhbnRzIiwiaWNvbiI6Ilx1ZDgzY1x1ZGY3ZFx1ZmUwZiIsImNvbG9yIjoiI2UwN2I1NCIsIml0ZW1zIjpbeyJpZCI6IjV1OTltdHlsIiwibmFtZUZyIjoiVGFzdHkgV2F2ZSBSZXN0YXVyYW50ICYgU2hvcCIsIm5hbWVFbiI6IlRhc3R5IFdhdmUgUmVzdGF1cmFudCAmIFNob3AiLCJkZXNjRnIiOiJDdWlzaW5lIG1hdXJpY2llbm5lIGV0IGludGVybmF0aW9uYWxlIGRhbnMgdW4gY2FkcmUgZFx1MDBlOWNvbnRyYWN0XHUwMGU5IGZhY2UgXHUwMGUwIGxhIG1lci4gRnJ1aXRzIGRlIG1lciBmcmFpcyBldCBjb2NrdGFpbHMgbWFpc29uIHJlY29tbWFuZFx1MDBlOXMuIiwiZGVzY0VuIjoiTWF1cml0aWFuIGFuZCBpbnRlcm5hdGlvbmFsIGN1aXNpbmUgaW4gYSByZWxheGVkIHNlYWZyb250IHNldHRpbmcuIEZyZXNoIHNlYWZvb2QgYW5kIGhvbWVtYWRlIGNvY2t0YWlscyBoaWdobHkgcmVjb21tZW5kZWQuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40NjQ5Nzc3LDU3LjY3OTA5MTIiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d5Qm1RWEtiRnRsNl9hUjVXdUplZV9MNS1ySkNhemdwa3JHMnVURVQzVDQwSG9mQzdPVVZQc3c1aUwxMzEzR01HUXVBa09XTHAtNmwtbUF0TnU4czg4UkR2blduQk0wLVNjVzlNUllpa1VuSWRGeDlRdHM3T1Rud0phZmNKZHRYZkhxcE43V1hkNndJZHQ0ODROV19hSEEwQzVTdkh2aTBJXzREN29jV3k5Zm5lSDBPMkM4T3IwSVN2RjlFX3Q5VFRsNzZJSlpFLW83OTRzSEEtRmtWc0l1YTFGdGZMeVRtRDI4RjNSWUhLcS1qb0JLejJILUNPeWtaWUE/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJyZzF2YnNwNCIsIm5hbWVGciI6IlRoZSBWaWtpbmcgUmVzdG8iLCJuYW1lRW4iOiJUaGUgVmlraW5nIFJlc3RvIiwiZGVzY0ZyIjoiUmVzdGF1cmFudCBwb3B1bGFpcmUgZGUgTWFoZWJvdXJnIHByb3Bvc2FudCB1bmUgY3Vpc2luZSBsb2NhbGUgZ1x1MDBlOW5cdTAwZTlyZXVzZS4gUG9pc3NvbnMgZ3JpbGxcdTAwZTlzIGV0IGN1cnJ5cyBtYXVyaWNpZW5zIFx1MDBlMCBwcml4IGFib3JkYWJsZXMuIiwiZGVzY0VuIjoiUG9wdWxhciBNYWhlYm91cmcgcmVzdGF1cmFudCBvZmZlcmluZyBnZW5lcm91cyBsb2NhbCBjdWlzaW5lLiBHcmlsbGVkIGZpc2ggYW5kIE1hdXJpdGlhbiBjdXJyaWVzIGF0IGFmZm9yZGFibGUgcHJpY2VzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDY3NTI4NCw1Ny42ODAzMDIxIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeDVyQ3BSVC1JX2lmLTBucm54eXlqYjExaGhTTkF6Mks4cU43SnhlZ1BIdlBuenM0am9LZHprajZYa0NzSXhWOEZ6SDRQRTBSNWs5akVTRU80UlRubXpzRlFrUDJ1QTluaWdqV1kwajVGN3NaVENjV2stdTJmdWVKTnBjblUybzl6UTdGa092aDBvRUZEbDQxeDBXTGVtWXJ2N3hkS1pDRUhJN0xnQlZ6UTc5TXhQQjVCbHdoeTg1UGhpMWNCMTlta0xZNk5MM2ZIQj9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6ImowZGo1aHNhIiwibmFtZUZyIjoiQmx1ZSBCYW1ib28iLCJuYW1lRW4iOiJCbHVlIEJhbWJvbyIsImRlc2NGciI6IkFtYmlhbmNlIGFzaWF0aXF1ZSBmdXNpb24gZGFucyB1biBjYWRyZSBzb2lnblx1MDBlOS4gQ3Vpc2luZSBzaW5vLW1hdXJpY2llbm5lIHJhZmZpblx1MDBlOWUsIGlkXHUwMGU5YWxlIHBvdXIgdW4gZFx1MDBlZW5lciBlbiBhbW91cmV1eC4iLCJkZXNjRW4iOiJBc2lhbiBmdXNpb24gYXRtb3NwaGVyZSBpbiBhIHJlZmluZWQgc2V0dGluZy4gU29waGlzdGljYXRlZCBTaW5vLU1hdXJpdGlhbiBjdWlzaW5lLCBpZGVhbCBmb3IgYSByb21hbnRpYyBkaW5uZXIuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40Mzk4OTI4LDU3LjcyMjQzODgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d3Z2dXaFlHcGhGcVEta1R2bzF0TzZXV0VEeFdoYjFueGZkYy0tV2pGaEh3Y3VYUWVqLXlCVXZtYXE4bFo2dTRWMVZsV2tiWm0wR1U2X1hubHNsWHByLUhuU3VpWHdMcGhHRUFWeTRrbWNCQmI5aDd1M1FXX2FSMWp2TklNYjhDWjdEalNPekRSVzdqTWtDM1NhelZSdXRkamFsQnoyYUhpYjVESXNXanowa1Z0N0drT25mbmJuVnlNeDlVZHNFRlZYOUZpU1hrUjQ3UVE/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJvOTU4bHh3diIsIm5hbWVGciI6IkxlcyBDb3BhaW5zIGQnQWJvcmQiLCJuYW1lRW4iOiJMZXMgQ29wYWlucyBkJ0Fib3JkIiwiZGVzY0ZyIjoiUmVzdGF1cmFudCBlbWJsXHUwMGU5bWF0aXF1ZSBkZSBNYWhlYm91cmcgYXZlYyB2dWUgc3VyIGxlIGxhZ29uLiBGcnVpdHMgZGUgbWVyIGZyYWlzIGV0IGN1aXNpbmUgY3JcdTAwZTlvbGUgYXV0aGVudGlxdWUgZGFucyB1bmUgYW1iaWFuY2UgY29udml2aWFsZS4iLCJkZXNjRW4iOiJJY29uaWMgTWFoZWJvdXJnIHJlc3RhdXJhbnQgb3Zlcmxvb2tpbmcgdGhlIGxhZ29vbi4gRnJlc2ggc2VhZm9vZCBhbmQgYXV0aGVudGljIENyZW9sZSBjdWlzaW5lIGluIGEgd2FybSBhdG1vc3BoZXJlLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDA4NjQ3Miw1Ny43MDk5ODYxIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeWZNWkxzYTdrM1ZMTDlhYnk2a3ZBS2RlNlltandLMEVNYnc5NFZqRWl2MlpSNWdBVld0eFNyeEFMTXFjRXZHTmstV0pfOUJGakphRmFreENHWUU3cEdEb2pxZm1HTDNIU043YkZOYkd6U3hiWXhabERJdzZ5V2RrMXh4QWFLMXFZb2pES1RPbzFUdC1haS1EUU5qa2ZQcjMyaFVwZ0NMNzNJbElZUGh6MjZiblNkbFdScmxtaVBkYzFBM3dsTERqRkdzOHozMkNZSD9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InI5dzFocDNtIiwibmFtZUZyIjoiTGUgQmF6aWxpYyIsIm5hbWVFbiI6IkxlIEJhemlsaWMiLCJkZXNjRnIiOiJDdWlzaW5lIGNyXHUwMGU5b2xlIGV0IGludGVybmF0aW9uYWxlIGRhbnMgdW4gY2FkcmUgdHJvcGljYWwgbHV4dXJpYW50LiBTdGVha3MsIGdyaWxsYWRlcyBldCBzcFx1MDBlOWNpYWxpdFx1MDBlOXMgbG9jYWxlcyBkYW5zIHVuZSBhbWJpYW5jZSBjaGFsZXVyZXVzZS4iLCJkZXNjRW4iOiJDcmVvbGUgYW5kIGludGVybmF0aW9uYWwgY3Vpc2luZSBpbiBhIGx1c2ggdHJvcGljYWwgc2V0dGluZy4gU3RlYWtzLCBncmlsbHMgYW5kIGxvY2FsIHNwZWNpYWx0aWVzIGluIGEgd2FybSBhdG1vc3BoZXJlLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDA3ODI2Nyw1Ny43MDcyNjA3IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeE9sMTZtbEtWZUxvMGlsOFVIanNhWktCd1A0WGlfYU5Pd2l0bGxtS2d6bTdlNnRtTk9RemtaNWdyN2ppYWdzRTR0dEVUbzhGbmpJMW9OSTNuU19FLVRhcWplQkdiWmpnVVZVYlR1Z0xLclhhZzY0QS1sMjJUS1ozU25iUnpxRlg0cUYwaVAtbEhlWnJqbkRrdEVJSXRzTzIyZXVkVDdmR0NjMk1kc2RFNUJITkZUa2tRLV9EQkpoMUIxeFdEYjVTcTdkV2FKT1YtRjBRP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoidDJ1cWhvMjciLCJuYW1lRnIiOiJUYXN0ZSBvZiBGcmVlZG9tIiwibmFtZUVuIjoiVGFzdGUgb2YgRnJlZWRvbSIsImRlc2NGciI6IlJlc3RhdXJhbnQgYW5pbVx1MDBlOSBhdmVjIHVuZSBjYXJ0ZSB2YXJpXHUwMGU5ZSwgYnVyZ2VycyBldCBwbGF0cyBtYXVyaWNpZW5zLiBBbWJpYW5jZSBmZXN0aXZlIGV0IHNlcnZpY2UgZFx1MDBlOWNvbnRyYWN0XHUwMGU5LiIsImRlc2NFbiI6IkxpdmVseSByZXN0YXVyYW50IHdpdGggYSB2YXJpZWQgbWVudSwgYnVyZ2VycyBhbmQgTWF1cml0aWFuIGRpc2hlcy4gRmVzdGl2ZSBhdG1vc3BoZXJlIGFuZCByZWxheGVkIHNlcnZpY2UuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MjAwNTI0LDU3LjcxMjEyNCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dNODdqcWVtS0hoYlpLYmpxWEN4TXNrbVN6aVh1SmM4Ynd3aG5QWHJmdUZWZ1Y2ak1RZVhKZEJpdUFaRl9QMmVyWE1oR3gtb1V5WGc0UnlQUmlRZXF4TV9XY3hGb1RaOE9LOG54NEdYQThDVVRvSEZZbzlkOEdIb0FpRG1jUllLZTF4OVNfWDV6bGRyc2xwZnQ2YkNHb1lUQ2hibUlQd3dJOUgwOG1fWEFOM3FEY1pkejFFc2R4aUVjY2k0Mm5QdUZQXy0xOVhPbHJhSHVMS0Jza01pRGpnX19FU18yTWN0NTZCZU8tcWNJSlJBb1E2OWgzb0ZpSFFXMD9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InhieHV5OW00IiwibmFtZUZyIjoiTGUgSmFyZGluIGRlIEJlYXUgVmFsbG9uIiwibmFtZUVuIjoiTGUgSmFyZGluIGRlIEJlYXUgVmFsbG9uIiwiZGVzY0ZyIjoiRFx1MDBlZW5lciByb21hbnRpcXVlIGRhbnMgdW4gamFyZGluIHRyb3BpY2FsIGV4Y2VwdGlvbm5lbC4gQ3Vpc2luZSBtYXVyaWNpZW5uZSBldCBpbnRlcm5hdGlvbmFsZSByYWZmaW5cdTAwZTllIGRhbnMgdW4gY2FkcmUgZW5jaGFudGV1ci4iLCJkZXNjRW4iOiJSb21hbnRpYyBkaW5pbmcgaW4gYW4gZXhjZXB0aW9uYWwgdHJvcGljYWwgZ2FyZGVuLiBSZWZpbmVkIE1hdXJpdGlhbiBhbmQgaW50ZXJuYXRpb25hbCBjdWlzaW5lIGluIGFuIGVuY2hhbnRpbmcgc2V0dGluZy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQyNDc1NzMsNTcuNzAxMTE4OCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dCRlc2YzViNTdXMmhFTVRTeW94WUhOSzlmcGV2ZVlsMDdwNHZIZk9uOTFGVF95dXhzZV8zRFowWF9pWkpUOTlCMG9MVXJoQ0Z2a1Q2MGtFVkFiS0hDTnNVRkdKQXc3N2RQUXZVTGFCMXVqUmNIczFyTldhMGd1c2NFOGR4VmZ1d0JLdk1wVUcwM2RwTjVIOGVtN19fNG9Sa1RRRjVObF9IaG1HT2xKTElsT3Q2VWVnR2w3Z3NHZTJLR2V0cU1SdDFJbHFsalVETXlpOG8tMGtnZWJuekFFSzk0VFZwNThqSHJUSVRoOThneWg1SlJNYk91Q19jMkhvdz9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6Inl1MDk5cG9vIiwibmFtZUZyIjoiQ2Fzc2UgQ3JvdXRlIiwibmFtZUVuIjoiQ2Fzc2UgQ3JvdXRlIiwiZGVzY0ZyIjoiUGV0aXQgcmVzdGF1cmFudCBsb2NhbCBzYW5zIHByXHUwMGU5dGVudGlvbiBwb3VyIGdvXHUwMGZidGVyIGxhIHZyYWllIGN1aXNpbmUgbWF1cmljaWVubmUuIE1pbmUgZnJpdGUsIGJvbCByZW52ZXJzXHUwMGU5IGV0IGRob2xsIHB1cmkgbWFpc29uLiIsImRlc2NFbiI6IlVucHJldGVudGlvdXMgbG9jYWwgZWF0ZXJ5IHRvIHRhc3RlIHJlYWwgTWF1cml0aWFuIGZvb2QuIEZyaWVkIG5vb2RsZXMsIGJvbCByZW52ZXJzZSBhbmQgaG9tZW1hZGUgZGhvbGwgcHVyaS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNjM0NzIsNTcuNzA3NDEyOCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3plLU9MQTF2WGJfSW9rRmtoWl9KZl9tYk01cWROaXpVU0JoVDBOS0dUZk1hd08xRTdvbnZPc182X3VnV1JlREhSV2RSbV8wWE5FM3BSdUdVVm9DUlpael9pbmlaYlBUMkQwOVdOeklDYnNZSzNrY2RwTmJfdms1eHdIM0lYRVNhek5YVnlsQktyWVAya2Q2NDRNaG1VWlozaXJpSk9JNmk1SXFSMzR2Z0lqYkM2ZFdlSXl2ZUFQS1dQeTBIdHF0aVJ6V1hZRHp6NjI/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJ1aHVydzZpNyIsIm5hbWVGciI6IkVzY28gQnVyZ2VycyIsIm5hbWVFbiI6IkVzY28gQnVyZ2VycyIsImRlc2NGciI6IkJ1cmdlcnMgYXJ0aXNhbmF1eCBnXHUwMGU5blx1MDBlOXJldXggZXQgZnJpdGVzIGZyYVx1MDBlZWNoZXMuIENvbmNlcHQgc3RyZWV0IGZvb2QgbW9kZXJuZSBkYW5zIHVuZSBhbWJpYW5jZSBqZXVuZSBldCBkXHUwMGU5Y29udHJhY3RcdTAwZTllLiIsImRlc2NFbiI6IkdlbmVyb3VzIGNyYWZ0IGJ1cmdlcnMgYW5kIGZyZXNoIGZyaWVzLiBNb2Rlcm4gc3RyZWV0IGZvb2QgY29uY2VwdCB3aXRoIGEgeW91bmcsIHJlbGF4ZWQgdmliZS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQ0MzE4NjksNTcuNzE3NTY1MyIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dySEdLSDROSDZBejBaQkYtdjFyX2Z6cTNQalp5UG5OTjhPNGFaYXBKVjFpbUVOWS01emdQbXZQTEJxVlExQy1xVkV0LUhTSWVtZzE2c2ZJZEhSdVRTSFdBVExiTGc1cjVxZVNuSkV1VkE3Nk5pT29VdENYZDdXY1lhMUEwUkYtLXE1cThhLUwxNG1WMzZKcVpPM0RsaGdKRlV2ZUgxTFVQQlhLSE1peWZlTm1fVUFucDBxTnlNaTE4enZiQzhMeE5UakhBVXV1aXY/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJjNGh4bjh5eiIsIm5hbWVGciI6IktvdCBOaW5pIFBpenphICYgRGVsaXZlcnkiLCJuYW1lRW4iOiJLb3QgTmluaSBQaXp6YSAmIERlbGl2ZXJ5IiwiZGVzY0ZyIjoiUGl6emFzIGFydGlzYW5hbGVzIGF2ZWMgbGl2cmFpc29uIGRpc3BvbmlibGUuIElkXHUwMGU5YWwgcG91ciB1bmUgc29pclx1MDBlOWUgdHJhbnF1aWxsZSBcdTAwZTAgbGEgdmlsbGEuIiwiZGVzY0VuIjoiUGl6emFzIGFydGlzYW5hbGVzIGF2ZWMgbGl2cmFpc29uIGRpc3BvbmlibGUuIElkXHUwMGU5YWwgcG91ciB1bmUgc29pclx1MDBlOWUgdHJhbnF1aWxsZSBcdTAwZTAgbGEgdmlsbGEuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDg2OTM3LDU3LjcwODg3MSIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3p0QXJqLV9xMFpYRE14WnJCVGxiTWZZR1NnZExiZ0VfNVFUQmJNU3htYWtPSlduN2MzMnNWTnhfVF9jd1dyaGRWNGFsdzFFNmJlSUxiVGJqRFJoTTdNY1BMUGgzTUdaUW1ZWl9uRXk3bUYzSG50RTJnSVl3XzBMcnBoR2UyTVYwc3J2TFM4RXFxUi0yWWZtdUJjTmpxQzQwTkczNDQ4WnpmcklTdlRqdEZZMVJ0NXR2a1lYOE5ER2hMRUg0QXFsMkctNFFuc3ZzaFg/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJwYjNlM2MxZyIsIm5hbWVGciI6IkZlcm5leSBGYWxhaXNlIFJvdWdlIFJlc3RhdXJhbnQiLCJuYW1lRW4iOiJGZXJuZXkgRmFsYWlzZSBSb3VnZSBSZXN0YXVyYW50IiwiZGVzY0ZyIjoiUmVzdGF1cmFudCBuaWNoXHUwMGU5IGRhbnMgbGEgdmFsbFx1MDBlOWUgZGUgRmVybmV5LCBjYWRyZSBuYXR1cmVsIGV4Y2VwdGlvbm5lbC4gQ3Vpc2luZSBjclx1MDBlOW9sZSBldCBncmlsbGFkZXMgZGFucyB1biBlbnZpcm9ubmVtZW50IHZlcmRveWFudC4iLCJkZXNjRW4iOiJSZXN0YXVyYW50IG5lc3RsZWQgaW4gRmVybmV5IFZhbGxleSB3aXRoIGFuIGV4Y2VwdGlvbmFsIG5hdHVyYWwgc2V0dGluZy4gQ3Jlb2xlIGN1aXNpbmUgYW5kIGdyaWxscyBpbiBhIGx1c2ggZ3JlZW4gZW52aXJvbm1lbnQuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC4zODM3Miw1Ny43MDI3NzQ2IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9Hd1JoR1RDbGhsbU9ET05tN1laRU9jN3hNWHZpWFlFVmVHazRpR2VaUndOejdEcWlfMmgxdk1UNEQ1U0Voc1RFcV80Sk9pU2RRbTBTODJsMUtBbHZHYVljSno3S2xtaHpwMG1BaXljcUttNGxxX0E1TTJaRGxxWkxZRWpJWUtjSlp3aGE1TzJ2Z2FLM0E0OWNVQjQ3VklBOEZhZWRMUFFkRE9vcU03cXY4cExZQlEtRkE2cjJORXFMaEE3dlduU3B5QWdTZEVCSG1sZz9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InR2cDBtaGphIiwibmFtZUZyIjoiQ2hleiBQYXRyaWNrIiwibmFtZUVuIjoiQ2hleiBQYXRyaWNrIiwiZGVzY0ZyIjoiUmVzdGF1cmFudCBmYW1pbGlhbCB0clx1MDBlOHMgYXBwclx1MDBlOWNpXHUwMGU5IHBvdXIgc2VzIGZydWl0cyBkZSBtZXIgZnJhaXMgZXQgc2EgY3Vpc2luZSBtYXVyaWNpZW5uZSBhdXRoZW50aXF1ZS4gU2VydmljZSBjaGFsZXVyZXV4IGV0IHByaXggcmFpc29ubmFibGVzLiIsImRlc2NFbiI6IkhpZ2hseSByZWdhcmRlZCBmYW1pbHkgcmVzdGF1cmFudCBrbm93biBmb3IgZnJlc2ggc2VhZm9vZCBhbmQgYXV0aGVudGljIE1hdXJpdGlhbiBjdWlzaW5lLiBXYXJtIHNlcnZpY2UgYW5kIHJlYXNvbmFibGUgcHJpY2VzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDE0NzQxNiw1Ny43MDQ4OTE3IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeU5BVi1fOFM4RFVUbFNwOThxeE5zYXQxWFJiQ2RSRmFRMkE1dUd6SVlXajc0MldVTHlsRmlLdlp0M1dwMmh2cHRlVEtMNU5rQTFPSjFjOTROTDU3NWFqSVdtb1RHUFdnRGtpbDdaQVF3N3RmTjNYd1pFM2xkWXdUQWlQUTBJbzFEY2hfdjhTUkQwa19MQmh0X2RLOG5SUXBlM3N1Rll4dHJDOGF3WG1tdkNOaUdkTWdoTzNTSXY3dTM3S29fb1pxVEliTGZhN09nT2tTOXJycGxzcmxlR3N4RUQzaWlSb3k1cjFSRUFKUFRlM1FiQkxZZ0Nvd3VWU0RnP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoia29od2l1bXgiLCJuYW1lRnIiOiJTYXZldXJzIGRlIFNoaW4iLCJuYW1lRW4iOiJTYXZldXJzIGRlIFNoaW4iLCJkZXNjRnIiOiJSZXN0YXVyYW50IHNpbm8tbWF1cmljaWVuIHByb3Bvc2FudCBzcFx1MDBlOWNpYWxpdFx1MDBlOXMgY2hpbm9pc2VzIGV0IGNyXHUwMGU5b2xlcy4gQ2FkcmUgc2ltcGxlLCBwb3J0aW9ucyBnXHUwMGU5blx1MDBlOXJldXNlcyBldCBzYXZldXJzIGF1dGhlbnRpcXVlcy4iLCJkZXNjRW4iOiJTaW5vLU1hdXJpdGlhbiByZXN0YXVyYW50IG9mZmVyaW5nIENoaW5lc2UgYW5kIENyZW9sZSBzcGVjaWFsdGllcy4gU2ltcGxlIHNldHRpbmcsIGdlbmVyb3VzIHBvcnRpb25zIGFuZCBhdXRoZW50aWMgZmxhdm91cnMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDg5NTc5LDU3LjcwOTI4NzMiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d6UEtrbzZsVkZCZmhVMW5OTzhPTGVvLTFZdktsV1ZFa2I4S09BV0M5c0hVdHM2WGxEOHNZT0xtSGVyMWNWQzlnMmpYUHlXcUlWLWJRU3dlUVVtV2V1WUdMQ3A4NWl2aF9mM1p3YmY5MUQ5Y2F5eU41TWtLbzU1Wk9OZVVsQVJFSkJTSGN0YzBRNU94NVpMRGJ6SmdrZ2NsT2ljaWdQaFBtLVd1M3Q2WXpDQkdCbVY2dFB4SVJFZ2haOTJlb2FPZFY0dTRyNWd1aGwyP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiem9qbGdtOW8iLCJuYW1lRnIiOiJOYXlheiBCcml5YW5pIiwibmFtZUVuIjoiTmF5YXogQnJpeWFuaSIsImRlc2NGciI6IkxlIG1laWxsZXVyIGJyaWFuaSBkZSBNYWhlYm91cmcgc2Vsb24gbGVzIGxvY2F1eC4gQ3Vpc2luZSBoYWxhbCwgcml6IGJhc21hdGkgcGFyZnVtXHUwMGU5IGV0IHZpYW5kZXMgbWlqb3RcdTAwZTllcy4iLCJkZXNjRW4iOiJUaGUgYmVzdCBiaXJ5YW5pIGluIE1haGVib3VyZyBhY2NvcmRpbmcgdG8gbG9jYWxzLiBIYWxhbCBjdWlzaW5lLCBmcmFncmFudCBiYXNtYXRpIHJpY2UgYW5kIHNsb3ctY29va2VkIG1lYXRzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDMxNzUyNSw1Ny42NTkxMTUzIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeFktR0pWaktnSXhNWnJWQmx5c044NXZEZTlHRm90T2lfRkU1RGQtaXBkX3A5Z2p5TlRLQURDRUFBdk5iN04zYzVfVlFwUnRxN1BhcEhHRFJySzM5b21jRkM1RXRIb1pUbWltQmdSb1Jlb0RJZjJ4QkN3UGdGOEV6ckVZRlV2ZklTNDNGUWIxeC1leXdVNG9rNkNORGNVc3VTRko4OG14T1BqWGNTRGd0cXB5SHZvaWZfWGh5YXhLejk2cHZ1V0xPZTl5Und5bzBfej9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InllaGJocXJ4IiwibmFtZUZyIjoiQm9pcyBDaFx1MDBlOXJpIiwibmFtZUVuIjoiQm9pcyBDaFx1MDBlOXJpIiwiZGVzY0ZyIjoiUmVzdGF1cmFudCBwYW5vcmFtaXF1ZSBhdSBjb2V1ciBkZXMgcGxhbnRhdGlvbnMgZGUgdGhcdTAwZTkuIFZ1ZSBpbXByZW5hYmxlIHN1ciBsZSBzdWQgZGUgbCBpbGUgZXQgY3Vpc2luZSBtYXVyaWNpZW5uZSByYWZmaW5lZS4iLCJkZXNjRW4iOiJQYW5vcmFtaWMgcmVzdGF1cmFudCBpbiB0aGUgaGVhcnQgb2YgdGhlIHRlYSBwbGFudGF0aW9ucy4gQnJlYXRodGFraW5nIHZpZXdzIG92ZXIgdGhlIHNvdXRoIG9mIHRoZSBpc2xhbmQgYW5kIHJlZmluZWQgTWF1cml0aWFuIGN1aXNpbmUuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MjgxOTU5LDU3LjUyMjMzODgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d4eGltZmFFY1NBQjd5eGdvckdBRG5LdE5UZEpZOGljNVR5VDQ1T0lLa09aV0x0ZWd3VjAtejlVU3pzREl5NjV3YTFDajNyQVJFaDNneGFtU2FwOFlUSy1hYzZtc1Y4dk5ZX3ZtS1lPM0ljVGVlNFphY0QzWWNVZEJZZ3dYS3Zkc2FpaW9QNmZidjNZeEhVa1hPc2ZvTEZIQUR4blhHaThfTVdGV2FEblFJSkFYamNOdW41cTItUlBLQ281aGlpekppWVhSV1lQVV9GeUZxMEVGd29VWFZJamloRVVYRF9xX1JYcFd3NHEtQzAwem51SFJtYkxNN1VuZWs/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiI2aTM0OWdlZiIsIm5hbWVGciI6IlNoYW5kcmFuaSBCZWFjaGNvbWJlciBSZXNvcnQgJiBTcGEiLCJuYW1lRW4iOiJTaGFuZHJhbmkgQmVhY2hjb21iZXIgUmVzb3J0ICYgU3BhIiwiZGVzY0ZyIjoiUmVzb3J0IDUgXHUwMGU5dG9pbGVzIHRvdXQtaW5jbHVzIHN1ciB1bmUgcHJlc3F1J1x1MDBlZWxlIHByaXZcdTAwZTllLiBQbHVzaWV1cnMgcmVzdGF1cmFudHMgZ2FzdHJvbm9taXF1ZXMsIHBsYWdlcyBwcml2XHUwMGU5ZXMgZXQgc3BhIGRlIGx1eGUuIiwiZGVzY0VuIjoiNS1zdGFyIGFsbC1pbmNsdXNpdmUgcmVzb3J0IG9uIGEgcHJpdmF0ZSBwZW5pbnN1bGEuIFNldmVyYWwgZ291cm1ldCByZXN0YXVyYW50cywgcHJpdmF0ZSBiZWFjaGVzIGFuZCBsdXh1cnkgc3BhLiIsImFkZHJlc3MiOiJMZSBDaGFsYW5kIiwicGhvbmUiOiIrMjMwICA2MDMgNDEwMCIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDQ4NzAxMyw1Ny43MDY2NDA3IiwiaW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vcC9BRjFRaXBQSVdWdTI4N2dELWtORDlMd0tlVXFhTU81VXRPOEJCS0lxeFpGNT1zMTM2MC13MTM2MC1oMTAyMC1ydyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IkJyZWFrZmFzdCAvIFBldGl0LWRcdTAwZTlqZXVuZXIgOiAwNmgwMCBcdTIwMTMgMTBoMDAgTHVuY2ggLyBEXHUwMGU5amV1bmVyIDogMTJoMzAgXHUyMDEzIDE1aDAwIERpbm5lciAvIERcdTAwZWVuZXIgOiAxOGgzMCBcdTIwMTMgMjFoMzAifSx7ImlkIjoicGl2cmJldHciLCJuYW1lRnIiOiJDb25zdGFuY2UgTGUgQ2hhbGFuZCBSZXNvcnQgJiBWaWxsYXMiLCJuYW1lRW4iOiJDb25zdGFuY2UgTGUgQ2hhbGFuZCBSZXNvcnQgJiBWaWxsYXMiLCJkZXNjRnIiOiJSZXNvcnQgZGUgbHV4ZSBjb250ZW1wb3JhaW4gZmFjZSBhdSBsYWdvbiBkZSBCbHVlIEJheS4gQ3Vpc2luZSBpbnRlcm5hdGlvbmFsZSByYWZmaW5cdTAwZTllLCB2aWxsYXMgYXZlYyBwaXNjaW5lIHByaXZcdTAwZTllIGV0IHNwYS4iLCJkZXNjRW4iOiJDb250ZW1wb3JhcnkgbHV4dXJ5IHJlc29ydCBmYWNpbmcgdGhlIEJsdWUgQmF5IGxhZ29vbi4gUmVmaW5lZCBpbnRlcm5hdGlvbmFsIGN1aXNpbmUsIHBvb2wgdmlsbGFzIGFuZCBzcGEuIiwiYWRkcmVzcyI6IkxlIENoYWxhbmQsIEJsdWUgQmF5IE1hcmluZSBQYXJrIE1VLCBQbGFpbmUgTWFnbmllbiA1MTUxMCIsInBob25lIjoiKzIzMCA2NTEgNTAwMCIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDUxNDE5Niw1Ny43MDAzMTE1IiwiaW1hZ2UiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vcC9BRjFRaXBNNmpqMUtOeWZXNXNWMzA5eWVWc3ZSUUZwMXJsZVJkS1RzeDlZNj1zMTM2MC13MTM2MC1oMTAyMC1ydyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IkRlaiAvIEx1bmNoOiAxMi4wMCBwbSBcdTIwMTMgMDMuMDAgcG0gRGluZXIgLyBEaW5uZXI6IDcuMDAgcG0gXHUyMDEzIDEwLjAwIHBtIn0seyJpZCI6InhoNDFka3J0IiwibmFtZUZyIjoiUmVzdGF1cmFudCBMZSBCb3VnYWludmlsbGUiLCJuYW1lRW4iOiJSZXN0YXVyYW50IExlIEJvdWdhaW52aWxsZSIsImRlc2NGciI6IlJlc3RhdXJhbnQgY3JcdTAwZTlvbGUgYXZlYyB0ZXJyYXNzZSB2dWUgbWVyIGV0IGFtYmlhbmNlIGF1dGhlbnRpcXVlLiBTcFx1MDBlOWNpYWxpdFx1MDBlOXMgZGUgcG9pc3NvbnMgZ3JpbGxcdTAwZTlzIGV0IGN1cnJ5cyBsb2NhdXguIiwiZGVzY0VuIjoiQ3Jlb2xlIHJlc3RhdXJhbnQgd2l0aCBzZWEtdmlldyB0ZXJyYWNlIGFuZCBhdXRoZW50aWMgYXRtb3NwaGVyZS4gR3JpbGxlZCBmaXNoIHNwZWNpYWx0aWVzIGFuZCBsb2NhbCBjdXJyaWVzLiIsImFkZHJlc3MiOiJSb3V0ZSBDb2FzdGFsZSwgQmx1ZSBCYXkiLCJwaG9uZSI6IisyMzAgNjMxIDgyOTkiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQ0NDY1MTksNTcuNzE3OTQ3MiIsImltYWdlIjoiaHR0cHM6Ly9keW5hbWljLW1lZGlhLWNkbi50cmlwYWR2aXNvci5jb20vbWVkaWEvcGhvdG8tby8yYi83OS81Ni9lMS9jYXB0aW9uLmpwZz93PTE0MDAmaD04MDAmcz0xIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiMTBoIC0yMmggLSBDbG9zZSBvbiBXZWRuZXNkYXkgLyBGZXJtZXIgbGUgTWVyY3JlZGkifSx7ImlkIjoiZGtsNWZmNTciLCJuYW1lRnIiOiJNY0RvbmFsZCdzIEJlYXUgVmFsbG9uIiwibmFtZUVuIjoiTWNEb25hbGQncyBCZWF1IFZhbGxvbiIsImRlc2NGciI6Ik1jRG9uYWxkJ3MgZGFucyBsZSBjZW50cmUgY29tbWVyY2lhbCBkZSBCZWF1IFZhbGxvbi4gUmVwYXMgcmFwaWRlIGV0IGFjY2Vzc2libGUgcG91ciB0b3V0ZSBsYSBmYW1pbGxlLiIsImRlc2NFbiI6Ik1jRG9uYWxkJ3MgYXQgQmVhdSBWYWxsb24gc2hvcHBpbmcgY2VudHJlLiBRdWljayBhbmQgYWNjZXNzaWJsZSBtZWFscyBmb3IgdGhlIHdob2xlIGZhbWlseS4iLCJhZGRyZXNzIjoiIFJveWFsIFJvYWQsIEJvJ1ZhbG9uIE1hbGwsNTIyMDEiLCJwaG9uZSI6IisyMzAgNjMwIDA2MDMiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQyNDAwNzUsNTcuNjk4ODg1MSIsImltYWdlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2dwcy1jcy1zL0FQTlFrQUVKZEVRU1c4VE5UdTcwNkMtTUU3X0dZbVVJckNRbkg4WGRGckpqVTdtb01NMk9nNkNjQTdyTWFXMjRhYWtNUGRTb2NfTnBKREhvcEgyZnB6dVVwTDd6cUU5eTlCYTQ3d2ZpT1FDVnZsWEhGQUJhNGNUbU9rOWsxQ0dGTXQ2eHc5QUhmeFJWTlY2THlvcz1zMTM2MC13MTM2MC1oMTAyMC1ydyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IjloIC0gMjJociJ9LHsiaWQiOiJrNGo2N3pwbiIsIm5hbWVGciI6IktGQyBNYWhlYm91cmciLCJuYW1lRW4iOiJLRkMgTWFoZWJvdXJnIiwiZGVzY0ZyIjoiS0ZDIGF1IGNvZXVyIGRlIE1haGVib3VyZy4gUG91bGV0IGNyb3VzdGlsbGFudCBldCBtZW51cyByYXBpZGVzIHBvdXIgdG91dGUgbGEgZmFtaWxsZS4iLCJkZXNjRW4iOiJLRkMgaW4gdGhlIGhlYXJ0IG9mIE1haGVib3VyZy4gQ3Jpc3B5IGNoaWNrZW4gYW5kIHF1aWNrIG1lYWxzIGZvciB0aGUgd2hvbGUgZmFtaWx5LiIsImFkZHJlc3MiOiJDb3JuZXIgSG9sbGFuZGFpcyBNVSwgUnVlIE1hcmlhbm5lLCBNYWhlYm91cmcgNTA4MTAiLCJwaG9uZSI6IisyMzAgNDMyIDE2MTIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNjQ0MjYsNTcuNzA4MTUyOCIsImltYWdlIjoiaHR0cHM6Ly9tZWRpYS5pc3RvY2twaG90by5jb20vaWQvMTc0Nzc4NjQ0My9waG90by9rZmMtcmVzdGF1cmFudC1pbi1tYWhlYm91cmctbWF1cml0aXVzLmpwZz9zPTE3MDY2N2Emdz0wJms9MjAmYz1wYUQ0UGRrd3VBVXFJanYzNzVhTWhXLWd6b3pUUmFVWWpsX200S21QaWdNPSIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6Ik1vbmRheS9MdW5kaSBhdSBTdW5kYXkvRGltYW5jaGUgOiBEZSAxMGgwMCBcdTAwZTAgMjFoMDAifSx7ImlkIjoiMnNlejZjNzQiLCJuYW1lRnIiOiJsJ0Fqb3VwYSBQdWIgLSBSZXN0YXVyYW50IiwibmFtZUVuIjoibCdBam91cGEgUHViIC0gUmVzdGF1cmFudCIsImRlc2NGciI6IkxcdTAwZTAgb1x1MDBmOSBsZXMgY3VsdHVyZXMgc2UgcmVuY29udHJlbnQgJiBsZXMgYm9ubmVzIHZpYmVzIHNcdTIwMTlcdTAwZTlwYW5vdWlzc2VudFxuXG5JbnNwaXJcdTAwZTkgcGFyIHVuIG1cdTAwZTlsYW5nZSB2aWJyYW50IGRlIHRyYWRpdGlvbnMgYWZyaWNhaW5lcywgZnJhblx1MDBlN2Fpc2VzLCBlc3BhZ25vbGVzLCBhbVx1MDBlOXJpbmRpZW5uZXMgZXQgY2FyaWJcdTAwZTllbm5lcywgTEFKT1VQQSBuXHUyMDE5ZXN0IHBhcyBzZXVsZW1lbnQgdW4gZW5kcm9pdCBvXHUwMGY5IG1hbmdlciBcdTIwMTQgY1x1MjAxOWVzdCB1biBsaWV1IG9cdTAwZjkgbFx1MjAxOW9uIHJlc3NlbnQgdW5lIHZcdTAwZTlyaXRhYmxlIGFtYmlhbmNlLlxuXG5BdSBCYXIgQ29ybmVyLCBzYXZvdXJleiBkZSBwdWlzc2FudHMgY29ja3RhaWxzIGF1IHJodW0gcGVuZGFudCBxdWUgbGVzIHJ5dGhtZXMgYWZyb2JlYXQgZXQgbGF0aW5zIGZvbnQgdmlicmVyIGxcdTIwMTllc3BhY2UuXG5cbkxlcyBlc3BhY2VzIGxvdW5nZSBjaGFsZXVyZXV4LCBkXHUwMGU5Y29yXHUwMGU5cyBkXHUyMDE5XHUwMGU5bFx1MDBlOW1lbnRzIHRyaWJhdXggZXQgZGUgdmVyZHVyZSBsdXh1cmlhbnRlLCB2b3VzIGludml0ZW50IFx1MDBlMCB2b3VzIGRcdTAwZTl0ZW5kcmUgc291cyBkZXMgbHVtaVx1MDBlOHJlcyB0YW1pc1x1MDBlOWVzLCBlbnRvdXJcdTAwZTkgZGUgYm9ubmUgY29tcGFnbmllLlxuXG5FbiBjdWlzaW5lLCBsZXMgXHUwMGU5cGljZXMgcmljaGVzIHJlbmNvbnRyZW50IGxlcyBmcnVpdHMgZGUgbWVyIGZyYWlzLCBsZXMgdmlhbmRlcyBtaWpvdFx1MDBlOWVzIGxlbnRlbWVudCBldCBsZXMgc2F2ZXVycyBncmlsbFx1MDBlOWVzIGF1IGZldSBcdTIwMTQgdW4gaG9tbWFnZSBcdTAwZTAgZGVzIHNpXHUwMGU4Y2xlcyBkZSB0cmFkaXRpb24gY3JcdTAwZTlvbGUsIHJcdTAwZTlpbnZlbnRcdTAwZTllIHBvdXIgYXVqb3VyZFx1MjAxOWh1aS5cblxuUXVlIHZvdXMgdmVuaWV6IHBvdXIgZGFuc2VyLCB2b3VzIHJlbGF4ZXIgb3Ugdm91cyByXHUwMGU5Z2FsZXIsIExBSk9VUEEgdm91cyBvZmZyZSB1bmUgZXhwXHUwMGU5cmllbmNlIGRlIGN1bHR1cmUsIGRlIHBhcnRhZ2UgZXQgZGUgY1x1MDBlOWxcdTAwZTlicmF0aW9uLlxuIiwiZGVzY0VuIjoiV2hlcmUgQ3VsdHVyZXMgQ29sbGlkZSAmIEdvb2QgVmliZXMgVGhyaXZlXG5cbkluc3BpcmVkIGJ5IGEgdmlicmFudCBtaXggb2YgQWZyaWNhbiwgRnJlbmNoLCBTcGFuaXNoLCBOYXRpdmUgQW1lcmljYW4sIGFuZCBDYXJpYmJlYW4gdHJhZGl0aW9ucywgTEFKT1VQQSBpc25cdTIwMTl0IGp1c3QgYSBwbGFjZSB0byBlYXQgXHUyMDE0IGl0XHUyMDE5cyBhIHBsYWNlIHRvIGZlZWwuXG5cbkF0IHRoZSBCYXIgQ29ybmVyLCBzaXAgYm9sZCBydW0gY29ja3RhaWxzIHdoaWxlIEFmcm9iZWF0IGFuZCBMYXRpbiByaHl0aG1zIGZpbGwgdGhlIHJvb20uXG5cbkNoaWxsaW5nIExvdW5nZXMgd2l0aCB0cmliYWwgZGVjb3IgYW5kIGx1c2ggZ3JlZW5lcnkgaW52aXRlIHlvdSB0byB1bndpbmQgdW5kZXIgc29mdCBsaWdodHMgYW5kIGdyZWF0IGNvbXBhbnkuXG5cbkZyb20gdGhlIEtpdGNoZW4sIHJpY2ggc3BpY2VzIG1lZXQgZnJlc2ggc2VhZm9vZCwgc2xvdy1jb29rZWQgbWVhdHMsIGFuZCBmaXJlLWdyaWxsZWQgZmxhdm91cnMgXHUyMDE0IGVjaG9pbmcgY2VudHVyaWVzIG9mIENyZW9sZSB0cmFkaXRpb24sIHJlaW1hZ2luZWQgZm9yIHRvZGF5LlxuXG5XaGV0aGVyIHlvdSdyZSBoZXJlIHRvIGRhbmNlLCByZWxheCwgb3IgaW5kdWxnZSwgTEFKT1VQQSBicmluZ3MgeW91IGEgdGFzdGUgb2YgY3VsdHVyZSwgY29tbXVuaXR5LCBhbmQgY2VsZWJyYXRpb24uIiwiYWRkcmVzcyI6IlJ1ZSBkdSBTb3VmZmxldXIgTWFoZWJvdXJnLCBNYXVyaXRpdXMiLCJwaG9uZSI6IisyMzAgNTI5MCAxMjY4IiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MTAyNjIyLDU3LjcwOTg3NDEiLCJpbWFnZSI6Imh0dHBzOi8vb25lc3RvcGhhbGFsLmNvbS9jZG4vc2hvcC9hcnRpY2xlcy9iZWVmX3NhbW9zYS0xNjk3MzMwOTIxMDYxXzEyMDB4LmpwZz92PTE2OTczMzA5NTciLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiJNb24gdG8gVHVlLFRodXIgdG8gU3VuXHVmZjFhMTg6MzAtMjI6MzAgIC0gV2VkXHVmZjFhQ2xvc2VkIGFsbCBkYXkgIn0seyJpZCI6ImU0MWp5OWdlIiwibmFtZUZyIjoiQXZhbG9uIEdvbGYgRXN0YXRlIiwibmFtZUVuIjoiQXZhbG9uIEdvbGYgRXN0YXRlIiwiZGVzY0ZyIjoiRG9tYWluZSBkZSBnb2xmIGhhdXQgZGUgZ2FtbWUgZGFucyB1biBjYWRyZSB0cm9waWNhbC4gUGFyY291cnMgOSB0cm91cyBldCByZXN0YXVyYW50IGF2ZWMgdnVlIHBhbm9yYW1pcXVlLiIsImRlc2NFbiI6IlVwc2NhbGUgZ29sZiBlc3RhdGUgaW4gYSB0cm9waWNhbCBzZXR0aW5nLiA5LWhvbGUgY291cnNlIGFuZCByZXN0YXVyYW50IHdpdGggcGFub3JhbWljIHZpZXdzLiIsImFkZHJlc3MiOiIgQm9pcyBDaGVyaSBSb2FkLCBCb2lzIENoZXJpIDYwMjAzIiwicGhvbmUiOiIrMjMwIDQzMCA1ODAwIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MzY5MjY2LDU3LjUxNDEyNTQiLCJpbWFnZSI6Imh0dHBzOi8vYXZhbG9uLm11L3dwLWNvbnRlbnQvdXBsb2Fkcy8yMDIwLzA1L0ZvdG9saWFfMTc2MzM5MjEzX1N1YnNjcmlwdGlvbl9Nb250aGx5X00tY29tcHJlc3Nvci5qcGciLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiJXRUVLIERBWVMgOGgzMCAtIDE2aDMwIC0gV0VFS0VORCAwNzozMCBBTSB0byA1OjMwIFBNIn1dfSx7ImlkIjoicGxhZ2VzIiwibmFtZUZyIjoiTGVzIFBsYWdlcyIsIm5hbWVFbiI6IkJlYWNoZXMiLCJpY29uIjoiXHVkODNjXHVkZmQ2XHVmZTBmIiwiY29sb3IiOiIjMWI2Y2E4IiwiaXRlbXMiOlt7ImlkIjoiOXhwc2oxNjUiLCJuYW1lRnIiOiJMYSBDYW1idXNlIEJlYWNoIiwibmFtZUVuIjoiTGEgQ2FtYnVzZSBCZWFjaCIsImRlc2NGciI6IlBsYWdlIHNhdXZhZ2UgZXQgcHJcdTAwZTlzZXJ2XHUwMGU5ZSBmYWNlIGF1IGxhZ29uIHR1cnF1b2lzZS4gSWRcdTAwZTlhbGUgcG91ciBzZSBiYWlnbmVyIGxvaW4gZGVzIGZvdWxlcywgYXZlYyB1bmUgdnVlIGltcHJlbmFibGUgc3VyIGwnaG9yaXpvbi4iLCJkZXNjRW4iOiJVbnNwb2lsdCB3aWxkIGJlYWNoIGZhY2luZyB0aGUgdHVycXVvaXNlIGxhZ29vbi4gUGVyZmVjdCBmb3Igc3dpbW1pbmcgYXdheSBmcm9tIHRoZSBjcm93ZHMsIHdpdGggc3R1bm5pbmcgdmlld3MgdG8gdGhlIGhvcml6b24uIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40NTM0NTY4LDU3LjY5OTU4ODgiLCJpbWFnZSI6Imh0dHBzOi8vY2RuLmdldHlvdXJndWlkZS5jb20vaW1nL2xvY2F0aW9uLzVkMzA0NjcyNTRiZGQuanBlZy85OS5qcGciLCJkaXN0YW5jZSI6IjggbWludXRlcyIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiZTBxdm1sOXoiLCJuYW1lRnIiOiJTaGFuZHJhbmkgQmVhY2giLCJuYW1lRW4iOiJTaGFuZHJhbmkgQmVhY2giLCJkZXNjRnIiOiJQbGFnZSBjYWNoXHUwMGU5ZSA1IFx1MDBlOXRvaWxlcyBib3JkXHUwMGU5ZSBkZSBmaWxhb3MsIGF1eCBlYXV4IGNhbG1lcyBldCBjcmlzdGFsbGluZXMsIG9mZnJhbnQgdW4gY2FkcmUgdHJvcGljYWwgZXhjZXB0aW9ubmVsLlxuU2l0dVx1MDBlOWUgZGV2YW50IGxcdTIwMTloXHUwMGY0dGVsIFNoYW5kcmFuaSBCZWFjaGNvbWJlciBSZXNvcnQgJiBTcGEsIGNldHRlIHBsYWdlIHNcdTAwZTlkdWl0IHBhciBzb24gYXRtb3NwaFx1MDBlOHJlIHBhaXNpYmxlIGV0IHByXHUwMGU5c2Vydlx1MDBlOWUuIExlIHNhYmxlIGZpbiwgbGVzIG51YW5jZXMgdHVycXVvaXNlIGR1IGxhZ29uIGV0IGxcdTIwMTlvbWJyZSBuYXR1cmVsbGUgZGVzIGZpbGFvcyBjclx1MDBlOWVudCB1biBkXHUwMGU5Y29yIGlkeWxsaXF1ZSwgcGFyZmFpdCBwb3VyIGxhIGRcdTAwZTl0ZW50ZSwgbGEgYmFpZ25hZGUgZXQgbGVzIGNvdWNoZXJzIGRlIHNvbGVpbCB0cm9waWNhdXguIFByb3RcdTAwZTlnXHUwMGU5ZSBwYXIgbGUgclx1MDBlOWNpZiwgbGEgbWVyIHkgcmVzdGUgZ1x1MDBlOW5cdTAwZTlyYWxlbWVudCBjYWxtZSwgaWRcdTAwZTlhbGUgcG91ciBwcm9maXRlciBwbGVpbmVtZW50IGRlIGxhIGJlYXV0XHUwMGU5IGF1dGhlbnRpcXVlIGR1IHN1ZC1lc3QgbWF1cmljaWVuLiIsImRlc2NFbiI6IkhpZGRlbiA1LXN0YXIgYmVhY2ggbGluZWQgd2l0aCBmaWxhbyB0cmVlcywgZmVhdHVyaW5nIGNhbG0gY3J5c3RhbC1jbGVhciB3YXRlcnMgYW5kIGFuIGV4Y2VwdGlvbmFsIHRyb3BpY2FsIHNldHRpbmcuXG5Mb2NhdGVkIGluIGZyb250IG9mIFNoYW5kcmFuaSBCZWFjaGNvbWJlciBSZXNvcnQgJiBTcGEsIHRoaXMgYmVhY2ggY2hhcm1zIHZpc2l0b3JzIHdpdGggaXRzIHBlYWNlZnVsIGFuZCB1bnNwb2lsZWQgYXRtb3NwaGVyZS4gVGhlIGZpbmUgd2hpdGUgc2FuZCwgdHVycXVvaXNlIGxhZ29vbiwgYW5kIG5hdHVyYWwgc2hhZGUgZnJvbSB0aGUgZmlsYW9zIGNyZWF0ZSBhbiBpZHlsbGljIGJhY2tkcm9wLCBwZXJmZWN0IGZvciByZWxheGF0aW9uLCBzd2ltbWluZywgYW5kIHRyb3BpY2FsIHN1bnNldHMuIFByb3RlY3RlZCBieSB0aGUgY29yYWwgcmVlZiwgdGhlIHNlYSByZW1haW5zIGNhbG0gbW9zdCBvZiB0aGUgdGltZSwgbWFraW5nIGl0IGFuIGlkZWFsIHNwb3QgdG8gZnVsbHkgZW5qb3kgdGhlIGF1dGhlbnRpYyBiZWF1dHkgb2Ygc291dGhlYXN0ZXJuIE1hdXJpdGl1cy5cbiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDQ1MzI3Miw1Ny43MDI5OTU1IiwiaW1hZ2UiOiJodHRwczovL3EteHguYnN0YXRpYy5jb20veGRhdGEvaW1hZ2VzL2hvdGVsL21heDUwMC8yNzA3NTYxMDYuanBnP2s9ZDA2MmM2ODg2NmY0MGMzYjYzNTA3NWJmMGI4ZDFhNDZmNWZlYThiYmI3YTc2N2IxMTE1Nzc5ODFmYjMyM2EzNyZvPSIsImRpc3RhbmNlIjoiOCBtaW51dGVzIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiI1MWR5bm1maCIsIm5hbWVGciI6IkJsdWUgQmF5IEJlYWNoIiwibmFtZUVuIjoiQmx1ZSBCYXkgQmVhY2giLCJkZXNjRnIiOiJMJ3VuZSBkZXMgcGx1cyBiZWxsZXMgcGxhZ2VzIGRlIGwnXHUwMGNlbGUgTWF1cmljZSwgYXV4IGVhdXggZCd1biBibGV1IGxhZ29uIGV4dHJhb3JkaW5haXJlLiBQb3J0ZSBkJ2VudHJcdTAwZTllIGR1IHBhcmMgbWFyaW4gcHJvdFx1MDBlOWdcdTAwZTkuIiwiZGVzY0VuIjoiT25lIG9mIE1hdXJpdGl1cydzIG1vc3QgYmVhdXRpZnVsIGJlYWNoZXMgd2l0aCBleHRyYW9yZGluYXJ5IGxhZ29vbi1ibHVlIHdhdGVycy4gR2F0ZXdheSB0byB0aGUgcHJvdGVjdGVkIG1hcmluZSBwYXJrLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDQ0MTkyOCw1Ny43MTY0NjkyIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9Hemlsdk5wcUFVVHJlRkVjN3JMcVE1WDNESXpDSTdMeVFWdHpNcWNib21VWlcxSzVvMUI4dEJQa2VlNHVPM2sxOHNEVTdxYVdtSU9fSWs0RTZVVEhjV1E1Yi03SzBYdThKdnphcXM2clVaQllQZGRZbnNfNVdSU3NTb3R2ODVMZTJ1ZndPeWk2MVV4MnA3dkd5Ql9saF9FTF8wMkVjTzQwQkFJN0ZUMTFmWFVSS0tOVWtzRlkyMTY0bHNYaFFsaTk0TzEwdms3d0F1LT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6Imp0YWw0bmxqIiwibmFtZUZyIjoiUG9pbnRlIEQnZXNueSBCZWFjaCIsIm5hbWVFbiI6IlBvaW50ZSBEJ2VzbnkgQmVhY2giLCJkZXNjRnIiOiJQbGFnZSB0cmFucXVpbGxlIGNsYXNzXHUwMGU5ZSBwYXJtaSBsZXMgcGx1cyBiZWxsZXMgZGUgbCdpbGUuIENvdWNoZXJzIGRlIHNvbGVpbCBtYWdpcXVlcyBldCBlYXUgdHJhbnNwYXJlbnRlLiIsImRlc2NFbiI6IlBsYWdlIHRyYW5xdWlsbGUgY2xhc3NcdTAwZTllIHBhcm1pIGxlcyBwbHVzIGJlbGxlcyBkZSBsJ2lsZS4gQ291Y2hlcnMgZGUgc29sZWlsIG1hZ2lxdWVzIGV0IGVhdSB0cmFuc3BhcmVudGUuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MjY1MTM0LDU3LjcyNjM3MzIiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d6Y0lYalp0TGhTTUd6azN1bnpZT2hkVWZ0ODI4YXU0V1BROEFWaW94MGJpQ204UXlPZlBMUlczalloNWc2OElaaHFtM1g4VThyNkpkZmphd2g5T0hUZ2Z5am9ZNXdaSUZGUEdOb243Mzc2ZThwM09CaHptazVmWGtydHdZc3dwS3JacTdRbzZUd2o1eTFRWmlVaU1BMnFCRmtIYWlRZ2o3M0huRzdGbUhrcmxxMU5LVVZ5bGtoWC0tTWxQcTRoTkZISjF3NE9qa0xkP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiNTMzaWwycWciLCJuYW1lRnIiOiJQb21wb25ldHRlIFBsYWdlIFB1YmxpcXVlIiwibmFtZUVuIjoiUG9tcG9uZXR0ZSBQbGFnZSBQdWJsaXF1ZSIsImRlc2NGciI6IlBsYWdlIHB1YmxpcXVlIGF1dGhlbnRpcXVlIGRhbnMgbGUgc3VkIGRlIGwnXHUwMGVlbGUsIHByaXNcdTAwZTllIGRlcyBsb2NhdXguIFNhYmxlIGJsYW5jLCBlYXUgY2FsbWUgZXQgYW1iaWFuY2UgZFx1MDBlOXRlbmR1ZS4iLCJkZXNjRW4iOiJBdXRoZW50aWMgcHVibGljIGJlYWNoIGluIHRoZSBzb3V0aCBvZiB0aGUgaXNsYW5kLCBwb3B1bGFyIHdpdGggbG9jYWxzLiBXaGl0ZSBzYW5kLCBjYWxtIHdhdGVyIGFuZCBhIHJlbGF4ZWQgYXRtb3NwaGVyZS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjUxNjQwMjcsNTcuNDc2NjE0OCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3hDR3Rya2F1QnZza3EtMDZwV1dTdy00UG5DY3EzcjFCWGFBVndDSEFVbGNhVU5vS0syS2w5WHh5ZGttZnctUkZ1c0RTaEJwdmJ2MVNSQXlOS3VNeGFJdmJJWGJtempQQ0ExOU8yVnFlbEtyS2pOS3hxd3NRZjFFWHRTSS1maGFhSkRpeW1nMVNJZnBIbGZJSEtOcE5CV0tMODFhd3RvTTg0N3ZlbnllLWJqTlhfMFVaVDdhWEhxYnlzdHVqWGFLckdBVTR6aEZsUzZLdz9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn1dfSx7ImlkIjoic3VwZXJtYXJjaGVzIiwibmFtZUZyIjoiU3VwZXJtYXJjaFx1MDBlOXMiLCJuYW1lRW4iOiJTdXBlcm1hcmtldHMiLCJpY29uIjoiXHVkODNkXHVkZWQyIiwiY29sb3IiOiIjMmU3ZDMyIiwiaXRlbXMiOlt7ImlkIjoiMjV2aWk2dW0iLCJuYW1lRnIiOiJCbydWYWxvbiBNYWxsIiwibmFtZUVuIjoiQm8nVmFsb24gTWFsbCIsImRlc2NGciI6IkNlbnRyZSBjb21tZXJjaWFsIG1vZGVybmUgYXZlYyBzdXBlcm1hcmNoXHUwMGU5LCBib3V0aXF1ZXMgZXQgcmVzdGF1cmF0aW9uIHJhcGlkZS4gSWRcdTAwZTlhbCBwb3VyIHZvcyBjb3Vyc2VzIFx1MDBlMCBCZWF1IFZhbGxvbi4iLCJkZXNjRW4iOiJNb2Rlcm4gc2hvcHBpbmcgY2VudHJlIHdpdGggc3VwZXJtYXJrZXQsIHNob3BzIGFuZCBmYXN0IGZvb2QuIElkZWFsIGZvciB5b3VyIHNob3BwaW5nIGluIEJlYXUgVmFsbG9uLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDIzOTMyNCw1Ny42OTc2NzExIiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiaGRwdnl0N3YiLCJuYW1lRnIiOiJXaW5uZXIncyBQbGFpbmUgTWFnbmllbiIsIm5hbWVFbiI6Ildpbm5lcidzIFBsYWluZSBNYWduaWVuIiwiZGVzY0ZyIjoiU3VwZXJtYXJjaFx1MDBlOSBiaWVuIGFjaGFsYW5kXHUwMGU5IFx1MDBlMCBxdWVscXVlcyBtaW51dGVzIGRlIGxhIHZpbGxhLiBMYXJnZSBjaG9peCBkZSBwcm9kdWl0cyBsb2NhdXggZXQgaW1wb3J0XHUwMGU5cy4iLCJkZXNjRW4iOiJXZWxsLXN0b2NrZWQgc3VwZXJtYXJrZXQgYSBmZXcgbWludXRlcyBmcm9tIHRoZSB2aWxsYS4gV2lkZSBjaG9pY2Ugb2YgbG9jYWwgYW5kIGltcG9ydGVkIHByb2R1Y3RzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDMxMDAwOCw1Ny42NjU4ODgzIiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiNHM3emg5aWgiLCJuYW1lRnIiOiJTbWFsbCBTaG9wIC8gUGV0aXRlIEJvdXRpcXVlIiwibmFtZUVuIjoiU21hbGwgU2hvcCAvIFBldGl0ZSBCb3V0aXF1ZSIsImRlc2NGciI6IlBldGl0ZSBcdTAwZTlwaWNlcmllIGRlIHByb3hpbWl0XHUwMGU5IHBvdXIgbGVzIGFjaGF0cyBkZSBkXHUwMGU5cGFubmFnZS4gQm9pc3NvbnMsIHNuYWNrcyBldCBwcm9kdWl0cyBlc3NlbnRpZWxzLiIsImRlc2NFbiI6IlNtYWxsIGNvbnZlbmllbmNlIHN0b3JlIGZvciBlbWVyZ2VuY3kgc2hvcHBpbmcuIERyaW5rcywgc25hY2tzIGFuZCBlc3NlbnRpYWwgcHJvZHVjdHMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40NjI3NDQ5LDU3LjY3ODU4ODIiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJmc3NxcGRnYyIsIm5hbWVGciI6IkxvbmRvbiBXYXkiLCJuYW1lRW4iOiJMb25kb24gV2F5IiwiZGVzY0ZyIjoiQm91dGlxdWUgbG9jYWxlIHByb3Bvc2FudCBwcm9kdWl0cyBhbGltZW50YWlyZXMgZXQgYXJ0aWNsZXMgZGl2ZXJzLiBQcmF0aXF1ZSBwb3VyIGxlcyBwZXRpdGVzIGNvdXJzZXMgcmFwaWRlcy4iLCJkZXNjRW4iOiJMb2NhbCBzaG9wIG9mZmVyaW5nIGZvb2QgcHJvZHVjdHMgYW5kIHZhcmlvdXMgaXRlbXMuIENvbnZlbmllbnQgZm9yIHF1aWNrIHNtYWxsIHB1cmNoYXNlcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQxNzUyMTksNTcuNzEwMDI2MSIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6ImU0d3JqN2htIiwibmFtZUZyIjoiTWFya2V0IC8gQmF6YXIiLCJuYW1lRW4iOiJNYXJrZXQgLyBCYXphciIsImRlc2NGciI6Ik1hcmNoXHUwMGU5IGxvY2FsIGFuaW1cdTAwZTkgYXZlYyBmcnVpdHMsIGxcdTAwZTlndW1lcyBldCBcdTAwZTlwaWNlcyBmcmFpcyBkZSBNYXVyaWNlLiBBbWJpYW5jZSBhdXRoZW50aXF1ZSBldCBwcml4IGltYmF0dGFibGVzLiIsImRlc2NFbiI6IkxpdmVseSBsb2NhbCBtYXJrZXQgd2l0aCBmcmVzaCBNYXVyaXRpYW4gZnJ1aXRzLCB2ZWdldGFibGVzIGFuZCBzcGljZXMuIEF1dGhlbnRpYyBhdG1vc3BoZXJlIGFuZCB1bmJlYXRhYmxlIHByaWNlcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNzAzMDMsNTcuNzA3ODUxOSIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3lPWmNvRjNEVXNhcTRaNGJvSFFMcjgxRGdnWlktMEJiaVpvRXNYQ1RjNzdrZ1VVSWZRZGRRX2U4WlNmY3kzTXhDRW9VMVpmMmI4WjV5dnk1bjhnWkhSSXBsdy1aY0g4Rmx1R3A4LUFLek1UMlVxQlZ0dW14YWtrUEM3ZDhSRVZaNVRVMzh0dWRHWjRDQ0JxYVM5TDVZXzNyUUFqcXM3ZFpFRno5d09jS1BkZzVJc1Y3cjVHVGR4OGRKQ2Q5aHpWeWVJYzh5MWo3RzY/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJiemg0YmRwcSIsIm5hbWVGciI6IlNob3BwaW5nIE1hcmtldCIsIm5hbWVFbiI6IlNob3BwaW5nIE1hcmtldCIsImRlc2NGciI6IlN1cGVybWFyY2hcdTAwZTkgZGUgcXVhcnRpZXIgYXZlYyBib24gY2hvaXggZGUgcHJvZHVpdHMgYWxpbWVudGFpcmVzIGxvY2F1eCBldCBpbXBvcnRcdTAwZTlzLiIsImRlc2NFbiI6Ik5laWdoYm91cmhvb2Qgc3VwZXJtYXJrZXQgd2l0aCBhIGdvb2Qgc2VsZWN0aW9uIG9mIGxvY2FsIGFuZCBpbXBvcnRlZCBmb29kIHByb2R1Y3RzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDA2NzQ3Nyw1Ny43MDg0ODIiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJvYzE4MDBrbCIsIm5hbWVGciI6IkxveWV1bmcgU3VwZXJtYXJrZXQiLCJuYW1lRW4iOiJMb3lldW5nIFN1cGVybWFya2V0IiwiZGVzY0ZyIjoiU3VwZXJtYXJjaFx1MDBlOSBzaW5vLW1hdXJpY2llbiBiaWVuIGZvdXJuaSBhdmVjIHNwXHUwMGU5Y2lhbGl0XHUwMGU5cyBhc2lhdGlxdWVzLiBQcm9kdWl0cyBmcmFpcyBldCBcdTAwZTlwaWNlcyBleG90aXF1ZXMuIiwiZGVzY0VuIjoiV2VsbC1zdG9ja2VkIFNpbm8tTWF1cml0aWFuIHN1cGVybWFya2V0IHdpdGggQXNpYW4gc3BlY2lhbHRpZXMuIEZyZXNoIHByb2R1Y2UgYW5kIGV4b3RpYyBzcGljZXMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDk4MTUxLDU3LjcwOTQyMzgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d4V2R4bmNBNTRHM29TRDJJeFRGSE9sdllqbjNLbndyaUdEWnBpcG5Za2wyTTZQb3J4SzZFNk8wRXRSMmQ4LWVXdUl4Tk1KNHJzdHpnR05pbTNLTXIwc0xIeldEVk5pcnZfNHZZSnF2WldhTnNOMlR3SFZ6MWhVR3dXbF8wYmJVcFlRMlJPbGswYTFwdDZlSzlkcjBOUjlpOGYzVElXX1FkQmhGc3NCNjE1Wnl6QUR2S3JlRGswQUVBWkdMOXliQi1sSEExcy1XVmVLYVhzbnFWZVBvRWU3VW5nd0diWnVBWFhTYkM1Y1hmaEhTU3ZTMzdBMERCUjZEYUU/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJ6azF4b3JlaiIsIm5hbWVGciI6IlBsYWlzYW5jZSBTaG9wcGluZyBWaWxsYWdlIiwibmFtZUVuIjoiUGxhaXNhbmNlIFNob3BwaW5nIFZpbGxhZ2UiLCJkZXNjRnIiOiJDZW50cmUgY29tbWVyY2lhbCBwcm9jaGUgZGUgbCdhXHUwMGU5cm9wb3J0IGF2ZWMgZ3JhbmRlcyBlbnNlaWduZXMuIFByYXRpcXVlIHBvdXIgbGVzIGRlcm5pXHUwMGU4cmVzIGNvdXJzZXMgYXZhbnQgbGUgZFx1MDBlOXBhcnQuIiwiZGVzY0VuIjoiU2hvcHBpbmcgY2VudHJlIG5lYXIgdGhlIGFpcnBvcnQgd2l0aCBtYWpvciBicmFuZHMuIEhhbmR5IGZvciBsYXN0LW1pbnV0ZSBzaG9wcGluZyBiZWZvcmUgZGVwYXJ0dXJlLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDAwNDExLDU3LjU5ODY1OSIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3d4NnVlVDQ4M3Rmc1BTd0RlYS1HalJJeEd6YU5NMmxkQUZZVGtBdDA4N2MtbDZPU1BYVjhlTU55VzVNdDJUWDk5c0RMV2tpOXFibnBNemVyZzk5bWVUX3BfYjNsSm9CWHJ5bEtaRVRoVW91V0RzaDdsYkJLYTVLZHg0VmJPOHFzbkxuTDFTNlFxUWZiWGk2cTl6RXMyeFllb1RxaUZXVE4yMjBZa24yT002YTJmTkNwQVg4Ty1PQTh5ZUg5YTJ2VlBxbkN1R0lqaXhIZzBoeEV5SzA4UWZRNjNXRmEtZ2JELU9EWWVJRk5ScWM0Vk41SWc2NmlPN1VKTT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IjEwcmRxb2R0IiwibmFtZUZyIjoiSW50ZXJtYXJ0IC0gUm9zZSBCZWxsZSBNYWxsIiwibmFtZUVuIjoiSW50ZXJtYXJ0IC0gUm9zZSBCZWxsZSBNYWxsIiwiZGVzY0ZyIjoiR3JhbmQgc3VwZXJtYXJjaFx1MDBlOSBkYW5zIGxlIG1hbGwgZGUgUm9zZSBCZWxsZS4gVmFzdGUgY2hvaXggZGUgcHJvZHVpdHMsIGJvdWNoZXJpZSBldCBib3VsYW5nZXJpZS4iLCJkZXNjRW4iOiJMYXJnZSBzdXBlcm1hcmtldCBpbiBSb3NlIEJlbGxlIG1hbGwuIFdpZGUgcHJvZHVjdCByYW5nZSwgYnV0Y2hlciBhbmQgYmFrZXJ5LiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuMzk4OTY5Miw1Ny41OTgwMDM4IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeGVNUlVlX2JKc3M0dFlqdENqQWQ3Mk9sVmwtZVlzbC1jTWxZVk5sQ20yZExoLXI1RXhaM19mbEk0UXgxMmViUEY3UGRnbHl0VUJkMkJPN2MwaXIwcUJPYkd2OW0yVDRGdFlqdmpEdjEtZFdMSGREaEthdlp0RjNDOXYzOWVnYUVsX09UYk9jM2RWbm94RU52c0NUSUFkV2dnbWlkTzBiMzBWVkFEX19SYzVuZTg1ZXhCQUJUWnFCVkVPWFRBNENibkIzNEJ3UTNOUjQxMGRfVEd6RFcwb1k1U2dBbGVTcmF6T2VXazd2Zy04eENxWWZrdi16SHpMSXdVP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifV19LHsiaWQiOiJhY3Rpdml0ZXMiLCJuYW1lRnIiOiJBY3Rpdml0XHUwMGU5cyIsIm5hbWVFbiI6IkFjdGl2aXRpZXMiLCJpY29uIjoiXHVkODNlXHVkZDNmIiwiY29sb3IiOiIjN2I1ZWE3IiwiaXRlbXMiOlt7ImlkIjoiYWhteWwya2EiLCJuYW1lRnIiOiJBbmdlbCBDcnVpc2VzIFNwZWVkYm9hdCIsIm5hbWVFbiI6IkFuZ2VsIENydWlzZXMgU3BlZWRib2F0IiwiZGVzY0ZyIjoiRXhjdXJzaW9ucyBlbiBzcGVlZGJvYXQgdmVycyBCbHVlIEJheSwgSWxlIGF1eCBDZXJmcyBldCBsZXMgaWxvdHMuIFNub3JrZWxpbmcsIGJhcmJlY3VlIHN1ciBwbGFnZSBwcml2XHUwMGU5ZSBldCBvYnNlcnZhdGlvbiBkZXMgZGF1cGhpbnMuIiwiZGVzY0VuIjoiU3BlZWRib2F0IGV4Y3Vyc2lvbnMgdG8gQmx1ZSBCYXksIElsZSBhdXggQ2VyZnMgYW5kIHRoZSBpc2xldHMuIFNub3JrZWxsaW5nLCBiYXJiZWN1ZSBvbiBhIHByaXZhdGUgYmVhY2ggYW5kIGRvbHBoaW4gd2F0Y2hpbmcuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40NDczMzQyLDU3LjcwNjA2NzYiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d4MkxXRm1Pa3RPRTlFQXVFaUVpVklCTXU3bzBadFZTZ2tvbFJzdmMtUTdhY2RwamhiN3dPbk1fQWt2bzVGY21fczNyOXlFckFkaU5RZjNWZXVORDQ2aXUybWxzQUljZEZyeFg4Uk5laTl0aU1udi1ZMW5ibzRRSWtWdTRJbWlZT0k0ak0wM2VyR19aOHZTQzBRU2NhOTRSZTFucXFVc0hmeVgzNVJ5ZFZpVmcwQ0ZPZmVGa0NfNGlyc3RvSEYwLUZVdno5dG9iWlVMV2c/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJoNzJjcGdhdCIsIm5hbWVGciI6IlF1YWQgQmlrZSAtIFBvbnQgTmF1cmVsIFF1YWQgQmlrZSIsIm5hbWVFbiI6IlF1YWQgQmlrZSAtIFBvbnQgTmF1cmVsIFF1YWQgQmlrZSIsImRlc2NGciI6IkF2ZW50dXJlIGVuIHF1YWQgXHUwMGUwIHRyYXZlcnMgbGVzIGNoYW1wcyBkZSBjYW5uZSBcdTAwZTAgc3VjcmUganVzcXUnYXUgUG9udCBOYXR1cmVsLiBTZW5zYXRpb25zIGZvcnRlcyBldCBwYXlzYWdlcyBzYXV2YWdlcy4iLCJkZXNjRW4iOiJRdWFkIGJpa2UgYWR2ZW50dXJlIHRocm91Z2ggc3VnYXIgY2FuZSBmaWVsZHMgdG8gUG9udCBOYXR1cmVsLiBUaHJpbGxzIGFuZCB3aWxkIGxhbmRzY2FwZXMgaW4gdGhlIHNvdXRoLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDUzMzQ4Nyw1Ny42Nzk5MzIzIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HemV4QVNNMWJ3N2l2ZHhJU0J5Sjg3ZXlxV2hMSEg2REJDYTJLaVl0YmF4ZVRNYzBVRVdCZkxmdTdRQXIxTWpvMXlWcV80UUdFUGZuUFdrU25rQ0IzTmhobWNmMzBQcXNjaXA3dkV0SFRUc0NFU2UxY2F3aHdIaDdraEljMlZRaFJTSU5JNzBOcGFEdUZVdVRKNXZXNjdBbG1Va0F3aFNudU1ESTM4NDV4Uk5oc3NxTjFVZ3MyNjVBalpQTEVjTU1DOEg4TWYySmVMOGR3P2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoibzV4Z2huMnIiLCJuYW1lRnIiOiJEUyBBZHZlbnR1cmVzIiwibmFtZUVuIjoiRFMgQWR2ZW50dXJlcyIsImRlc2NGciI6IkFjdGl2aXRcdTAwZTlzIGQnYXZlbnR1cmUgZXQgZXhjdXJzaW9ucyBzdXIgbWVzdXJlIGRhbnMgbGUgc3VkIGRlIE1hdXJpY2UuIFJhbmRvbm5cdTAwZTllcywga2F5YWsgZXQgZFx1MDBlOWNvdXZlcnRlIGRlIGxhIG5hdHVyZSBsb2NhbGUuIiwiZGVzY0VuIjoiQWR2ZW50dXJlIGFjdGl2aXRpZXMgYW5kIHRhaWxvci1tYWRlIGV4Y3Vyc2lvbnMgaW4gdGhlIHNvdXRoIG9mIE1hdXJpdGl1cy4gSGlraW5nLCBrYXlha2luZyBhbmQgbG9jYWwgbmF0dXJlIGRpc2NvdmVyeS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQ1MTM1NTksNTcuNjUxNDU3NyIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3l4V3VRMHl6QWZ2UWphREpOY0hxalhWYU43N3k2dFpLRzltY3RQY2lKYnlMMzN3MzZEeXV2UGFCbjg5Tkdpb2JkTTlZenVDUUhDeWF2OWRMc29pSW82RkpuWEI4RFhMVVVZS010c3BwaXBINnVycTItX0FJdlY5bGEyNkR0cHVIekNuOWVjaFhRSlJLSzlTRUt2M0lhb1ItQkhaZVcwNXRRTVZqeHJLTUdHS1BRYkExckZlaHJycEtYRmtJcFQ1ZDBrcnUxVGtZd1I/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJsdHpvcTQ1eiIsIm5hbWVGciI6IlNwZWNpYWxpc2VkIEtpdGVib2FyZGluZyIsIm5hbWVFbiI6IlNwZWNpYWxpc2VkIEtpdGVib2FyZGluZyIsImRlc2NGciI6IkVjb2xlIGV0IGNsdWIgZGUga2l0ZXN1cmYgZGFucyBsZXMgbWVpbGxldXJlcyBjb25kaXRpb25zIGRlIHZlbnQgZGUgbCdpbGUuIENvdXJzIGRcdTAwZTlidXRhbnRzIGV0IGxvY2F0aW9uIGRlIG1hdFx1MDBlOXJpZWwuIiwiZGVzY0VuIjoiS2l0ZXN1cmZpbmcgc2Nob29sIGFuZCBjbHViIGluIHRoZSBpc2xhbmQncyBiZXN0IHdpbmQgY29uZGl0aW9ucy4gQmVnaW5uZXIgbGVzc29ucyBhbmQgZXF1aXBtZW50IHJlbnRhbC4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQyMDA5NDMsNTcuNzIwOTM5NSIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3lockwybWl5bG1DdkZDM1VDUVhQbU00MVlOUzBXMHUxOXlRVHFhaE5YUHBkeGpKckFQejRIQXNLYTB1Sm9mVGNhRVdpMVBfT0JXVkZlRF8wSDBmZ0RkbWdrNFVsanQzdHFwRUdWZ09WM3NZQWN6TkFLZDFma0E4aHVnTTdkR2ZuLUc2TzlGdFFFTEZ0ME9NLXI0REZ4aThxQi1rVHRjRkxONDhLTTJkTFpQckIzN0FXbWFPY0FoaHZjWmFRYWRlX196S09qVTFScVY/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJpYnJ0eXk3NCIsIm5hbWVGciI6IkF2YWxvbiBHb2xmIEVzdGF0ZSIsIm5hbWVFbiI6IkF2YWxvbiBHb2xmIEVzdGF0ZSIsImRlc2NGciI6IkRvbWFpbmUgZGUgZ29sZiBoYXV0IGRlIGdhbW1lIGRhbnMgdW4gY2FkcmUgdHJvcGljYWwuIFBhcmNvdXJzIDkgdHJvdXMgZXQgcmVzdGF1cmFudCBhdmVjIHZ1ZSBwYW5vcmFtaXF1ZS4iLCJkZXNjRW4iOiJVcHNjYWxlIGdvbGYgZXN0YXRlIGluIGEgdHJvcGljYWwgc2V0dGluZy4gOS1ob2xlIGNvdXJzZSBhbmQgcmVzdGF1cmFudCB3aXRoIHBhbm9yYW1pYyB2aWV3cy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQzNjkyNjYsNTcuNTE0MTI1NCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3hvUGlVU0c1aXFnM2VKNEh5dDBIVXIzOVZMb1RSSlJsNTV6RmFHLVhWY0JkVl9fYzNqV2NzQjFmVTZYMFZ5MzVrQkpJZGZRQzl4bzN0ejZRME9BQk1teF9JMEszdVR6RzZSOUh6TElpdXcwbDE4VHFCbkhrejYtNDFYS3ljV21Ea3BHY3JWMTZCc3RaZEl5UkFneVl1T2ltLUNVSXdGaEhMUzBqVmF2R3RxbEc4a0tCUEVqTDA3bUhOanRROURMUWZzUXd5bmRuUEJqVlRiTEN1UWUweDRoaV9qeDFOa0F4cFlVbmlZcHItNU1zM1prZUdfTHY2WFdLUT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn1dfSx7ImlkIjoidm9pciIsIm5hbWVGciI6IkxlcyBFbmRyb2l0cyBcdTAwZTAgVm9pciIsIm5hbWVFbiI6IlBsYWNlcyB0byBTZWUiLCJpY29uIjoiXHVkODNkXHVkYzQxXHVmZTBmIiwiY29sb3IiOiIjZjBhNTAwIiwiaXRlbXMiOlt7ImlkIjoianV1MWd3NzIiLCJuYW1lRnIiOiJQb250IE5hdHVyZWwiLCJuYW1lRW4iOiJQb250IE5hdHVyZWwiLCJkZXNjRnIiOiJBcmNoZSBuYXR1cmVsbGUgc3BlY3RhY3VsYWlyZSBzY3VscHRcdTAwZTllIHBhciBsJ29jXHUwMGU5YW4gZGFucyBsZXMgcm9jaGVzIHZvbGNhbmlxdWVzIGR1IHN1ZC4gU2l0ZSBnXHUwMGU5b2xvZ2lxdWUgdW5pcXVlIGV0IHNhdXZhZ2UuIiwiZGVzY0VuIjoiU3BlY3RhY3VsYXIgbmF0dXJhbCBhcmNoIHNjdWxwdGVkIGJ5IHRoZSBvY2VhbiBpbiB0aGUgdm9sY2FuaWMgcm9ja3Mgb2YgdGhlIHNvdXRoLiBVbmlxdWUgYW5kIHdpbGQgZ2VvbG9naWNhbCBzaXRlLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDgwNDQyLDU3LjY2OTM4NzgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d3aFB4eHdZQ25rYWJCUFgzNS1oYWszcl9OQWo1SnNsMmwzNjZaRjFFX2I4cWlJWmdFU2VKclVhVlFuUFZLUXA5S2FoZURwUHdGYzNCWmdJRTlJVzBmTUVSb0lJWkxRMTFYdUZJZ1Y5QjhwSF90UjhxV082dDlMZGdoVHE0MTh5eXB4ZUREeTNVNXJfenprWWlCVVBUX3kyV09FUlZPZDRHUkppM09tSmxYNXljZ2QwT1E0Z0E0TEd0ek5pajNXbWhEbVZ4UzdUY1FIP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiY2xtMmNuZHgiLCJuYW1lRnIiOiJCbHVlIEJheSBNYXJpbmUgUGFyayIsIm5hbWVFbiI6IkJsdWUgQmF5IE1hcmluZSBQYXJrIiwiZGVzY0ZyIjoiUGFyYyBtYXJpbiBwcm90XHUwMGU5Z1x1MDBlOSBhdmVjIDM4IGVzcFx1MDBlOGNlcyBkZSBjb3JhdXggZXQgNzIgZXNwXHUwMGU4Y2VzIGRlIHBvaXNzb25zLiBJZFx1MDBlOWFsIHBvdXIgbGUgc25vcmtlbGluZyBldCBsZXMgYmFsYWRlcyBlbiBiYXRlYXUgXHUwMGUwIGZvbmQgZGUgdmVycmUuIiwiZGVzY0VuIjoiUHJvdGVjdGVkIG1hcmluZSBwYXJrIHdpdGggMzggY29yYWwgc3BlY2llcyBhbmQgNzIgZmlzaCBzcGVjaWVzLiBJZGVhbCBmb3Igc25vcmtlbGxpbmcgYW5kIGdsYXNzLWJvdHRvbSBib2F0IHRyaXBzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDQ0ODQ3OCw1Ny43MDk4MDEiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d3UjV5MFlCTlVCR0VhUHhpTHpuQUVTTWZIVWZ5RFA2cWsxaDRseFI4aHNYMFFKdjJkUGFDY3FKNUwxNC1PY21UNEw1REpwVWpLT3NuaFAyQXFvYzZYbVdsSU94WjFlVnVjcEJ5Q2x4emlaUVU5RU5HT1pxZ193Mjh2enU4RGJJd2NWSGFuT3FOVG10UVQwY3Z2VHVuV3lGN3Nhc0RSclJqa3JzdTZLUzVVS3FUV1B6QlBmODJ4M0hQWlg2MVZKSlR3Sk1jc1NzeHZEP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiaXo3aGJ4ZjgiLCJuYW1lRnIiOiJMYSBWYWxsXHUwMGU5ZSBkZSBGZXJuZXkiLCJuYW1lRW4iOiJMYSBWYWxsXHUwMGU5ZSBkZSBGZXJuZXkiLCJkZXNjRnIiOiJSXHUwMGU5c2VydmUgbmF0dXJlbGxlIGRlIDIwMCBoZWN0YXJlcyBwclx1MDBlOXNlcnZhbnQgbGEgZm9yXHUwMGVhdCBlbmRcdTAwZTltaXF1ZSBkZSBsJ1x1MDBlZWxlLiBSYW5kb25uXHUwMGU5ZXMgZ3VpZFx1MDBlOWVzLCBmYXVuZSBzYXV2YWdlIGV0IHBheXNhZ2VzIHZlcmRveWFudHMuIiwiZGVzY0VuIjoiMjAwLWhlY3RhcmUgbmF0dXJlIHJlc2VydmUgcHJlc2VydmluZyB0aGUgaXNsYW5kJ3MgZW5kZW1pYyBmb3Jlc3QuIEd1aWRlZCBoaWtlcywgd2lsZGxpZmUgYW5kIGx1c2ggbGFuZHNjYXBlcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjM2MjAwODgsNTcuNzA1NjAyNiIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dmMi1nRC1BMFQ2T1VxeE5RV2xGYWtabUVKdGRXVzd2b1NpeWF2U0dNRWtXcjdFMXJ0bHNrUndjZmx5OGl6aGRNWG5QWl9JYkl0WGNVNzhjX19lNmpwbGotclZvM28wZTUzUVFEV0YtMm9HMm1ZREgxR251NHBEZFZnQ0c1VnBSUTN3YmtLNkduazJoSERfME44bnFqSTRIaHBVRVJvSDBnZU1RTEE1SlRXZDhILVhmVGVDNWdoSTJjVmVMMWtxMFdGaW5HV2xjRzg/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJpd3BwNGxnMCIsIm5hbWVGciI6Ik1haGVib3VyZyBNdXNldW0iLCJuYW1lRW4iOiJNYWhlYm91cmcgTXVzZXVtIiwiZGVzY0ZyIjoiTXVzXHUwMGU5ZSBoaXN0b3JpcXVlIHJldHJhXHUwMGU3YW50IGxhIGJhdGFpbGxlIGRlIEdyYW5kIFBvcnQgZGUgMTgxMC4gQ2FydGVzIGFuY2llbm5lcywgb2JqZXRzIGNvbG9uaWF1eCBldCBtYXF1ZXR0ZXMgZGUgbmF2aXJlcy4iLCJkZXNjRW4iOiJIaXN0b3JpY2FsIG11c2V1bSB0ZWxsaW5nIHRoZSBzdG9yeSBvZiB0aGUgMTgxMCBCYXR0bGUgb2YgR3JhbmQgUG9ydC4gQW5jaWVudCBtYXBzLCBjb2xvbmlhbCBhcnRlZmFjdHMgYW5kIHNoaXAgbW9kZWxzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDE2MzI0NSw1Ny43MDMzMzAxIiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiazh2ZnYya3QiLCJuYW1lRnIiOiJNYWhlYm91cmcgV2F0ZXJmcm9udCIsIm5hbWVFbiI6Ik1haGVib3VyZyBXYXRlcmZyb250IiwiZGVzY0ZyIjoiUHJvbWVuYWRlIGJhbG5cdTAwZTlhaXJlIGFuaW1cdTAwZTllIGF2ZWMgdnVlIHN1ciBsZXMgXHUwMGVlbG90cyBkZSBsYSBiYWllLiBSZXN0YXVyYW50cywgYXJ0aXNhbmF0IGxvY2FsIGV0IGNvdWNoZXJzIGRlIHNvbGVpbCBtYWduaWZpcXVlcy4iLCJkZXNjRW4iOiJMaXZlbHkgc2Vhc2lkZSBwcm9tZW5hZGUgd2l0aCB2aWV3cyBvdmVyIHRoZSBiYXkncyBpc2xldHMuIFJlc3RhdXJhbnRzLCBsb2NhbCBjcmFmdHMgYW5kIG1hZ25pZmljZW50IHN1bnNldHMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDUwMjc1LDU3LjcwOTc1NjciLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d5a2wzZmdmWkdkcUZjVTI1VWVUOXRsaFV3dzdkQkZtNkRXMk5zR0lGcE9yM3pROU9kM25ITW02UVNsTV9zaVZTR19jT1lwWk1FSzRIWks2NnZGUUtrX0x5UnFWTUNNb1J2LUJXQV9DZlNiMzd4aFl6Y0JXOFh0OFdhWXZfbXlXdXMtbVF6dWhCbFdwU0FOTW5mb0F0b1ZCeXc3TjY5SS10MW5NbDhfZDlVLXJNRUZFb1lMTzVWdW5wZmZ5SHBIMmpfVU55Z1VQSzI1P2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiNTZjZG50MnYiLCJuYW1lRnIiOiJMYSBWYW5pbGxlIE5hdHVyZSBQYXJrIiwibmFtZUVuIjoiTGEgVmFuaWxsZSBOYXR1cmUgUGFyayIsImRlc2NGciI6IlBhcmMgbmF0dXJlbCBhdmVjIHRvcnR1ZXMgZ1x1MDBlOWFudGVzLCBjcm9jb2RpbGVzIGR1IE5pbCBldCBsXHUwMGU5bXVyaWVucy4gQ2FkcmUgdHJvcGljYWwgbHV4dXJpYW50LCBhY2Nlc3NpYmxlIFx1MDBlMCB0b3V0ZSBsYSBmYW1pbGxlLiIsImRlc2NFbiI6Ik5hdHVyZSBwYXJrIHdpdGggZ2lhbnQgdG9ydG9pc2VzLCBOaWxlIGNyb2NvZGlsZXMgYW5kIGxlbXVycy4gTHVzaCB0cm9waWNhbCBzZXR0aW5nLCBwZXJmZWN0IGZvciB0aGUgd2hvbGUgZmFtaWx5LiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDk5NDc1LDU3LjU2MzI3MiIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3lSSUJXMjROVzd3amEzU1h5dXF0RkhGcHRaSWw5T1llSVBoRmFQcEk4b2ozNUotYjZtVHV6SnVRdmxRRk9mX2wzMVgteU9fM1hrUHk3RHRRRTItaG16VHBMeFBKRHA1dlR4emp3ZW1qTGtUOEpCbHdraFVSY2hkeVBUZ0xSeHpFaWpBV1BXXzdReUUxVmpUZ2JvaE1mQ0pGZzhKQmh4MVpaZ0ZibGg5XzV1RXZ4QUV1QUVZd3VJNU1DNWNXQzVUTkM2cUpqQ05tNGpXcXhYZlIyQ1JuWmRwRFpraFAyc250aVhvamp5SGdmdnN2NE56YmJFdWI4M09pND9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6ImFva2Z5eWJnIiwibmFtZUZyIjoiVmFsbFx1MDBlOWUgQWR2ZW50dXJlIFBhcmsiLCJuYW1lRW4iOiJWYWxsXHUwMGU5ZSBBZHZlbnR1cmUgUGFyayIsImRlc2NGciI6IlBhcmMgZCdhdmVudHVyZSBhdmVjIHR5cm9saWVubmUgZXQgcXVhZCBkYW5zIGxhIHZhbGxcdTAwZTllIGRlIEZlcm5leS4gQWRyXHUwMGU5bmFsaW5lIGdhcmFudGllIGRhbnMgdW4gY2FkcmUgdmVyZG95YW50LiIsImRlc2NFbiI6IkFkdmVudHVyZSBwYXJrIHdpdGggemlwLWxpbmUgYW5kIHF1YWQgYmlrZXMgaW4gdGhlIEZlcm5leSBWYWxsZXkuIEd1YXJhbnRlZWQgdGhyaWxscyBpbiBhIGx1c2ggZ3JlZW4gc2V0dGluZy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQ1NzkyMzIsNTcuNDg0NDcxNiIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3czOEQ4cGFoSXdiVW1FYUhEbWNNX0t0eEs3djZpc09XLUV2REFLSS03bkhMd085aGpzM21wZDZpal9wekt3bW9ucnhrcGJUd3RHMTZyZDMyVjhnRU01ZFczbG5LUVN4d0xvRFRKbzVMMk1KRGM3OEM2cm9ZNTJWVUpnUlVKT1IxUThEYjRLSHhLblVRcTl4R0h2eTJxSGZ0Wlp2d3gwd21lOHgtUDR2MlY2QV90UGVGUWViTnhmQkt5TVpnNXVFeEs1ZjB0VHF2RlVOdkU1dEpYY09MclY2dTNFV25Qc3FZbVdEVXRFbjZELXM2aUlmb0RubUZZVkFZZz9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InNuZW55emR0IiwibmFtZUZyIjoiQ2FzZWxhIE5hdHVyZSBQYXJrcyB8IElsZSBNYXVyaWNlIiwibmFtZUVuIjoiQ2FzZWxhIE5hdHVyZSBQYXJrcyB8IElsZSBNYXVyaWNlIiwiZGVzY0ZyIjoiTGUgcGFyYyBuYXR1cmUgbnVtXHUwMGU5cm8gMSBkZSBNYXVyaWNlIGF2ZWMgbGlvbnMsIHpcdTAwZThicmVzIGV0IHJoaW5vY1x1MDBlOXJvcy4gTWFyY2hlIGF2ZWMgbGVzIGxpb25zIGV0IHNhZmFyaSBlbiBidXMgcG91ciB0b3V0ZSBsYSBmYW1pbGxlLiIsImRlc2NFbiI6Ik1hdXJpdGl1cydzIG51bWJlciAxIG5hdHVyZSBwYXJrIHdpdGggbGlvbnMsIHplYnJhcyBhbmQgcmhpbm9zLiBXYWxrIHdpdGggbGlvbnMgYW5kIGJ1cyBzYWZhcmkgZm9yIHRoZSB3aG9sZSBmYW1pbHkuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC4yOTExNDc3LDU3LjQwMzk5NDkiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d6MGQ0LUE0MjZlTThyVFc2ZGYxd0VBeGt2U1NlVUtxOEp2eWg1RHZUY1ZON0JKSnNPcUxQVlZLY2lsT1UxamhZN3BLUVNsMGdWaWE5TXA5N0laUG9KdVc3SlpXbVhYSHVnaFFQV29lQmpnS3ZpanVna0k3ems0cE1fSFlXZDM3dVZabG8ycmYtd0pBbzRfSVFqNDFCVFRVQldJSEF1el83QWNxXzI1ajJ5NXlZR1NjemVFdG1yQnhQdl9pbDVwWnFnTDhReGx0WmhmRDk3ZGo5NzZkZnZvczQ5enB5cWVwTG9hWXZtbTB5Q01nNHE1ZE5ua1R6Q21ZSjg/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJqaHV1eG03ZSIsIm5hbWVGciI6IklsZSBEZXMgRGV1eCBDb2NvcyIsIm5hbWVFbiI6IklsZSBEZXMgRGV1eCBDb2NvcyIsImRlc2NGciI6Iklsb3QgcHJpdlx1MDBlOSBjbGFzc1x1MDBlOSBSYW1zYXIsIGFjY2Vzc2libGUgZW4gYmF0ZWF1IGRlcHVpcyBCbHVlIEJheS4gRWF1eCB0dXJxdW9pc2VzLCBzbm9ya2VsaW5nIGV0IHBpcXVlLW5pcXVlIGNyXHUwMGU5b2xlLiIsImRlc2NFbiI6IlByaXZhdGUgUmFtc2FyLWxpc3RlZCBpc2xldCwgYWNjZXNzaWJsZSBieSBib2F0IGZyb20gQmx1ZSBCYXkuIFR1cnF1b2lzZSB3YXRlcnMsIHNub3JrZWxsaW5nIGFuZCBDcmVvbGUgcGljbmljLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDQ4NzA3NSw1Ny43MTA5ODMyIiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HelhoalJQYW1YX1V2MDgyMHA0cmZXSzZGZGFhUXhrZlVwVW9UdF9JR19iZFF5R19uQlE5aktRSTBEeTdFVmctTkp1aU14ZUpfTlpyWll0R1hWRFU1VzdoNThhQUJDSHVERmZZbmZxd283T0ZYS0pHa1B3bC1pR21yUVpPbENHR3hFcnJHQ05CSG5DQ0N3dVdSTHRqeWI1N3ZVYXJRWDUxdFRtMlBXTjhQR0NUelYzaWFFWUdoRXV4UUlyV0J1N0VoZXI2Yy1ycEJXVz9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InZ1dzc1eGk4IiwibmFtZUZyIjoiTGlvbiBNb3VudGFpbiBoaWtpbmcgdHJhaWwiLCJuYW1lRW4iOiJMaW9uIE1vdW50YWluIGhpa2luZyB0cmFpbCIsImRlc2NGciI6IlJhbmRvbm5cdTAwZTllIGVtYmxcdTAwZTltYXRpcXVlICg1NjRtKSBhdmVjIHZ1ZSBwYW5vcmFtaXF1ZSBzdXIgbGUgbGFnb24gZGUgTWFoZWJvdXJnLiBFbnZpcm9uIDNoIGFsbGVyLXJldG91ciwgbml2ZWF1IG1vZFx1MDBlOXJcdTAwZTkuIiwiZGVzY0VuIjoiSWNvbmljIGhpa2UgKDU2NG0pIHdpdGggcGFub3JhbWljIHZpZXdzIG92ZXIgdGhlIE1haGVib3VyZyBsYWdvb24uIEFib3V0IDMgaG91cnMgcmV0dXJuLCBtb2RlcmF0ZSBkaWZmaWN1bHR5LiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuMzcyMDg1Miw1Ny43MjcwMzQ1IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeVJUOXR1aGhqOFU0SDBwOFJiU3l3Yk9zUF9RR2RNTUpXUV9oM3M4WG44Ri1rbEgtcnhVc1NJci1BTDlYWE5RbkJxT3picUpONDA1d1FmdUo1ODZac1JXQUhmZl9YSXRzUUhidU0tQ3EyZHBQVmlGc3lzQ05OQ0RlM29QT2d6em16Z2djcTcxWkZ4eVpoOEsxcFpMQktOLUhJUDhVYXdhYTlUcHk5c2NJOHFFbWJGRGtGeDRRSzJwOTlhYUVSWmdxMTVpcnNpcFR3SDNBP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoiYjB4c2F0N3QiLCJuYW1lRnIiOiJJbGUgYXV4IEFpZ3JldHRlcyIsIm5hbWVFbiI6IklsZSBhdXggQWlncmV0dGVzIiwiZGVzY0ZyIjoiSWxlLXJcdTAwZTlzZXJ2ZSBuYXR1cmVsbGUgZGUgMjYgaGVjdGFyZXMgcHJcdTAwZTlzZXJ2YW50IGwnXHUwMGU5Y29zeXN0XHUwMGU4bWUgb3JpZ2luYWwgZGUgTWF1cmljZS4gVG9ydHVlcyBnXHUwMGU5YW50ZXMgZXQgb2lzZWF1eCBlbmRcdTAwZTltaXF1ZXMuIiwiZGVzY0VuIjoiMjYtaGVjdGFyZSBuYXR1cmUgcmVzZXJ2ZSBpc2xhbmQgcHJlc2VydmluZyBNYXVyaXRpdXMncyBvcmlnaW5hbCBlY29zeXN0ZW0uIEdpYW50IHRvcnRvaXNlcyBhbmQgZW5kZW1pYyBiaXJkcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQxNzk4NCw1Ny43MzExMjM4IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9Held6eTRtOWhuT3FlbjRhUFhjQzMzeEtQczFkMk9nUjc5U3lLV1gzZDNjVVJMSFBtbG5FVU13cDRGYmw4YVFnZERaS0RiOHFtTWpRdDZUV0s0MlNzT0kycHhqYWpiQWJ5U3pHMUczRnFJcV9fZlNmcVhCV3YydzFxRWxhYVo4QXZmWWphSHVUOFJKREk3Smg0MFRObHlXenByUGphTGxGU0k2STZoMjYwdmtkQzE1Z2tsYnFpa0llNklGNHVETHctNnZvczFYUVJmQT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InhtMzEyZmdxIiwibmFtZUZyIjoiXHUwMGNlbGUgYXV4IENlcmZzIiwibmFtZUVuIjoiXHUwMGNlbGUgYXV4IENlcmZzIiwiZGVzY0ZyIjoiSWxlIHBhcmFkaXNpYXF1ZSBkYW5zIGxlIGxhZ29uIGRlIGwnZXN0LCBkZXN0aW5hdGlvbiBwaGFyZSBkZSBNYXVyaWNlLiBFYXV4IGNyaXN0YWxsaW5lcywgc3BvcnRzIG5hdXRpcXVlcyBldCByZXN0YXVyYW50cyBkZSBib3JkIGRlIG1lci4iLCJkZXNjRW4iOiJQYXJhZGlzZSBpc2xhbmQgaW4gdGhlIGVhc3Rlcm4gbGFnb29uLCBNYXVyaXRpdXMncyBmbGFnc2hpcCBkZXN0aW5hdGlvbi4gQ3J5c3RhbC1jbGVhciB3YXRlcnMsIHdhdGVyIHNwb3J0cyBhbmQgYmVhY2hzaWRlIHJlc3RhdXJhbnRzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuMjcyMzUzOCw1Ny44MDQxMTA3IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HeDZRa051Y2tPYnI2WDRIRGFHM0VnOEFNdXBONkhYWmcxQ05ISV9Ha0xzMUprT2VYTGRYRDIxblhyUlVXR1hxeWU1WkJVb2J4aF95XzdhYmU0ODZNN2Z3bkhIWlItMFJfeVFmcE9KR2VJTEhNSzRIcEJjd2xsaGdPOWoyeGE5eGg5aXB2ZVowRXNkNkVxS2V5MnM2VkV4a1pXa1ZjYkhrQWFYcHhCMDZYYWRsbnVJaGZXZ2FhQks5ZFdmcVRGSnZPd3BCVG5pVXItQT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6Inpwd2JocXpkIiwibmFtZUZyIjoiT2xkIExpZ2h0IEhvdXNlIChcdTAwZWVsZSBhdSBwaGFyZSkiLCJuYW1lRW4iOiJPbGQgTGlnaHQgSG91c2UgKFx1MDBlZWxlIGF1IHBoYXJlKSIsImRlc2NGciI6IlBoYXJlIGhpc3RvcmlxdWUgc3VyIHVuIGlsb3QgZHUgbGFnb24gZGUgTWFoZWJvdXJnLiBBY2Nlc3NpYmxlIGVuIGJhdGVhdSwgcGFub3JhbWEgZXhjZXB0aW9ubmVsIGV0IGNvdWNoZXJzIGRlIHNvbGVpbC4iLCJkZXNjRW4iOiJIaXN0b3JpYyBsaWdodGhvdXNlIG9uIGEgc21hbGwgaXNsZXQgaW4gTWFoZWJvdXJnIGxhZ29vbi4gQWNjZXNzaWJsZSBieSBib2F0LCBleGNlcHRpb25hbCBwYW5vcmFtYSBhbmQgc3Vuc2V0cy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjM5NTc3ODgsNTcuNzc3Mzg2MyIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3ppUmV0cEZIOEhRbE0wOUMxZ1lzUFVyM2ZyTlhKdlk1aEU3YU5hN1owWjdGRjIzSGVzSXBiOF9PVzVwZkc5QnZka3lKdGlMa1pPOHFFaTBxZ1dXTUlZbzM4MEFnVHRONlNKaEIteDJhMkdONGxpWkhtN29maGRNWmtMekhyYkxBMi0wOGV6aW1uMW1TQWtfX2hscGhJc3JjZ09xZDV1alpQbnBKYUxiaEN4TmMxcm9qd0hQckhZaGxWWi1heHVTQjRVWERwX2F6bExMQT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IjJsenh6c3o4IiwibmFtZUZyIjoiQ2FzY2FkZSBSb2NoZXN0ZXIiLCJuYW1lRW4iOiJDYXNjYWRlIFJvY2hlc3RlciIsImRlc2NGciI6IkNhc2NhZGUgdW5pcXVlIGF1eCBkYWxsZXMgdm9sY2FuaXF1ZXMgcmVjdGFuZ3VsYWlyZXMgcmVzc2VtYmxhbnQgXHUwMGUwIGRlcyBjb2xvbm5lcyBkZSBiYXNhbHRlLiBQYXlzYWdlIG1pblx1MDBlOXJhbCBldCBzYXV2YWdlIGRhbnMgbGUgc3VkLiIsImRlc2NFbiI6IlVuaXF1ZSB3YXRlcmZhbGwgd2l0aCByZWN0YW5ndWxhciB2b2xjYW5pYyBzbGFicyByZXNlbWJsaW5nIGJhc2FsdCBjb2x1bW5zLiBXaWxkLCBtaW5lcmFsIGxhbmRzY2FwZSBpbiB0aGUgc291dGguIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC41MDI5ODM1LDU3LjUxNjgyODgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d3S2tURmthNVNHU3N4UkFIYU9XYjFRWDk3OTVVTDc5amZDc2s5VUc3TmtMNmVyeTRST0hHc3dHUVozb0dpVk5WVTdPLXFpUVJjbUFzaUpvbk92WUtCT1dYNzVhaEJ5bmJpTUNWSXE5RF9DaGhLTlRIb1FBWXFDcmFNeldrSTh3LW8wWGs2RmItVkRrQ1puSVNOMVBOd3dmOE9SYXVpbndMa1dHZE5LMFVmZ3prQnk4Y0JjcFVmT0pub1BYMnBVQkdGV0VvTndwdnpqelczdk9qQW13YTY2cnFxcHpSTjRQajllZi1DZVpLTXA4cWZvQ0tfRTVPVDZGemM/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJtamFkdzZjdCIsIm5hbWVGciI6IkdyYW5kIEJhc3NpbiBUZW1wbGUiLCJuYW1lRW4iOiJHcmFuZCBCYXNzaW4gVGVtcGxlIiwiZGVzY0ZyIjoiTGFjIHZvbGNhbmlxdWUgc2Fjclx1MDBlOSBldCBsaWV1IGRlIHBcdTAwZThsZXJpbmFnZSBoaW5kb3UgbGUgcGx1cyBpbXBvcnRhbnQgZGUgTWF1cmljZS4gQW1iaWFuY2Ugc3Bpcml0dWVsbGUgaW50ZW5zZSBldCBkXHUwMGU5Y29yIG5hdHVyZWwuIiwiZGVzY0VuIjoiU2FjcmVkIHZvbGNhbmljIGxha2UgYW5kIG1vc3QgaW1wb3J0YW50IEhpbmR1IHBpbGdyaW1hZ2Ugc2l0ZSBpbiBNYXVyaXRpdXMuIEludGVuc2Ugc3Bpcml0dWFsIGF0bW9zcGhlcmUgYW5kIG5hdHVyYWwgc2V0dGluZy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQxODMyNzMsNTcuNDkzNDI5MiIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dvWVJjVUZ4WTFVY0dIblZhcktCQXVhckFmb1hkY2VnWWZOWmNoMHRfa3hydG5EX2dxYkFLYkJDc3hqbFZPT3NUdkt3U0RWVlpnVlNGc3JsQXFUb2JCNFVkZm9zRTVMMDROSnlxanc0Y0dUZkhSLV8xVW1HaXRUbUNNdXdoWFAzdElqRGtXczJtVEY3dFRxeXpuU2Ixck1FaDU3OXNLbjBVUXRweS1WWEYtRFRlZmdMVzI3U2tWZndpX1NNU2VELTVveWo3Tm1wQ01KNUNZUE1JNHhrMmFSSkNtd3Rvd01yUm9naDlwaWlMN3VMVkJFYi1hLVo1SnRVWT9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IndhN25nNmpsIiwibmFtZUZyIjoiVGFtYXJpbmQgRmFsbHMgLyA3IENhc2NhZGVzIiwibmFtZUVuIjoiVGFtYXJpbmQgRmFsbHMgLyA3IENhc2NhZGVzIiwiZGVzY0ZyIjoiTGVzIGNcdTAwZTlsXHUwMGU4YnJlcyA3IENhc2NhZGVzIGVuIHBsZWluZSBmb3JcdTAwZWF0IHRyb3BpY2FsZS4gUmFuZG9ublx1MDBlOWUgZXQgYmFpZ25hZGUgZGFucyBkZXMgcGlzY2luZXMgbmF0dXJlbGxlcywgdW5lIGV4cFx1MDBlOXJpZW5jZSBpbm91YmxpYWJsZS4iLCJkZXNjRW4iOiJUaGUgZmFtb3VzIDcgQ2FzY2FkZXMgaW4gdHJvcGljYWwgZm9yZXN0LiBIaWtpbmcgYW5kIHN3aW1taW5nIGluIG5hdHVyYWwgcG9vbHMgXHUyMDE0IGFuIHVuZm9yZ2V0dGFibGUgZXhwZXJpZW5jZS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjM1NDcyNDcsNTcuNDY2NDE3MSIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3dDZzM2Y0JKTzhlU281QlpzN0JlWklJaTdlZEh1WWFTdjJuMEJlbzA4RGxzdTM1YnlnVGVkb25uOVdobVdLTGtXREJhMHo1OWdQc1JmWVBlZEpCZG14UlJCMlhCN21xaExYYUNhX0l4Y0tENmtwZ01sT0JTclJGRW1JcC04WnBLUlI2MGtpeU5pX0FmUnE0NkdxUFZ3VDlKYkZPTWdpSXAtMlpkdk9zcldtcUtHRmFWcjE4Mm9wNTRuV01NNkJ3RUd3OWhGVkppLWlWWVR5dmNPMGk0Rk9xSDVJcmlsLVRPNUZhbjMyVEdxYlF1VGtWelRZUXRDNkY3az9hdXRodXNlcj0wJmZpZmU9czE2MzgzIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IjI0NHQ5MHB1IiwibmFtZUZyIjoiQm9pcyBDaGVyaSBUZWEgRmFjdG9yeSIsIm5hbWVFbiI6IkJvaXMgQ2hlcmkgVGVhIEZhY3RvcnkiLCJkZXNjRnIiOiJMYSBwbHVzIGFuY2llbm5lIHBsYW50YXRpb24gZGUgdGhcdTAwZTkgZGUgTWF1cmljZSwgZW4gYWN0aXZpdFx1MDBlOSBkZXB1aXMgMTg5Mi4gVmlzaXRlIGd1aWRcdTAwZTllLCBkXHUwMGU5Z3VzdGF0aW9uIGV0IHJlc3RhdXJhbnQgcGFub3JhbWlxdWUuIiwiZGVzY0VuIjoiTWF1cml0aXVzJ3Mgb2xkZXN0IHRlYSBwbGFudGF0aW9uLCBpbiBvcGVyYXRpb24gc2luY2UgMTg5Mi4gR3VpZGVkIHRvdXIsIHRhc3RpbmcgYW5kIHBhbm9yYW1pYyByZXN0YXVyYW50LiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDI2MzI5MSw1Ny41MjU2NTg2IiwiaW1hZ2UiOiJodHRwczovL215bWFwcy51c2VyY29udGVudC5nb29nbGUuY29tL2hvc3RlZGltYWdlL20vKi8zQUU1YV9HenZYX0FfSzZxcTE2LTRRWmdOeUtMVDZqUkM0RDdwNjRWc3RIRHhVWGt6ZmtYTzQySHNxbW1ONmRZOG03dTQwTnd0QkZyZWlmRnZBcUZMT0V0MjhhSnFPdmNkTDlrQkFlOWRJT1JmUmoxd2w0bXpaMWt4VGJ4ZE5iU09FZ0hiTy1zUGpSVUdWT3FKUTdHaUxGNktVdV9teVUyYkdGYldhaTJvR1N5Q1k1V1g0anhrQ2VJQjlfZHRYWk9DbktKRG0xcVBQUjlmb1BqZTkwQmV6cUhmMUsyeHFmZlN6anprVzhSSkJPV3VkZTNBeUpwbXVBU09Ya0ExZXJRP2F1dGh1c2VyPTAmZmlmZT1zMTYzODMiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoicnhwY3FqbjIiLCJuYW1lRnIiOiJHcmlzIEdyaXMgQmVhY2giLCJuYW1lRW4iOiJHcmlzIEdyaXMgQmVhY2giLCJkZXNjRnIiOiJQbGFnZSBzYXV2YWdlIGR1IHN1ZCBiYXR0dWUgcGFyIGxlcyB2YWd1ZXMgZGUgbCdvY1x1MDBlOWFuIEluZGllbi4gUGF5c2FnZSBkcmFtYXRpcXVlIGV0IGdyYW5kaW9zZSBwb3VyIGxlcyBhbWF0ZXVycyBkZSBuYXR1cmUgYnJ1dGUuIiwiZGVzY0VuIjoiV2lsZCBzb3V0aGVybiBiZWFjaCBiYXR0ZXJlZCBieSBJbmRpYW4gT2NlYW4gd2F2ZXMuIERyYW1hdGljLCBncmFuZCBsYW5kc2NhcGUgZm9yIG5hdHVyZSBsb3ZlcnMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC41MjQzODk5LDU3LjUzMjIxNTgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d3cVllY0xuMkxkT2VSWWJNOFhOUVN5V2dZZkQyM21JZThNemQ3R3ZrX1l0cXRJbDNGTFBseWdnWHliQzk0eENCRUlpVTkyVjExMVM0bHl5YWFNV0dzYm16dGlTTWxpM1hVR1dHeXFRTFV6ZlNkNUJWS3pGcGo3SXpvUFRBT24tVnl6SmZ2UzgxZmdLeEZTa2RoQXRrZ3RYWGJCNEhLMXZKeVdNR1R1UFFBTjdFaVNYYWtudDh1YnNYb05Ydm1uZldGMHV3UXNjMThrdkliaDRuQjktVGhyMnJWQ3VNX0hzZXlySEVqc3k2bzVyTXZId1NreTB1MFJvYmM/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9XX0seyJpZCI6ImJvdWxhbmdlcmllcyIsIm5hbWVGciI6IlBcdTAwZTJ0aXNzZXJpZXMgLyBCb3VsYW5nZXJpZXMiLCJuYW1lRW4iOiJCYWtlcmllcyAvIFBhc3RyeSBTaG9wcyIsImljb24iOiJcdWQ4M2VcdWRkNTAiLCJjb2xvciI6IiNjNDdhM2EiLCJpdGVtcyI6W3siaWQiOiJsamJpaW1hNSIsIm5hbWVGciI6IkJsXHUwMGU5IEQnb3IgQm91bGFuZ2VyaWUgZXQgUGF0aXNzZXJpZSIsIm5hbWVFbiI6IkJsXHUwMGU5IEQnb3IgQm91bGFuZ2VyaWUgZXQgUGF0aXNzZXJpZSIsImRlc2NGciI6IkJvdWxhbmdlcmllIGFydGlzYW5hbGUgbWF1cmljaWVubmUgYXZlYyBwYWlucyBjaGF1ZHMsIHZpZW5ub2lzZXJpZXMgZXQgZ1x1MDBlMnRlYXV4IGxvY2F1eC4gSWRcdTAwZTlhbGUgcG91ciBsZSBwZXRpdC1kXHUwMGU5amV1bmVyLiIsImRlc2NFbiI6Ik1hdXJpdGlhbiBhcnRpc2FuIGJha2VyeSB3aXRoIHdhcm0gYnJlYWRzLCBwYXN0cmllcyBhbmQgbG9jYWwgY2FrZXMuIFBlcmZlY3QgZm9yIGJyZWFrZmFzdC4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQzMTkxMDYsNTcuNjYxMzkxOCIsImltYWdlIjoiaHR0cHM6Ly9teW1hcHMudXNlcmNvbnRlbnQuZ29vZ2xlLmNvbS9ob3N0ZWRpbWFnZS9tLyovM0FFNWFfR3hDMGMtZzNGNWRmdm16bW5QQlBaR3UxZ3JteVE5aDR6Wk1HZmVPLVMtNXdLRThhbnp3dFJfdzJMN2dBSG9wVWVfSHo3bXBjRXNVRERtZFJnaHprYWljME44TmZ2aDRRc0RTRDVzZmZhajNKejU4bGJTcEYtQ2NiRU5tVUVtOGJvNm5GbU9lUnBVMm91RWNCN0xla2E1LW9DSGFsbzdDak9rcVBGM1Q3d1dPUXpicWhTWWlkVjhBZ0JvSGxNUEpuLUlwUTh4ejdnZXA/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9XX1dLCJzdWJjYXRlZ29yaWVzIjpbeyJpZCI6ImF0bSIsIm5hbWVGciI6IkFUTSIsIm5hbWVFbiI6IkFUTSIsImljb24iOiJcdWQ4M2NcdWRmZTciLCJjb2xvciI6IiM2MDdkOGIiLCJpdGVtcyI6W3siaWQiOiJqeWU5ZzEwaiIsIm5hbWVGciI6IkF0bSBNQ0IiLCJuYW1lRW4iOiJBdG0gTUNCIiwiZGVzY0ZyIjoiRGlzdHJpYnV0ZXVyIE1DQiAyNGgvMjQuIEFjY2VwdGUgVmlzYSwgTWFzdGVyY2FyZCBldCBjYXJ0ZXMgbG9jYWxlcy4iLCJkZXNjRW4iOiJNQ0IgQVRNIG9wZW4gMjQvNy4gQWNjZXB0cyBWaXNhLCBNYXN0ZXJjYXJkIGFuZCBsb2NhbCBjYXJkcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQzMjEyOTEsNTcuNjYwNDgyMiIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6InhodjN0a2ZzIiwibmFtZUZyIjoiQXRtIFNibSBQbGFpbmUgTWFnbmllbiIsIm5hbWVFbiI6IkF0bSBTYm0gUGxhaW5lIE1hZ25pZW4iLCJkZXNjRnIiOiJEaXN0cmlidXRldXIgU0JNIGRpc3BvbmlibGUgMjRoLzI0IFx1MDBlMCBQbGFpbmUgTWFnbmllbi4iLCJkZXNjRW4iOiJTQk0gQVRNIGF2YWlsYWJsZSAyNC83IGluIFBsYWluZSBNYWduaWVuLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDMxODkwOSw1Ny42NjEzMTk3IiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoidWY5emhmbnIiLCJuYW1lRnIiOiJNQ0IgQVRNIiwibmFtZUVuIjoiTUNCIEFUTSIsImRlc2NGciI6IkRpc3RyaWJ1dGV1ciBNQ0IgMjRoLzI0LiBBY2NlcHRlIFZpc2EsIE1hc3RlcmNhcmQgZXQgY2FydGVzIGxvY2FsZXMuIiwiZGVzY0VuIjoiTUNCIEFUTSBvcGVuIDI0LzcuIEFjY2VwdHMgVmlzYSwgTWFzdGVyY2FyZCBhbmQgbG9jYWwgY2FyZHMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDg5MTIzLDU3LjcwNTU5NDIiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJrZzdlbnVzayIsIm5hbWVGciI6IkFic2EgfCBBdG0gfCBCZWF1IFZhbGxvbiIsIm5hbWVFbiI6IkFic2EgfCBBdG0gfCBCZWF1IFZhbGxvbiIsImRlc2NGciI6IkRpc3RyaWJ1dGV1ciBBYnNhIFx1MDBlMCBCZWF1IFZhbGxvbiwgZGlzcG9uaWJsZSAyNGgvMjQuIiwiZGVzY0VuIjoiQWJzYSBBVE0gYXQgQmVhdSBWYWxsb24sIGF2YWlsYWJsZSAyNC83LiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDIzNzU5LDU3LjY5Nzk0MSIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IjliNGp1cW53IiwibmFtZUZyIjoiQVRNIE1DQiIsIm5hbWVFbiI6IkFUTSBNQ0IiLCJkZXNjRnIiOiJEaXN0cmlidXRldXIgTUNCIDI0aC8yNC4gQWNjZXB0ZSBWaXNhLCBNYXN0ZXJjYXJkIGV0IGNhcnRlcyBsb2NhbGVzLiIsImRlc2NFbiI6Ik1DQiBBVE0gb3BlbiAyNC83LiBBY2NlcHRzIFZpc2EsIE1hc3RlcmNhcmQgYW5kIGxvY2FsIGNhcmRzLiIsImFkZHJlc3MiOiIiLCJwaG9uZSI6IiIsIm1hcExpbmsiOiJodHRwczovL21hcHMuZ29vZ2xlLmNvbS8/cT0tMjAuNDE3NTI1OSw1Ny43MTAwMzQ5IiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifV19LHsiaWQiOiJlc3NlbmNlIiwibmFtZUZyIjoiU3RhdGlvbnMgRXNzZW5jZSIsIm5hbWVFbiI6IkdhcyBTdGF0aW9ucyIsImljb24iOiJcdTI2ZmQiLCJjb2xvciI6IiNlNTM5MzUiLCJpdGVtcyI6W3siaWQiOiJhems0M2l1bSIsIm5hbWVGciI6IkVuZ2VuIEZpbGxpbmcgU3RhdGlvbiIsIm5hbWVFbiI6IkVuZ2VuIEZpbGxpbmcgU3RhdGlvbiIsImRlc2NGciI6IlN0YXRpb24gRW5nZW4gYXZlYyBjYXJidXJhbnRzIFNQOTUsIGRpZXNlbCBldCBib3V0aXF1ZS4gT3V2ZXJ0ZSA3ai83LiIsImRlc2NFbiI6IkVuZ2VuIHN0YXRpb24gd2l0aCBTUDk1LCBkaWVzZWwgYW5kIHNob3AuIE9wZW4gNyBkYXlzIGEgd2Vlay4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQzMDg0NDUsNTcuNjY2NjI4OCIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6Ijd0bDZ1Z2hsIiwibmFtZUZyIjoiU2hlbGwgRmlsbGluZyBTdGF0aW9uIiwibmFtZUVuIjoiU2hlbGwgRmlsbGluZyBTdGF0aW9uIiwiZGVzY0ZyIjoiU3RhdGlvbiBTaGVsbCBjb21wbFx1MDBlOHRlIGF2ZWMgY2FyYnVyYW50cywgYm91dGlxdWUgZXQgc2VydmljZXMgYXV0by4iLCJkZXNjRW4iOiJGdWxsIFNoZWxsIHN0YXRpb24gd2l0aCBmdWVsLCBzaG9wIGFuZCBjYXIgc2VydmljZXMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MzIxOTIyLDU3LjY2MDcyNDkiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiI3Nmd3dHM0MSIsIm5hbWVGciI6IlNIRUxMIiwibmFtZUVuIjoiU0hFTEwiLCJkZXNjRnIiOiJTdGF0aW9uIFNoZWxsIGF2ZWMgY2FyYnVyYW50cywgYm91dGlxdWUgZXQgZ29uZmxhZ2UgZGVzIHBuZXVzLiIsImRlc2NFbiI6IlNoZWxsIHN0YXRpb24gd2l0aCBmdWVsLCBzaG9wIGFuZCB0eXJlIGluZmxhdGlvbi4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNTk1MDUsNTcuNzAzNDIyMiIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6ImtjM21ub2d0IiwibmFtZUZyIjoiVG90YWxFbmVyZ2llcyBNYWhlYm91cmciLCJuYW1lRW4iOiJUb3RhbEVuZXJnaWVzIE1haGVib3VyZyIsImRlc2NGciI6IlN0YXRpb24gVG90YWxFbmVyZ2llcyBcdTAwZTAgTWFoZWJvdXJnIGF2ZWMgY2FyYnVyYW50cyBldCBib3V0aXF1ZS4iLCJkZXNjRW4iOiJUb3RhbEVuZXJnaWVzIHN0YXRpb24gaW4gTWFoZWJvdXJnIHdpdGggZnVlbCBhbmQgc2hvcC4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNzkxNyw1Ny43MDU3ODMiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiJvOGQzamx3MiIsIm5hbWVGciI6IkluZGlhbiBPaWwiLCJuYW1lRW4iOiJJbmRpYW4gT2lsIiwiZGVzY0ZyIjoiU3RhdGlvbiBJbmRpYW4gT2lsIGF2ZWMgY2FyYnVyYW50cyBldCBzZXJ2aWNlcy4gT3V2ZXJ0ZSA3ai83LiIsImRlc2NFbiI6IkluZGlhbiBPaWwgc3RhdGlvbiB3aXRoIGZ1ZWwgYW5kIHNlcnZpY2VzLiBPcGVuIDcgZGF5cyBhIHdlZWsuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MDU5MDYxLDU3LjcwNzk4OTkiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiIweTZqdzhiciIsIm5hbWVGciI6IlNoZWxsIiwibmFtZUVuIjoiU2hlbGwiLCJkZXNjRnIiOiJTdGF0aW9uIFNoZWxsIGF2ZWMgY2FyYnVyYW50cywgYm91dGlxdWUgZXQgZ29uZmxhZ2UgZGVzIHBuZXVzLiIsImRlc2NFbiI6IlNoZWxsIHN0YXRpb24gd2l0aCBmdWVsLCBzaG9wIGFuZCB0eXJlIGluZmxhdGlvbi4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNzM1MDksNTcuNzA4MjY3IiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoibXVsamIyd2IiLCJuYW1lRnIiOiJTaGVsbCBGaWxsaW5nIFN0YXRpb24iLCJuYW1lRW4iOiJTaGVsbCBGaWxsaW5nIFN0YXRpb24iLCJkZXNjRnIiOiJTdGF0aW9uIFNoZWxsIGNvbXBsXHUwMGU4dGUgYXZlYyBjYXJidXJhbnRzLCBib3V0aXF1ZSBldCBzZXJ2aWNlcyBhdXRvLiIsImRlc2NFbiI6IkZ1bGwgU2hlbGwgc3RhdGlvbiB3aXRoIGZ1ZWwsIHNob3AgYW5kIGNhciBzZXJ2aWNlcy4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQxMDk4NzMsNTcuNjE3MTI2MSIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn1dfSx7ImlkIjoiaG9waXRhdXgiLCJuYW1lRnIiOiJIXHUwMGY0cGl0YXV4IC8gRG9jdGV1cnMiLCJuYW1lRW4iOiJIb3NwaXRhbHMgLyBEb2N0b3JzIiwiaWNvbiI6Ilx1ZDgzY1x1ZGZlNSIsImNvbG9yIjoiI2M2MjgyOCIsIml0ZW1zIjpbeyJpZCI6Inc4dXVjcHQ5IiwibmFtZUZyIjoiRHIgVmlzaG51IEFwcGlhaCIsIm5hbWVFbiI6IkRyIFZpc2hudSBBcHBpYWgiLCJkZXNjRnIiOiJNXHUwMGU5ZGVjaW4gZ1x1MDBlOW5cdTAwZTlyYWxpc3RlIGRpc3BvbmlibGUgcG91ciBjb25zdWx0YXRpb25zLiBDb250YWN0ZXIgcG91ciBsZXMgaG9yYWlyZXMgZXQgdXJnZW5jZXMuIiwiZGVzY0VuIjoiR2VuZXJhbCBwcmFjdGl0aW9uZXIgYXZhaWxhYmxlIGZvciBjb25zdWx0YXRpb25zLiBDb250YWN0IGZvciBob3VycyBhbmQgZW1lcmdlbmNpZXMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MTEzMjQsNTcuNzA1NzcyOCIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6Imp5Nzl2YXZlIiwibmFtZUZyIjoiTWFoZWJvdXJnIEhvc3BpdGFsIiwibmFtZUVuIjoiTWFoZWJvdXJnIEhvc3BpdGFsIiwiZGVzY0ZyIjoiSFx1MDBmNHBpdGFsIHB1YmxpYyBkZSBNYWhlYm91cmcgYXZlYyB1cmdlbmNlcyAyNGgvMjQuIFNBTVUgOiAxMTQsIFBvbXBpZXJzIDogMTE1LiIsImRlc2NFbiI6Ik1haGVib3VyZyBwdWJsaWMgaG9zcGl0YWwgd2l0aCAyNC83IGVtZXJnZW5jeS4gU0FNVTogMTE0LCBGaXJlOiAxMTUuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MTA4MDM0LDU3LjcwMzM1MjYiLCJpbWFnZSI6IiIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9LHsiaWQiOiI4cGI5dzNmNyIsIm5hbWVGciI6Ikphd2FoYXJsYWwgTmVocnUgSG9zcGl0YWwiLCJuYW1lRW4iOiJKYXdhaGFybGFsIE5laHJ1IEhvc3BpdGFsIiwiZGVzY0ZyIjoiR3JhbmQgaFx1MDBmNHBpdGFsIHB1YmxpYyBkZSBSb3NlIEJlbGxlIGF2ZWMgc2VydmljZSBkZXMgdXJnZW5jZXMgMjRoLzI0LiIsImRlc2NFbiI6IkxhcmdlIHB1YmxpYyBob3NwaXRhbCBpbiBSb3NlIEJlbGxlIHdpdGggMjQvNyBlbWVyZ2VuY3kgZGVwYXJ0bWVudC4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjQwNDU0NzEsNTcuNTkyOTYwOSIsImltYWdlIjoiIiwiZGlzdGFuY2UiOiIiLCJwcmljZUxldmVsIjoiIiwib3BlbkhvdXJzIjoiIn0seyJpZCI6IjRlaHRtb3N6IiwibmFtZUZyIjoiQ2xpbmlxdWUgRGFyblx1MDBlOSBDdXJlcGlwZSIsIm5hbWVFbiI6IkNsaW5pcXVlIERhcm5cdTAwZTkgQ3VyZXBpcGUiLCJkZXNjRnIiOiJDbGluaXF1ZSBwcml2XHUwMGU5ZSByXHUwMGU5cHV0XHUwMGU5ZSBcdTAwZTAgQ3VyZXBpcGUgYXZlYyBzcFx1MDBlOWNpYWxpc3RlcyBldCB1cmdlbmNlcy4gU29pbnMgZGUgcXVhbGl0XHUwMGU5IDI0aC8yNC4iLCJkZXNjRW4iOiJSZXB1dGVkIHByaXZhdGUgY2xpbmljIGluIEN1cmVwaXBlIHdpdGggc3BlY2lhbGlzdHMgYW5kIGVtZXJnZW5jeSBjYXJlLiBRdWFsaXR5IDI0LzcgY2FyZS4iLCJhZGRyZXNzIjoiIiwicGhvbmUiOiIiLCJtYXBMaW5rIjoiaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vP3E9LTIwLjI4Nzg1OCw1Ny40MTg4NTg5IiwiaW1hZ2UiOiIiLCJkaXN0YW5jZSI6IiIsInByaWNlTGV2ZWwiOiIiLCJvcGVuSG91cnMiOiIifSx7ImlkIjoienNodzZxMGwiLCJuYW1lRnIiOiJDLUxhYiBCZWF1IFZhbGxvbiIsIm5hbWVFbiI6IkMtTGFiIEJlYXUgVmFsbG9uIiwiZGVzY0ZyIjoiTGFib3JhdG9pcmUgZCdhbmFseXNlcyBtXHUwMGU5ZGljYWxlcyBcdTAwZTAgQmVhdSBWYWxsb24uIFByaXNlcyBkZSBzYW5nLCBleGFtZW5zIGV0IHJcdTAwZTlzdWx0YXRzIHJhcGlkZXMuIiwiZGVzY0VuIjoiTWVkaWNhbCB0ZXN0aW5nIGxhYm9yYXRvcnkgaW4gQmVhdSBWYWxsb24uIEJsb29kIHRlc3RzLCBleGFtaW5hdGlvbnMgYW5kIHF1aWNrIHJlc3VsdHMuIiwiYWRkcmVzcyI6IiIsInBob25lIjoiIiwibWFwTGluayI6Imh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9xPS0yMC40MjIyMjk5LDU3LjcwMTM4MjgiLCJpbWFnZSI6Imh0dHBzOi8vbXltYXBzLnVzZXJjb250ZW50Lmdvb2dsZS5jb20vaG9zdGVkaW1hZ2UvbS8qLzNBRTVhX0d4cWp6Vkl2TnpiTjNLMFNHenRSRGZWSVRkM0NMdE1Wd0Q3M2hyX1J5SWFjbU5EVE9aQXZ3RnVmcjJ0dTFNN3ZBQTB4c1RaX0hOU0pNZHEwZy02alBpZ2ZONkt6d1RKWEZxU2NSUnZLTy1VaE1YekdvVGFQYV9VTXkyNWs5dTdQVDl1elZ1Ym1IOHpFS1cyZFJVTlNhcERRMHd2ckdBT0VUNjFFdDFoVmpvcEl1SFlYR1ZzNWJpR1Jta1dPZDNpeVhUTWw2blo5eUFYcER3UWpCa3oxVE1ZRElxNzVYb09Mbll1aFlYcnUwQ3V1Y29rb1dTTGZpejZIMG8/YXV0aHVzZXI9MCZmaWZlPXMxNjM4MyIsImRpc3RhbmNlIjoiIiwicHJpY2VMZXZlbCI6IiIsIm9wZW5Ib3VycyI6IiJ9XX1dLCJnYWxsZXJ5IjpbeyJpZCI6ImcxIiwidXJsIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvbWlzby9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2VjM2Q5OTZjLWI0YzQtNGVlYy04MDFlLWU3NDUyN2RhNGQ5OS5qcGVnIiwiY2FwdGlvbiI6IlZpbGxhIFAndGl0IEJvdWNob24gLSBWdWUgbWVyIn0seyJpZCI6ImcyIiwidXJsIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsLzlhNjQ5ZjQ4LTA1MjQtNGI2MS04YTIyLTU1MTMzOTQ1MjYyNC5wbmciLCJjYXB0aW9uIjoiUGlzY2luZSBwcml2XHUwMGU5ZSJ9LHsiaWQiOiJnMyIsInVybCI6Imh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL2hvc3RpbmcvSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC9kZDhjZTRiNi1mMjA5LTRmNGEtYjNhNy03NTIxMGJlZmZjZDIucG5nIiwiY2FwdGlvbiI6IlNhbG9uICYgc1x1MDBlOWpvdXIifSx7ImlkIjoiZzQiLCJ1cmwiOiJodHRwczovL2EwLm11c2NhY2hlLmNvbS9pbS9waWN0dXJlcy9ob3N0aW5nL0hvc3RpbmctNTQxNTM5NzIvb3JpZ2luYWwvYzgyN2M4MGUtNWIxZC00OTk0LWE4YWMtYmJmZGQ1MDJkMzVlLnBuZyIsImNhcHRpb24iOiJUZXJyYXNzZSB2dWUgbGFnb24ifSx7ImlkIjoiZzUiLCJ1cmwiOiJodHRwczovL2EwLm11c2NhY2hlLmNvbS9pbS9waWN0dXJlcy9ob3N0aW5nL0hvc3RpbmctNTQxNTM5NzIvb3JpZ2luYWwvODExOGM0MWItOWRkYy00MWU0LWE1YmItZmNjMzc2MjY1YzVhLnBuZyIsImNhcHRpb24iOiJDdWlzaW5lIFx1MDBlOXF1aXBcdTAwZTllIn0seyJpZCI6Imc2IiwidXJsIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsL2Q1ZDRmYmQzLWVmZDAtNDdmOS04ZDU2LWI2ODVhMTY2NmUzOS5wbmciLCJjYXB0aW9uIjoiQ2hhbWJyZSBtYXN0ZXIgLSBsaXQgcXVlZW4sIHZ1ZSBtZXIsIGRyZXNzaW5nIn0seyJpZCI6Imc3IiwidXJsIjoiaHR0cHM6Ly9hMC5tdXNjYWNoZS5jb20vaW0vcGljdHVyZXMvaG9zdGluZy9Ib3N0aW5nLTU0MTUzOTcyL29yaWdpbmFsLzQ4Y2EzMzYzLTA5Y2YtNDFjZi04OGQ4LTk4MmVmOWYxOWQwNy5wbmciLCJjYXB0aW9uIjoiQ2hhbWJyZSAyIC0gbGl0IGRvdWJsZSJ9LHsiaWQiOiJnOCIsInVybCI6Imh0dHBzOi8vYTAubXVzY2FjaGUuY29tL2ltL3BpY3R1cmVzL21pc28vSG9zdGluZy01NDE1Mzk3Mi9vcmlnaW5hbC80ZTEzMTVjNS1mODMwLTRmZGYtYTBiZi0zYmNjOGM0NjViMTAuanBlZyIsImNhcHRpb24iOiJDaGFtYnJlIDMgLSBsaXQgcXVlZW4ifV19"));
const loadData=()=>{
  try{const s=localStorage.getItem("ptitbouchon_v8");if(s)return JSON.parse(s);}catch{}
  return JSON.parse(JSON.stringify(BACKUP_DATA));
};
const saveData=(d)=>{try{localStorage.setItem("ptitbouchon_v8",JSON.stringify(d));}catch{}}; 

// -- CLICK STATS --------------------------
const trackClick=(itemId,itemName)=>{
  const s=LS.get("pb_clicks",{});
  if(!s[itemId])s[itemId]={name:itemName,count:0};
  s[itemId].count+=1; s[itemId].last=new Date().toISOString();
  LS.set("pb_clicks",s);
};
const getClicks=()=>LS.get("pb_clicks",{});
// ==========================================
// GLOBAL CSS
// ==========================================
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:#1b6ca8;border-radius:3px}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
50%{transform:translateY(-7px)}}
@keyframes spin{to{transform:rotate(360deg)}}
100%{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.5)}}
40%{transform:translateY(-12px) scale(1.15)}60%{transform:translateY(-6px) scale(1.05)}}
50%{transform:rotate(12deg)}}
50%{transform:scale(1.25)}}
20%{transform:rotate(-10deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(8deg)}}
30%{transform:scale(1.3,0.75)}40%{transform:scale(0.85,1.1)}50%{transform:scale(1.15,0.9)}65%{transform:scale(0.95,1.05)}75%{transform:scale(1.05,0.95)}}
10%,20%{transform:scale(0.9) rotate(-6deg)}30%,50%,70%,90%{transform:scale(1.1) rotate(6deg)}40%,60%,80%{transform:scale(1.1) rotate(-6deg)}}
14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.3)}70%{transform:scale(1)}}
15%{transform:rotate(-10deg) translateX(-5px)}30%{transform:rotate(8deg) translateX(4px)}45%{transform:rotate(-6deg) translateX(-3px)}60%{transform:rotate(4deg) translateX(2px)}75%{transform:rotate(-2deg) translateX(-1px)}}
30%{transform:skewX(-10deg) skewY(-10deg)}40%{transform:skewX(8deg) skewY(8deg)}50%{transform:skewX(-5deg) skewY(-5deg)}65%{transform:skewX(3deg) skewY(3deg)}75%{transform:skewX(-2deg) skewY(-2deg)}}
50%{transform:perspective(400px) rotateY(90deg) scale(1.1)}100%{transform:perspective(400px) rotateY(0)}}
50%{transform:scale(1.2)}}
















.fadeUp{animation:fadeUp 0.45s ease both}
.card-hover{transition:all 0.28s ease}
.card-hover:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(11,35,66,0.14)!important}

.btn-hover{transition:all 0.2s ease}
.btn-hover:hover{opacity:0.88;transform:translateY(-1px)}
@media(max-width:1024px){.desk-nav{display:none!important}}
@media(min-width:1025px){.mob-only{display:none!important}.bot-nav{display:none!important}}
@media(max-width:500px){.item-row{flex-direction:column!important}.item-row .item-pic{width:100%!important;max-width:100%!important;min-height:200px!important}}
`;

// ==========================================
// SPLASH
// ==========================================
function Splash({s}){
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg, ${SEA.navy} 0%, #1a4a7a 50%, #0e3258 100%)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',Georgia,serif"}}>
      <style>{GLOBAL_CSS}</style>
      <div style={{textAlign:"center",animation:"fadeUp 0.8s ease"}}>
        <div style={{fontSize:88,marginBottom:20,animation:"floatY 3s ease infinite",filter:"drop-shadow(0 8px 32px rgba(0,180,216,0.4))"}}>🏡</div>
        <h1 style={{color:SEA.sand,fontSize:"clamp(28px,7vw,56px)",fontWeight:700,marginBottom:8,letterSpacing:2}}>{s.propertyName}</h1>
        <p style={{color:SEA.sky,opacity:0.7,fontSize:11,letterSpacing:5,textTransform:"uppercase",marginBottom:44,fontFamily:"'Montserrat',sans-serif"}}>{s.tagline||"Villa Guest Guide"}</p>
        <div style={{width:38,height:38,border:`3px solid ${SEA.sky}40`,borderTopColor:SEA.sky,borderRadius:"50%",animation:"spin 0.9s linear infinite",margin:"0 auto"}}/>
      </div>
    </div>
  );
}

// ==========================================
// LANGUAGE SELECTOR  -  deux cartes côte à côte
// ==========================================
function LangSelector({setLang,settings}){
  const [hov,setHov]=useState(null);

  // Beach photo backgrounds for the two cards
  const LANG_CARDS=[
    {
      code:"fr", label:"Français", flag:"🇫🇷", sub:"Accéder au guide",
      bg:"https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=800&q=80",
      overlay:"rgba(10,35,66,0.55)",
    },
    {
      code:"en", label:"English", flag:"🇬🇧", sub:"Access the guide",
      bg:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      overlay:"rgba(10,35,66,0.55)",
    },
  ];

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${SEA.navy},#1a4a7a)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px",position:"relative",overflow:"hidden"}}>
      <style>{GLOBAL_CSS+`
        .lang-card{cursor:pointer;transition:transform 0.35s ease,box-shadow 0.35s ease;border-radius:28px;overflow:hidden;position:relative}
        .lang-card:hover{transform:scale(1.04) translateY(-6px);box-shadow:0 28px 60px rgba(0,0,0,0.45)!important}
        .lang-card .inner{transition:transform 0.4s ease}
        .lang-card:hover .inner{transform:scale(1.06)}
      `}</style>

      {/* Decorative waves */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:120,background:`linear-gradient(transparent, ${SEA.navy}80)`,pointerEvents:"none"}}/>

      {/* Header text */}
      <div style={{textAlign:"center",marginBottom:48,position:"relative",zIndex:1}}>
        <div style={{fontSize:72,marginBottom:16,animation:"floatY 3s ease infinite",filter:"drop-shadow(0 6px 24px rgba(79,195,247,0.5))"}}>🏡</div>
        <h1 style={{color:SEA.sand,fontSize:"clamp(26px,6vw,52px)",fontWeight:700,letterSpacing:2,fontFamily:"'Cormorant Garamond',Georgia,serif",textShadow:"0 2px 20px rgba(0,0,0,0.4)",marginBottom:8}}>
          {settings.propertyName}
        </h1>
        <p style={{color:SEA.sky,opacity:0.75,fontSize:12,letterSpacing:4,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>
          {settings.tagline||"Villa Guest Guide"}
        </p>
      </div>

      {/* Language cards - SIDE BY SIDE */}
      <div style={{display:"flex",gap:20,justifyContent:"center",flexWrap:"nowrap",position:"relative",zIndex:1,width:"100%",maxWidth:680}}>
        {LANG_CARDS.map(lc=>(
          <div key={lc.code} className="lang-card"
            style={{flex:"1 1 0",minWidth:0,maxWidth:320,height:320,boxShadow:"0 16px 48px rgba(0,0,0,0.4)"}}
            onClick={()=>setLang(lc.code)}
            onMouseEnter={()=>setHov(lc.code)}
            onMouseLeave={()=>setHov(null)}>

            {/* Photo background */}
            <div className="inner" style={{position:"absolute",inset:0,backgroundImage:`url(${lc.bg})`,backgroundSize:"cover",backgroundPosition:"center"}}/>

            {/* Dark overlay */}
            <div style={{position:"absolute",inset:0,background:hov===lc.code?"rgba(10,35,66,0.42)":lc.overlay,transition:"background 0.3s"}}/>

            {/* Gradient bottom */}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top, rgba(10,35,66,0.9) 0%, transparent 55%)"}}/>

            {/* Content */}
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"28px 20px"}}>
              <div style={{fontSize:52,marginBottom:10,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.5))"}}>{lc.flag}</div>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:700,color:"white",marginBottom:6,letterSpacing:1,textAlign:"center"}}>{lc.label}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",fontFamily:"'Montserrat',sans-serif",letterSpacing:1,textAlign:"center"}}>{lc.sub}</div>
              <div style={{marginTop:16,background:hov===lc.code?SEA.sky:"rgba(255,255,255,0.15)",color:"white",padding:"8px 24px",borderRadius:30,fontSize:13,fontWeight:600,transition:"background 0.3s",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.25)"}}>
                {lc.code==="fr"?"Commencer →":"Get started →"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Location */}
      {settings.address&&(
        <div style={{marginTop:32,color:"rgba(255,255,255,0.35)",fontSize:12,display:"flex",alignItems:"center",gap:6,fontFamily:"'Montserrat',sans-serif",position:"relative",zIndex:1}}>
          📍 {settings.address}
        </div>
      )}
    </div>
  );
}

// ==========================================
// STAR RATING
// ==========================================
function Stars({itemId,size=17}){
  const [ratings,setRatings]=useState(()=>getRatings());
  const [userRatings,setUserRatings]=useState(()=>getUserRatings());
  const [hover,setHover]=useState(0);
  const [done,setDone]=useState(false);
  const r=ratings[itemId]||{total:0,count:0};
  const avg=r.count>0?(r.total/r.count):0;
  const userR=userRatings[itemId]||0;
  const fill=hover||userR||(avg>0?Math.round(avg):0);
  const rate=(s)=>{
    if(userR===s)return;
    saveRating(itemId,s);saveUserRating(itemId,s);
    setRatings(getRatings());setUserRatings(getUserRatings());
    setDone(true);setTimeout(()=>setDone(false),2000);
  };
  return(
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <div style={{display:"flex",gap:1}}>
        {[1,2,3,4,5].map(s=>(
          <button key={s} onClick={()=>rate(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
            style={{background:"none",border:"none",cursor:"pointer",padding:0,fontSize:size,color:s<=fill?"#f0a500":"#c8ddf0",transition:"color 0.12s,transform 0.1s",transform:hover===s?"scale(1.35)":"scale(1)",lineHeight:1}}>★</button>
        ))}
      </div>
      <span style={{fontSize:11,color:SEA.sub}}>{r.count>0?`${avg.toFixed(1)} (${r.count})`:"−"}</span>
      {done&&<span style={{fontSize:11,color:"#2e7d32",fontWeight:700}}>✓ Merci !</span>}
    </div>
  );
}

// ==========================================
// RICH ITEM CARD
// ==========================================
function ItemCard({item,cat,lang,theme,favorites,setFavorites}){
  const [exp,setExp]=useState(false);
  const isFav=favorites.includes(item.id);
  const desc=lang==="fr"?item.descFr:item.descEn;
  const name=lang==="fr"?item.nameFr:item.nameEn;
  const t=(fr,en)=>lang==="fr"?fr:en;
  const share=()=>{
    const txt=`🏡 P'tit Bouchon - ${t("Recommandation","Recommendation")} :\n*${name}*\n📍 ${item.address||""}\n${item.mapLink||""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`,"_blank");
  };
  return(
    <div className="card-hover" style={{background:theme.card,borderRadius:0,marginBottom:12,boxShadow:"0 2px 12px rgba(11,35,66,0.06)",overflow:"hidden",border:`1px solid ${theme.border}`}}>
      <div className="item-row" style={{display:"flex",flexDirection:"row"}}>
        {item.image&&(
          <div className="item-pic" style={{width:"clamp(120px,36%,210px)",flexShrink:0,position:"relative",overflow:"hidden",minHeight:165}}>
            <img src={item.image} alt={name}
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block",transition:"transform 0.45s"}}
              onMouseEnter={e=>e.target.style.transform="scale(1.08)"}
              onMouseLeave={e=>e.target.style.transform="scale(1)"}
              onError={e=>{e.target.parentElement.style.display="none";}}/>
            <div style={{position:"absolute",top:8,left:8,background:cat.color,borderRadius:20,padding:"3px 10px",fontSize:11,color:"white",fontWeight:700}}>{cat.icon}</div>
            {item.priceLevel&&<div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.65)",borderRadius:20,padding:"3px 10px",fontSize:11,color:"white"}}>{item.priceLevel}</div>}
          </div>
        )}
        <div style={{flex:1,padding:"16px 16px 14px",display:"flex",flexDirection:"column",gap:7,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
            <h3 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(16px,2.5vw,20px)",color:theme.text,margin:0,lineHeight:1.2,flex:1,fontStyle:"italic"}}>{name}</h3>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <button onClick={()=>setFavorites(toggleFavorite(item.id))}
                style={{background:isFav?"#ffe0e3":"rgba(0,0,0,0.04)",border:"none",cursor:"pointer",width:32,height:32,borderRadius:8,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                {isFav?"❤️":"🤍"}
              </button>
              <button onClick={share}
                style={{background:"#e8f8ee",border:"none",cursor:"pointer",width:32,height:32,borderRadius:8,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>
                💬
              </button>
            </div>
          </div>
          {/* BADGES */}
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {!item.image&&<span style={{background:`${SEA.sky}15`,color:cat.color,padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{cat.icon}</span>}
            {item.distance&&<span style={{background:`${SEA.sky}20`,color:SEA.ocean,padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>📍 {item.distance}</span>}
            {item.openHours&&<span style={{background:"rgba(0,0,0,0.05)",color:theme.sub,padding:"2px 10px",borderRadius:20,fontSize:11}}>🕐 {item.openHours}</span>}
            {!item.image&&item.priceLevel&&<span style={{background:"rgba(0,0,0,0.05)",color:theme.sub,padding:"2px 10px",borderRadius:20,fontSize:11}}>{item.priceLevel}</span>}
          </div>
          {/* STARS */}
          <Stars itemId={item.id} size={16}/>
          {/* DESC */}
          {desc&&(
            <div>
              <p style={{fontSize:13,color:theme.sub,lineHeight:1.65,margin:0,display:"-webkit-box",WebkitLineClamp:exp?999:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{desc}</p>
              {desc.length>90&&<button onClick={()=>setExp(!exp)} style={{background:"none",border:"none",color:cat.color,fontSize:12,cursor:"pointer",padding:"1px 0",fontWeight:600}}>{exp?"▲ Moins":"▼ Plus"}</button>}
            </div>
          )}
          {/* ACTIONS */}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:2}}>
            {item.address&&<span style={{fontSize:11,color:theme.sub,background:theme.bg,borderRadius:20,padding:"4px 10px",border:`1px solid ${theme.border}`,display:"flex",alignItems:"center",gap:3,maxWidth:"100%",overflow:"hidden"}}><span style={{flexShrink:0}}>📍</span><span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.address}</span></span>}
            {item.phone&&<a href={`tel:${item.phone}`} onClick={()=>trackClick(item.id,name)} style={{fontSize:9,color:"white",background:cat.color,borderRadius:4,padding:"5px 13px",textDecoration:"none",fontWeight:600,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>📞 {item.phone}</a>}
            {item.mapLink&&<a href={item.mapLink} target="_blank" rel="noopener noreferrer" onClick={()=>trackClick(item.id,name)} style={{fontSize:9,color:"white",background:"#1b6ca8",borderRadius:4,padding:"5px 13px",textDecoration:"none",fontWeight:600,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif",display:"flex",alignItems:"center",gap:4}}>🗺️ Maps</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoEmbed({url}){
  if(!url)return null;
  let src=url;
  const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  const vm=url.match(/vimeo\.com\/(\d+)/);
  if(yt)src=`https://www.youtube.com/embed/${yt[1]}?rel=0`;
  else if(vm)src=`https://player.vimeo.com/video/${vm[1]}`;
  return(<div style={{position:"relative",paddingBottom:"56.25%",height:0,overflow:"hidden",borderRadius:14,marginBottom:14}}><iframe src={src} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title="video"/></div>);
}
// ==========================================
// HOME VIEW
// ==========================================
function HomeView({data,lang,theme,goTo,setSelCat}){
  const {settings,categories,subcategories,pages,amenities,checkin}=data;
  const t=(fr,en)=>lang==="fr"?fr:en;
  const allCats=[...categories,...subcategories];
  const [showAmenities,setShowAmenities]=useState(false);

  // -- SLIDER ------------------------------
  const SLIDES=[
    "https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/9a649f48-0524-4b61-8a22-551339452624.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/dd8ce4b6-f209-4f4a-b3a7-75210beffcd2.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/8118c41b-9ddc-41e4-a5bb-fcc376265c5a.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/d5d4fbd3-efd0-47f9-8d56-b685a1666e39.png",
    "https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/48ca3363-09cf-41cf-88d8-982ef9f19d07.png",
    "https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/4e1315c5-f830-4fdf-a0bf-3bcc8c465b10.jpeg",
  ];
  const [slide,setSlide]=useState(0);
  const [fading,setFading]=useState(false);

  useEffect(()=>{
    const id=setInterval(()=>{
      setFading(true);
      setTimeout(()=>{
        setSlide(s=>(s+1)%SLIDES.length);
        setFading(false);
      },600);
    },4000);
    return()=>clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const goSlide=(i)=>{
    setFading(true);
    setTimeout(()=>{setSlide(i);setFading(false);},300);
  };

  return(
    <div>
      {/* -- HERO SLIDER -- */}
      <div style={{borderRadius:8,marginBottom:28,position:"relative",overflow:"hidden",minHeight:"clamp(300px,55vw,480px)"}}>

        {/* Background photos - crossfade */}
        {SLIDES.map((src,i)=>(
          <div key={i} style={{
            position:"absolute",inset:0,
            backgroundImage:`url(${src})`,
            backgroundSize:"cover",backgroundPosition:"center",
            transition:"opacity 0.8s ease",
            opacity:i===slide?(fading?0:1):0,
            zIndex:i===slide?1:0,
          }}/>
        ))}

        {/* Dark overlay gradient */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, rgba(10,35,66,0.25) 0%, rgba(10,35,66,0.7) 100%)",zIndex:2}}/>

        {/* Content */}
        <div style={{position:"relative",zIndex:3,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",minHeight:"clamp(300px,55vw,480px)",padding:"32px 24px"}}>
          

          <h1 style={{fontFamily:theme.hfont,color:"white",fontSize:"clamp(26px,5vw,52px)",fontWeight:700,marginBottom:6,textShadow:"0 2px 20px rgba(0,0,0,0.5)",textAlign:"center",lineHeight:1.15}}>
            {settings.propertyName}
          </h1>
          <p style={{color:"rgba(255,255,255,0.8)",fontSize:"clamp(13px,2vw,17px)",fontStyle:"italic",marginBottom:20,textAlign:"center",fontFamily:theme.hfont}}>
            {settings.tagline}
          </p>

          {/* Check-in pills */}
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
            {[`🏠 Check-in ${checkin?.checkIn||settings.checkIn||"08:00"}`,`👋 Check-out ${checkin?.checkOut||settings.checkOut||"11:00"}`].map(pill=>(
              <span key={pill} style={{background:"rgba(255,255,255,0.12)",color:"white",padding:"6px 16px",borderRadius:4,fontSize:9,backdropFilter:"blur(6px)",border:"1px solid rgba(255,255,255,0.2)",fontWeight:500,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>
                {pill}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:20}}>
            <a href={`tel:${settings.phone}`}
              style={{background:SEA.sand,color:SEA.navy,padding:"11px 22px",borderRadius:30,textDecoration:"none",fontWeight:700,fontSize:14,boxShadow:"0 6px 20px rgba(245,230,200,0.35)"}}>
              📞 {settings.phone}
            </a>
            {settings.whatsapp&&<a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
              style={{background:"#25d366",color:"white",padding:"12px 26px",borderRadius:4,textDecoration:"none",fontWeight:600,fontSize:10,letterSpacing:3,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>
              💬 WhatsApp
            </a>}
          </div>

          {/* Dot navigation */}
          <div style={{display:"flex",gap:7,justifyContent:"center"}}>
            {SLIDES.map((_,i)=>(
              <button key={i} onClick={()=>goSlide(i)}
                style={{width:i===slide?24:8,height:8,borderRadius:4,background:i===slide?"white":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",padding:0,transition:"all 0.35s ease"}}/>
            ))}
          </div>

          {/* Left / Right arrows */}
          
          
        </div>
      </div>      {/* - AMENITIES DROPDOWN MENU - */}
      {amenities?.length>0&&(
        <div style={{marginBottom:24}}>
          <button onClick={()=>setShowAmenities(!showAmenities)}
            style={{width:"100%",background:theme.card,border:`2px solid ${showAmenities?SEA.ocean:theme.border}`,borderRadius:0,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:theme.bfont,color:theme.text,boxShadow:"0 4px 16px rgba(11,35,66,0.07)",transition:"all 0.25s"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${SEA.sky}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>✨</div>
              <div style={{textAlign:"left"}}>
                <div style={{fontFamily:theme.hfont,fontWeight:700,fontSize:16,color:theme.text}}>{t("Équipements de la villa","Villa Amenities")}</div>
                <div style={{fontSize:12,color:theme.sub,marginTop:1}}>{amenities.length} {t("équipements inclus","amenities included")}</div>
              </div>
            </div>
            <div style={{fontSize:20,color:SEA.ocean,transition:"transform 0.3s",transform:showAmenities?"rotate(180deg)":"none"}}>▾</div>
          </button>

          {showAmenities&&(
            <div style={{background:theme.card,border:`1px solid ${theme.border}`,borderTop:"none",borderRadius:0,padding:"20px",boxShadow:"0 8px 24px rgba(11,35,66,0.08)",animation:"fadeUp 0.25s ease"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                {amenities.map(a=>(
                  <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,background:`${SEA.sky}10`,borderRadius:12,padding:"10px 14px",border:`1px solid ${SEA.sky}25`}}>
                    <span style={{fontSize:22,flexShrink:0}}>{a.icon}</span>
                    <span style={{fontSize:13,color:theme.text,fontWeight:500}}>{lang==="fr"?a.nameFr:a.nameEn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* - QUICK ACTIONS - */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))",gap:12,marginBottom:28}}>
        {[
          {icon:"🔑",fr:"Check-in & Codes",en:"Check-in & Codes",nav:"checkin",color:SEA.ocean,grad:"linear-gradient(135deg,#1b6ca8,#2e86c1)"},
          {icon:"🌅",fr:"Itinéraires",en:"Itineraries",nav:"itineraries",color:"#7b5ea7",grad:"linear-gradient(135deg,#7b5ea7,#9c7ec7)"},
          {icon:"🗺️",fr:"Explorer",en:"Explore",nav:"explore",color:SEA.teal,grad:"linear-gradient(135deg,#00b4d8,#0096c7)"},
          {icon:"❤️",fr:"Favoris",en:"Favorites",nav:"favorites",color:"#e53935",grad:"linear-gradient(135deg,#e53935,#ef5350)"},
          {icon:"📷",fr:"Galerie",en:"Gallery",nav:"gallery",color:"#2e7d32",grad:"linear-gradient(135deg,#2e7d32,#388e3c)"},
          {icon:"📞",fr:"Contact",en:"Contact",nav:"contact",color:SEA.gold,grad:"linear-gradient(135deg,#f0a500,#f5c518)"},
        ].map(q=>(
          <button key={q.nav} className="card-hover" onClick={()=>goTo(q.nav)}
            style={{background:theme.card,border:`1px solid ${SEA.border}`,borderRadius:0,padding:"22px 10px",cursor:"pointer",textAlign:"center",boxShadow:"0 4px 14px rgba(11,35,66,0.07)",position:"relative",overflow:"hidden"}}>
            {/* Top accent bar */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:SEA.ocean,borderRadius:0}}/>
            <div  style={{fontSize:`${settings?.quickEmojiSize||36}px`,marginBottom:10}}>{q.icon}</div>
            <div style={{fontWeight:600,fontSize:`${settings?.cardFontSize||9}px`,color:settings?.cardLabelColor||SEA.ocean,letterSpacing:`${settings?.letterSpacing||3}px`,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>{lang==="fr"?q.fr:q.en}</div>
          </button>
        ))}
      </div>

      {/* - EXPLORE - */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <h2 style={{fontFamily:theme.hfont,fontSize:22,color:theme.text}}>🗺️ {t("Explorer la région","Explore the area")}</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(138px,1fr))",gap:10,marginBottom:28}}>
        {allCats.map(cat=>(
          <button key={cat.id} className="card-hover" onClick={()=>{setSelCat(cat.id);goTo("explore");}}
            style={{background:theme.card,border:`1px solid ${SEA.border}`,borderRadius:0,padding:"18px 10px",cursor:"pointer",textAlign:"center",boxShadow:"0 3px 12px rgba(11,35,66,0.06)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:SEA.ocean,opacity:0.4}}/>
            <div  style={{fontSize:`${settings?.emojiSize||32}px`,marginBottom:7}}>{cat.icon}</div>
            <div style={{fontWeight:600,fontSize:`${settings?.cardFontSize||10}px`,color:settings?.cardLabelColor||SEA.ocean,letterSpacing:`${settings?.letterSpacing||2}px`,textTransform:"uppercase",lineHeight:1.3}}>{lang==="fr"?cat.nameFr:cat.nameEn}</div>
            <div style={{fontSize:10,color:theme.sub,marginTop:3}}>{cat.items?.length||0} {t("lieux","places")}</div>
          </button>
        ))}
      </div>

      {/* - CUSTOM PAGES - */}
      {pages?.filter(p=>p.type!=="welcome").length>0&&(
        <>
          <h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:24,color:theme.text,marginBottom:16,fontStyle:"italic",fontWeight:400}}>📋 {t("Informations pratiques","Practical Info")}</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))",gap:10}}>
            {pages.filter(p=>p.type!=="welcome").map(p=>(
              <button key={p.id} className="card-hover" onClick={()=>goTo("page_"+p.id)}
                style={{background:theme.card,border:`1px solid ${SEA.ocean}18`,borderRadius:0,padding:"18px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(11,35,66,0.06)"}}>
                <div  style={{fontSize:28,marginBottom:8}}>{p.icon}</div>
                <div style={{fontFamily:"'Montserrat',sans-serif",fontWeight:600,fontSize:10,color:theme.text,letterSpacing:3,textTransform:"uppercase"}}>{lang==="fr"?p.titleFr:p.titleEn}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// CHECK-IN VIEW
// ==========================================
function CheckinView({data,lang,theme}){
  const {settings,checkin,houseRules,faqs}=data;
  const t=(fr,en)=>lang==="fr"?fr:en;
  const [vis,setVis]=useState({});
  const [copied,setCopied]=useState({});
  const [openFaq,setOpenFaq]=useState(null);
  const copy=(text,k)=>{navigator.clipboard?.writeText(text).catch(()=>{});setCopied(p=>({...p,[k]:true}));setTimeout(()=>setCopied(p=>({...p,[k]:false})),2000);};
  const Card=({title,children})=>(
    <div style={{background:theme.card,borderRadius:22,padding:"22px",marginBottom:16,boxShadow:"0 4px 18px rgba(11,35,66,0.07)",border:`1px solid ${theme.border}`}}>
      <h2 style={{fontFamily:theme.hfont,fontSize:17,color:theme.text,marginBottom:16}}>{title}</h2>
      {children}
    </div>
  );
  const CodeRow=({icon,label,value,k})=>(
    <div style={{background:theme.bg,borderRadius:14,padding:"13px 16px",marginBottom:9,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,border:`1px solid ${theme.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>{icon}</span>
        <div>
          <div style={{fontSize:11,color:theme.sub,marginBottom:2}}>{label}</div>
          <div style={{fontWeight:700,color:theme.text,fontSize:17,fontFamily:"monospace",letterSpacing:2,transition:"all 0.3s"}}>
            {vis[k]?value:"• • • • • •"}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setVis(p=>({...p,[k]:!p[k]}))}
          style={{background:`${SEA.sky}20`,border:"none",color:SEA.ocean,padding:"6px 11px",borderRadius:8,cursor:"pointer",fontSize:14}}>👁️</button>
        <button onClick={()=>copy(value,k)}
          style={{background:copied[k]?"#2e7d32":"rgba(0,0,0,0.06)",border:"none",color:copied[k]?"white":theme.sub,padding:"6px 11px",borderRadius:8,cursor:"pointer",fontSize:14,transition:"all 0.25s"}}>
          {copied[k]?"✓":"📋"}
        </button>
      </div>
    </div>
  );
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:20,fontStyle:"italic",fontWeight:300}}>🔑 {t("Check-in & Informations","Check-in & Information")}</h1>
      {/* Times */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        {[{icon:"🏠",fr:"Check-in",en:"Check-in",val:settings.checkIn||"15:00",col:SEA.ocean,g:"linear-gradient(135deg,#1b6ca8,#2e86c1)"},{icon:"👋",fr:"Check-out",en:"Check-out",val:settings.checkOut||"11:00",col:"#e53935",g:"linear-gradient(135deg,#e53935,#ef5350)"}].map(x=>(
          <div key={x.fr} style={{background:x.g,borderRadius:0,padding:"22px",textAlign:"center",color:"white",boxShadow:`0 8px 24px rgba(0,0,0,0.18)`}}>
            <div style={{fontSize:32,marginBottom:4}}>{x.icon}</div>
            <div style={{fontSize:9,opacity:0.8,marginBottom:4,textTransform:"uppercase",letterSpacing:3,fontFamily:"'Montserrat',sans-serif"}}>{lang==="fr"?x.fr:x.en}</div>
            <div style={{fontSize:34,fontWeight:800,fontFamily:theme.hfont}}>{x.val}</div>
          </div>
        ))}
      </div>
      {/* WiFi & Codes */}
      <Card title={`📶 ${t("WiFi & Codes d'accès","WiFi & Access Codes")}`}>
        <CodeRow icon="📶" label={t("Réseau WiFi","WiFi Network")} value={checkin?.wifiName||"PtitBouchon_5G"} k="wn"/>
        <CodeRow icon="🔐" label={t("Mot de passe","Password")} value={checkin?.wifiPass||"bienvenue2024"} k="wp"/>
        {checkin?.accessCode&&<CodeRow icon="🔒" label={t("Code portail","Gate code")} value={checkin.accessCode} k="gate"/>}
        {checkin?.lockboxCode&&<CodeRow icon="🗝️" label={t("Code boîtier","Lockbox code")} value={checkin.lockboxCode} k="lock"/>}
      </Card>
      {/* Instructions */}
      {checkin?.instructions?.length>0&&(
        <Card title={`📋 ${t("Instructions d'arrivée","Arrival Instructions")}`}>
          {checkin.instructions.map((ins,i)=>(
            <div key={ins.id} style={{display:"flex",gap:14,marginBottom:16,paddingBottom:16,borderBottom:i<checkin.instructions.length-1?`1px dashed ${theme.border}`:"none"}}>
              <div style={{width:46,height:46,borderRadius:14,background:`${SEA.sky}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:`0 2px 8px ${SEA.sky}20`}}>{ins.icon}</div>
              <div><div style={{fontWeight:700,fontSize:15,color:theme.text,marginBottom:4}}>{lang==="fr"?ins.titleFr:ins.titleEn}</div><div style={{fontSize:14,color:theme.sub,lineHeight:1.65}}>{lang==="fr"?ins.textFr:ins.textEn}</div></div>
            </div>
          ))}
        </Card>
      )}
      {/* House Rules */}
      {houseRules?.length>0&&(
        <Card title={`📜 ${t("Règles de la maison","House Rules")}`}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
            {houseRules.map(r=>(
              <div key={r.id} style={{display:"flex",gap:10,background:`${SEA.sky}08`,borderRadius:14,padding:"12px 14px",border:`1px solid ${SEA.sky}20`,alignItems:"flex-start"}}>
                <span style={{fontSize:22,flexShrink:0}}>{r.icon}</span>
                <div><div style={{fontWeight:700,fontSize:13,color:theme.text}}>{lang==="fr"?r.titleFr:r.titleEn}</div><div style={{fontSize:12,color:theme.sub,marginTop:2,lineHeight:1.55}}>{lang==="fr"?r.textFr:r.textEn}</div></div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* FAQ */}
      {faqs?.length>0&&(
        <Card title="❓ FAQ">
          {faqs.map((f,i)=>(
            <div key={f.id} style={{borderBottom:i<faqs.length-1?`1px solid ${theme.border}`:"none",paddingBottom:10,marginBottom:10}}>
              <button onClick={()=>setOpenFaq(openFaq===f.id?null:f.id)}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:"5px 0"}}>
                <span style={{fontWeight:700,fontSize:14,color:theme.text}}>{lang==="fr"?f.qFr:f.qEn}</span>
                <span style={{color:SEA.ocean,fontSize:20,transition:"transform 0.25s",transform:openFaq===f.id?"rotate(180deg)":"none",flexShrink:0}}>▾</span>
              </button>
              {openFaq===f.id&&<div style={{fontSize:14,color:theme.sub,lineHeight:1.7,padding:"6px 0 2px",animation:"fadeIn 0.2s ease"}}>{lang==="fr"?f.aFr:f.aEn}</div>}
            </div>
          ))}
        </Card>
      )}
      {/* Location */}
      {settings.villaLat&&settings.villaLng&&(
        <Card title={`📍 ${t("Localisation de la villa","Villa Location")}`}>
          <div style={{marginBottom:10,fontSize:14,color:theme.sub}}>📍 {settings.address}</div>
          <a href={`https://maps.google.com/?q=${settings.villaLat},${settings.villaLng}`} target="_blank" rel="noopener noreferrer"
            style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1b6ca8",color:"white",padding:"10px 22px",borderRadius:12,textDecoration:"none",fontWeight:700,fontSize:14,boxShadow:"0 4px 14px rgba(27,108,168,0.4)"}}>
            🗺️ {t("Voir sur Google Maps","Open in Google Maps")}
          </a>
        </Card>
      )}
    </div>
  );
}

// ==========================================
// CATEGORY DETAIL VIEW (séparé pour éviter
// useState dans un if = React error #300)
// ==========================================
function CategoryDetail({cat,lang,theme,favorites,setFavorites,onBack}){
  const t=(fr,en)=>lang==="fr"?fr:en;
  const [sort,setSort]=useState("default");
  const ratings=getRatings();

  // Scroll vers le haut dès que la catégorie s'affiche
  useEffect(()=>{
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    window.scrollTo(0,0);
    // Aussi essayer de scroller le parent scrollable
    const main=document.querySelector("main");
    if(main)main.scrollTop=0;
  },[cat.id]);
  const items=[...(cat.items||[])];
  if(sort==="rating") items.sort((a,b)=>{
    const ra=ratings[a.id]?.count?ratings[a.id].total/ratings[a.id].count:0;
    const rb=ratings[b.id]?.count?ratings[b.id].total/ratings[b.id].count:0;
    return rb-ra;
  });
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:52,height:52,borderRadius:16,background:`${SEA.sky}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 4px 14px ${cat.color}30`}}>{cat.icon}</div>
          <div>
            <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(22px,3.5vw,34px)",color:SEA.ocean,margin:0,fontStyle:"italic",fontWeight:400}}>{lang==="fr"?cat.nameFr:cat.nameEn}</h1>
            <div style={{fontSize:12,color:theme.sub}}>{items.length} {t("lieu(x)","place(s)")}</div>
          </div>
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)}
          style={{background:theme.card,border:`1px solid ${theme.border}`,color:theme.text,padding:"7px 12px",borderRadius:10,fontSize:13,cursor:"pointer",outline:"none"}}>
          <option value="default">{t("Par défaut","Default")}</option>
          <option value="rating">{t("Mieux notés","Best rated")}</option>
        </select>
      </div>
      {items.length===0&&<div style={{textAlign:"center",padding:"56px 0",color:theme.sub}}>{t("Aucun lieu pour l'instant","No places yet")}</div>}
      {items.map(item=><ItemCard key={item.id} item={item} cat={cat} lang={lang} theme={theme} favorites={favorites} setFavorites={setFavorites}/>)}
    </div>
  );
}

// ==========================================
// EXPLORE VIEW
// ==========================================
function ExploreView({data,lang,theme,selCat,setSelCat,favorites,setFavorites}){
  const t=(fr,en)=>lang==="fr"?fr:en;
  const allCats=[...data.categories,...data.subcategories];
  const [tab,setTab]=useState("all");
  const cat=selCat?allCats.find(c=>c.id===selCat):null;

  if(cat){
    return <CategoryDetail cat={cat} lang={lang} theme={theme} favorites={favorites} setFavorites={setFavorites} onBack={()=>setSelCat(null)}/>;
  }

  const mainCats=data.categories||[];
  const subCats=data.subcategories||[];
  const CatGrid=({cats})=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(138px,1fr))",gap:10,marginBottom:24}}>
      {cats.map(c=>(
        <button key={c.id} className="card-hover" onClick={()=>{setSelCat(c.id);window.scrollTo(0,0);document.documentElement.scrollTop=0;}}
          style={{background:theme.card,border:`1px solid ${SEA.border}`,borderRadius:0,padding:"18px 10px",cursor:"pointer",textAlign:"center",boxShadow:"0 3px 12px rgba(11,35,66,0.06)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:c.color,opacity:0.7}}/>
          <div  style={{fontSize:32,marginBottom:7}}>{c.icon}</div>
          <div style={{fontWeight:700,fontSize:12,color:c.color}}>{lang==="fr"?c.nameFr:c.nameEn}</div>
          <div style={{fontSize:10,color:theme.sub,marginTop:3}}>{c.items?.length||0} {t("lieux","places")}</div>
        </button>
      ))}
    </div>
  );

  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:18,fontStyle:"italic",fontWeight:300}}>🗺️ {t("Explorer","Explore")}</h1>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
        {[{v:"all",fr:"Tout",en:"All"},{v:"main",fr:"Catégories",en:"Categories"},{v:"sub",fr:"Services",en:"Services"}].map(f=>(
          <button key={f.v} onClick={()=>setTab(f.v)}
            style={{padding:"7px 18px",borderRadius:24,border:`2px solid ${SEA.ocean}`,background:tab===f.v?SEA.ocean:"transparent",color:tab===f.v?"white":SEA.ocean,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all 0.22s"}}>
            {lang==="fr"?f.fr:f.en}
          </button>
        ))}
      </div>
      {(tab==="all"||tab==="main")&&<><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,color:theme.text,marginBottom:12,fontStyle:"italic",fontWeight:400}}>{t("Catégories","Categories")}</h2><CatGrid cats={mainCats}/></>}
      {(tab==="all"||tab==="sub")&&<><h2 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,color:theme.text,marginBottom:12,fontStyle:"italic",fontWeight:400}}>{t("Services utiles","Useful Services")}</h2><CatGrid cats={subCats}/></>}
    </div>
  );
}

// ==========================================
// ITINERARIES VIEW
// ==========================================
function ItinerariesView({data,lang,theme}){
  const t=(fr,en)=>lang==="fr"?fr:en;
  const [open,setOpen]=useState(null);
  const its=data.itineraries||[];
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:8,fontStyle:"italic",fontWeight:300}}>🌅 {t("Itinéraires suggérés","Suggested Itineraries")}</h1>
      <p style={{color:theme.sub,fontSize:14,marginBottom:24}}>{t("Des journées types pour découvrir le meilleur de l'Île Maurice.","Curated day trips to discover the best of Mauritius.")}</p>
      {its.length===0&&<div style={{textAlign:"center",padding:"56px 0",color:theme.sub}}>{t("Aucun itinéraire","No itineraries yet")}</div>}
      {its.map(itin=>(
        <div key={itin.id} className="card-hover" style={{background:theme.card,borderRadius:0,marginBottom:10,overflow:"hidden",boxShadow:"0 2px 10px rgba(11,35,66,0.06)",border:`1px solid ${theme.border}`,transition:"box-shadow 0.28s"}}>
          <button onClick={()=>setOpen(open===itin.id?null:itin.id)}
            style={{display:"flex",alignItems:"center",gap:16,width:"100%",background:"none",border:"none",cursor:"pointer",padding:"20px",textAlign:"left"}}>
            <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${itin.color},${itin.color}cc)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,boxShadow:`0 6px 18px ${itin.color}40`}}>{itin.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:400,fontStyle:"italic",color:SEA.ocean}}>{lang==="fr"?itin.nameFr:itin.nameEn}</div>
              <div style={{fontSize:11,color:theme.sub,marginTop:3,fontFamily:"'Montserrat',sans-serif",letterSpacing:0.5}}>{lang==="fr"?itin.descFr:itin.descEn}</div>
              <div style={{fontSize:9,color:theme.sub,marginTop:5,opacity:0.7,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>⏱ {itin.steps?.length||0} {t("étapes","steps")}</div>
            </div>
            <span style={{color:SEA.ocean,fontSize:22,transition:"transform 0.3s",transform:open===itin.id?"rotate(180deg)":"none",flexShrink:0}}>▾</span>
          </button>
          {open===itin.id&&(
            <div style={{padding:"4px 20px 24px",borderTop:`1px solid ${theme.border}`}}>
              <div style={{position:"relative",paddingLeft:24,marginTop:12}}>
                <div style={{position:"absolute",left:20,top:0,bottom:0,width:2,background:`linear-gradient(to bottom,${itin.color},${itin.color}20)`}}/>
                {itin.steps?.map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:14,marginBottom:16,position:"relative"}}>
                    <div style={{width:46,minHeight:46,borderRadius:12,background:itin.color,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,color:"white",fontWeight:800,zIndex:1,boxShadow:`0 4px 12px ${itin.color}50`,padding:4,fontSize:10,lineHeight:1.2,textAlign:"center"}}>
                      {lang==="fr"?step.timeFr:step.timeEn}
                    </div>
                    <div style={{paddingTop:10,paddingBottom:4,borderBottom:i<itin.steps.length-1?`1px dashed ${theme.border}`:"none",flex:1}}>
                      <div style={{fontSize:14,color:theme.text,lineHeight:1.65}}>{lang==="fr"?step.textFr:step.textEn}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// GALLERY VIEW - masonry
// ==========================================
function GalleryView({gallery,theme,t}){
  const [idx,setIdx]=useState(null);
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:20,fontStyle:"italic",fontWeight:300}}>📷 {t("Galerie Photos","Photo Gallery")}</h1>
      {gallery.length===0&&<div style={{textAlign:"center",padding:"56px 0",color:theme.sub}}><div style={{fontSize:64,marginBottom:16}}>📷</div>{t("Aucune photo pour l'instant","No photos yet")}</div>}
      <div style={{columns:"2 155px",gap:10}}>
        {gallery.map((img,i)=>(
          <div key={i} onClick={()=>setIdx(i)}
            style={{borderRadius:0,overflow:"hidden",cursor:"pointer",marginBottom:8,breakInside:"avoid",boxShadow:"0 3px 14px rgba(11,35,66,0.1)",transition:"transform 0.22s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <img src={img.url} alt={img.caption||""} style={{width:"100%",display:"block"}} onError={e=>e.target.style.display="none"}/>
          </div>
        ))}
      </div>
      {idx!==null&&(
        <div onClick={()=>setIdx(null)} style={{position:"fixed",inset:0,background:"rgba(10,35,66,0.96)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <img src={gallery[idx]?.url} alt="" style={{maxWidth:"100%",maxHeight:"88vh",borderRadius:14,objectFit:"contain"}} onClick={e=>e.stopPropagation()}/>
          <div style={{position:"absolute",top:16,right:16,display:"flex",gap:8}}>
            {idx>0&&<button onClick={e=>{e.stopPropagation();setIdx(idx-1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",width:46,height:46,borderRadius:23,cursor:"pointer",fontSize:24,backdropFilter:"blur(4px)"}}>‹</button>}
            {idx<gallery.length-1&&<button onClick={e=>{e.stopPropagation();setIdx(idx+1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",width:46,height:46,borderRadius:23,cursor:"pointer",fontSize:24,backdropFilter:"blur(4px)"}}>›</button>}
            <button onClick={()=>setIdx(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",width:46,height:46,borderRadius:23,cursor:"pointer",fontSize:22,backdropFilter:"blur(4px)"}}>✕</button>
          </div>
          {gallery[idx]?.caption&&<div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"white",background:"rgba(0,0,0,0.7)",padding:"8px 20px",borderRadius:24,fontSize:13,backdropFilter:"blur(4px)"}}>{gallery[idx].caption}</div>}
        </div>
      )}
    </div>
  );
}

function FavoritesView({data,lang,theme,favorites,setFavorites}){
  const t=(fr,en)=>lang==="fr"?fr:en;
  const allCats=[...data.categories,...data.subcategories];
  const favItems=allCats.flatMap(cat=>(cat.items||[]).filter(i=>favorites.includes(i.id)).map(i=>({...i,_cat:cat})));
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:8,fontStyle:"italic",fontWeight:300}}>❤️ {t("Mes Favoris","My Favorites")}</h1>
      <p style={{color:theme.sub,fontSize:14,marginBottom:22}}>{t("Cliquez sur ❤️ sur n'importe quel lieu pour le sauvegarder ici.","Click ❤️ on any place to save it here.")}</p>
      {favItems.length===0&&(<div style={{textAlign:"center",padding:"56px 24px"}}><div style={{fontSize:72,marginBottom:16}}>🤍</div><div style={{color:theme.sub,fontSize:15}}>{t("Explorez et cliquez ❤️ !","Explore and click ❤️!")}</div></div>)}
      {favItems.map(item=><ItemCard key={item.id} item={item} cat={item._cat} lang={lang} theme={theme} favorites={favorites} setFavorites={setFavorites}/>)}
    </div>
  );
}

function ContactView({data,lang,theme}){
  const t=(fr,en)=>lang==="fr"?fr:en;
  const {settings}=data;
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:20,fontStyle:"italic",fontWeight:300}}>📞 Contact</h1>
      <div style={{background:theme.card,borderRadius:24,padding:"24px 20px",boxShadow:"0 4px 20px rgba(11,35,66,0.08)",border:`1px solid ${theme.border}`}}>
        {[
          {icon:"📞",label:t("Téléphone","Phone"),val:settings.phone,href:`tel:${settings.phone}`},
          {icon:"✉️",label:"Email",val:settings.email,href:`mailto:${settings.email}`},
          settings.whatsapp&&{icon:"💬",label:"WhatsApp",val:settings.whatsapp,href:`https://wa.me/${settings.whatsapp.replace(/\D/g,"")}`},
          settings.website&&{icon:"🌐",label:t("Site web","Website"),val:settings.website,href:`https://${settings.website}`},
          settings.instagram&&{icon:"📸",label:"Instagram",val:settings.instagram,href:`https://instagram.com/${settings.instagram.replace("@","")}`},
          {icon:"📍",label:t("Adresse","Address"),val:"Public Beach Road, Plaine Magnien, Grand Port, Mauritius 52404",href:`https://maps.google.com/?q=${settings.villaLat},${settings.villaLng}`},
        ].filter(Boolean).map(c=>(
          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
            style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",background:`${SEA.sky}08`,borderRadius:0,textDecoration:"none",color:theme.text,border:`1px solid ${SEA.sky}25`,marginBottom:10,transition:"all 0.22s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=SEA.ocean;e.currentTarget.style.background=`${SEA.sky}18`;e.currentTarget.style.transform="translateX(4px)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=`${SEA.sky}25`;e.currentTarget.style.background=`${SEA.sky}08`;e.currentTarget.style.transform="none";}}>
            <span style={{fontSize:26}}>{c.icon}</span>
            <div><div style={{fontSize:11,color:theme.sub,marginBottom:2}}>{c.label}</div><div style={{fontWeight:600,color:SEA.ocean,fontSize:15}}>{c.val}</div></div>
            <span style={{marginLeft:"auto",color:SEA.sky,fontSize:18}}>›</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function PageView({pages,pageId,lang,theme,goTo}){
  const page=pages?.find(p=>p.id===pageId);
  if(!page)return null;
  const t=(fr,en)=>lang==="fr"?fr:en;
  const aMap={left:"flex-start",center:"center",right:"flex-end"};
  return(
    <div>
      <button onClick={()=>goTo("home")} style={{background:"transparent",border:`2px solid ${SEA.ocean}`,color:SEA.ocean,padding:"7px 18px",borderRadius:24,cursor:"pointer",fontSize:13,marginBottom:20,display:"inline-flex",alignItems:"center",gap:6,fontWeight:600}}>← {t("Accueil","Home")}</button>
      <div style={{background:theme.card,borderRadius:24,overflow:"hidden",boxShadow:"0 4px 24px rgba(11,35,66,0.09)",border:`1px solid ${theme.border}`}}>
        {page.image&&<img src={page.image} alt="" style={{width:"100%",height:280,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}
        {page.video&&<VideoEmbed url={page.video}/>}
        <div style={{padding:"30px 24px",display:"flex",flexDirection:"column",alignItems:aMap[page.align]||"flex-start",minHeight:150}}>
          <h1 style={{fontFamily:theme.hfont,fontSize:"clamp(20px,4vw,34px)",color:theme.text,marginBottom:16,textAlign:page.align||"left"}}>{page.icon} {lang==="fr"?page.titleFr:page.titleEn}</h1>
          <div style={{fontSize:15,lineHeight:1.9,color:theme.text,opacity:0.82,textAlign:page.align||"left",maxWidth:660,whiteSpace:"pre-wrap",fontFamily:theme.bfont}}>{lang==="fr"?page.contentFr:page.contentEn}</div>
        </div>
      </div>
    </div>
  );
}
// ==========================================
// VIDEOS VIEW
// ==========================================
function VideosView({data,lang,theme,t}){
  const videos=data.videos||[];
  const parseEmbed=(url)=>{
    if(!url)return null;
    const yt=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if(yt)return`https://www.youtube.com/embed/${yt[1]}?rel=0`;
    const vm=url.match(/vimeo\.com\/(\d+)/);
    if(vm)return`https://player.vimeo.com/video/${vm[1]}`;
    // Instagram reels - not embeddable directly, open in new tab
    return null;
  };
  return(
    <div>
      <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:theme.text,marginBottom:8,fontStyle:"italic",fontWeight:300}}>🎬 {t("Vidéos","Videos")}</h1>
      <p style={{color:theme.sub,fontSize:14,marginBottom:24}}>{t("Découvrez la villa et l'Île Maurice en vidéo","Discover the villa and Mauritius in video")}</p>
      {videos.length===0&&(
        <div style={{textAlign:"center",padding:"56px 0",color:theme.sub}}>
          <div style={{fontSize:64,marginBottom:16}}>🎬</div>
          <div>{t("Aucune vidéo pour l'instant","No videos yet")}</div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:20}}>
        {videos.map(v=>{
          const embed=parseEmbed(v.url);
          const title=lang==="fr"?v.titleFr:v.titleEn;
          return(
            <div key={v.id} style={{background:theme.card,borderRadius:20,overflow:"hidden",boxShadow:"0 4px 18px rgba(11,35,66,0.08)",border:`1px solid ${theme.border}`}}>
              {embed?(
                <div style={{position:"relative",paddingBottom:"56.25%",height:0}}>
                  <iframe src={embed} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title={title}/>
                </div>
              ):v.url?(
                <div style={{background:SEA.navy,padding:"32px",textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎬</div>
                  <a href={v.url} target="_blank" rel="noopener noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:8,background:SEA.ocean,color:"white",padding:"12px 24px",borderRadius:12,textDecoration:"none",fontWeight:700,fontSize:14}}>
                    ▶ {t("Voir sur Instagram / YouTube","Watch on Instagram / YouTube")}
                  </a>
                </div>
              ):null}
              {title&&(
                <div style={{padding:"14px 18px"}}>
                  <div style={{fontFamily:theme.hfont,fontSize:16,fontWeight:700,color:theme.text}}>{title}</div>
                  {v.desc&&<div style={{fontSize:13,color:theme.sub,marginTop:4}}>{lang==="fr"?v.descFr:v.descEn}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MAIN GUEST APP SHELL
// ==========================================
function GuestApp({data,lang,setLang,setMode,theme,darkMode,setDarkMode,showAdminLogin,setShowAdminLogin,adminPass,setAdminPass,handleAdminLogin}){
  const {settings}=data;
  const [nav,setNav]=useState("home");
  const [menuOpen,setMenuOpen]=useState(false);
  const [search,setSearch]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [favorites,setFavorites]=useState(()=>getFavorites());
  const [selCat,setSelCat]=useState(null);
  const t=(fr,en)=>lang==="fr"?fr:en;
  const allCats=[...(data.categories||[]),...(data.subcategories||[])];
  const scrollTop=()=>{
    window.scrollTo(0,0);
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
    setTimeout(()=>{window.scrollTo(0,0);document.documentElement.scrollTop=0;},50);
  };
  const goTo=(section)=>{
    setNav(section);
    setMenuOpen(false);
    setShowSearch(false);
    setSearch("");
    scrollTop();
  };;

  const searchResults=search.length>=2?allCats.flatMap(cat=>
    (cat.items||[]).filter(item=>(item.nameFr+item.nameEn+item.descFr+item.descEn+item.address).toLowerCase().includes(search.toLowerCase())
    ).map(item=>({...item,_cat:cat}))
  ):[];

  const hbg=bgStyle(settings.headerBgType,settings.headerBg,settings.headerBgImage);
  const fbg=bgStyle(settings.footerBgType,settings.footerBg,settings.footerBgImage);
  const activeAlerts=data.alerts?.filter(a=>a.active)||[];

  const navItems=[
    {id:"home",icon:"🏡",fr:"Accueil",en:"Home"},
    {id:"checkin",icon:"🔑",fr:"Check-in",en:"Check-in"},
    {id:"explore",icon:"🗺️",fr:"Explorer",en:"Explore"},
    {id:"itineraries",icon:"🌅",fr:"Itinéraires",en:"Itineraries"},
    {id:"videos",icon:"🎬",fr:"Vidéos",en:"Videos"},
    {id:"gallery",icon:"📷",fr:"Galerie",en:"Gallery"},
    {id:"favorites",icon:"❤️",fr:"Favoris",en:"Favorites"},
    {id:"contact",icon:"📞",fr:"Contact",en:"Contact"},
  ];

  return(
    <div style={{minHeight:"100vh",background:theme.bg,fontFamily:theme.bfont,color:theme.text,display:"flex",flexDirection:"column"}}>
      <style>{GLOBAL_CSS}</style>

      {/* -- HEADER -- */}
      <header style={{...hbg,color:theme.htx,padding:"0 12px",display:"flex",alignItems:"center",justifyContent:"space-between",minHeight:56,position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 30px rgba(10,35,66,0.35)",backdropFilter:"blur(12px)"}}>
        {settings.headerBgType==="image"&&settings.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(10,35,66,0.5)"}}/>}
        {/* Logo */}
        <button onClick={()=>goTo("home")} style={{background:"none",border:"none",display:"flex",alignItems:"center",gap:8,cursor:"pointer",position:"relative",zIndex:1,padding:"4px 0",flexShrink:0}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${SEA.sky}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,backdropFilter:"blur(4px)"}}>🏡</div>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:"clamp(12px,2vw,17px)",fontWeight:400,color:SEA.sand,lineHeight:1.1,fontStyle:"italic"}}>{settings.propertyName}</div>
            <div style={{fontSize:7,opacity:0.55,letterSpacing:3,textTransform:"uppercase",color:SEA.sky,fontFamily:"'Montserrat',sans-serif"}}>Guide</div>
          </div>
        </button>
        {/* Desktop nav — scrollable so it never wraps */}
        <nav className="desk-nav" style={{display:"flex",gap:0,overflowX:"auto",flex:1,margin:"0 8px",scrollbarWidth:"none"}}>
          <style>{`.desk-nav::-webkit-scrollbar{display:none}`}</style>
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>goTo(n.id)}
              style={{background:"transparent",border:"none",borderBottom:`2px solid ${nav===n.id?SEA.sky:"transparent"}`,color:SEA.sand,padding:"0 9px",height:56,cursor:"pointer",fontFamily:"'Montserrat',sans-serif",fontSize:8,letterSpacing:2,textTransform:"uppercase",transition:"all 0.22s",whiteSpace:"nowrap",fontWeight:nav===n.id?600:400,opacity:nav===n.id?1:0.55,flexShrink:0}}>
              {lang==="fr"?n.fr:n.en}
            </button>
          ))}
        </nav>
        {/* Icon buttons */}
        <div style={{display:"flex",gap:3,alignItems:"center",position:"relative",zIndex:1,flexShrink:0}}>
          {[
            {icon:"🔍",fn:()=>setShowSearch(!showSearch)},
            {icon:darkMode?"☀️":"🌙",fn:()=>setDarkMode(!darkMode)},
            {icon:lang==="fr"?"🇬🇧":"🇫🇷",fn:()=>setLang(lang==="fr"?"en":"fr")},
          ].map((b,i)=>(
            <button key={i} onClick={b.fn}
              style={{background:`${SEA.sky}18`,border:"1px solid rgba(255,255,255,0.1)",color:SEA.sand,width:32,height:32,borderRadius:6,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.background=`${SEA.sky}35`}
              onMouseLeave={e=>e.currentTarget.style.background=`${SEA.sky}18`}>
              {b.icon}
            </button>
          ))}
          <button className="mob-only" onClick={()=>setMenuOpen(!menuOpen)}
            style={{background:`${SEA.sky}18`,border:"1px solid rgba(255,255,255,0.1)",color:SEA.sand,width:32,height:32,borderRadius:6,cursor:"pointer",fontSize:18,display:"none",alignItems:"center",justifyContent:"center"}}>
            {menuOpen?"✕":"☰"}
          </button>
        </div>
      </header>

      {/* -- MOBILE MENU -- */}
      {menuOpen&&(
        <div style={{...hbg,padding:"10px 14px 16px",borderBottom:`2px solid ${SEA.sky}40`,zIndex:199,position:"relative"}}>
          {settings.headerBgType==="image"&&settings.headerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(10,35,66,0.65)"}}/>}
          <div style={{position:"relative",zIndex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {navItems.map(n=>(
              <button key={n.id} onClick={()=>goTo(n.id)}
                style={{background:nav===n.id?SEA.ocean:`${SEA.sky}18`,border:"none",color:"white",padding:"12px 12px",borderRadius:12,cursor:"pointer",fontFamily:theme.bfont,fontSize:13,textAlign:"left",fontWeight:nav===n.id?700:400}}>
                {n.icon} {lang==="fr"?n.fr:n.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* -- SEARCH -- */}
      {showSearch&&(
        <div style={{background:theme.card,borderBottom:`1px solid ${theme.border}`,padding:"12px 18px",position:"sticky",top:66,zIndex:150,boxShadow:"0 4px 20px rgba(11,35,66,0.1)"}}>
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
            placeholder={t("Rechercher restaurant, plage, activité…","Search restaurant, beach, activity…")}
            style={{width:"100%",padding:"11px 20px",borderRadius:30,border:`2px solid ${SEA.ocean}`,background:theme.bg,color:theme.text,fontSize:15,outline:"none",fontFamily:theme.bfont,boxShadow:`0 3px 14px ${SEA.ocean}20`}}/>
          {searchResults.length>0&&(
            <div style={{marginTop:8,maxHeight:280,overflowY:"auto",display:"flex",flexDirection:"column",gap:5}}>
              {searchResults.map(item=>(
                <button key={item.id} onClick={()=>{setSelCat(item._cat.id);goTo("explore");}}
                  style={{display:"flex",alignItems:"center",gap:12,background:theme.bg,border:`1px solid ${theme.border}`,borderRadius:14,padding:"10px 14px",cursor:"pointer",textAlign:"left",width:"100%",transition:"border-color 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=SEA.ocean}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=theme.border}>
                  <span style={{fontSize:26}}>{item._cat.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:theme.text}}>{lang==="fr"?item.nameFr:item.nameEn}</div>
                    <div style={{fontSize:11,color:theme.sub}}>{lang==="fr"?item._cat.nameFr:item._cat.nameEn} · {item.address}</div>
                  </div>
                  {item.distance&&<span style={{background:`${SEA.sky}20`,color:SEA.ocean,padding:"3px 10px",borderRadius:20,fontSize:9,fontWeight:600,letterSpacing:1,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif"}}>📍 {item.distance}</span>}
                </button>
              ))}
            </div>
          )}
          {search.length>=2&&searchResults.length===0&&<div style={{textAlign:"center",padding:"14px 0",color:theme.sub,fontSize:14}}>{t("Aucun résultat","No results")}</div>}
        </div>
      )}

      {/* -- ALERTS -- */}
      {activeAlerts.map(alert=>(
        <div key={alert.id} style={{background:alert.type==="warning"?"#ff9800":alert.type==="danger"?"#e53935":SEA.ocean,color:"white",padding:"11px 22px",textAlign:"center",fontSize:13,fontWeight:600}}>
          {alert.icon||"📢"} {lang==="fr"?alert.textFr:alert.textEn}
        </div>
      ))}

      {/* -- MAIN -- */}
      <main style={{flex:1,maxWidth:940,width:"100%",margin:"0 auto",padding:"24px 16px 90px"}} className="fadeUp">
        {/* -- BOUTON RETOUR HAUT -- */}
        {nav!=="home"&&(
          <button onClick={()=>goTo("home")}
            style={{display:"inline-flex",alignItems:"center",gap:8,background:theme.card,border:`1px solid ${theme.border}`,color:SEA.ocean,padding:"8px 20px",borderRadius:4,cursor:"pointer",fontSize:9,fontWeight:600,marginBottom:20,letterSpacing:3,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif",boxShadow:"0 2px 10px rgba(11,35,66,0.07)",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=SEA.ocean;e.currentTarget.style.color="white";e.currentTarget.style.borderColor=SEA.ocean;}}
            onMouseLeave={e=>{e.currentTarget.style.background=theme.card;e.currentTarget.style.color=SEA.ocean;e.currentTarget.style.borderColor=theme.border;}}>
            ← {t("Accueil","Home")}
          </button>
        )}
        {nav==="home"&&<HomeView data={data} lang={lang} theme={theme} goTo={goTo} setSelCat={setSelCat}/>}
        {nav==="checkin"&&<CheckinView data={data} lang={lang} theme={theme}/>}
        {nav==="explore"&&<ExploreView data={data} lang={lang} theme={theme} selCat={selCat} setSelCat={setSelCat} favorites={favorites} setFavorites={setFavorites}/>}
        {nav==="itineraries"&&<ItinerariesView data={data} lang={lang} theme={theme}/>}
        {nav==="videos"&&<VideosView data={data} lang={lang} theme={theme} t={t}/>}
        {nav==="gallery"&&<GalleryView gallery={data.gallery||[]} theme={theme} t={t}/>}
        {nav==="favorites"&&<FavoritesView data={data} lang={lang} theme={theme} favorites={favorites} setFavorites={setFavorites}/>}
        {nav==="contact"&&<ContactView data={data} lang={lang} theme={theme}/>}
        {nav.startsWith("page_")&&<PageView pages={data.pages} pageId={nav.replace("page_","")} lang={lang} theme={theme} goTo={goTo}/>}
        {/* -- BOUTON RETOUR BAS -- */}
        {nav!=="home"&&(
          <div style={{marginTop:32,paddingTop:20,borderTop:`1px solid ${theme.border}`,display:"flex",justifyContent:"center"}}>
            <button onClick={()=>{goTo("home");}}
              style={{display:"inline-flex",alignItems:"center",gap:8,background:SEA.ocean,border:"none",color:"white",padding:"13px 32px",borderRadius:4,cursor:"pointer",fontSize:10,fontWeight:600,letterSpacing:4,textTransform:"uppercase",fontFamily:"'Montserrat',sans-serif",boxShadow:`0 4px 18px ${SEA.ocean}40`,transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${SEA.ocean}50`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=`0 4px 18px ${SEA.ocean}40`;}}>
              ↑ {t("Retour à l'accueil","Back to Home")}
            </button>
          </div>
        )}
      </main>

      {/* -- BOTTOM NAV (mobile) -- */}
      <nav className="bot-nav" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:darkMode?"rgba(10,35,66,0.97)":"rgba(255,255,255,0.97)",borderTop:`1px solid ${theme.border}`,padding:"6px 0 env(safe-area-inset-bottom,8px)",zIndex:180,boxShadow:"0 -4px 24px rgba(11,35,66,0.14)",backdropFilter:"blur(14px)"}}>
        <div style={{display:"flex",justifyContent:"space-around",maxWidth:520,margin:"0 auto"}}>
          {navItems.slice(0,5).map(n=>(
            <button key={n.id} onClick={()=>goTo(n.id)}
              style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 6px",color:nav===n.id?SEA.ocean:theme.sub,transition:"color 0.2s",minWidth:44}}>
              <span style={{fontSize:22}}>{n.icon}</span>
              <span style={{fontSize:8,fontWeight:nav===n.id?600:400,letterSpacing:1,textTransform:"uppercase"}}>{lang==="fr"?n.fr:n.en}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* -- FOOTER -- */}
      <footer style={{...fbg,color:SEA.sand,padding:"24px 18px",textAlign:"center",position:"relative"}}>
        {settings.footerBgType==="image"&&settings.footerBgImage&&<div style={{position:"absolute",inset:0,background:"rgba(10,35,66,0.6)"}}/>}
        <div style={{position:"relative",zIndex:1}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:SEA.sand,marginBottom:4,fontStyle:"italic",fontWeight:300,letterSpacing:2}}>{settings.propertyName}</div>
          <div style={{fontSize:11,opacity:0.4,marginBottom:4}}>Public Beach Road, Plaine Magnien, Grand Port, Mauritius 52404</div>
          <div style={{fontSize:11,opacity:0.4,marginBottom:10}}>{settings.phone} · {settings.email}</div>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:14}}>
            {settings.whatsapp&&<a href={`https://wa.me/${settings.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" style={{color:"rgba(255,255,255,0.45)",textDecoration:"none",fontSize:12}}>💬 WhatsApp</a>}
            {settings.instagram&&<a href={`https://instagram.com/${settings.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{color:"rgba(255,255,255,0.45)",textDecoration:"none",fontSize:12}}>📸 {settings.instagram}</a>}
          </div>
          <button onClick={()=>setShowAdminLogin(!showAdminLogin)}
            style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.22)",padding:"3px 14px",borderRadius:20,cursor:"pointer",fontSize:10}}>
            ⚙️ Admin
          </button>
          {showAdminLogin&&(
            <div style={{marginTop:10,display:"flex",gap:8,justifyContent:"center",alignItems:"center"}}>
              <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAdminLogin()}
                placeholder={t("Mot de passe","Password")}
                style={{padding:"6px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",color:"white",fontSize:13,outline:"none",width:145}}/>
              <button onClick={handleAdminLogin}
                style={{background:SEA.sand,border:"none",color:SEA.navy,padding:"6px 14px",borderRadius:8,cursor:"pointer",fontWeight:700}}>OK</button>
              <button onClick={()=>setShowAdminLogin(false)}
                style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:18}}>✕</button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
// ======================= ADMIN PANEL =======================
const AS=({title,children})=>(<div style={{background:"#162018",border:"1px solid #243428",borderRadius:16,padding:"20px",marginBottom:18}}><h3 style={{color:"var(--acc)",marginBottom:14,fontSize:15}}>{title}</h3>{children}</div>);
const IB=({onClick,children,accent,danger,disabled,title})=>(<button onClick={onClick} disabled={disabled} title={title} style={{background:danger?"#4a1515":accent?"#1a3020":"#192b1e",border:`1px solid ${danger?"#7a2020":accent?"var(--acc)":"#2e4a34"}`,color:danger?"#ff8080":accent?"var(--acc)":"#6a9a6a",padding:"5px 10px",borderRadius:7,cursor:disabled?"not-allowed":"pointer",fontSize:12,opacity:disabled?0.4:1,whiteSpace:"nowrap",transition:"all 0.2s"}}>{children}</button>);

function AdminPanel({data,updateData,setMode,adminTab,setAdminTab,saveStatus,handleSave,lastSaved}){
  const {settings}=data;
  const tabs=[
    {id:"settings",icon:"🎨",label:"Apparence"},
    {id:"contact",icon:"📞",label:"Contact"},
    {id:"checkin",icon:"🔑",label:"Check-in"},
    {id:"rules",icon:"📜",label:"Règles & FAQ"},
    {id:"amenities",icon:"✨",label:"Équipements"},
    {id:"alerts",icon:"📢",label:"Alertes"},
    {id:"pages",icon:"📄",label:"Pages"},
    {id:"itineraries",icon:"🌅",label:"Itinéraires"},
    {id:"videos",icon:"🎬",label:"Vidéos"},
    {id:"categories",icon:"🗂️",label:"Catégories"},
    {id:"subcategories",icon:"📌",label:"Sous-catégories"},
    {id:"gallery",icon:"🖼️",label:"Galerie"},
    {id:"analytics",icon:"📊",label:"Statistiques"},
    {id:"backup",icon:"💾",label:"Sauvegarde"},
  ];
  const sb={saved:{bg:"#1e3a28",bc:"#2e6040",col:"#5dab5d",l:"✓ Sauvegardé"},saving:{bg:"#243020",bc:"var(--acc)",col:"var(--acc)",l:"⏳ Sauvegarde…"},unsaved:{bg:"var(--acc)",bc:"var(--acc)",col:"#1a1a1a",l:"💾 Sauvegarder"}}[saveStatus]||{bg:"#1e3a28",bc:"#2e6040",col:"#5dab5d",l:"✓"};
  return(
    <div style={{"--acc":settings.accentColor,"--hfont":`'${settings.fontFamily}',Georgia,serif`,"--bfont":`'${settings.bodyFont}',sans-serif`,minHeight:"100vh",background:"#0d1a10",color:"#dde8dd",fontFamily:"'Montserrat',sans-serif"}}>
      <style>{`*{box-sizing:border-box} input,textarea,select{background:#192b1e;color:#dde8dd;border:1px solid #2e4a34;border-radius:8px;padding:8px 12px;width:100%;font-size:14px;outline:none;font-family:inherit;transition:border-color 0.2s} input:focus,textarea:focus,select:focus{border-color:var(--acc)} label{font-size:11px;color:#7a9e7a;display:block;margin-bottom:3px;margin-top:10px;text-transform:uppercase;letter-spacing:0.5px} @keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
      {/* TOPBAR */}
      <div style={{background:"#162018",padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #243428",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>⚙️</span>
          <span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",color:"var(--acc)",fontSize:19,fontWeight:700}}>Admin Backend</span>
          <span style={{fontSize:11,color:"#5a7a5a",background:"#192b1e",padding:"2px 10px",borderRadius:20}}>{settings.propertyName}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {saveStatus==="saved"&&<span style={{fontSize:11,color:"#4a7a4a"}}>✓ {lastSaved.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>}
          <button onClick={handleSave} style={{background:sb.bg,border:`1px solid ${sb.bc}`,color:sb.col,padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,minWidth:148,transition:"all 0.3s"}}>{sb.l}</button>
          <button onClick={()=>setMode("preview")} style={{background:"#243020",border:"1px solid #3a5040",color:"#7ab87a",padding:"7px 12px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12}}>👁️ Aperçu</button>
          <button onClick={()=>setMode("guest")} style={{background:"#1e2d23",border:"1px solid #3a5040",color:"#a0c0a0",padding:"7px 12px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:12}}>🌐 Guide</button>
        </div>
      </div>
      <div style={{display:"flex",minHeight:"calc(100vh - 54px)"}}>
        {/* SIDEBAR */}
        <div style={{width:188,background:"#0f1a12",padding:"12px 8px",flexShrink:0,borderRight:"1px solid #1a2c1e",overflowY:"auto"}}>
          {tabs.map(tb=>(
            <button key={tb.id} onClick={()=>setAdminTab(tb.id)}
              style={{display:"flex",alignItems:"center",gap:9,width:"100%",background:adminTab===tb.id?"var(--acc)":"transparent",border:"none",color:adminTab===tb.id?"#1a1a1a":"#6a9a6a",padding:"9px 10px",borderRadius:9,cursor:"pointer",fontSize:12,marginBottom:2,textAlign:"left",fontWeight:adminTab===tb.id?700:400,transition:"all 0.2s"}}>
              {tb.icon} {tb.label}
            </button>
          ))}
          <div style={{marginTop:20,padding:"10px",background:"#192b1e",borderRadius:9,fontSize:11,color:"#4a6a4a",lineHeight:1.6}}>
            <div style={{fontWeight:700,color:"#6a9a6a",marginBottom:3}}>🔐 Mot de passe</div>
            <div>Défaut: <strong style={{color:"var(--acc)"}}>admin123</strong></div>
          </div>
        </div>
        {/* CONTENT */}
        <div style={{flex:1,padding:"22px",overflowY:"auto"}}>
          {adminTab==="settings"&&<ASettings data={data} updateData={updateData}/>}
          {adminTab==="contact"&&<AContact data={data} updateData={updateData}/>}
          {adminTab==="checkin"&&<ACheckin data={data} updateData={updateData}/>}
          {adminTab==="rules"&&<ARules data={data} updateData={updateData}/>}
          {adminTab==="amenities"&&<AAmenities data={data} updateData={updateData}/>}
          {adminTab==="alerts"&&<AAlerts data={data} updateData={updateData}/>}
          {adminTab==="pages"&&<APages data={data} updateData={updateData}/>}
          {adminTab==="itineraries"&&<AItineraries data={data} updateData={updateData}/>}
          {adminTab==="videos"&&<AVideos data={data} updateData={updateData}/>}
          {adminTab==="categories"&&<ACats data={data} updateData={updateData} field="categories" title="Catégories"/>}
          {adminTab==="subcategories"&&<ACats data={data} updateData={updateData} field="subcategories" title="Sous-catégories"/>}
          {adminTab==="gallery"&&<AGallery data={data} updateData={updateData}/>}
          {adminTab==="analytics"&&<AAnalytics data={data}/>}
          {adminTab==="backup"&&<ABackup data={data} updateData={updateData}/>}
        </div>
      </div>
    </div>
  );
}

function BgPicker({label,tK,cK,iK,settings,updateData}){
  const type=settings[tK]||"color";
  const set=(k,v)=>updateData(d=>{d.settings[k]=v;});
  return(
    <div style={{marginBottom:14}}>
      <label style={{fontWeight:700,color:"#9ab89a",fontSize:12,marginBottom:6,display:"block"}}>{label}</label>
      <div style={{display:"flex",gap:5,marginBottom:7}}>
        {["color","image"].map(v=>(<button key={v} onClick={()=>set(tK,v)} style={{flex:1,background:type===v?"var(--acc)":"#192b1e",border:"none",color:type===v?"#1a1a1a":"#7a9e7a",padding:"6px 8px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:type===v?700:400}}>{v==="color"?"🎨 Couleur":"🖼️ Photo"}</button>))}
      </div>
      {type==="color"?(<div style={{display:"flex",gap:7,alignItems:"center"}}><input type="color" value={settings[cK]||"#000"} onChange={e=>set(cK,e.target.value)} style={{width:44,height:34,padding:2,cursor:"pointer",flexShrink:0}}/><input value={settings[cK]||""} onChange={e=>set(cK,e.target.value)} style={{flex:1}}/></div>):(<div><input value={settings[iK]||""} onChange={e=>set(iK,e.target.value)} placeholder="URL de l'image…"/>{settings[iK]&&<img src={settings[iK]} alt="" style={{width:"100%",maxHeight:80,objectFit:"cover",borderRadius:8,marginTop:6}} onError={e=>e.target.style.display="none"}/>}</div>)}
    </div>
  );
}

function ASettings({data,updateData}){
  const s=data.settings;
  const set=(k,v)=>updateData(d=>{d.settings[k]=v;});

  const ColorRow=({label,k})=>(
    <div key={k}>
      <label>{label}</label>
      <div style={{display:"flex",gap:7,alignItems:"center"}}>
        <input type="color" value={s[k]||"#000000"} onChange={e=>set(k,e.target.value)} style={{width:44,height:34,padding:2,cursor:"pointer",flexShrink:0,border:"none",background:"none"}}/>
        <input value={s[k]||""} onChange={e=>set(k,e.target.value)} style={{flex:1,fontFamily:"monospace"}}/>
      </div>
    </div>
  );

  return(<div style={{maxWidth:740}}>

    {/* HEADER / FOOTER */}
    <AS title="🎨 Header & Footer">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
        <BgPicker label="Fond du header" tK="headerBgType" cK="headerBg" iK="headerBgImage" settings={s} updateData={updateData}/>
        <BgPicker label="Fond du footer" tK="footerBgType" cK="footerBg" iK="footerBgImage" settings={s} updateData={updateData}/>
        <BgPicker label="Fond général" tK="bodyBgType" cK="bodyBg" iK="bodyBgImage" settings={s} updateData={updateData}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10,marginTop:14}}>
        <ColorRow label="Couleur texte header" k="headerText"/>
        <ColorRow label="Couleur texte footer" k="footerText"/>
      </div>
    </AS>

    {/* COULEURS */}
    <AS title="🖍️ Couleurs de l'interface">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
        <ColorRow label="Couleur accent (boutons, liens)" k="accentColor"/>
        <ColorRow label="Couleur des bordures des cartes" k="cardBorderColor"/>
        <ColorRow label="Couleur du texte des cartes" k="cardLabelColor"/>
        <ColorRow label="Texte général" k="bodyText"/>
        <ColorRow label="Fond des cartes" k="cardBg"/>
        <ColorRow label="Fond général de la page" k="bodyBg"/>
      </div>
      {/* Live preview */}
      <div style={{marginTop:16,border:"1px solid #2e4a34",borderRadius:8,padding:14,background:"#0d1a10"}}>
        <div style={{fontSize:10,color:"#5a7a5a",marginBottom:10,letterSpacing:2,textTransform:"uppercase"}}>Apercu carte</div>
        <div style={{background:s.cardBg||"#fff",border:`1px solid ${s.cardBorderColor||"#ddeeff"}`,borderRadius:0,padding:"16px",display:"flex",flexDirection:"column",alignItems:"center",gap:8,maxWidth:180}}>
          <span style={{fontSize:s.emojiSize||32}}>🏖️</span>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:s.cardFontSize||10,color:s.cardLabelColor||s.accentColor||"#1b6ca8",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>Les Plages</div>
          <div style={{width:"100%",height:2,background:s.accentColor||"#1b6ca8",opacity:0.4}}/>
        </div>
      </div>
    </AS>

    {/* TYPOGRAPHIE */}
    <AS title="🔤 Typographie & Tailles">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <label>Police des titres</label>
          <select value={s.fontFamily||"Cormorant Garamond"} onChange={e=>set("fontFamily",e.target.value)} style={{marginBottom:6}}>
            {FONTS.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:"var(--acc)",padding:"8px 10px",background:"#0d1a10",borderRadius:4,fontStyle:"italic"}}>P'tit Bouchon</div>
        </div>
        <div>
          <label>Police du corps</label>
          <select value={s.bodyFont||"Montserrat"} onChange={e=>set("bodyFont",e.target.value)} style={{marginBottom:6}}>
            {BODY_FONTS.map(f=><option key={f} value={f}>{f}</option>)}
          </select>
          <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:13,padding:"8px 10px",background:"#0d1a10",borderRadius:4,color:"#7a9e7a"}}>Texte du corps</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginTop:14}}>
        <div>
          <label>Taille du titre principal (px)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="range" min={20} max={72} value={parseInt(s.heroFontSize)||52} onChange={e=>set("heroFontSize",e.target.value)} style={{flex:1,cursor:"pointer"}}/>
            <span style={{color:"var(--acc)",fontWeight:700,minWidth:32,textAlign:"right"}}>{s.heroFontSize||52}px</span>
          </div>
        </div>
        <div>
          <label>Taille labels des cartes (px)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="range" min={7} max={16} value={parseInt(s.cardFontSize)||10} onChange={e=>set("cardFontSize",e.target.value)} style={{flex:1,cursor:"pointer"}}/>
            <span style={{color:"var(--acc)",fontWeight:700,minWidth:32,textAlign:"right"}}>{s.cardFontSize||10}px</span>
          </div>
        </div>
        <div>
          <label>Espacement des lettres</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="range" min={0} max={8} step={0.5} value={parseFloat(s.letterSpacing)||2} onChange={e=>set("letterSpacing",e.target.value)} style={{flex:1,cursor:"pointer"}}/>
            <span style={{color:"var(--acc)",fontWeight:700,minWidth:32,textAlign:"right"}}>{s.letterSpacing||2}px</span>
          </div>
        </div>
      </div>
    </AS>

    {/* EMOJIS */}
    <AS title="😀 Emojis">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
        <div>
          <label>Taille emojis dans les cartes (px)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="range" min={20} max={64} value={parseInt(s.emojiSize)||32} onChange={e=>set("emojiSize",e.target.value)} style={{flex:1,cursor:"pointer"}}/>
            <span style={{color:"var(--acc)",fontWeight:700,minWidth:32,textAlign:"right"}}>{s.emojiSize||32}px</span>
          </div>
          <div style={{marginTop:8,background:"#0d1a10",borderRadius:4,padding:"12px",textAlign:"center",fontSize:parseInt(s.emojiSize)||32}}>🏖️</div>
        </div>
        <div>
          <label>Taille emojis rapides (accueil)</label>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type="range" min={20} max={56} value={parseInt(s.quickEmojiSize)||36} onChange={e=>set("quickEmojiSize",e.target.value)} style={{flex:1,cursor:"pointer"}}/>
            <span style={{color:"var(--acc)",fontWeight:700,minWidth:32,textAlign:"right"}}>{s.quickEmojiSize||36}px</span>
          </div>
          <div style={{marginTop:8,background:"#0d1a10",borderRadius:4,padding:"12px",textAlign:"center",fontSize:parseInt(s.quickEmojiSize)||36}}>🔑</div>
        </div>
      </div>
    </AS>

  </div>);
}

function AContact({data,updateData}){
  const s=data.settings;const set=(k,v)=>updateData(d=>{d.settings[k]=v;});
  return(<div style={{maxWidth:520}}><AS title="📞 Propriété & Contact">{[["Nom de la propriété","propertyName"],["Slogan / Tagline","tagline"],["Téléphone","phone"],["Email","email"],["WhatsApp (avec +indicatif)","whatsapp"],["Site web","website"],["Instagram","instagram"],["Adresse complète","address"],["Heure Check-in","checkIn"],["Heure Check-out","checkOut"],["Latitude villa","villaLat"],["Longitude villa","villaLng"]].map(([l,k])=>(<div key={k}><label>{l}</label><input value={s[k]||""} onChange={e=>set(k,e.target.value)}/></div>))}</AS></div>);
}

function ACheckin({data,updateData}){
  const ci=data.checkin||{};const set=(k,v)=>updateData(d=>{if(!d.checkin)d.checkin={};d.checkin[k]=v;});
  const [editIns,setEditIns]=useState(null);const ins=ci.instructions||[];
  const addIns=()=>{const ni={id:generateId(),icon:"📋",titleFr:"Nouvelle instruction",titleEn:"New instruction",textFr:"",textEn:""};updateData(d=>{if(!d.checkin)d.checkin={};if(!d.checkin.instructions)d.checkin.instructions=[];d.checkin.instructions.push(ni);});setEditIns(ni.id);};
  const delIns=(id)=>updateData(d=>{if(d.checkin?.instructions)d.checkin.instructions=d.checkin.instructions.filter(x=>x.id!==id);});
  const updIns=(id,k,v)=>updateData(d=>{const i=d.checkin?.instructions?.find(x=>x.id===id);if(i)i[k]=v;});
  const ei=editIns?ins.find(x=>x.id===editIns):null;
  return(<div style={{maxWidth:640}}>
    <AS title="🔐 Codes d'accès (cachés derrière 👁️)">{[["Nom WiFi","wifiName"],["Mot de passe WiFi","wifiPass"],["Code portail","accessCode"],["Code boîtier clé","lockboxCode"]].map(([l,k])=>(<div key={k}><label>{l}</label><input value={ci[k]||""} onChange={e=>set(k,e.target.value)}/></div>))}</AS>
    <AS title="📋 Instructions d'arrivée"><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><IB onClick={addIns} accent>+ Ajouter</IB></div>
      {!ei&&ins.map(x=>(<div key={x.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"10px 14px",marginBottom:7,display:"flex",gap:10,alignItems:"center"}}><span style={{fontSize:22}}>{x.icon}</span><div style={{flex:1,fontSize:13,fontWeight:600}}>{x.titleFr}</div><div style={{display:"flex",gap:4}}><IB onClick={()=>setEditIns(x.id)} accent>✎</IB><IB onClick={()=>delIns(x.id)} danger>🗑</IB></div></div>))}
      {ei&&(<div><button onClick={()=>setEditIns(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"5px 12px",borderRadius:7,cursor:"pointer",marginBottom:12}}>← Retour</button><div style={{background:"#162018",border:"1px solid #243428",borderRadius:12,padding:"16px"}}><div style={{display:"flex",gap:8,marginBottom:8}}><div style={{width:60}}><label>Icône</label><input value={ei.icon} onChange={e=>updIns(ei.id,"icon",e.target.value)}/></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label>Titre (FR)</label><input value={ei.titleFr} onChange={e=>updIns(ei.id,"titleFr",e.target.value)}/></div><div><label>Title (EN)</label><input value={ei.titleEn} onChange={e=>updIns(ei.id,"titleEn",e.target.value)}/></div><div><label>Texte (FR)</label><textarea value={ei.textFr} onChange={e=>updIns(ei.id,"textFr",e.target.value)} rows={3} style={{resize:"vertical"}}/></div><div><label>Text (EN)</label><textarea value={ei.textEn} onChange={e=>updIns(ei.id,"textEn",e.target.value)} rows={3} style={{resize:"vertical"}}/></div></div></div></div>)}
    </AS>
  </div>);
}

function ARules({data,updateData}){
  const rules=data.houseRules||[];const faqs=data.faqs||[];
  const addR=()=>updateData(d=>{if(!d.houseRules)d.houseRules=[];d.houseRules.push({id:generateId(),icon:"📋",titleFr:"Nouvelle règle",titleEn:"New rule",textFr:"",textEn:""});});
  const delR=(id)=>updateData(d=>{d.houseRules=d.houseRules.filter(x=>x.id!==id);});
  const updR=(id,k,v)=>updateData(d=>{const r=d.houseRules?.find(x=>x.id===id);if(r)r[k]=v;});
  const addF=()=>updateData(d=>{if(!d.faqs)d.faqs=[];d.faqs.push({id:generateId(),qFr:"Question ?",qEn:"Question?",aFr:"",aEn:""});});
  const delF=(id)=>updateData(d=>{d.faqs=d.faqs.filter(x=>x.id!==id);});
  const updF=(id,k,v)=>updateData(d=>{const f=d.faqs?.find(x=>x.id===id);if(f)f[k]=v;});
  return(<div style={{maxWidth:740}}>
    <AS title="📜 Règles de la maison"><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><IB onClick={addR} accent>+ Ajouter</IB></div>{rules.map(r=>(<div key={r.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"12px",marginBottom:8}}><div style={{display:"flex",gap:7,marginBottom:8}}><div style={{width:50}}><label>Icône</label><input value={r.icon} onChange={e=>updR(r.id,"icon",e.target.value)}/></div><div style={{marginTop:"auto"}}><IB onClick={()=>delR(r.id)} danger>🗑</IB></div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Titre (FR)</label><input value={r.titleFr} onChange={e=>updR(r.id,"titleFr",e.target.value)}/></div><div><label>Title (EN)</label><input value={r.titleEn} onChange={e=>updR(r.id,"titleEn",e.target.value)}/></div><div><label>Texte (FR)</label><textarea value={r.textFr} onChange={e=>updR(r.id,"textFr",e.target.value)} rows={2} style={{resize:"vertical"}}/></div><div><label>Text (EN)</label><textarea value={r.textEn} onChange={e=>updR(r.id,"textEn",e.target.value)} rows={2} style={{resize:"vertical"}}/></div></div></div>))}</AS>
    <AS title="❓ FAQ"><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><IB onClick={addF} accent>+ Ajouter</IB></div>{faqs.map(f=>(<div key={f.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"12px",marginBottom:8}}><div style={{display:"flex",justifyContent:"flex-end",marginBottom:7}}><IB onClick={()=>delF(f.id)} danger>🗑</IB></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Question (FR)</label><input value={f.qFr} onChange={e=>updF(f.id,"qFr",e.target.value)}/></div><div><label>Question (EN)</label><input value={f.qEn} onChange={e=>updF(f.id,"qEn",e.target.value)}/></div><div><label>Réponse (FR)</label><textarea value={f.aFr} onChange={e=>updF(f.id,"aFr",e.target.value)} rows={3} style={{resize:"vertical"}}/></div><div><label>Answer (EN)</label><textarea value={f.aEn} onChange={e=>updF(f.id,"aEn",e.target.value)} rows={3} style={{resize:"vertical"}}/></div></div></div>))}</AS>
  </div>);
}

function AAmenities({data,updateData}){
  const ams=data.amenities||[];
  const add=()=>updateData(d=>{if(!d.amenities)d.amenities=[];d.amenities.push({id:generateId(),icon:"✨",nameFr:"Nouvel équipement",nameEn:"New amenity"});});
  const del=(id)=>updateData(d=>{d.amenities=d.amenities.filter(x=>x.id!==id);});
  const upd=(id,k,v)=>updateData(d=>{const a=d.amenities?.find(x=>x.id===id);if(a)a[k]=v;});
  return(<div style={{maxWidth:680}}><AS title="✨ Équipements de la villa"><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><IB onClick={add} accent>+ Ajouter</IB></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:8}}>{ams.map(a=>(<div key={a.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"10px",display:"flex",gap:7,alignItems:"center"}}><input value={a.icon} onChange={e=>upd(a.id,"icon",e.target.value)} style={{width:46}}/><input value={a.nameFr} onChange={e=>upd(a.id,"nameFr",e.target.value)} placeholder="Français" style={{flex:1}}/><input value={a.nameEn} onChange={e=>upd(a.id,"nameEn",e.target.value)} placeholder="English" style={{flex:1}}/><IB onClick={()=>del(a.id)} danger>🗑</IB></div>))}</div></AS></div>);
}

function AAlerts({data,updateData}){
  const alerts=data.alerts||[];
  const add=()=>updateData(d=>{if(!d.alerts)d.alerts=[];d.alerts.push({id:generateId(),icon:"📢",textFr:"",textEn:"",type:"info",active:true});});
  const del=(id)=>updateData(d=>{d.alerts=d.alerts.filter(x=>x.id!==id);});
  const upd=(id,k,v)=>updateData(d=>{const a=d.alerts?.find(x=>x.id===id);if(a)a[k]=v;});
  return(<div style={{maxWidth:680}}><AS title="📢 Alertes & Annonces"><p style={{fontSize:12,color:"#5a7a5a",marginBottom:12}}>Affichées en bannière en haut du guide (marché local, coupure d'eau, événement…)</p><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><IB onClick={add} accent>+ Ajouter</IB></div>{alerts.map(a=>(<div key={a.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"12px",marginBottom:8}}><div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}><input value={a.icon} onChange={e=>upd(a.id,"icon",e.target.value)} style={{width:50}}/><select value={a.type} onChange={e=>upd(a.id,"type",e.target.value)} style={{flex:1,minWidth:120}}><option value="info">ℹ️ Info (bleu)</option><option value="warning">⚠️ Avertissement (orange)</option><option value="danger">🚨 Urgent (rouge)</option></select><label style={{display:"flex",alignItems:"center",gap:6,marginTop:0,textTransform:"none",fontSize:13,cursor:"pointer",color:"#9ab89a"}}><input type="checkbox" checked={a.active} onChange={e=>upd(a.id,"active",e.target.checked)} style={{width:"auto"}}/> Actif</label><IB onClick={()=>del(a.id)} danger>🗑</IB></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Texte (FR)</label><input value={a.textFr} onChange={e=>upd(a.id,"textFr",e.target.value)}/></div><div><label>Text (EN)</label><input value={a.textEn} onChange={e=>upd(a.id,"textEn",e.target.value)}/></div></div></div>))}</AS></div>);
}
function APages({data,updateData}){
  const [editing,setEditing]=useState(null);const pages=data.pages||[];
  const ALIGNS=[{v:"left",l:"← G"},{v:"center",l:"⬛ C"},{v:"right",l:"D →"}];
  const add=()=>{const np={id:generateId(),titleFr:"Nouvelle page",titleEn:"New page",icon:"📖",contentFr:"",contentEn:"",align:"left",valign:"top",image:"",video:"",type:"custom"};updateData(d=>d.pages.push(np));setEditing(np.id);};
  const del=(id)=>{if(window.confirm("Supprimer ?"))updateData(d=>{d.pages=d.pages.filter(p=>p.id!==id);});};
  const upd=(id,k,v)=>updateData(d=>{const p=d.pages.find(x=>x.id===id);if(p)p[k]=v;});
  const move=(id,dir)=>updateData(d=>{const i=d.pages.findIndex(p=>p.id===id);const ni=i+dir;if(ni<0||ni>=d.pages.length)return;[d.pages[i],d.pages[ni]]=[d.pages[ni],d.pages[i]];});
  const dup=(p)=>{const c={...JSON.parse(JSON.stringify(p)),id:generateId(),titleFr:p.titleFr+" (copie)",titleEn:p.titleEn+" (copy)"};updateData(d=>d.pages.push(c));};
  const ep=editing?pages.find(p=>p.id===editing):null;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{color:"var(--acc)",fontSize:20}}>📄 Pages</h2>{!ep&&<IB onClick={add} accent>+ Ajouter</IB>}</div>
    {!ep&&pages.map((p,i)=>(<div key={p.id} style={{background:"#162018",border:"1px solid #243428",borderRadius:12,padding:"11px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>{p.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{p.titleFr} / {p.titleEn}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{p.type==="welcome"?"Accueil":"Personnalisée"}</div></div><div style={{display:"flex",gap:4}}><IB onClick={()=>move(p.id,-1)} disabled={i===0}>↑</IB><IB onClick={()=>move(p.id,1)} disabled={i===pages.length-1}>↓</IB><IB onClick={()=>dup(p)}>⧉</IB><IB onClick={()=>setEditing(p.id)} accent>✎</IB><IB onClick={()=>del(p.id)} danger>🗑</IB></div></div>))}
    {ep&&(<div><button onClick={()=>setEditing(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"6px 12px",borderRadius:7,cursor:"pointer",marginBottom:16}}>← Retour</button><AS title="Éditer la page"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><label>Titre (FR)</label><input value={ep.titleFr} onChange={e=>upd(ep.id,"titleFr",e.target.value)}/></div><div><label>Title (EN)</label><input value={ep.titleEn} onChange={e=>upd(ep.id,"titleEn",e.target.value)}/></div></div><label>Icône</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>{PAGE_ICONS.map(ic=><button key={ic} onClick={()=>upd(ep.id,"icon",ic)} style={{fontSize:20,background:ep.icon===ic?"var(--acc)":"#192b1e",border:"none",borderRadius:7,width:38,height:38,cursor:"pointer"}}>{ic}</button>)}</div><label>Alignement texte</label><div style={{display:"flex",gap:5,marginBottom:10}}>{ALIGNS.map(a=><button key={a.v} onClick={()=>upd(ep.id,"align",a.v)} style={{flex:1,background:ep.align===a.v?"var(--acc)":"#192b1e",border:"none",borderRadius:6,padding:"6px",cursor:"pointer",color:ep.align===a.v?"#1a1a1a":"#7a9e7a",fontSize:12}}>{a.l}</button>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><label>Contenu (FR)</label><textarea value={ep.contentFr} onChange={e=>upd(ep.id,"contentFr",e.target.value)} rows={6} style={{resize:"vertical"}}/></div><div><label>Content (EN)</label><textarea value={ep.contentEn} onChange={e=>upd(ep.id,"contentEn",e.target.value)} rows={6} style={{resize:"vertical"}}/></div></div><label>URL image</label><input value={ep.image} onChange={e=>upd(ep.id,"image",e.target.value)} placeholder="https://..."/><label>URL vidéo YouTube / Vimeo</label><input value={ep.video} onChange={e=>upd(ep.id,"video",e.target.value)} placeholder="https://youtube.com/watch?v=..."/>{ep.video&&<div style={{marginTop:8}}><VideoEmbed url={ep.video}/></div>}{ep.image&&<img src={ep.image} alt="" style={{width:"100%",maxHeight:160,objectFit:"cover",borderRadius:8,marginTop:6}} onError={e=>e.target.style.display="none"}/>}</AS></div>)}
  </div>);
}

function AItineraries({data,updateData}){
  const [selIt,setSelIt]=useState(null);const its=data.itineraries||[];
  const add=()=>{const ni={id:generateId(),icon:"🌅",nameFr:"Nouvel itinéraire",nameEn:"New itinerary",descFr:"",descEn:"",color:"#4a90d9",steps:[]};updateData(d=>{if(!d.itineraries)d.itineraries=[];d.itineraries.push(ni);});setSelIt(ni.id);};
  const del=(id)=>{if(window.confirm("Supprimer ?"))updateData(d=>{d.itineraries=d.itineraries.filter(x=>x.id!==id);});setSelIt(null);};
  const upd=(id,k,v)=>updateData(d=>{const it=d.itineraries?.find(x=>x.id===id);if(it)it[k]=v;});
  const addStep=(id)=>updateData(d=>{const it=d.itineraries?.find(x=>x.id===id);if(it){if(!it.steps)it.steps=[];it.steps.push({timeFr:"00h00",timeEn:"00:00",textFr:"",textEn:""});}});
  const delStep=(id,i)=>updateData(d=>{const it=d.itineraries?.find(x=>x.id===id);if(it)it.steps.splice(i,1);});
  const updStep=(id,i,k,v)=>updateData(d=>{const it=d.itineraries?.find(x=>x.id===id);if(it&&it.steps[i])it.steps[i][k]=v;});
  const it=selIt?its.find(x=>x.id===selIt):null;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{color:"var(--acc)",fontSize:20}}>🌅 Itinéraires</h2>{!selIt&&<IB onClick={add} accent>+ Ajouter</IB>}</div>
    {!selIt&&its.map(x=>(<div key={x.id} style={{background:"#162018",border:`1px solid ${x.color}35`,borderRadius:12,padding:"11px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>{x.icon}</span><div style={{flex:1,fontSize:13,fontWeight:700}}>{x.nameFr} / {x.nameEn}</div><div style={{display:"flex",gap:4}}><IB onClick={()=>setSelIt(x.id)} accent>✎</IB><IB onClick={()=>del(x.id)} danger>🗑</IB></div></div>))}
    {it&&(<div><button onClick={()=>setSelIt(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"6px 12px",borderRadius:7,cursor:"pointer",marginBottom:16}}>← Retour</button><AS title="Éditer l'itinéraire"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label>Nom (FR)</label><input value={it.nameFr} onChange={e=>upd(it.id,"nameFr",e.target.value)}/></div><div><label>Name (EN)</label><input value={it.nameEn} onChange={e=>upd(it.id,"nameEn",e.target.value)}/></div><div><label>Description (FR)</label><input value={it.descFr} onChange={e=>upd(it.id,"descFr",e.target.value)}/></div><div><label>Description (EN)</label><input value={it.descEn} onChange={e=>upd(it.id,"descEn",e.target.value)}/></div></div><div style={{display:"flex",gap:10,marginTop:8,alignItems:"flex-end"}}><div style={{width:54}}><label>Icône</label><input value={it.icon} onChange={e=>upd(it.id,"icon",e.target.value)}/></div><div style={{width:80}}><label>Couleur</label><input type="color" value={it.color} onChange={e=>upd(it.id,"color",e.target.value)} style={{height:36,padding:2,cursor:"pointer"}}/></div></div><div style={{marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><h4 style={{color:"var(--acc)"}}>Étapes ({it.steps?.length||0})</h4><IB onClick={()=>addStep(it.id)} accent>+ Étape</IB></div>{it.steps?.map((step,i)=>(<div key={i} style={{background:"#0d1a10",borderRadius:10,padding:"12px",marginBottom:8,border:"1px solid #1e3020"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"#6a9a6a",fontSize:12}}>Étape {i+1}</span><IB onClick={()=>delStep(it.id,i)} danger>🗑</IB></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Heure (FR)</label><input value={step.timeFr} onChange={e=>updStep(it.id,i,"timeFr",e.target.value)}/></div><div><label>Time (EN)</label><input value={step.timeEn} onChange={e=>updStep(it.id,i,"timeEn",e.target.value)}/></div><div><label>Texte (FR)</label><textarea value={step.textFr} onChange={e=>updStep(it.id,i,"textFr",e.target.value)} rows={2} style={{resize:"vertical"}}/></div><div><label>Text (EN)</label><textarea value={step.textEn} onChange={e=>updStep(it.id,i,"textEn",e.target.value)} rows={2} style={{resize:"vertical"}}/></div></div></div>))}</AS></div>)}
  </div>);
}

function ACats({data,updateData,field,title}){
  const [selCat,setSelCat]=useState(null);const [editItem,setEditItem]=useState(null);
  const cats=data[field]||[];
  const addCat=()=>{const nc={id:generateId(),nameFr:"Nouvelle catégorie",nameEn:"New category",icon:"📍",color:"#888",items:[]};updateData(d=>{if(!d[field])d[field]=[];d[field].push(nc);});setSelCat(nc.id);};
  const delCat=(id)=>{if(window.confirm("Supprimer ?"))updateData(d=>{d[field]=d[field].filter(c=>c.id!==id);});setSelCat(null);};
  const updCat=(id,k,v)=>updateData(d=>{const c=d[field]?.find(x=>x.id===id);if(c)c[k]=v;});
  const addItem=(cid)=>{const ni={id:generateId(),nameFr:"Nouveau lieu",nameEn:"New place",descFr:"",descEn:"",address:"",phone:"",mapLink:"",image:"",distance:"",priceLevel:"",openHours:""};updateData(d=>{const c=d[field]?.find(x=>x.id===cid);if(c){if(!c.items)c.items=[];c.items.push(ni);}});setEditItem(ni.id);};
  const delItem=(cid,iid)=>{if(window.confirm("Supprimer ?"))updateData(d=>{const c=d[field]?.find(x=>x.id===cid);if(c)c.items=c.items.filter(i=>i.id!==iid);});};
  const updItem=(cid,iid,k,v)=>updateData(d=>{const c=d[field]?.find(x=>x.id===cid);const i=c?.items?.find(x=>x.id===iid);if(i)i[k]=v;});
  const moveItem=(cid,iid,dir)=>updateData(d=>{const c=d[field]?.find(x=>x.id===cid);if(!c)return;const idx=c.items.findIndex(i=>i.id===iid);const ni=idx+dir;if(ni<0||ni>=c.items.length)return;[c.items[idx],c.items[ni]]=[c.items[ni],c.items[idx]];});
  const cat=selCat?cats.find(c=>c.id===selCat):null;
  const item=cat&&editItem?cat.items.find(i=>i.id===editItem):null;
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{color:"var(--acc)",fontSize:20}}>🗂️ {title}</h2>{!selCat&&<IB onClick={addCat} accent>+ Ajouter</IB>}</div>
    {!selCat&&cats.map(c=>(<div key={c.id} style={{background:"#162018",border:`1px solid ${c.color}35`,borderRadius:12,padding:"11px 14px",marginBottom:7,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:26}}>{c.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{c.nameFr} / {c.nameEn}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{c.items?.length||0} lieu(x)</div></div><div style={{display:"flex",gap:4}}><IB onClick={()=>{setSelCat(c.id);setEditItem(null);}} accent>✎ Éditer</IB><IB onClick={()=>delCat(c.id)} danger>🗑</IB></div></div>))}
    {cat&&!item&&(<div><button onClick={()=>setSelCat(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"6px 12px",borderRadius:7,cursor:"pointer",marginBottom:14}}>← Retour</button><AS title="Paramètres de la catégorie"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><label>Nom (FR)</label><input value={cat.nameFr} onChange={e=>updCat(cat.id,"nameFr",e.target.value)}/></div><div><label>Name (EN)</label><input value={cat.nameEn} onChange={e=>updCat(cat.id,"nameEn",e.target.value)}/></div></div><label>Icône</label><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{CAT_ICONS.map(ic=><button key={ic} onClick={()=>updCat(cat.id,"icon",ic)} style={{fontSize:20,background:cat.icon===ic?"var(--acc)":"#192b1e",border:"none",borderRadius:7,width:38,height:38,cursor:"pointer"}}>{ic}</button>)}</div><label>Couleur</label><div style={{display:"flex",flexWrap:"wrap",gap:4,alignItems:"center"}}>{CAT_COLORS.map(col=><button key={col} onClick={()=>updCat(cat.id,"color",col)} style={{width:32,height:32,background:col,border:cat.color===col?"3px solid white":"none",borderRadius:7,cursor:"pointer"}}/>)}<input type="color" value={cat.color} onChange={e=>updCat(cat.id,"color",e.target.value)} style={{width:32,height:32,padding:2}}/></div></AS>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h3 style={{color:"var(--acc)",fontSize:15}}>Lieux ({cat.items?.length||0})</h3><IB onClick={()=>addItem(cat.id)} accent>+ Ajouter un lieu</IB></div>
    {cat.items?.map((it,i)=>(<div key={it.id} style={{background:"#0d1a10",border:"1px solid #1e3020",borderRadius:10,padding:"10px 14px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>{it.image&&<img src={it.image} alt="" style={{width:50,height:50,objectFit:"cover",borderRadius:8,flexShrink:0}} onError={e=>e.target.style.display="none"}/>}<div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{it.nameFr}</div><div style={{fontSize:11,color:"#5a7a5a"}}>{it.address}</div></div><div style={{display:"flex",gap:3}}><IB onClick={()=>moveItem(cat.id,it.id,-1)} disabled={i===0}>↑</IB><IB onClick={()=>moveItem(cat.id,it.id,1)} disabled={i===cat.items.length-1}>↓</IB><IB onClick={()=>setEditItem(it.id)} accent>✎</IB><IB onClick={()=>delItem(cat.id,it.id)} danger>🗑</IB></div></div>))}</div>)}
    {item&&(<div><button onClick={()=>setEditItem(null)} style={{background:"#1e3020",border:"none",color:"#7a9a7a",padding:"6px 12px",borderRadius:7,cursor:"pointer",marginBottom:14}}>← Retour à {cat.nameFr}</button><AS title={`✎ ${item.nameFr}`}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div><label>Nom (FR)</label><input value={item.nameFr} onChange={e=>updItem(cat.id,item.id,"nameFr",e.target.value)}/></div><div><label>Name (EN)</label><input value={item.nameEn} onChange={e=>updItem(cat.id,item.id,"nameEn",e.target.value)}/></div><div><label>Description (FR)</label><textarea value={item.descFr} onChange={e=>updItem(cat.id,item.id,"descFr",e.target.value)} rows={3} style={{resize:"vertical"}}/></div><div><label>Description (EN)</label><textarea value={item.descEn} onChange={e=>updItem(cat.id,item.id,"descEn",e.target.value)} rows={3} style={{resize:"vertical"}}/></div><div><label>Distance depuis villa</label><input value={item.distance||""} onChange={e=>updItem(cat.id,item.id,"distance",e.target.value)} placeholder="5 min, 2 km…"/></div><div><label>Prix (€, Gratuit…)</label><input value={item.priceLevel||""} onChange={e=>updItem(cat.id,item.id,"priceLevel",e.target.value)} placeholder="€€, Gratuit"/></div><div><label>Horaires</label><input value={item.openHours||""} onChange={e=>updItem(cat.id,item.id,"openHours",e.target.value)} placeholder="9h-18h, Fermé lundi"/></div><div><label>Téléphone</label><input value={item.phone||""} onChange={e=>updItem(cat.id,item.id,"phone",e.target.value)} placeholder="+596 696…"/></div></div><label>Adresse complète</label><input value={item.address||""} onChange={e=>updItem(cat.id,item.id,"address",e.target.value)} placeholder="123 Rue…, Ville"/><label>🗺️ Lien Google Maps</label><input value={item.mapLink||""} onChange={e=>updItem(cat.id,item.id,"mapLink",e.target.value)} placeholder="https://maps.google.com/?q=…"/>{item.mapLink&&<a href={item.mapLink} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:4,fontSize:12,color:"#4285f4"}}>🔗 Tester le lien Maps</a>}<label>📸 Photo du lieu (URL)</label><input value={item.image||""} onChange={e=>updItem(cat.id,item.id,"image",e.target.value)} placeholder="https://…"/><div style={{fontSize:11,color:"#5a7a5a",marginTop:3}}>💡 Copiez l'URL d'une photo du lieu (façade, plage, plat…)</div>{item.image&&<img src={item.image} alt="" style={{width:"100%",maxHeight:170,objectFit:"cover",borderRadius:9,marginTop:7}} onError={e=>e.target.style.display="none"}/>}</AS></div>)}
  </div>);
}

function AGallery({data,updateData}){
  const gallery=data.gallery||[];
  const add=()=>updateData(d=>{if(!d.gallery)d.gallery=[];d.gallery.push({id:generateId(),url:"",caption:""});});
  const del=(id)=>updateData(d=>{d.gallery=d.gallery.filter(g=>g.id!==id);});
  const upd=(id,k,v)=>updateData(d=>{const g=d.gallery?.find(x=>x.id===id);if(g)g[k]=v;});
  return(<div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h2 style={{color:"var(--acc)",fontSize:20}}>🖼️ Galerie Photos</h2><IB onClick={add} accent>+ Ajouter</IB></div>{gallery.length===0&&<div style={{textAlign:"center",padding:44,color:"#4a6a4a",fontSize:13}}>Aucune photo. Cliquez sur + Ajouter.</div>}<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>{gallery.map(g=>(<div key={g.id} style={{background:"#162018",border:"1px solid #243428",borderRadius:14,overflow:"hidden"}}>{g.url&&<img src={g.url} alt="" style={{width:"100%",height:150,objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>}<div style={{padding:"10px"}}><label>URL image</label><input value={g.url} onChange={e=>upd(g.id,"url",e.target.value)} placeholder="https://…"/><label>Légende (optionnel)</label><input value={g.caption} onChange={e=>upd(g.id,"caption",e.target.value)} placeholder="Description…"/><button onClick={()=>del(g.id)} style={{marginTop:8,background:"#4a1515",border:"none",color:"#ff8080",padding:"5px 12px",borderRadius:7,cursor:"pointer",fontSize:12}}>🗑 Supprimer</button></div></div>))}</div></div>);
}

function AAnalytics({data}){
  const [a,setA]=useState(()=>LS.get("pb_analytics",{}));
  const [ratings,setRatings]=useState(()=>getRatings());
  const [clicks,setClicks]=useState(()=>getClicks());
  const [view,setView]=useState("days");
  const refresh=()=>{setA(LS.get("pb_analytics",{}));setRatings(getRatings());setClicks(getClicks());};
  const allCats=[...(data.categories||[]),...(data.subcategories||[])];
  const today=new Date().toISOString().slice(0,10),thisMonth=new Date().toISOString().slice(0,7),thisYear=String(new Date().getFullYear());
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const key=d.toISOString().slice(0,10);return{key,label:key.slice(5),count:a.days?.[key]||0};});
  const last12=Array.from({length:12},(_,i)=>{const d=new Date();d.setMonth(d.getMonth()-11+i);const key=d.toISOString().slice(0,7);return{key,label:new Date(key+"-01").toLocaleDateString("fr-FR",{month:"short"}),count:a.months?.[key]||0};});
  const yrs=Object.entries(a.years||{}).sort((x,y)=>x[0].localeCompare(y[0])).map(([k,v])=>({key:k,label:k,count:v}));
  const chartData=view==="days"?last14:view==="months"?last12:yrs.length?yrs:[{key:thisYear,label:thisYear,count:0}];
  const maxVal=Math.max(1,...chartData.map(d=>d.count));
  const ratedItems=allCats.flatMap(cat=>(cat.items||[]).map(item=>{const r=ratings[item.id];if(!r||r.count===0)return null;return{name:item.nameFr,catIcon:cat.icon,avg:r.total/r.count,count:r.count};}).filter(Boolean)).sort((x,y)=>y.avg-x.avg);
  const clickItems=Object.entries(clicks).map(([id,v])=>({id,...v})).sort((a,b)=>b.count-a.count).slice(0,15);
  const devices=a.devices||{};
  return(<div style={{maxWidth:780}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><h2 style={{color:"var(--acc)",fontSize:22}}>📊 Statistiques</h2><button onClick={refresh} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"7px 16px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13}}>🔄 Actualiser</button></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10,marginBottom:22}}>
      {[{l:"Aujourd'hui",v:a.days?.[today]||0,i:"📅",c:"#4a90d9"},{l:"Ce mois",v:a.months?.[thisMonth]||0,i:"📆",c:"#7b5ea7"},{l:"Cette année",v:a.years?.[thisYear]||0,i:"🗓️",c:"#5dab5d"},{l:"Total visites",v:a.total||0,i:"∞",c:"var(--acc)"},{l:"📱 Mobile",v:devices.mobile||0,i:"📱",c:"#00acc1"},{l:"🖥️ Desktop",v:devices.desktop||0,i:"🖥️",c:"#f06292"}].map(k=>(
        <div key={k.l} style={{background:"#162018",border:`1px solid ${k.c}40`,borderRadius:14,padding:"16px",textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:4}}>{k.i}</div>
          <div style={{fontSize:26,fontWeight:800,color:k.c,fontFamily:"var(--hfont)"}}>{k.v}</div>
          <div style={{fontSize:11,color:"#5a7a5a",marginTop:2}}>{k.l}</div>
        </div>
      ))}
    </div>
    <AS title="📈 Historique des visites">
      <div style={{display:"flex",gap:5,marginBottom:14}}>{[{v:"days",l:"14 jours"},{v:"months",l:"12 mois"},{v:"years",l:"Années"}].map(b=>(<button key={b.v} onClick={()=>setView(b.v)} style={{background:view===b.v?"var(--acc)":"#1e2d23",border:"none",color:view===b.v?"#1a1a1a":"#7a9a7a",padding:"5px 12px",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:view===b.v?700:400}}>{b.l}</button>))}</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:120,overflowX:"auto",paddingBottom:4}}>
        {chartData.map(d=>(<div key={d.key} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"1 0 auto",minWidth:24,maxWidth:46}}>
          <div style={{fontSize:9,color:"#5a7a5a",marginBottom:2}}>{d.count>0?d.count:""}</div>
          <div style={{width:"100%",background:`var(--acc)`,borderRadius:"4px 4px 0 0",height:`${Math.max(2,(d.count/maxVal)*100)}px`,opacity:0.85,transition:"height 0.4s"}}/>
          <div style={{fontSize:8,color:"#4a6a4a",marginTop:3,transform:"rotate(-35deg)",transformOrigin:"top center",whiteSpace:"nowrap"}}>{d.label}</div>
        </div>))}
      </div>
      {(a.total||0)===0&&<div style={{textAlign:"center",color:"#4a6a4a",padding:"16px 0",fontSize:12}}>Aucune visite enregistrée.</div>}
    </AS>
    <AS title={`🔥 Lieux les plus consultés (${clickItems.length})`}>
      {clickItems.length===0&&<div style={{color:"#4a6a4a",textAlign:"center",padding:"16px 0",fontSize:13}}>Aucun clic enregistré pour l'instant.</div>}
      {clickItems.map((item,i)=>{
        const maxC=clickItems[0]?.count||1;
        return(<div key={item.id} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:13,color:"#dde8dd",fontWeight:600}}>#{i+1} {item.name}</span>
            <span style={{fontSize:12,color:"var(--acc)",fontWeight:700}}>{item.count} clics</span>
          </div>
          <div style={{height:6,background:"#192b1e",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",background:`var(--acc)`,width:`${(item.count/maxC)*100}%`,borderRadius:3,transition:"width 0.5s"}}/>
          </div>
        </div>);
      })}
    </AS>
    <AS title={`⭐ Notes des lieux (${ratedItems.length} noté${ratedItems.length>1?"s":""})`}>
      {ratedItems.length===0&&<div style={{color:"#4a6a4a",textAlign:"center",padding:"16px 0",fontSize:13}}>Aucun lieu noté par les visiteurs.</div>}
      {ratedItems.map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #1e2d23"}}><span>{item.catIcon}</span><div style={{flex:1,fontSize:13,fontWeight:600}}>{item.name}</div><div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:s<=Math.round(item.avg)?"#f5a623":"#333",fontSize:16}}>★</span>)}</div><span style={{fontSize:13,color:"var(--acc)",fontWeight:700,minWidth:30}}>{item.avg.toFixed(1)}</span><span style={{fontSize:11,color:"#5a7a5a"}}>{item.count} avis</span></div>))}
    </AS>
  </div>);
}

// -- VIDEOS ADMIN -----------------------------------------
function AVideos({data,updateData}){
  const videos=data.videos||[];
  const add=()=>updateData(d=>{if(!d.videos)d.videos=[];d.videos.push({id:generateId(),titleFr:"Nouvelle vidéo",titleEn:"New video",descFr:"",descEn:"",url:""});});
  const del=(id)=>updateData(d=>{d.videos=d.videos.filter(v=>v.id!==id);});
  const upd=(id,k,v)=>updateData(d=>{const x=d.videos?.find(x=>x.id===id);if(x)x[k]=v;});
  return(<div style={{maxWidth:680}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <h2 style={{color:"var(--acc)",fontSize:20}}>🎬 Vidéos</h2>
      <IB onClick={add} accent>+ Ajouter</IB>
    </div>
    <div style={{background:"#192b1e",borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#5a8a6a",lineHeight:1.6}}>
      💡 Supporte YouTube, Vimeo et liens Instagram Reels.<br/>
      YouTube: <code style={{color:"var(--acc)"}}>https://youtube.com/watch?v=XXXXX</code><br/>
      Instagram: coller le lien du Reel (s'ouvrira dans un nouvel onglet)
    </div>
    {videos.map(v=>(
      <div key={v.id} style={{background:"#162018",border:"1px solid #243428",borderRadius:12,padding:"16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}><IB onClick={()=>del(v.id)} danger>🗑 Supprimer</IB></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label>Titre (FR)</label><input value={v.titleFr} onChange={e=>upd(v.id,"titleFr",e.target.value)}/></div>
          <div><label>Title (EN)</label><input value={v.titleEn} onChange={e=>upd(v.id,"titleEn",e.target.value)}/></div>
          <div><label>Description (FR)</label><input value={v.descFr||""} onChange={e=>upd(v.id,"descFr",e.target.value)}/></div>
          <div><label>Description (EN)</label><input value={v.descEn||""} onChange={e=>upd(v.id,"descEn",e.target.value)}/></div>
        </div>
        <label>🔗 URL de la vidéo (YouTube / Vimeo / Instagram)</label>
        <input value={v.url} onChange={e=>upd(v.id,"url",e.target.value)} placeholder="https://youtube.com/watch?v=..."/>
        {v.url&&v.url.includes("youtube")&&(
          <div style={{marginTop:10,position:"relative",paddingBottom:"40%",height:0,overflow:"hidden",borderRadius:8}}>
            <iframe src={`https://www.youtube.com/embed/${v.url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1]}`} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allowFullScreen title="preview"/>
          </div>
        )}
      </div>
    ))}
  </div>);
}

// -- BACKUP ADMIN -----------------------------------------
function ABackup({data,updateData}){
  const [msg,setMsg]=useState("");
  const exportData=()=>{
    const json=JSON.stringify(data,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url; a.download=`ptitbouchon-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setMsg("✅ Sauvegarde téléchargée !");
    setTimeout(()=>setMsg(""),3000);
  };
  const importData=(e)=>{
    const file=e.target.files?.[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const parsed=JSON.parse(ev.target.result);
        if(!parsed.settings)throw new Error("Fichier invalide");
        updateData(d=>{Object.assign(d,parsed);});
        setMsg("✅ Données importées avec succès !");
      }catch(err){setMsg("❌ Erreur : fichier invalide");}
      setTimeout(()=>setMsg(""),4000);
    };
    reader.readAsText(file);
    e.target.value="";
  };
  const resetData=()=>{
    if(!window.confirm("⚠️ Réinitialiser toutes les données ? Cette action est irréversible."))return;
    localStorage.removeItem("ptitbouchon_v6");
    window.location.reload();
  };
  return(<div style={{maxWidth:560}}>
    <h2 style={{color:"var(--acc)",fontSize:20,marginBottom:20}}>💾 Sauvegarde & Restauration</h2>
    {msg&&<div style={{background:msg.includes("✅")?"#1a3a20":"#3a1a1a",border:`1px solid ${msg.includes("✅")?"#3a6a40":"#6a2020"}`,borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:msg.includes("✅")?"#7adc7a":"#ff8080"}}>{msg}</div>}

    <AS title="📤 Exporter les données">
      <p style={{fontSize:13,color:"#7a9e7a",marginBottom:14,lineHeight:1.6}}>Télécharge toutes les données de l'application (lieux, paramètres, photos, itinéraires…) dans un fichier JSON. Conserve ce fichier précieusement !</p>
      <button onClick={exportData} style={{background:"var(--acc)",border:"none",color:"#1a1a1a",padding:"10px 22px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:8}}>
        📥 Télécharger la sauvegarde (.json)
      </button>
    </AS>

    <AS title="📥 Importer des données">
      <p style={{fontSize:13,color:"#7a9e7a",marginBottom:14,lineHeight:1.6}}>⚠️ Importer un fichier remplacera <strong style={{color:"#ff8a50"}}>toutes</strong> les données actuelles. Fais une sauvegarde avant !</p>
      <label style={{display:"inline-flex",alignItems:"center",gap:8,background:"#1e3020",border:"1px solid var(--acc)",color:"var(--acc)",padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,marginTop:0}}>
        📂 Choisir un fichier .json
        <input type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
      </label>
    </AS>

    <AS title="🗑️ Réinitialisation">
      <p style={{fontSize:13,color:"#7a9e7a",marginBottom:14,lineHeight:1.6}}>Remet l'application à zéro avec les données par défaut. <strong style={{color:"#ff5050"}}>Irréversible !</strong></p>
      <button onClick={resetData} style={{background:"#4a1515",border:"1px solid #7a2020",color:"#ff8080",padding:"10px 18px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14}}>
        ⚠️ Réinitialiser toutes les données
      </button>
    </AS>
  </div>);
}

// ======================= MAIN APP =======================
export default function App(){
  const [lang,setLang]=useState(null);
  const [mode,setMode]=useState("guest");
  const [data,setData]=useState(()=>loadData());
  const [adminTab,setAdminTab]=useState("settings");
  const [adminPass,setAdminPass]=useState("");
  const [showAdminLogin,setShowAdminLogin]=useState(false);
  const [darkMode,setDarkMode]=useState(false);
  const [saveStatus,setSaveStatus]=useState("saved");
  const [lastSaved,setLastSaved]=useState(()=>new Date());
  const [loading,setLoading]=useState(true);

  useEffect(()=>{setTimeout(()=>setLoading(false),1800);},[]);
  useEffect(()=>{if(lang)trackVisit();},[lang]);
  useEffect(()=>{saveData(data);setSaveStatus("unsaved");},[data]);

  const updateData=useCallback((fn)=>setData(prev=>{const next=JSON.parse(JSON.stringify(prev));fn(next);return next;}),[]);
  const handleSave=()=>{setSaveStatus("saving");setTimeout(()=>{saveData(data);setLastSaved(new Date());setSaveStatus("saved");},600);};
  const handleAdminLogin=()=>{
    if(adminPass==="admin123"){setMode("admin");setShowAdminLogin(false);setAdminPass("");}
    else alert(lang==="fr"?"Mot de passe incorrect":"Wrong password");
  };

  const {settings}=data;

  useEffect(()=>{
    const f=encodeURIComponent(`${settings.fontFamily||"Playfair Display"}:ital,wght@0,400;0,700;1,400&family=${settings.bodyFont||"Lato"}:wght@300;400;700`);
    const ex=document.getElementById("gf");if(ex)ex.remove();
    const l=document.createElement("link");l.id="gf";l.rel="stylesheet";
    l.href=`https://fonts.googleapis.com/css2?family=${f}&display=swap`;document.head.appendChild(l);
  },[settings.fontFamily,settings.bodyFont]);

  const theme={
    bg:    darkMode?"#091520":settings.bodyBg,
    card:  darkMode?"#0d2035":settings.cardBg,
    text:  darkMode?"#e0eff8":settings.bodyText,
    sub:   darkMode?"#5a8aaa":SEA.sub,
    border:darkMode?"#1a3a55":(settings.cardBorderColor||SEA.border),
    acc:   settings.accentColor||SEA.ocean,
    hbg:   settings.headerBg,   htx:settings.headerText,
    fbg:   settings.footerBg,   ftx:settings.footerText,
    hfont: "'Cormorant Garamond',Georgia,serif",
    bfont: "'Montserrat',sans-serif",
  };

  if(loading)return <Splash s={settings}/>;
  if(!lang)return <LangSelector setLang={setLang} settings={settings}/>;
  if(mode==="admin")return <AdminPanel data={data} updateData={updateData} setMode={setMode} adminTab={adminTab} setAdminTab={setAdminTab} saveStatus={saveStatus} handleSave={handleSave} lastSaved={lastSaved}/>;
  if(mode==="preview")return(
    <div style={{position:"relative"}}>
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:9999,background:"#1b6ca8",color:"white",padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:13,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
        <span>👁️ <strong>Mode Aperçu</strong> - Modifications non sauvegardées</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setMode("admin");}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",padding:"5px 12px",borderRadius:6,cursor:"pointer",fontSize:12}}>← Retour Admin</button>
        </div>
      </div>
      <div style={{paddingTop:40}}>
        <GuestApp data={data} lang={lang||"fr"} setLang={setLang} setMode={setMode} theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} showAdminLogin={false} setShowAdminLogin={()=>{}} adminPass="" setAdminPass={()=>{}} handleAdminLogin={()=>{}}/>
      </div>
    </div>
  );
  return <GuestApp data={data} lang={lang} setLang={setLang} setMode={setMode} theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} showAdminLogin={showAdminLogin} setShowAdminLogin={setShowAdminLogin} adminPass={adminPass} setAdminPass={setAdminPass} handleAdminLogin={handleAdminLogin}/>;
}
