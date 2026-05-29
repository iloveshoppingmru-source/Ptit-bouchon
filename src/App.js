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

const BACKUP_DATA={"settings":{"propertyName":"P'tit Bouchon","tagline":"Villa face à la mer - Île Maurice","phone":"+230 5250 7300","email":"cdesign@intnet.mu","website":"","whatsapp":"+23052507300","instagram":"","checkIn":"08:00","checkOut":"11:00","address":"Public Beach Road, Plaine Magnien, Grand Port, Mauritius 52404","villaLat":"-20.4310","villaLng":"57.6659","headerBg":"#0a2342","headerText":"#f5e6c8","footerBg":"#0a2342","footerText":"#f5e6c8","accentColor":"#1b6ca8","cardBorderColor":"#ddeeff","cardLabelColor":"#1b6ca8","emojiSize":32,"quickEmojiSize":36,"cardFontSize":10,"heroFontSize":"50","letterSpacing":2,"bodyBg":"#f8fbff","bodyText":"#0d2137","cardBg":"#ffffff","fontFamily":"Cormorant Garamond","bodyFont":"Montserrat","headerBgType":"image","headerBgImage":"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg","footerBgType":"color","footerBgImage":"","bodyBgType":"color","bodyBgImage":""},"checkin":{"wifiName":"Telecom-ms4p","wifiPass":"Es98sJni","accessCode":"","lockboxCode":"4 last Phone number digits - 4 derniers numero téléphonne","checkIn":"08:00","checkOut":"11:00","instructions":[{"id":"c1","icon":"🔑","titleFr":"Trouver la Villa","titleEn":"Find the Villa","textFr":"La meilleure façon de se rendre à la Villa est d'aller jusqu'à la plage du Bouchon. Dès que vous êtes en face de la plage, prenez à gauche et vous devriez voir une petite maison avec un toit bleu (c'est les toilettes publiques).\n\nEnviron 15 mètres après les toilettes, vous verrez une petite entrée sur votre gauche après les gros rochers. Prenez l'entrée et ça sera la deuxième Villa derrière.\n\nY'aura un grand mur avec deux entrées. L'entrée de gauche est beaucoup plus large (Plus accessible pour les voiture).\n\nL'adresse c'est Le Bouchon Public BEACH","textEn":"The best way to get to the Villa is to head towards Bouchon Beach. Once you're facing the beach, turn left, and you should see a small house with a blue roof (this is the public restroom).\n\nAbout 15 meters past the restroom, you'll notice a small entrance on your left, after the large rocks. Take that entrance, and it will be the second Villa behind.\n\nThere will be a large wall with two entrances. The left entrance is much wider (more accessible for cars).\n\nThe address is Le Bouchon Public Beach Plaine Magnien."},{"id":"c2","icon":"🔑","titleFr":"Self Check-in - Boîtier à clé","titleEn":"Self Check-in - Lockbox","textFr":"Pas besoin de nous attendre ! La clé se trouve dans le boîtier sécurisé à côté de la porte principale. Le code vous sera communiqué par message avant votre arrivée.","textEn":"No need to wait for us! The key is in the secure lockbox next to the main door. The code will be sent to you by message before your arrival."},{"id":"c3","icon":"🔐","titleFr":"Système d'alarme","titleEn":"Alarm system","textFr":"La villa est équipée d'un système d'alarme. Les instructions de désactivation se trouvent dans le guide d'accueil à l'intérieur de la villa.","textEn":"The villa has an alarm system. Deactivation instructions are in the welcome guide inside the villa."},{"id":"c4","icon":"📱","titleFr":"Contactez-nous","titleEn":"Contact us","textFr":"Envoyez-nous un message WhatsApp dès votre arrivée. Charles répond dans l'heure, 7j/7. Taux de réponse : 100%.","textEn":"Send us a WhatsApp message upon arrival. Charles responds within the hour, 7 days a week. Response rate: 100%."}]},"houseRules":[{"id":"r1","icon":"🕗","titleFr":"Check-in","titleEn":"Check-in","textFr":"Check-in : 8h00 - 21h00. Self check-in via boîtier à clé.","textEn":"Check-in: 8:00 AM - 9:00 PM. Self check-in via lockbox."},{"id":"r2","icon":"🕙","titleFr":"Check-out","titleEn":"Check-out","textFr":"Départ avant 11h00.","textEn":"Checkout before 11:00 AM."},{"id":"r3","icon":"👥","titleFr":"Capacité maximale","titleEn":"Maximum capacity","textFr":"6 personnes maximum.","textEn":"6 guests maximum."},{"id":"r4","icon":"🚭","titleFr":"Non-fumeur","titleEn":"No smoking","textFr":"Il est strictement interdit de fumer à l'intérieur de la villa.","textEn":"Smoking is strictly prohibited inside the villa."},{"id":"r5","icon":"🏊","titleFr":"Piscine privée","titleEn":"Private pool","textFr":"La piscine est privée. Pas de portail ou de verrou - vigilance requise avec les enfants.","textEn":"Pool is private. No gate or lock - supervision required with children."},{"id":"r6","icon":"📹","titleFr":"Caméras de sécurité","titleEn":"Security cameras","textFr":"La villa est équipée d'un système de vidéosurveillance extérieure 24h/24.","textEn":"The villa has exterior CCTV security cameras operating 24/7."},{"id":"r7","icon":"🔒","titleFr":"Système d'alarme","titleEn":"Alarm system","textFr":"La villa est protégée par un système d'alarme. Instructions fournies à l'arrivée.","textEn":"The villa is protected by an alarm system. Instructions provided on arrival."},{"id":"r8","icon":"✈️","titleFr":"Idéalement situé","titleEn":"Ideal location","textFr":"L'aéroport est à seulement 8 minutes de la villa - idéal pour les arrivées et départs.","textEn":"The airport is only 8 minutes from the villa - ideal for arrivals and departures."},{"id":"r9","icon":"🌿","titleFr":"Écologie","titleEn":"Eco-friendly","textFr":"L'eau chaude est produite par panneau solaire pour une approche plus écologique.","textEn":"Hot water is solar-powered for a more ecological approach."},{"id":"r10","icon":"🧹","titleFr":"Propreté","titleEn":"Cleanliness","textFr":"Merci de laisser la villa propre à votre départ. Le linge est inclus sans frais supplémentaires.","textEn":"Please leave the villa clean on departure. Laundry is included at no extra cost."}],"amenities":[{"id":"a1","icon":"🌊","nameFr":"Vue sur la mer","nameEn":"Sea view"},{"id":"a2","icon":"🏖️","nameFr":"Accès plage privée","nameEn":"Private beach access"},{"id":"a3","icon":"🏊","nameFr":"Piscine privée","nameEn":"Private pool"},{"id":"a4","icon":"🛏️","nameFr":"3 chambres (6 pers.)","nameEn":"3 bedrooms (6 guests)"},{"id":"a5","icon":"🚿","nameFr":"2 salles de bain privatives","nameEn":"2 private bathrooms"},{"id":"a6","icon":"📶","nameFr":"WiFi rapide - 54 Mb/s","nameEn":"Fast WiFi - 54 Mb/s"},{"id":"a7","icon":"🍳","nameFr":"Cuisine équipée","nameEn":"Fully equipped kitchen"},{"id":"a8","icon":"🧺","nameFr":"Lave-linge (inclus)","nameEn":"Washing machine (included)"},{"id":"a9","icon":"❄️","nameFr":"Climatisation","nameEn":"Air conditioning"},{"id":"a10","icon":"☀️","nameFr":"Terrasse vue mer","nameEn":"Sea-view terrace"},{"id":"a11","icon":"🌿","nameFr":"Eau chaude solaire","nameEn":"Solar hot water"},{"id":"a12","icon":"📹","nameFr":"Vidéosurveillance ext.","nameEn":"Exterior CCTV"},{"id":"a13","icon":"🔒","nameFr":"Système d'alarme","nameEn":"Alarm system"},{"id":"a14","icon":"🔑","nameFr":"Self check-in (boîtier)","nameEn":"Self check-in (lockbox)"},{"id":"a15","icon":"✈️","nameFr":"8 min de l'aéroport","nameEn":"8 min from airport"},{"id":"a16","icon":"🏅","nameFr":"Superhost ★ 4.99 (149 avis)","nameEn":"Superhost ★ 4.99 (149 reviews)"}],"faqs":[{"id":"f1","qFr":"À quelle heure est le check-in ?","qEn":"What time is check-in?","aFr":"Le check-in est entre 8h00 et 21h00. C'est un self check-in via boîtier à clé - pas besoin de nous attendre sur place !","aEn":"Check-in is between 8:00 AM and 9:00 PM. It's a self check-in via lockbox - no need to wait for us!"},{"id":"f2","qFr":"À quelle heure est le check-out ?","qEn":"What time is checkout?","aFr":"Le départ est avant 11h00. Pour un départ tardif, contactez-nous à l'avance.","aEn":"Checkout is before 11:00 AM. For a late checkout, contact us in advance."},{"id":"f3","qFr":"Combien de personnes peuvent séjourner ?","qEn":"How many guests can stay?","aFr":"La villa accueille jusqu'à 6 personnes dans ses 3 chambres.","aEn":"The villa accommodates up to 6 guests in its 3 bedrooms."},{"id":"f4","qFr":"La villa est-elle proche de l'aéroport ?","qEn":"Is the villa close to the airport?","aFr":"Oui ! L'aéroport international Sir Seewoosagur Ramgoolam est à seulement 8 minutes - idéal pour les arrivées tardives et les départs matinaux.","aEn":"Yes! Sir Seewoosagur Ramgoolam International Airport is only 8 minutes away - ideal for late arrivals and early departures."},{"id":"f5","qFr":"La piscine est-elle privée ?","qEn":"Is the pool private?","aFr":"Oui, la piscine est exclusivement réservée aux occupants de la villa. Attention : pas de portail de sécurité, surveillance recommandée avec les enfants.","aEn":"Yes, the pool is exclusively for villa guests. Note: no safety gate, supervision recommended with children."},{"id":"f6","qFr":"Y a-t-il de l'eau chaude ?","qEn":"Is there hot water?","aFr":"Oui, la villa dispose d'un chauffe-eau solaire pour une approche écologique. Eau chaude disponible en continu.","aEn":"Yes, the villa has a solar water heater for an eco-friendly approach. Hot water available continuously."},{"id":"f7","qFr":"Le linge de maison est-il fourni ?","qEn":"Is household linen provided?","aFr":"Oui, le linge de lit et les serviettes sont fournis. L'utilisation du lave-linge est incluse sans frais supplémentaires.","aEn":"Yes, bed linen and towels are provided. Use of the washing machine is included at no extra cost."},{"id":"f8","qFr":"Y a-t-il des caméras de sécurité ?","qEn":"Are there security cameras?","aFr":"Des caméras de vidéosurveillance extérieure sont présentes sur la propriété et fonctionnent 24h/24. Elles couvrent uniquement les extérieurs.","aEn":"Exterior security cameras are present on the property and operate 24/7. They cover exterior areas only."}],"alerts":[],"pages":[{"id":"welcome","titleFr":"Bienvenue","titleEn":"Welcome","icon":"🏡","contentFr":"Bienvenue au P'tit Bouchon !","contentEn":"Welcome to P'tit Bouchon!","align":"center","valign":"center","image":"","video":"","type":"welcome"},{"id":"villa","titleFr":"La Villa","titleEn":"The Villa","icon":"🌊","align":"left","valign":"top","image":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png","video":"","type":"custom","contentFr":"Villa P'tit Bouchon - Face à la Mer\n\nFace au lagon, avec une vue extraordinaire sur la mer et la plage publique, cette superbe villa accueille jusqu'à 6 personnes dans ses 3 chambres et sa piscine privée.\n\n🏠 L'espace\nRez-de-chaussée : salon, salle à manger intérieure/extérieure, cuisine ouverte, WC, une chambre avec vue piscine.\n\nPremier étage : chambre master avec grand dressing, terrasse et salle de bain privative. Deuxième chambre avec dressing, WC et salle de bain. Toutes les chambres du 1er étage ont vue sur la mer.\n\nℹ️ À savoir\n• Piscine privée\n• Aéroport à 8 minutes\n• Vidéosurveillance extérieure 24h/24\n• Eau chaude solaire\n• Linge inclus sans frais\n\n⭐ Superhost - Note 4.99/5 · 149 avis","contentEn":"Villa P'tit Bouchon - Facing the Sea\n\nFacing the lagoon, with extraordinary views of the sea and the public beach, this stunning villa accommodates up to 6 guests in its 3 bedrooms and private pool.\n\n🏠 The Space\nGround floor: living room, indoor/outdoor dining room, open kitchen, WC, one bedroom with pool view.\n\nFirst floor: master bedroom with large walk-in wardrobe, terrace and private bathroom. Second bedroom with wardrobe, WC and bathroom. All first floor rooms have sea views.\n\nℹ️ Good to know\n• Private pool\n• Airport 8 minutes away\n• Exterior CCTV 24/7\n• Solar hot water\n• Laundry included free\n\n⭐ Superhost - Rating 4.99/5 · 149 reviews"}],"videos":[{"id":"drnyvgbvl","titleFr":"Visite du Sud ","titleEn":"Visit of the South","descFr":"","descEn":"","url":"https://www.youtube.com/watch?v=EkVJBHLL6lU"},{"id":"l23e21xed","titleFr":"Visite de L'Est","titleEn":"Visit of the East","descFr":"","descEn":"","url":"https://www.youtube.com/watch?v=z7btudLLyKI"},{"id":"7r6ut66c1","titleFr":"Visite de L'ouest","titleEn":"Visit of the West","descFr":"","descEn":"","url":"https://www.youtube.com/watch?v=s43NgECPXPQ"},{"id":"hkfsidmpl","titleFr":"Visite du Nord","titleEn":"Visit of the North","descFr":"","descEn":"","url":"https://www.youtube.com/watch?v=ZvB02aaC790"}],"villaPhotos":["https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/9a649f48-0524-4b61-8a22-551339452624.png","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/dd8ce4b6-f209-4f4a-b3a7-75210beffcd2.png","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/8118c41b-9ddc-41e4-a5bb-fcc376265c5a.png","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/d5d4fbd3-efd0-47f9-8d56-b685a1666e39.png","https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/48ca3363-09cf-41cf-88d8-982ef9f19d07.png","https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/4e1315c5-f830-4fdf-a0bf-3bcc8c465b10.jpeg"],"itineraries":[{"id":"i1","icon":"🏖️","nameFr":"Journée Plages","nameEn":"Beach Day","descFr":"Le meilleur des plages mauriciennes en une journée","descEn":"The best Mauritian beaches in one day","color":"#1b6ca8","steps":[{"timeFr":"8h","timeEn":"8am","textFr":"Petit-déjeuner à la Boulangerie Blé D'or (Plaine Magnien)","textEn":"Breakfast at Blé D'or Bakery (Plaine Magnien)"},{"timeFr":"9h30","timeEn":"9:30am","textFr":"Blue Bay Beach - eau cristalline, parc marin protégé (20 min)","textEn":"Blue Bay Beach - crystal water, protected marine park (20 min)"},{"timeFr":"12h","timeEn":"12pm","textFr":"Déjeuner au restaurant Les Copains d'Abord (vue mer)","textEn":"Lunch at Les Copains d'Abord (sea view)"},{"timeFr":"14h","timeEn":"2pm","textFr":"Snorkeling - Angel Cruises Speedboat aux îlets","textEn":"Snorkeling - Angel Cruises Speedboat to the islets"},{"timeFr":"17h","timeEn":"5pm","textFr":"Pointe D'Esny Beach - coucher de soleil magique","textEn":"Pointe D'Esny Beach - magical sunset"},{"timeFr":"19h30","timeEn":"7:30pm","textFr":"Apéritif sur la terrasse de la villa face au lagon","textEn":"Aperitif on the villa terrace facing the lagoon"}]},{"id":"i2","icon":"🌿","nameFr":"Nature & Cascades","nameEn":"Nature & Waterfalls","descFr":"Forêts tropicales, cascades et panoramas de l'Île Maurice","descEn":"Tropical forests, waterfalls and panoramas of Mauritius","color":"#2e7d32","steps":[{"timeFr":"7h","timeEn":"7am","textFr":"Départ matinal - pique-nique et chaussures de rando","textEn":"Early start - picnic and hiking shoes"},{"timeFr":"9h","timeEn":"9am","textFr":"Lion Mountain Trail - randonnée panoramique (2h30)","textEn":"Lion Mountain Trail - panoramic hike (2h30)"},{"timeFr":"12h","timeEn":"12pm","textFr":"Déjeuner à Mahebourg Waterfront","textEn":"Lunch at Mahebourg Waterfront"},{"timeFr":"14h","timeEn":"2pm","textFr":"Tamarind Falls / 7 Cascades - baignade naturelle","textEn":"Tamarind Falls / 7 Cascades - natural swimming"},{"timeFr":"17h","timeEn":"5pm","textFr":"La Vallée de Ferney - faune et flore endémiques","textEn":"Ferney Valley - endemic fauna and flora"}]},{"id":"i3","icon":"🍹","nameFr":"Rhum & Gastronomie","nameEn":"Rum & Gastronomy","descFr":"Culture mauricienne, rhum et saveurs locales","descEn":"Mauritian culture, rum and local flavors","color":"#c47a3a","steps":[{"timeFr":"9h","timeEn":"9am","textFr":"Mahebourg Market - fruits, épices et artisanat local","textEn":"Mahebourg Market - fruits, spices and local crafts"},{"timeFr":"11h","timeEn":"11am","textFr":"Bois Chéri Tea Factory - visite guidée + dégustation thé","textEn":"Bois Chéri Tea Factory - guided tour + tea tasting"},{"timeFr":"13h","timeEn":"1pm","textFr":"Déjeuner au restaurant Bois Chéri, vue panoramique","textEn":"Lunch at Bois Chéri restaurant, panoramic view"},{"timeFr":"15h","timeEn":"3pm","textFr":"La Vanille Nature Park - tortues géantes et crocodiles","textEn":"La Vanille Nature Park - giant tortoises and crocodiles"},{"timeFr":"18h","timeEn":"6pm","textFr":"Dégustation rhum mauricien à la villa","textEn":"Mauritian rum tasting at the villa"}]}],"categories":[{"id":"restaurants","nameFr":"Restaurants","nameEn":"Restaurants","icon":"🍽️","color":"#e07b54","items":[{"id":"5u99mtyl","nameFr":"Tasty Wave Restaurant & Shop","nameEn":"Tasty Wave Restaurant & Shop","descFr":"Cuisine mauricienne et internationale dans un cadre décontracté face à la mer. Fruits de mer frais et cocktails maison recommandés.","descEn":"Mauritian and international cuisine in a relaxed seafront setting. Fresh seafood and homemade cocktails highly recommended.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4649777,57.6790912","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyBmQXKbFtl6_aR5WuJee_L5-rJCazgpkrG2uTET3T40HofC7OUVPsw5iL1313GMGQuAkOWLp-6l-mAtNu8s88RDvnWnBM0-ScW9MRYikUnIdFx9Qts7OTnwJafcJdtXfHqpN7WXd6wIdt484NW_aHA0C5SvHvi0I_4D7ocWy9fneH0O2C8Or0ISvF9E_t9TTl76IJZE-o794sHA-FkVsIua1FtfLyTmD28F3RYHKq-joBKz2H-COykZYA?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"rg1vbsp4","nameFr":"The Viking Resto","nameEn":"The Viking Resto","descFr":"Restaurant populaire de Mahebourg proposant une cuisine locale généreuse. Poissons grillés et currys mauriciens à prix abordables.","descEn":"Popular Mahebourg restaurant offering generous local cuisine. Grilled fish and Mauritian curries at affordable prices.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4675284,57.6803021","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx5rCpRT-I_if-0nrnxyyjb11hhSNAz2K8qN7JxegPHvPnzs4joKdzkj6XkCsIxV8FzH4PE0R5k9jESEO4RTnmzsFQkP2uA9nigjWY0j5F7sZTCcWk-u2fueJNpcnU2o9zQ7FkOvh0oEFDl41x0WLemYrv7xdKZCEHI7LgBVzQ79MxPB5Blwhy85Phi1cB19mkLY6NL3fHB?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"j0dj5hsa","nameFr":"Blue Bamboo","nameEn":"Blue Bamboo","descFr":"Ambiance asiatique fusion dans un cadre soigné. Cuisine sino-mauricienne raffinée, idéale pour un dîner en amoureux.","descEn":"Asian fusion atmosphere in a refined setting. Sophisticated Sino-Mauritian cuisine, ideal for a romantic dinner.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4398928,57.7224388","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwggWhYGphFqQ-kTvo1tO6WWEDxWhb1nxfdc--WjFhHwcuXQej-yBUvmaq8lZ6u4V1VlWkbZm0GU6_XnlslXpr-HnSuiXwLphGEAVy4kmcBBb9h7u3QW_aR1jvNIMb8CZ7DjSOzDRW7jMkC3SazVRutdjalBz2aHib5DIsWjz0kVt7GkOnfnbnVyMx9UdsEFVX9FiSXkR47QQ?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"o958lxwv","nameFr":"Les Copains d'Abord","nameEn":"Les Copains d'Abord","descFr":"Restaurant emblématique de Mahebourg avec vue sur le lagon. Fruits de mer frais et cuisine créole authentique dans une ambiance conviviale.","descEn":"Iconic Mahebourg restaurant overlooking the lagoon. Fresh seafood and authentic Creole cuisine in a warm atmosphere.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4086472,57.7099861","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyfMZLsa7k3VLL9aby6kvAKde6YmjwK0EMbw94VjEiv2ZR5gAVWtxSrxALMqcEvGNk-WJ_9BFjJaFakxCGYE7pGDojqfmGL3HSN7bFNbGzSxbYxZlDIw6yWdk1xxAaK1qYojDKTOo1Tt-ai-DQNjkfPr32hUpgCL73IlIYPhz26bnSdlWRrlmiPdc1A3wlLDjFGs8z32CYH?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"r9w1hp3m","nameFr":"Le Bazilic","nameEn":"Le Bazilic","descFr":"Cuisine créole et internationale dans un cadre tropical luxuriant. Steaks, grillades et spécialités locales dans une ambiance chaleureuse.","descEn":"Creole and international cuisine in a lush tropical setting. Steaks, grills and local specialties in a warm atmosphere.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4078267,57.7072607","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxOl16mlKVeLo0il8UHjsaZKBwP4Xi_aNOwitllmKgzm7e6tmNOQzkZ5gr7jiagsE4ttETo8FnjI1oNI3nS_E-TaqjeBGbZjgUVUbTugLKrXag64A-l22TKZ3SnbRzqFX4qF0iP-lHeZrjnDktEIItsO22eudT7fGCc2MdsdE5BHNFTkkQ-_DBJh1B1xWDb5Sq7dWaJOV-F0Q?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"t2uqho27","nameFr":"Taste of Freedom","nameEn":"Taste of Freedom","descFr":"Restaurant animé avec une carte variée, burgers et plats mauriciens. Ambiance festive et service décontracté.","descEn":"Lively restaurant with a varied menu, burgers and Mauritian dishes. Festive atmosphere and relaxed service.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4200524,57.712124","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwM87jqemKHhbZKbjqXCxMskmSziXuJc8bwwhnPXrfuFVgV6jMQeXJdBiuAZF_P2erXMhGx-oUyXg4RyPRiQeqxM_WcxFoTZ8OK8nx4GXA8CUToHFYo9d8GHoAiDmcRYKe1x9S_X5zldrslpft6bCGoYTChbmIPwwI9H08m_XAN3qDcZdz1EsdxiEcci42nPuFP_-19XOlraHuLKBskMiDjg__ES_2Mct56BeO-qcIJRAoQ69h3oFiHQW0?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"xbxuy9m4","nameFr":"Le Jardin de Beau Vallon","nameEn":"Le Jardin de Beau Vallon","descFr":"Dîner romantique dans un jardin tropical exceptionnel. Cuisine mauricienne et internationale raffinée dans un cadre enchanteur.","descEn":"Romantic dining in an exceptional tropical garden. Refined Mauritian and international cuisine in an enchanting setting.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4247573,57.7011188","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwBFW6c5b57W2hEMTSyoxYHNK9fpeveYl07p4vHfOn91FT_yuxse_3DZ0X_iZJT99B0oLUrhCFvkT60kEVAbKHCNsUFGJAw77dPQvULaB1ujRcHs1rNWa0guscE8dxVfuwBKvMpUG03dpN5H8em7__4oRkTQF5Nl_HhmGOlJLIlOt6UegGl7gsGe2KGetqMRt1IlqljUDMyi8o-0kgebnzAEK94TVp58jHrTITh98gyh5JRMbOuC_c2How?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"yu099poo","nameFr":"Casse Croute","nameEn":"Casse Croute","descFr":"Petit restaurant local sans prétention pour goûter la vraie cuisine mauricienne. Mine frite, bol renversé et dholl puri maison.","descEn":"Unpretentious local eatery to taste real Mauritian food. Fried noodles, bol renverse and homemade dholl puri.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4063472,57.7074128","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gze-OLA1vXb_IokFkhZ_Jf_mbM5qdNizUSBhT0NKGTfMawO1E7onvOs_6_ugWReDHRWdRm_0XNE3pRuGUVoCRZZz_iniZbPT2D09WNzICbsYK3kcdpNb_vk5xwH3IXESazNXVylBKrYP2kd644MhmUZZ3iriJOI6i5IqR34vgIjbC6dWeIyveAPKWPy0HtqtiRzWXYDzz62?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"uhurw6i7","nameFr":"Esco Burgers","nameEn":"Esco Burgers","descFr":"Burgers artisanaux généreux et frites fraîches. Concept street food moderne dans une ambiance jeune et décontractée.","descEn":"Generous craft burgers and fresh fries. Modern street food concept with a young, relaxed vibe.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4431869,57.7175653","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwrHGKH4NH6Az0ZBF-v1r_fzq3PjZyPnNN8O4aZapJV1imENY-5zgPmvPLBqVQ1C-qVEt-HSIemg16sfIdHRuTSHWATLbLg5r5qeSnJEuVA76NiOoUtCXd7WcYa1A0RF--q5q8a-L14mV36JqZO3DlhgJFUveH1LUPBXKHMiyfeNm_UAnp0qNyMi18zvbC8LxNTjHAUuuiv?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"c4hxn8yz","nameFr":"Kot Nini Pizza & Delivery","nameEn":"Kot Nini Pizza & Delivery","descFr":"Pizzas artisanales avec livraison disponible. Idéal pour une soirée tranquille à la villa.","descEn":"Pizzas artisanales avec livraison disponible. Idéal pour une soirée tranquille à la villa.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4086937,57.708871","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GztArj-_q0ZXDMxZrBTlbMfYGSgdLbgE_5QTBbMSxmakOJWn7c32sVNx_T_cwWrhdV4alw1E6beILbTbjDRhM7McPLPh3MGZQmYZ_nEy7mF3HntE2gIYw_0LrphGe2MV0srvLS8EqqR-2YfmuBcNjqC40NG3448ZzfrISvTjtFY1Rt5tvkYX8NDGhLEH4Aql2G-4QnsvshX?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"pb3e3c1g","nameFr":"Ferney Falaise Rouge Restaurant","nameEn":"Ferney Falaise Rouge Restaurant","descFr":"Restaurant niché dans la vallée de Ferney, cadre naturel exceptionnel. Cuisine créole et grillades dans un environnement verdoyant.","descEn":"Restaurant nestled in Ferney Valley with an exceptional natural setting. Creole cuisine and grills in a lush green environment.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.38372,57.7027746","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwRhGTClhlmODONm7YZEOc7xMXviXYEVeGk4iGeZRwNz7Dqi_2h1vMT4D5SEhsTEq_4JOiSdQm0S82l1KAlvGaYcJz7Klmhzp0mAiycqKm4lq_A5M2ZDlqZLYEjIYKcJZwha5O2vgaK3A49cUB47VIA8FaedLPQdDOoqM7qv8pLYBQ-FA6r2NEqLhA7vWnSpyAgSdEBHmlg?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"tvp0mhja","nameFr":"Chez Patrick","nameEn":"Chez Patrick","descFr":"Restaurant familial très apprécié pour ses fruits de mer frais et sa cuisine mauricienne authentique. Service chaleureux et prix raisonnables.","descEn":"Highly regarded family restaurant known for fresh seafood and authentic Mauritian cuisine. Warm service and reasonable prices.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4147416,57.7048917","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyNAV-_8S8DUTlSp98qxNsat1XRbCdRFaQ2A5uGzIYWj742WULylFiKvZt3Wp2hvpteTKL5NkA1OJ1c94NL575ajIWmoTGPWgDkil7ZAQw7tfN3XwZE3ldYwTAiPQ0Io1Dch_v8SRD0k_LBht_dK8nRQpe3suFYxtrC8awXmmvCNiGdMghO3SIv7u37Ko_oZqTIbLfa7OgOkS9rrplsrleGsxED3iiRoy5r1REAJPTe3QbBLYgCowuVSDg?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"kohwiumx","nameFr":"Saveurs de Shin","nameEn":"Saveurs de Shin","descFr":"Restaurant sino-mauricien proposant spécialités chinoises et créoles. Cadre simple, portions généreuses et saveurs authentiques.","descEn":"Sino-Mauritian restaurant offering Chinese and Creole specialties. Simple setting, generous portions and authentic flavours.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4089579,57.7092873","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzPKko6lVFBfhU1nNO8OLeo-1YvKlWVEkb8KOAWC9sHUts6XlD8sYOLmHer1cVC9g2jXPyWqIV-bQSweQUmWeuYGLCp85ivh_f3Zwbf91D9cayyN5MkKo55ZONeUlAREJBSHctc0Q5Ox5ZLDbzJgkgclOicigPhPm-Wu3t6YzCBGBmV6tPxIREghZ92eoaOdV4u4r5guhl2?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"zojlgm9o","nameFr":"Nayaz Briyani","nameEn":"Nayaz Briyani","descFr":"Le meilleur briani de Mahebourg selon les locaux. Cuisine halal, riz basmati parfumé et viandes mijotées.","descEn":"The best biryani in Mahebourg according to locals. Halal cuisine, fragrant basmati rice and slow-cooked meats.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4317525,57.6591153","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxY-GJVjKgIxMZrVBlysN85vDe9GFotOi_FE5Dd-ipd_p9gjyNTKADCEAAvNb7N3c5_VQpRtq7PapHGDRrK39omcFC5EtHoZTmimBgRoReoDIf2xBCwPgF8EzrEYFUvfIS43FQb1x-eywU4ok6CNDcUsuSFJ88mxOPjXcSDgtqpyHvoif_XhyaxKz96pvuWLOe9yRwyo0_z?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"yehbhqrx","nameFr":"Bois Chéri","nameEn":"Bois Chéri","descFr":"Restaurant panoramique au coeur des plantations de thé. Vue imprenable sur le sud de l ile et cuisine mauricienne raffinee.","descEn":"Panoramic restaurant in the heart of the tea plantations. Breathtaking views over the south of the island and refined Mauritian cuisine.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4281959,57.5223388","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxximfaEcSAB7yxgorGADnKtNTdJY8ic5TyT45OIKkOZWLtegwV0-z9USzsDIy65wa1Cj3rAREh3gxamSap8YTK-ac6msV8vNY_vmKYO3IcTee4ZacD3YcUdBYgwXKvdsaiioP6fbv3YxHUkXOsfoLFHADxnXGi8_MWFWaDnQIJAXjcNun5q2-RPKCo5hiizJiYXRWYPU_FyFq0EFwoUXVIjihEUXD_q_RXpWw4q-C00znuHRmbLM7Unek?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"6i349gef","nameFr":"Shandrani Beachcomber Resort & Spa","nameEn":"Shandrani Beachcomber Resort & Spa","descFr":"Resort 5 étoiles tout-inclus sur une presqu'île privée. Plusieurs restaurants gastronomiques, plages privées et spa de luxe.","descEn":"5-star all-inclusive resort on a private peninsula. Several gourmet restaurants, private beaches and luxury spa.","address":"Le Chaland","phone":"+230  603 4100","mapLink":"https://maps.google.com/?q=-20.4487013,57.7066407","image":"https://lh3.googleusercontent.com/p/AF1QipPIWVu287gD-kND9LwKeUqaMO5UtO8BBKIqxZF5=s1360-w1360-h1020-rw","distance":"","priceLevel":"","openHours":"Breakfast / Petit-déjeuner : 06h00 – 10h00 Lunch / Déjeuner : 12h30 – 15h00 Dinner / Dîner : 18h30 – 21h30"},{"id":"pivrbetw","nameFr":"Constance Le Chaland Resort & Villas","nameEn":"Constance Le Chaland Resort & Villas","descFr":"Resort de luxe contemporain face au lagon de Blue Bay. Cuisine internationale raffinée, villas avec piscine privée et spa.","descEn":"Contemporary luxury resort facing the Blue Bay lagoon. Refined international cuisine, pool villas and spa.","address":"Le Chaland, Blue Bay Marine Park MU, Plaine Magnien 51510","phone":"+230 651 5000","mapLink":"https://maps.google.com/?q=-20.4514196,57.7003115","image":"https://lh3.googleusercontent.com/p/AF1QipM6jj1KNyfW5sV309yeVsvRQFp1rleRdKTsx9Y6=s1360-w1360-h1020-rw","distance":"","priceLevel":"","openHours":"Dej / Lunch: 12.00 pm – 03.00 pm Diner / Dinner: 7.00 pm – 10.00 pm"},{"id":"xh41dkrt","nameFr":"Restaurant Le Bougainville","nameEn":"Restaurant Le Bougainville","descFr":"Restaurant créole avec terrasse vue mer et ambiance authentique. Spécialités de poissons grillés et currys locaux.","descEn":"Creole restaurant with sea-view terrace and authentic atmosphere. Grilled fish specialties and local curries.","address":"Route Coastale, Blue Bay","phone":"+230 631 8299","mapLink":"https://maps.google.com/?q=-20.4446519,57.7179472","image":"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/79/56/e1/caption.jpg?w=1400&h=800&s=1","distance":"","priceLevel":"","openHours":"10h -22h - Close on Wednesday / Fermer le Mercredi"},{"id":"dkl5ff57","nameFr":"McDonald's Beau Vallon","nameEn":"McDonald's Beau Vallon","descFr":"McDonald's dans le centre commercial de Beau Vallon. Repas rapide et accessible pour toute la famille.","descEn":"McDonald's at Beau Vallon shopping centre. Quick and accessible meals for the whole family.","address":" Royal Road, Bo'Valon Mall,52201","phone":"+230 630 0603","mapLink":"https://maps.google.com/?q=-20.4240075,57.6988851","image":"https://lh3.googleusercontent.com/gps-cs-s/APNQkAEJdEQSW8TNTu706C-ME7_GYmUIrCQnH8XdFrJjU7moMM2Og6CcA7rMaW24aakMPdSoc_NpJDHopH2fpzuUpL7zqE9y9Ba47wfiOQCVvlXHFABa4cTmOk9k1CGFMt6xw9AHfxRVNV6Lyos=s1360-w1360-h1020-rw","distance":"","priceLevel":"","openHours":"9h - 22hr"},{"id":"k4j67zpn","nameFr":"KFC Mahebourg","nameEn":"KFC Mahebourg","descFr":"KFC au coeur de Mahebourg. Poulet croustillant et menus rapides pour toute la famille.","descEn":"KFC in the heart of Mahebourg. Crispy chicken and quick meals for the whole family.","address":"Corner Hollandais MU, Rue Marianne, Mahebourg 50810","phone":"+230 432 1612","mapLink":"https://maps.google.com/?q=-20.4064426,57.7081528","image":"https://media.istockphoto.com/id/1747786443/photo/kfc-restaurant-in-mahebourg-mauritius.jpg?s=170667a&w=0&k=20&c=paD4PdkwuAUqIjv375aMhW-gzozTRaUYjl_m4KmPigM=","distance":"","priceLevel":"","openHours":"Monday/Lundi au Sunday/Dimanche : De 10h00 à 21h00"},{"id":"2sez6c74","nameFr":"l'Ajoupa Pub - Restaurant","nameEn":"l'Ajoupa Pub - Restaurant","descFr":"Là où les cultures se rencontrent & les bonnes vibes s’épanouissent\n\nInspiré par un mélange vibrant de traditions africaines, françaises, espagnoles, amérindiennes et caribéennes, LAJOUPA n’est pas seulement un endroit où manger — c’est un lieu où l’on ressent une véritable ambiance.\n\nAu Bar Corner, savourez de puissants cocktails au rhum pendant que les rythmes afrobeat et latins font vibrer l’espace.\n\nLes espaces lounge chaleureux, décorés d’éléments tribaux et de verdure luxuriante, vous invitent à vous détendre sous des lumières tamisées, entouré de bonne compagnie.\n\nEn cuisine, les épices riches rencontrent les fruits de mer frais, les viandes mijotées lentement et les saveurs grillées au feu — un hommage à des siècles de tradition créole, réinventée pour aujourd’hui.\n\nQue vous veniez pour danser, vous relaxer ou vous régaler, LAJOUPA vous offre une expérience de culture, de partage et de célébration.\n","descEn":"Where Cultures Collide & Good Vibes Thrive\n\nInspired by a vibrant mix of African, French, Spanish, Native American, and Caribbean traditions, LAJOUPA isn’t just a place to eat — it’s a place to feel.\n\nAt the Bar Corner, sip bold rum cocktails while Afrobeat and Latin rhythms fill the room.\n\nChilling Lounges with tribal decor and lush greenery invite you to unwind under soft lights and great company.\n\nFrom the Kitchen, rich spices meet fresh seafood, slow-cooked meats, and fire-grilled flavours — echoing centuries of Creole tradition, reimagined for today.\n\nWhether you're here to dance, relax, or indulge, LAJOUPA brings you a taste of culture, community, and celebration.","address":"Rue du Souffleur Mahebourg, Mauritius","phone":"+230 5290 1268","mapLink":"https://maps.google.com/?q=-20.4102622,57.7098741","image":"https://onestophalal.com/cdn/shop/articles/beef_samosa-1697330921061_1200x.jpg?v=1697330957","distance":"","priceLevel":"","openHours":"Mon to Tue,Thur to Sun：18:30-22:30  - Wed：Closed all day "},{"id":"e41jy9ge","nameFr":"Avalon Golf Estate","nameEn":"Avalon Golf Estate","descFr":"Domaine de golf haut de gamme dans un cadre tropical. Parcours 9 trous et restaurant avec vue panoramique.","descEn":"Upscale golf estate in a tropical setting. 9-hole course and restaurant with panoramic views.","address":" Bois Cheri Road, Bois Cheri 60203","phone":"+230 430 5800","mapLink":"https://maps.google.com/?q=-20.4369266,57.5141254","image":"https://avalon.mu/wp-content/uploads/2020/05/Fotolia_176339213_Subscription_Monthly_M-compressor.jpg","distance":"","priceLevel":"","openHours":"WEEK DAYS 8h30 - 16h30 - WEEKEND 07:30 AM to 5:30 PM"}]},{"id":"plages","nameFr":"Les Plages","nameEn":"Beaches","icon":"🏖️","color":"#1b6ca8","items":[{"id":"9xpsj165","nameFr":"La Cambuse Beach","nameEn":"La Cambuse Beach","descFr":"Plage sauvage et préservée face au lagon turquoise. Idéale pour se baigner loin des foules, avec une vue imprenable sur l'horizon.","descEn":"Unspoilt wild beach facing the turquoise lagoon. Perfect for swimming away from the crowds, with stunning views to the horizon.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4534568,57.6995888","image":"https://cdn.getyourguide.com/img/location/5d30467254bdd.jpeg/99.jpg","distance":"8 minutes","priceLevel":"","openHours":""},{"id":"e0qvml9z","nameFr":"Shandrani Beach","nameEn":"Shandrani Beach","descFr":"Plage cachée 5 étoiles bordée de filaos, aux eaux calmes et cristallines, offrant un cadre tropical exceptionnel.\nSituée devant l’hôtel Shandrani Beachcomber Resort & Spa, cette plage séduit par son atmosphère paisible et préservée. Le sable fin, les nuances turquoise du lagon et l’ombre naturelle des filaos créent un décor idyllique, parfait pour la détente, la baignade et les couchers de soleil tropicaux. Protégée par le récif, la mer y reste généralement calme, idéale pour profiter pleinement de la beauté authentique du sud-est mauricien.","descEn":"Hidden 5-star beach lined with filao trees, featuring calm crystal-clear waters and an exceptional tropical setting.\nLocated in front of Shandrani Beachcomber Resort & Spa, this beach charms visitors with its peaceful and unspoiled atmosphere. The fine white sand, turquoise lagoon, and natural shade from the filaos create an idyllic backdrop, perfect for relaxation, swimming, and tropical sunsets. Protected by the coral reef, the sea remains calm most of the time, making it an ideal spot to fully enjoy the authentic beauty of southeastern Mauritius.\n","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4453272,57.7029955","image":"https://q-xx.bstatic.com/xdata/images/hotel/max500/270756106.jpg?k=d062c68866f40c3b635075bf0b8d1a46f5fea8bbb7a767b111577981fb323a37&o=","distance":"8 minutes","priceLevel":"","openHours":""},{"id":"51dynmfh","nameFr":"Blue Bay Beach","nameEn":"Blue Bay Beach","descFr":"L'une des plus belles plages de l'Île Maurice, aux eaux d'un bleu lagon extraordinaire. Porte d'entrée du parc marin protégé.","descEn":"One of Mauritius's most beautiful beaches with extraordinary lagoon-blue waters. Gateway to the protected marine park.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4441928,57.7164692","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzilvNpqAUTreFEc7rLqQ5X3DIzCI7LyQVtzMqcbomUZW1K5o1B8tBPkee4uO3k18sDU7qaWmIO_Ik4E6UTHcWQ5b-7K0Xu8Jvzaqs6rUZBYPddYns_5WRSsSotv85Le2ufwOyi61Ux2p7vGyB_lh_EL_02EcO40BAI7FT11fXURKKNUksFY2164lsXhQli94O10vk7wAu-?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"jtal4nlj","nameFr":"Pointe D'esny Beach","nameEn":"Pointe D'esny Beach","descFr":"Plage tranquille classée parmi les plus belles de l'ile. Couchers de soleil magiques et eau transparente.","descEn":"Plage tranquille classée parmi les plus belles de l'ile. Couchers de soleil magiques et eau transparente.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4265134,57.7263732","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzcIXjZtLhSMGzk3unzYOhdUft828au4WPQ8AViox0biCm8QyOfPLRW3jYh5g68IZhqm3X8U8r6Jdfjawh9OHTgfyjoY5wZIFFPGNon7376e8p3OBhzmk5fXkrtwYswpKrZq7Qo6Twj5y1QZiUiMA2qBFkHaiQgj73HnG7FmHkrlq1NKUVylkhX--MlPq4hNFHJ1w4OjkLd?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"533il2qg","nameFr":"Pomponette Plage Publique","nameEn":"Pomponette Plage Publique","descFr":"Plage publique authentique dans le sud de l'île, prisée des locaux. Sable blanc, eau calme et ambiance détendue.","descEn":"Authentic public beach in the south of the island, popular with locals. White sand, calm water and a relaxed atmosphere.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.5164027,57.4766148","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxCGtrkauBvskq-06pWWSw-4PnCcq3r1BXaAVwCHAUlcaUNoKK2Kl9Xxydkmfw-RFusDShBpvbv1SRAyNKuMxaIvbIXbmzjPCA19O2VqelKrKjNKxqwsQf1EXtSI-fhaaJDiymg1SIfpHlfIHKNpNBWKL81awtoM847venye-bjNX_0UZT7aXHqbystujXaKrGAU4zhFlS6Kw?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]},{"id":"supermarches","nameFr":"Supermarchés","nameEn":"Supermarkets","icon":"🛒","color":"#2e7d32","items":[{"id":"25vii6um","nameFr":"Bo'Valon Mall","nameEn":"Bo'Valon Mall","descFr":"Centre commercial moderne avec supermarché, boutiques et restauration rapide. Idéal pour vos courses à Beau Vallon.","descEn":"Modern shopping centre with supermarket, shops and fast food. Ideal for your shopping in Beau Vallon.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4239324,57.6976711","image":"","distance":"","priceLevel":"","openHours":""},{"id":"hdpvyt7v","nameFr":"Winner's Plaine Magnien","nameEn":"Winner's Plaine Magnien","descFr":"Supermarché bien achalandé à quelques minutes de la villa. Large choix de produits locaux et importés.","descEn":"Well-stocked supermarket a few minutes from the villa. Wide choice of local and imported products.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4310008,57.6658883","image":"","distance":"","priceLevel":"","openHours":""},{"id":"4s7zh9ih","nameFr":"Small Shop / Petite Boutique","nameEn":"Small Shop / Petite Boutique","descFr":"Petite épicerie de proximité pour les achats de dépannage. Boissons, snacks et produits essentiels.","descEn":"Small convenience store for emergency shopping. Drinks, snacks and essential products.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4627449,57.6785882","image":"","distance":"","priceLevel":"","openHours":""},{"id":"fssqpdgc","nameFr":"London Way","nameEn":"London Way","descFr":"Boutique locale proposant produits alimentaires et articles divers. Pratique pour les petites courses rapides.","descEn":"Local shop offering food products and various items. Convenient for quick small purchases.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4175219,57.7100261","image":"","distance":"","priceLevel":"","openHours":""},{"id":"e4wrj7hm","nameFr":"Market / Bazar","nameEn":"Market / Bazar","descFr":"Marché local animé avec fruits, légumes et épices frais de Maurice. Ambiance authentique et prix imbattables.","descEn":"Lively local market with fresh Mauritian fruits, vegetables and spices. Authentic atmosphere and unbeatable prices.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4070303,57.7078519","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyOZcoF3DUsaq4Z4boHQLr81DggZY-0BbiZoEsXCTc77kgUUIfQddQ_e8ZSfcy3MxCEoU1Zf2b8Z5yvy5n8gZHRIplw-ZcH8FluGp8-AKzMT2UqBVtumxakkPC7d8REVZ5TU38tudGZ4CCBqaS9L5Y_3rQAjqs7dZEFz9wOcKPdg5IsV7r5GTdx8dJCd9hzVyeIc8y1j7G6?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"bzh4bdpq","nameFr":"Shopping Market","nameEn":"Shopping Market","descFr":"Supermarché de quartier avec bon choix de produits alimentaires locaux et importés.","descEn":"Neighbourhood supermarket with a good selection of local and imported food products.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4067477,57.708482","image":"","distance":"","priceLevel":"","openHours":""},{"id":"oc1800kl","nameFr":"Loyeung Supermarket","nameEn":"Loyeung Supermarket","descFr":"Supermarché sino-mauricien bien fourni avec spécialités asiatiques. Produits frais et épices exotiques.","descEn":"Well-stocked Sino-Mauritian supermarket with Asian specialties. Fresh produce and exotic spices.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4098151,57.7094238","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxWdxncA54G3oSD2IxTFHOlvYjn3KnwriGDZpipnYkl2M6PorxK6E6O0EtR2d8-eWuIxNMJ4rstzgGNim3KMr0sLHzWDVNirv_4vYJqvZWaNsN2TwHVz1hUGwWl_0bbUpYQ2ROlk0a1pt6eK9dr0NR9i8f3TIW_QdBhFssB615ZyzADvKreDk0AEAZGL9ybB-lHA1s-WVeKaXsnqVePoEe7UngwGbZuAXXSbC5cXfhHSSvS37A0DBR6DaE?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"zk1xorej","nameFr":"Plaisance Shopping Village","nameEn":"Plaisance Shopping Village","descFr":"Centre commercial proche de l'aéroport avec grandes enseignes. Pratique pour les dernières courses avant le départ.","descEn":"Shopping centre near the airport with major brands. Handy for last-minute shopping before departure.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.400411,57.598659","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gwx6ueT483tfsPSwDea-GjRIxGzaNM2ldAFYTkAt087c-l6OSPXV8eMNyW5Mt2TX99sDLWki9qbnpMzerg99meT_p_b3lJoBXrylKZEThUouWDsh7lbBKa5Kdx4VbO8qsnLnL1S6QqQfbXi6q9zEs2xYeoTqiFWTN220Ykn2OM6a2fNCpAX8O-OA8yeH9a2vVPqnCuGIjixHg0hxEyK08QfQ63WFa-gbD-ODYeIFNRqc4VN5Ig66iO7UJM?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"10rdqodt","nameFr":"Intermart - Rose Belle Mall","nameEn":"Intermart - Rose Belle Mall","descFr":"Grand supermarché dans le mall de Rose Belle. Vaste choix de produits, boucherie et boulangerie.","descEn":"Large supermarket in Rose Belle mall. Wide product range, butcher and bakery.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.3989692,57.5980038","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxeMRUe_bJss4tYjtCjAd72OlVl-eYsl-cMlYVNlCm2dLh-r5ExZ3_flI4Qx12ebPF7PdglytUBd2BO7c0ir0qBObGv9m2T4FtYjvjDv1-dWLHdDhKavZtF3C9v39egaEl_OTbOc3dVnoxENvsCTIAdWggmidO0b30VVAD__Rc5ne85exBABTZqBVEOXTA4CbnB34BwQ3NR410d_TGzDW0oY5SgAleSrazOeWk7vg-8xCqYfkv-zHzLIwU?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]},{"id":"activites","nameFr":"Activités","nameEn":"Activities","icon":"🤿","color":"#7b5ea7","items":[{"id":"ahmyl2ka","nameFr":"Angel Cruises Speedboat","nameEn":"Angel Cruises Speedboat","descFr":"Excursions en speedboat vers Blue Bay, Ile aux Cerfs et les ilots. Snorkeling, barbecue sur plage privée et observation des dauphins.","descEn":"Speedboat excursions to Blue Bay, Ile aux Cerfs and the islets. Snorkelling, barbecue on a private beach and dolphin watching.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4473342,57.7060676","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx2LWFmOktOE9EAuEiEiVIBMu7o0ZtVSgkolRsvc-Q7acdpjhb7wOnM_Akvo5Fcm_s3r9yErAdiNQf3VeuND46iu2mlsAIcdFrxX8RNei9tiMnv-Y1nbo4QIkVu4ImiYOI4jM03erG_Z8vSC0QSca94Re1nqqUsHfyX35RydViVg0CFOfeFkC_4irstoHF0-FUvz9tobZULWg?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"h72cpgat","nameFr":"Quad Bike - Pont Naurel Quad Bike","nameEn":"Quad Bike - Pont Naurel Quad Bike","descFr":"Aventure en quad à travers les champs de canne à sucre jusqu'au Pont Naturel. Sensations fortes et paysages sauvages.","descEn":"Quad bike adventure through sugar cane fields to Pont Naturel. Thrills and wild landscapes in the south.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4533487,57.6799323","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzexASM1bw7ivdxISByJ87eyqWhLHH6DBCa2KiYtbaxeTMc0UEWBfLfu7QAr1Mjo1yVq_4QGEPfnPWkSnkCB3Nhhmcf30Pqscip7vEtHTTsCESe1cawhwHh7khIc2VQhRSINI70NpaDuFUuTJ5vW67AlmUkAwhSnuMDI3845xRNhssqN1Ugs265AjZPLEcMMC8H8Mf2JeL8dw?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"o5xghn2r","nameFr":"DS Adventures","nameEn":"DS Adventures","descFr":"Activités d'aventure et excursions sur mesure dans le sud de Maurice. Randonnées, kayak et découverte de la nature locale.","descEn":"Adventure activities and tailor-made excursions in the south of Mauritius. Hiking, kayaking and local nature discovery.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4513559,57.6514577","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyxWuQ0yzAfvQjaDJNcHqjXVaN77y6tZKG9mctPciJbyL33w36DyuvPaBn89NGiobdM9YzuCQHCyav9dLsoiIo6FJnXB8DXLUUYKMtsppipH6urq2-_AIvV9la26DtpuHzCn9echXQJRKK9SEKv3IaoR-BHZeW05tQMVjxrKMGGKPQbA1rFehrrpKXFkIpT5d0kru1TkYwR?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"ltzoq45z","nameFr":"Specialised Kiteboarding","nameEn":"Specialised Kiteboarding","descFr":"Ecole et club de kitesurf dans les meilleures conditions de vent de l'ile. Cours débutants et location de matériel.","descEn":"Kitesurfing school and club in the island's best wind conditions. Beginner lessons and equipment rental.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4200943,57.7209395","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyhrL2miylmCvFC3UCQXPmM41YNS0W0u19yQTqahNXPpdxjJrAPz4HAsKa0uJofTcaEWi1P_OBWVFeD_0H0fgDdmgk4Uljt3tqpEGVgOV3sYAczNAKd1fkA8hugM7dGfn-G6O9FtQELFt0OM-r4DFxi8qB-kTtcFLN48KM2dLZPrB37AWmaOcAhhvcZaQade__zKOjU1RqV?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"ibrtyy74","nameFr":"Avalon Golf Estate","nameEn":"Avalon Golf Estate","descFr":"Domaine de golf haut de gamme dans un cadre tropical. Parcours 9 trous et restaurant avec vue panoramique.","descEn":"Upscale golf estate in a tropical setting. 9-hole course and restaurant with panoramic views.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4369266,57.5141254","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxoPiUSG5iqg3eJ4Hyt0HUr39VLoTRJRl55zFaG-XVcBdV__c3jWcsB1fU6X0Vy35kBJIdfQC9xo3tz6Q0OABMmx_I0K3uTzG6R9HzLIiuw0l18TqBnHkz6-41XKycWmDkpGcrV16BstZdIyRAgyYuOim-CUIwFhHLS0jVavGtqlG8kKBPEjL07mHNjtQ9DLQfsQwyndnPBjVTbLCuQe0x4hi_jx1NkAxpYUniYpr-5Ms3ZkeG_Lv6XWKQ?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]},{"id":"voir","nameFr":"Les Endroits à Voir","nameEn":"Places to See","icon":"👁️","color":"#f0a500","items":[{"id":"juu1gw72","nameFr":"Pont Naturel","nameEn":"Pont Naturel","descFr":"Arche naturelle spectaculaire sculptée par l'océan dans les roches volcaniques du sud. Site géologique unique et sauvage.","descEn":"Spectacular natural arch sculpted by the ocean in the volcanic rocks of the south. Unique and wild geological site.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.480442,57.6693878","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwhPxxwYCnkabBPX35-hak3r_NAj5Jsl2l366ZF1E_b8qiIZgESeJrUaVQnPVKQp9KaheDpPwFc3BZgIE9IW0fMERoIIZLQ11XuFIgV9B8pH_tR8qWO6t9LdghTq418yypxeDDy3U5r_zzkYiBUPT_y2WOERVOd4GRJi3OmJlX5ycgd0OQ4gA4LGtzNij3WmhDmVxS7TcQH?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"clm2cndx","nameFr":"Blue Bay Marine Park","nameEn":"Blue Bay Marine Park","descFr":"Parc marin protégé avec 38 espèces de coraux et 72 espèces de poissons. Idéal pour le snorkeling et les balades en bateau à fond de verre.","descEn":"Protected marine park with 38 coral species and 72 fish species. Ideal for snorkelling and glass-bottom boat trips.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4448478,57.709801","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwR5y0YBNUBGEaPxiLznAESMfHUfyDP6qk1h4lxR8hsX0QJv2dPaCcqJ5L14-OcmT4L5DJpUjKOsnhP2Aqoc6XmWlIOxZ1eVucpByClxziZQU9ENGOZqg_w28vzu8DbIwcVHanOqNTmtQT0cvvTunWyF7sasDRrRjkrsu6KS5UKqTWPzBPf82x3HPZX61VJJTwJMcsSsxvD?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"iz7hbxf8","nameFr":"La Vallée de Ferney","nameEn":"La Vallée de Ferney","descFr":"Réserve naturelle de 200 hectares préservant la forêt endémique de l'île. Randonnées guidées, faune sauvage et paysages verdoyants.","descEn":"200-hectare nature reserve preserving the island's endemic forest. Guided hikes, wildlife and lush landscapes.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.3620088,57.7056026","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gwf2-gD-A0T6OUqxNQWlFakZmEJtdWW7voSiyavSGMEkWr7E1rtlskRwcfly8izhdMXnPZ_IbItXcU78c__e6jplj-rVo3o0e53QQDWF-2oG2mYDH1Gnu4pDdVgCG5VpRQ3wbkK6Gnk2hHD_0N8nqjI4HhpUERoH0geMQLA5JTWd8H-XfTeC5ghI2cVeL1kq0WFinGWlcG8?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"iwpp4lg0","nameFr":"Mahebourg Museum","nameEn":"Mahebourg Museum","descFr":"Musée historique retraçant la bataille de Grand Port de 1810. Cartes anciennes, objets coloniaux et maquettes de navires.","descEn":"Historical museum telling the story of the 1810 Battle of Grand Port. Ancient maps, colonial artefacts and ship models.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4163245,57.7033301","image":"","distance":"","priceLevel":"","openHours":""},{"id":"k8vfv2kt","nameFr":"Mahebourg Waterfront","nameEn":"Mahebourg Waterfront","descFr":"Promenade balnéaire animée avec vue sur les îlots de la baie. Restaurants, artisanat local et couchers de soleil magnifiques.","descEn":"Lively seaside promenade with views over the bay's islets. Restaurants, local crafts and magnificent sunsets.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4050275,57.7097567","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gykl3fgfZGdqFcU25UeT9tlhUww7dBFm6DW2NsGIFpOr3zQ9Od3nHMm6QSlM_siVSG_cOYpZMEK4HZK66vFQKk_LyRqVMCMoRv-BWA_CfSb37xhYzcBW8Xt8WaYv_myWus-mQzuhBlWpSANMnfoAtoVByw7N69I-t1nMl8_d9U-rMEFEoYLO5VunpffyHpH2j_UNygUPK25?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"56cdnt2v","nameFr":"La Vanille Nature Park","nameEn":"La Vanille Nature Park","descFr":"Parc naturel avec tortues géantes, crocodiles du Nil et lémuriens. Cadre tropical luxuriant, accessible à toute la famille.","descEn":"Nature park with giant tortoises, Nile crocodiles and lemurs. Lush tropical setting, perfect for the whole family.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.499475,57.563272","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyRIBW24NW7wja3SXyuqtFHFptZIl9OYeIPhFaPpI8oj35J-b6mTuzJuQvlQFOf_l31X-yO_3XkPy7DtQE2-hmzTpLxPJDp5vTxzjwemjLkT8JBlwkhURchdyPTgLRxzEijAWPW_7QyE1VjTgbohMfCJFg8JBhx1ZZgFblh9_5uEvxAEuAEYwuI5MC5cWC5TNC6qJjCNm4jWqxXfR2CRnZdpDZkhP2sntiXojjyHgfvsv4NzbbEub83Oi4?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"aokfyybg","nameFr":"Vallée Adventure Park","nameEn":"Vallée Adventure Park","descFr":"Parc d'aventure avec tyrolienne et quad dans la vallée de Ferney. Adrénaline garantie dans un cadre verdoyant.","descEn":"Adventure park with zip-line and quad bikes in the Ferney Valley. Guaranteed thrills in a lush green setting.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4579232,57.4844716","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gw38D8pahIwbUmEaHDmcM_KtxK7v6isOW-EvDAKI-7nHLwO9hjs3mpd6ij_pzKwmonrxkpbTwtG16rd32V8gEM5dW3lnKQSxwLoDTJo5L2MJDc78C6roY52VUJgRUJOR1Q8Db4KHxKnUQq9xGHvy2qHftZZvwx0wme8x-P4v2V6A_tPeFQebNxfBKyMZg5uExK5f0tTqvFUNvE5tJXcOLrV6u3EWnPsqYmWDUtEn6D-s6iIfoDnmFYVAYg?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"snenyzdt","nameFr":"Casela Nature Parks | Ile Maurice","nameEn":"Casela Nature Parks | Ile Maurice","descFr":"Le parc nature numéro 1 de Maurice avec lions, zèbres et rhinocéros. Marche avec les lions et safari en bus pour toute la famille.","descEn":"Mauritius's number 1 nature park with lions, zebras and rhinos. Walk with lions and bus safari for the whole family.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.2911477,57.4039949","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gz0d4-A426eM8rTW6df1wEAxkvSSeUKq8Jvyh5DvTcVN7BJJsOqLPVVKcilOU1jhY7pKQSl0gVia9Mp97IZPoJuW7JZWmXXHughQPWoeBjgKvijugkI7zk4pM_HYWd37uVZlo2rf-wJAo4_IQj41BTTUBWIHAuz_7Acq_25j2y5yYGSczeEtmrBxPv_il5pZqgL8QxltZhfD97dj976dfvos49zpyqepLoaYvmm0yCMg4q5dNnkTzCmYJ8?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"jhuuxm7e","nameFr":"Ile Des Deux Cocos","nameEn":"Ile Des Deux Cocos","descFr":"Ilot privé classé Ramsar, accessible en bateau depuis Blue Bay. Eaux turquoises, snorkeling et pique-nique créole.","descEn":"Private Ramsar-listed islet, accessible by boat from Blue Bay. Turquoise waters, snorkelling and Creole picnic.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4487075,57.7109832","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzXhjRPamX_Uv0820p4rfWK6FdaaQxkfUpUoTt_IG_bdQyG_nBQ9jKQI0Dy7EVg-NJuiMxeJ_NZrZYtGXVDU5W7h58aABCHuDFfYnfqwo7OFXKJGkPwl-iGmrQZOlCGGxErrGCNBHnCCCwuWRLtjyb57vUarQX51tTm2PWN8PGCTzV3iaEYGhEuxQIrWBu7Eher6c-rpBWW?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"vuw75xi8","nameFr":"Lion Mountain hiking trail","nameEn":"Lion Mountain hiking trail","descFr":"Randonnée emblématique (564m) avec vue panoramique sur le lagon de Mahebourg. Environ 3h aller-retour, niveau modéré.","descEn":"Iconic hike (564m) with panoramic views over the Mahebourg lagoon. About 3 hours return, moderate difficulty.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.3720852,57.7270345","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GyRT9tuhhj8U4H0p8RbSywbOsP_QGdMMJWQ_h3s8Xn8F-klH-rxUsSIr-AL9XXNQnBqOzbqJN405wQfuJ586ZsRWAHff_XItsQHbuM-Cq2dpPViFsysCNNCDe3oPOgzzmzggcq71ZFxyZh8K1pZLBKN-HIP8Uawaa9Tpy9scI8qEmbFDkFx4QK2p99aaERZgq15irsipTwH3A?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"b0xsat7t","nameFr":"Ile aux Aigrettes","nameEn":"Ile aux Aigrettes","descFr":"Ile-réserve naturelle de 26 hectares préservant l'écosystème original de Maurice. Tortues géantes et oiseaux endémiques.","descEn":"26-hectare nature reserve island preserving Mauritius's original ecosystem. Giant tortoises and endemic birds.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.417984,57.7311238","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzWzy4m9hnOqen4aPXcC33xKPs1d2OgR79SyKWX3d3cURLHPmlnEUMwp4Fbl8aQgdDZKDb8qmMjQt6TWK42SsOI2pxjajbAbySzG1G3FqIq__fSfqXBWv2w1qElaaZ8AvfYjaHuT8RJDI7Jh40TNlyWzprPjaLlFSI6I6h260vkdC15gklbqikIe6IF4uDLw-6vos1XQRfA?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"xm312fgq","nameFr":"Île aux Cerfs","nameEn":"Île aux Cerfs","descFr":"Ile paradisiaque dans le lagon de l'est, destination phare de Maurice. Eaux cristallines, sports nautiques et restaurants de bord de mer.","descEn":"Paradise island in the eastern lagoon, Mauritius's flagship destination. Crystal-clear waters, water sports and beachside restaurants.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.2723538,57.8041107","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_Gx6QkNuckObr6X4HDaG3Eg8AMupN6HXZg1CNHI_GkLs1JkOeXLdXD21nXrRUWGXqye5ZBUobxh_y_7abe486M7fwnHHZR-0R_yQfpOJGeILHMK4HpBcwllhgO9j2xa9xh9ipveZ0Esd6EqKey2s6VExkZWkVcbHkAaXpxB06XadlnuIhfWgaaBK9dWfqTFJvOwpBTniUr-A?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"zpwbhqzd","nameFr":"Old Light House (île au phare)","nameEn":"Old Light House (île au phare)","descFr":"Phare historique sur un ilot du lagon de Mahebourg. Accessible en bateau, panorama exceptionnel et couchers de soleil.","descEn":"Historic lighthouse on a small islet in Mahebourg lagoon. Accessible by boat, exceptional panorama and sunsets.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.3957788,57.7773863","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GziRetpFH8HQlM09C1gYsPUr3frNXJvY5hE7aNa7Z0Z7FF23HesIpb8_OW5pfG9BvdkyJtiLkZO8qEi0qgWWMIYo380AgTtN6SJhB-x2a2GN4liZHm7ofhdMZkLzHrbLA2-08ezimn1mSAk__hlphIsrcgOqd5ujZPnpJaLbhCxNc1rojwHPrHYhlVZ-axuSB4UXDp_azlLLA?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"2lzxzsz8","nameFr":"Cascade Rochester","nameEn":"Cascade Rochester","descFr":"Cascade unique aux dalles volcaniques rectangulaires ressemblant à des colonnes de basalte. Paysage minéral et sauvage dans le sud.","descEn":"Unique waterfall with rectangular volcanic slabs resembling basalt columns. Wild, mineral landscape in the south.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.5029835,57.5168288","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwKkTFka5SGSsxRAHaOWb1QX9795UL79jfCsk9UG7NkL6ery4ROHGswGQZ3oGiVNVU7O-qiQRcmAsiJonOvYKBOWX75ahBynbiMCVIq9D_ChhKNTHoQAYqCraMzWkI8w-o0Xk6Fb-VDkCZnISN1PNwwf8ORauinwLkWGdNK0UfgzkBy8cBcpUfOJnoPX2pUBGFWEoNwpvzjzW3vOjAmwa66rqqpzRN4Pj9ef-CeZKMp8qfoCK_E5OT6Fzc?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"mjadw6ct","nameFr":"Grand Bassin Temple","nameEn":"Grand Bassin Temple","descFr":"Lac volcanique sacré et lieu de pèlerinage hindou le plus important de Maurice. Ambiance spirituelle intense et décor naturel.","descEn":"Sacred volcanic lake and most important Hindu pilgrimage site in Mauritius. Intense spiritual atmosphere and natural setting.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4183273,57.4934292","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwoYRcUFxY1UcGHnVarKBAuarAfoXdcegYfNZch0t_kxrtnD_gqbAKbBCsxjlVOOsTvKwSDVVZgVSFsrlAqTobB4UdfosE5L04NJyqjw4cGTfHR-_1UmGitTmCMuwhXP3tIjDkWs2mTF7tTqyznSb1rMEh579sKn0UQtpy-VXF-DTefgLW27SkVfwi_SMSeD-5oyj7NmpCMJ5CYPMI4xk2aRJCmwtowMrRogh9piiL7uLVBEb-a-Z5JtUY?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"wa7ng6jl","nameFr":"Tamarind Falls / 7 Cascades","nameEn":"Tamarind Falls / 7 Cascades","descFr":"Les célèbres 7 Cascades en pleine forêt tropicale. Randonnée et baignade dans des piscines naturelles, une expérience inoubliable.","descEn":"The famous 7 Cascades in tropical forest. Hiking and swimming in natural pools — an unforgettable experience.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.3547247,57.4664171","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwCg36cBJO8eSo5BZs7BeZIIi7edHuYaSv2n0Beo08Dlsu35bygTedonn9WhmWKLkWDBa0z59gPsRfYPedJBdmxRRB2XB7mqhLXaCa_IxcKD6kpgMlOBSrRFEmIp-8ZpKRR60kiyNi_AfRq46GqPVwT9JbFOMgiIp-2ZdvOsrWmqKGFaVr182op54nWMM6BwEGw9hFVJi-iVYTyvcO0i4FOqH5Iril-TO5Fan32TGqbQuTkVzTYQtC6F7k?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"244t90pu","nameFr":"Bois Cheri Tea Factory","nameEn":"Bois Cheri Tea Factory","descFr":"La plus ancienne plantation de thé de Maurice, en activité depuis 1892. Visite guidée, dégustation et restaurant panoramique.","descEn":"Mauritius's oldest tea plantation, in operation since 1892. Guided tour, tasting and panoramic restaurant.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4263291,57.5256586","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GzvX_A_K6qq16-4QZgNyKLT6jRC4D7p64VstHDxUXkzfkXO42HsqmmN6dY8m7u40NwtBFreifFvAqFLOEt28aJqOvcdL9kBAe9dIORfRj1wl4mzZ1kxTbxdNbSOEgHbO-sPjRUGVOqJQ7GiLF6KUu_myU2bGFbWai2oGSyCY5WX4jxkCeIB9_dtXZOCnKJDm1qPPR9foPje90BezqHf1K2xqffSzjzkW8RJBOWude3AyJpmuASOXkA1erQ?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""},{"id":"rxpcqjn2","nameFr":"Gris Gris Beach","nameEn":"Gris Gris Beach","descFr":"Plage sauvage du sud battue par les vagues de l'océan Indien. Paysage dramatique et grandiose pour les amateurs de nature brute.","descEn":"Wild southern beach battered by Indian Ocean waves. Dramatic, grand landscape for nature lovers.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.5243899,57.5322158","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GwqYecLn2LdOeRYbM8XNQSyWgYfD23mIe8Mzd7Gvk_YtqtIl3FLPlyggXybC94xCBEIiU92V111S4lyyaaMWGsbmztiSMli3XUGWGyqQLUzfSd5BVKzFpj7IzoPTAOn-VyzJfvS81fgKxFSkdhAtkgtXXbB4HK1vJyWMGTuPQAN7EiSXaknt8ubsXoNXvmnfWF0uwQsc18kvIbh4nB9-Thr2rVCuM_HseyrHEjsy6o5rMvHwSky0u0Robc?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]},{"id":"boulangeries","nameFr":"Pâtisseries / Boulangeries","nameEn":"Bakeries / Pastry Shops","icon":"🥐","color":"#c47a3a","items":[{"id":"ljbiima5","nameFr":"Blé D'or Boulangerie et Patisserie","nameEn":"Blé D'or Boulangerie et Patisserie","descFr":"Boulangerie artisanale mauricienne avec pains chauds, viennoiseries et gâteaux locaux. Idéale pour le petit-déjeuner.","descEn":"Mauritian artisan bakery with warm breads, pastries and local cakes. Perfect for breakfast.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4319106,57.6613918","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxC0c-g3F5dfvmzmnPBPZGu1grmyQ9h4zZMGfeO-S-5wKE8anzwtR_w2L7gAHopUe_Hz7mpcEsUDDmdRghzkaic0N8Nfvh4QsDSD5sffaj3Jz58lbSpF-CcbENmUEm8bo6nFmOeRpU2ouEcB7Leka5-oCHalo7CjOkqPF3T7wWOQzbqhSYidV8AgBoHlMPJn-IpQ8xz7gep?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]}],"subcategories":[{"id":"atm","nameFr":"ATM","nameEn":"ATM","icon":"🏧","color":"#607d8b","items":[{"id":"jye9g10j","nameFr":"Atm MCB","nameEn":"Atm MCB","descFr":"Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.","descEn":"MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4321291,57.6604822","image":"","distance":"","priceLevel":"","openHours":""},{"id":"xhv3tkfs","nameFr":"Atm Sbm Plaine Magnien","nameEn":"Atm Sbm Plaine Magnien","descFr":"Distributeur SBM disponible 24h/24 à Plaine Magnien.","descEn":"SBM ATM available 24/7 in Plaine Magnien.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4318909,57.6613197","image":"","distance":"","priceLevel":"","openHours":""},{"id":"uf9zhfnr","nameFr":"MCB ATM","nameEn":"MCB ATM","descFr":"Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.","descEn":"MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4089123,57.7055942","image":"","distance":"","priceLevel":"","openHours":""},{"id":"kg7enusk","nameFr":"Absa | Atm | Beau Vallon","nameEn":"Absa | Atm | Beau Vallon","descFr":"Distributeur Absa à Beau Vallon, disponible 24h/24.","descEn":"Absa ATM at Beau Vallon, available 24/7.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.423759,57.697941","image":"","distance":"","priceLevel":"","openHours":""},{"id":"9b4juqnw","nameFr":"ATM MCB","nameEn":"ATM MCB","descFr":"Distributeur MCB 24h/24. Accepte Visa, Mastercard et cartes locales.","descEn":"MCB ATM open 24/7. Accepts Visa, Mastercard and local cards.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4175259,57.7100349","image":"","distance":"","priceLevel":"","openHours":""}]},{"id":"essence","nameFr":"Stations Essence","nameEn":"Gas Stations","icon":"⛽","color":"#e53935","items":[{"id":"azk43ium","nameFr":"Engen Filling Station","nameEn":"Engen Filling Station","descFr":"Station Engen avec carburants SP95, diesel et boutique. Ouverte 7j/7.","descEn":"Engen station with SP95, diesel and shop. Open 7 days a week.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4308445,57.6666288","image":"","distance":"","priceLevel":"","openHours":""},{"id":"7tl6ughl","nameFr":"Shell Filling Station","nameEn":"Shell Filling Station","descFr":"Station Shell complète avec carburants, boutique et services auto.","descEn":"Full Shell station with fuel, shop and car services.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4321922,57.6607249","image":"","distance":"","priceLevel":"","openHours":""},{"id":"76gwts41","nameFr":"SHELL","nameEn":"SHELL","descFr":"Station Shell avec carburants, boutique et gonflage des pneus.","descEn":"Shell station with fuel, shop and tyre inflation.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4059505,57.7034222","image":"","distance":"","priceLevel":"","openHours":""},{"id":"kc3mnogt","nameFr":"TotalEnergies Mahebourg","nameEn":"TotalEnergies Mahebourg","descFr":"Station TotalEnergies à Mahebourg avec carburants et boutique.","descEn":"TotalEnergies station in Mahebourg with fuel and shop.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.407917,57.705783","image":"","distance":"","priceLevel":"","openHours":""},{"id":"o8d3jlw2","nameFr":"Indian Oil","nameEn":"Indian Oil","descFr":"Station Indian Oil avec carburants et services. Ouverte 7j/7.","descEn":"Indian Oil station with fuel and services. Open 7 days a week.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4059061,57.7079899","image":"","distance":"","priceLevel":"","openHours":""},{"id":"0y6jw8br","nameFr":"Shell","nameEn":"Shell","descFr":"Station Shell avec carburants, boutique et gonflage des pneus.","descEn":"Shell station with fuel, shop and tyre inflation.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4073509,57.708267","image":"","distance":"","priceLevel":"","openHours":""},{"id":"muljb2wb","nameFr":"Shell Filling Station","nameEn":"Shell Filling Station","descFr":"Station Shell complète avec carburants, boutique et services auto.","descEn":"Full Shell station with fuel, shop and car services.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4109873,57.6171261","image":"","distance":"","priceLevel":"","openHours":""}]},{"id":"hopitaux","nameFr":"Hôpitaux / Docteurs","nameEn":"Hospitals / Doctors","icon":"🏥","color":"#c62828","items":[{"id":"w8uucpt9","nameFr":"Dr Vishnu Appiah","nameEn":"Dr Vishnu Appiah","descFr":"Médecin généraliste disponible pour consultations. Contacter pour les horaires et urgences.","descEn":"General practitioner available for consultations. Contact for hours and emergencies.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.411324,57.7057728","image":"","distance":"","priceLevel":"","openHours":""},{"id":"jy79vave","nameFr":"Mahebourg Hospital","nameEn":"Mahebourg Hospital","descFr":"Hôpital public de Mahebourg avec urgences 24h/24. SAMU : 114, Pompiers : 115.","descEn":"Mahebourg public hospital with 24/7 emergency. SAMU: 114, Fire: 115.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4108034,57.7033526","image":"","distance":"","priceLevel":"","openHours":""},{"id":"8pb9w3f7","nameFr":"Jawaharlal Nehru Hospital","nameEn":"Jawaharlal Nehru Hospital","descFr":"Grand hôpital public de Rose Belle avec service des urgences 24h/24.","descEn":"Large public hospital in Rose Belle with 24/7 emergency department.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4045471,57.5929609","image":"","distance":"","priceLevel":"","openHours":""},{"id":"4ehtmosz","nameFr":"Clinique Darné Curepipe","nameEn":"Clinique Darné Curepipe","descFr":"Clinique privée réputée à Curepipe avec spécialistes et urgences. Soins de qualité 24h/24.","descEn":"Reputed private clinic in Curepipe with specialists and emergency care. Quality 24/7 care.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.287858,57.4188589","image":"","distance":"","priceLevel":"","openHours":""},{"id":"zshw6q0l","nameFr":"C-Lab Beau Vallon","nameEn":"C-Lab Beau Vallon","descFr":"Laboratoire d'analyses médicales à Beau Vallon. Prises de sang, examens et résultats rapides.","descEn":"Medical testing laboratory in Beau Vallon. Blood tests, examinations and quick results.","address":"","phone":"","mapLink":"https://maps.google.com/?q=-20.4222299,57.7013828","image":"https://mymaps.usercontent.google.com/hostedimage/m/*/3AE5a_GxqjzVIvNzbN3K0SGztRDfVITd3CLtMVwD73hr_RyIacmNDTOZAvwFufr2tu1M7vAA0xsTZ_HNSJMdq0g-6jPigfN6KzwTJXFqScRRvKO-UhMXzGoTaPa_UMy25k9u7PT9uzVubmH8zEKW2dRUNSapDQ0wvrGAOET61Et1hVjopIuHYXGVs5biGRmkWOd3iyXTMl6nZ9yAXpDwQjBkz1TMYDIq75XoOLnYuhYXru0CuucokoWSLfiz6H0o?authuser=0&fife=s16383","distance":"","priceLevel":"","openHours":""}]}],"gallery":[{"id":"g1","url":"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/ec3d996c-b4c4-4eec-801e-e74527da4d99.jpeg","caption":"Villa P'tit Bouchon - Vue mer"},{"id":"g2","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/9a649f48-0524-4b61-8a22-551339452624.png","caption":"Piscine privée"},{"id":"g3","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/dd8ce4b6-f209-4f4a-b3a7-75210beffcd2.png","caption":"Salon & séjour"},{"id":"g4","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/c827c80e-5b1d-4994-a8ac-bbfdd502d35e.png","caption":"Terrasse vue lagon"},{"id":"g5","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/8118c41b-9ddc-41e4-a5bb-fcc376265c5a.png","caption":"Cuisine équipée"},{"id":"g6","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/d5d4fbd3-efd0-47f9-8d56-b685a1666e39.png","caption":"Chambre master - lit queen, vue mer, dressing"},{"id":"g7","url":"https://a0.muscache.com/im/pictures/hosting/Hosting-54153972/original/48ca3363-09cf-41cf-88d8-982ef9f19d07.png","caption":"Chambre 2 - lit double"},{"id":"g8","url":"https://a0.muscache.com/im/pictures/miso/Hosting-54153972/original/4e1315c5-f830-4fdf-a0bf-3bcc8c465b10.jpeg","caption":"Chambre 3 - lit queen"}]};
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
