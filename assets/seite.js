/* ============================================================
   PRAIA DA URSA — SEITENAUFBAU
   Baut Kopfzeile, Navigation, Inhalt und Fusszeile aus
   inhalte.js. Hier musst du normalerweise nichts aendern.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Sprache --------------------------------------
     de Deutsch · en Englisch · lb Luxemburgisch · fr Franzoesisch.
     Fehlt ein Text in einer Sprache, springt ERSATZ ein.        */
  var SPRACHEN = ["de", "en", "lb", "fr"];
  var ERSATZ = {
    de: ["de"],
    en: ["en", "de"],
    lb: ["lb", "de"],
    fr: ["fr", "en", "de"]
  };
  var GEBIET = { de: "de-DE", en: "en-GB", lb: "lb-LU", fr: "fr-FR" };

  /* Drei Betriebsarten:
     BAU      — das Werkzeug erzeugt gerade die fertigen HTML-Seiten
     STATISCH — eine fertig erzeugte Seite ist im Browser geoeffnet;
                der Inhalt steht schon im HTML, hier kommt nur noch
                Bewegung dazu (Menue, Diashow, Leuchtkasten)
     sonst    — Impressum und Datenschutz, die weiter im Browser
                zusammengebaut werden                                */
  var BAU = window.PDU_VORRENDERN || null;
  var STATISCH = !BAU && !!(document.body && document.body.hasAttribute("data-vorgerendert"));

  function spracheLesen() {
    if (BAU) return BAU.sprache;
    var fest = document.documentElement.getAttribute("data-sprache");
    if (STATISCH && SPRACHEN.indexOf(fest) > -1) return fest;
    var ausUrl = new URLSearchParams(location.search).get("lang");
    if (SPRACHEN.indexOf(ausUrl) > -1) return ausUrl;
    try {
      var gemerkt = localStorage.getItem("pdu-sprache");
      if (SPRACHEN.indexOf(gemerkt) > -1) return gemerkt;
    } catch (e) { /* privater Modus: still ignorieren */ }
    return "de";
  }

  var sprache = spracheLesen();

  function spracheSetzen(neu) {
    if (neu === sprache) return;
    sprache = neu;
    try { localStorage.setItem("pdu-sprache", neu); } catch (e) {}
    var url = new URL(location.href);
    if (neu === "de") { url.searchParams.delete("lang"); }
    else { url.searchParams.set("lang", neu); }
    history.replaceState(null, "", url);
    aufbauen();
  }

  /* ---------- Pfade -----------------------------------------
     Deutsch liegt im Hauptordner, jede andere Sprache in einem
     eigenen Unterordner (/en/, /lb/, /fr/). Gibt es eine Seite in
     einer Sprache nicht, fuehrt der Link zur Startseite dieser Sprache. */
  function gibtEs(ziel, datei) {
    var liste = (typeof INHALTE !== "undefined" ? INHALTE.seitenJeSprache : null) ||
                window.PDU_SEITEN || null;
    return !liste || !liste[ziel] || liste[ziel].indexOf(datei) > -1;
  }

  function ordnerHier() { return (BAU || STATISCH) ? sprache : "de"; }

  function seitenPfad(datei, ziel) {
    ziel = ziel || sprache;
    if (!gibtEs(ziel, datei)) { datei = "index.html"; }
    var hier = ordnerHier();
    if (ziel === hier) { return datei; }
    return (hier === "de" ? "" : "../") + (ziel === "de" ? "" : ziel + "/") + datei;
  }

  /* Impressum und Datenschutz gibt es nur im Hauptordner */
  function rechtsPfad(datei) {
    return (ordnerHier() === "de" ? "" : "../") + datei +
           (sprache === "de" ? "" : "?lang=" + sprache);
  }

  /* ---------- Helfer --------------------------------------- */

  /* t() nimmt entweder "Text" oder { de: "...", en: "...", ... } */
  function t(wert) {
    if (wert === null || wert === undefined) return "";
    if (typeof wert === "object") {
      var reihe = ERSATZ[sprache] || ["de"];
      for (var i = 0; i < reihe.length; i++) {
        if (wert[reihe[i]]) return wert[reihe[i]];
      }
      return "";
    }
    return String(wert);
  }

  /* ---------- Woerterbuch fuer alle festen Beschriftungen --- */
  var UI = {
    sprung:        { de: "Zum Inhalt springen", en: "Skip to content",
                     lb: "Direkt bei den Inhalt", fr: "Aller au contenu" },
    menue:         { de: "Menü", en: "Menu", lb: "Menü", fr: "Menu" },
    schliessen:    { de: "Schließen", en: "Close", lb: "Zoumaachen", fr: "Fermer" },
    hauptnavi:     { de: "Hauptnavigation", en: "Main navigation",
                     lb: "Haaptnavigatioun", fr: "Navigation principale" },
    sprachwahl:    { de: "Sprache", en: "Language", lb: "Sprooch", fr: "Langue" },
    seiten:        { de: "Seiten", en: "Pages", lb: "Säiten", fr: "Pages" },
    kontakt:       { de: "Kontakt", en: "Contact", lb: "Kontakt", fr: "Contact" },
    kontaktMarke:  { de: "Kontakt", en: "Get in touch", lb: "Kontakt", fr: "Contact" },
    verband:       { de: "Verband", en: "Association", lb: "Verband", fr: "Association" },
    impressum:     { de: "Impressum", en: "Legal notice", lb: "Impressum", fr: "Mentions légales" },
    datenschutz:   { de: "Datenschutz", en: "Privacy", lb: "Dateschutz", fr: "Confidentialité" },
    frage:         { de: "Eine Frage? Schreib uns einfach.", en: "Have a question? Just ask.",
                     lb: "Eng Fro? Schreift eis einfach.", fr: "Une question ? Écrivez-nous." },
    perWhatsapp:   { de: "Per WhatsApp schreiben", en: "Message on WhatsApp",
                     lb: "Iwwer WhatsApp schreiwen", fr: "Écrire sur WhatsApp" },
    perMail:       { de: "E-Mail schreiben", en: "Send an email",
                     lb: "E-Mail schreiwen", fr: "Envoyer un e-mail" },
    anrufen:       { de: "Anrufen", en: "Call us", lb: "Uruffen", fr: "Appeler" },
    alleReserviert:{ de: "Alle reserviert", en: "All reserved",
                     lb: "All reservéiert", fr: "Tous réservés" },
    kittenAnsehen: { de: "Die Kitten ansehen", en: "Meet the kittens",
                     lb: "D'Kitten ukucken", fr: "Découvrir les chatons" },
    wuerfe:        { de: "Würfe", en: "Litters", lb: "Wierf", fr: "Portées" },
    inPlanung:     { de: "In Planung", en: "Planned", lb: "A Planung", fr: "En préparation" },
    mehrDazu:      { de: "Mehr dazu", en: "More about this", lb: "Méi dozou", fr: "En savoir plus" },
    weiterlesen:   { de: "Weiterlesen ↓", en: "Read on ↓", lb: "Weiderliesen ↓", fr: "Lire la suite ↓" },
    dieZucht:      { de: "Die Zucht", en: "The cattery", lb: "D'Zucht", fr: "L'élevage" },
    ueberUns:      { de: "Über uns", en: "About us", lb: "Iwwer eis", fr: "À propos" },
    dieMutter:     { de: "Die Mutter", en: "The mother", lb: "D'Mamm", fr: "La mère" },
    ihrSteckbrief: { de: "Ihr Steckbrief", en: "Her profile", lb: "Hire Steckbréif", fr: "Sa fiche" },
    wieWirZuechten:{ de: "Wie wir züchten", en: "How we breed",
                     lb: "Wéi mir zuchten", fr: "Notre façon d'élever" },
    ueberUnsIntro: { de: "Eine kleine Zucht in Trier, angeschlossen an den Felidae e.V.",
                     en: "A small cattery in Trier, registered with Felidae e.V.",
                     lb: "Eng kleng Zucht zu Tréier, ugeschloss un de Felidae e.V.",
                     fr: "Un petit élevage à Trèves, affilié au Felidae e.V." },
    katzeEine:     { de: "Unsere Katze", en: "Our cat", lb: "Eis Kaz", fr: "Notre femelle" },
    katzeMehr:     { de: "Unsere Katzen", en: "Our cats", lb: "Eis Kazen", fr: "Nos chats" },
    katzeTitelEine:{ de: "Die Katze hinter der Zucht", en: "The cat behind the cattery",
                     lb: "D'Kaz hannert der Zucht", fr: "Le cœur de notre élevage" },
    katzeTitelMehr:{ de: "Die Katzen hinter der Zucht", en: "The cats behind the cattery",
                     lb: "D'Kazen hannert der Zucht", fr: "Les chats de notre élevage" },
    geboren:       { de: "Geboren", en: "Born", lb: "Gebuer", fr: "Naissance" },
    farbschlag:    { de: "Farbschlag", en: "Colour", lb: "Faarf", fr: "Couleur" },
    vollerName:    { de: "Voller Name", en: "Full name", lb: "Vollen Numm", fr: "Nom complet" },
    blutgruppe:    { de: "Blutgruppe", en: "Blood group", lb: "Bluttgrupp", fr: "Groupe sanguin" },
    gesundheit:    { de: "Gesundheit", en: "Health", lb: "Gesondheet", fr: "Santé" },
    kitten:        { de: "Kitten", en: "Kittens", lb: "Kitten", fr: "Chatons" },
    keineKitten:   { de: "Zurzeit keine Kitten", en: "No kittens at the moment",
                     lb: "Momentan keng Kitten", fr: "Aucun chaton pour le moment" },
    mutter:        { de: "Mutter", en: "Mother", lb: "Mamm", fr: "Mère" },
    vater:         { de: "Vater", en: "Father", lb: "Papp", fr: "Père" },
    auszugAb:      { de: "Auszug ab", en: "Ready from", lb: "Ëmzuch ab", fr: "Départ possible" },
    kaetzin:       { de: "Kätzin", en: "Female", lb: "Weibchen", fr: "Femelle" },
    kater:         { de: "Kater", en: "Male", lb: "Männchen", fr: "Mâle" },
    fruehereWuerfe:{ de: "Frühere Würfe", en: "Past litters",
                     lb: "Fréier Wierf", fr: "Portées précédentes" },
    vermittlung:   { de: "Vermittlung", en: "Rehoming", lb: "Vermëttlung", fr: "Adoption" },
    vermittlungTitel: { de: "Wie ein Kitten sein Zuhause findet", en: "How a kitten finds its home",
                     lb: "Wéi e Kitten säin Doheem fënnt", fr: "Comment un chaton trouve son foyer" },
    voraussetzen:  { de: "Was wir voraussetzen", en: "What we ask of you",
                     lb: "Wat mir virausetzen", fr: "Ce que nous attendons de vous" },
    gesundheitTitel: { de: "Worauf wir untersuchen", en: "What we test for",
                     lb: "Wourop mir ënnersichen", fr: "Ce que nous dépistons" },
    verbandVor:    { de: "Wir züchten nach der Zucht- und Registrierordnung des ",
                     en: "We breed under the breeding and registration rules of ",
                     lb: "Mir zuchte no der Zucht- a Registréierungsuerdnung vum ",
                     fr: "Nous élevons dans le respect du règlement d'élevage et d'enregistrement du " },
    verbandNach:   { de: ". Jedes Kitten verlässt uns mit anerkanntem Stammbaum.",
                     en: ". Every kitten leaves us with a recognised pedigree.",
                     lb: ". All Kitten verléisst eis mat engem unerkannte Stammbam.",
                     fr: ". Chaque chaton nous quitte avec un pedigree reconnu." },
    sprichUnsAn:   { de: "Sprich uns an", en: "Talk to us", lb: "Schwätzt eis un", fr: "Parlons-en" },
    chatStarten:   { de: "Chat starten", en: "Start a chat", lb: "Chat starten", fr: "Démarrer une discussion" },
    email:         { de: "E-Mail", en: "Email", lb: "E-Mail", fr: "E-mail" },
    telefon:       { de: "Telefon", en: "Phone", lb: "Telefon", fr: "Téléphone" },
    woWirSind:     { de: "Wo wir sind", en: "Where we are", lb: "Wou mir sinn", fr: "Où nous trouver" },
    bildFehlt:     { de: "Bild fehlt", en: "Image missing", lb: "Bild feelt", fr: "Image manquante" },
    bild:          { de: "Bild", en: "Image", lb: "Bild", fr: "Image" },
    bildZurueck:   { de: "Vorheriges Bild", en: "Previous image", lb: "Viregt Bild", fr: "Image précédente" },
    bildVor:       { de: "Nächstes Bild", en: "Next image", lb: "Nächst Bild", fr: "Image suivante" },
    derVater:      { de: "Der Vater", en: "The father", lb: "De Papp", fr: "Le père" },
    dieVaeter:     { de: "Die Väter", en: "The fathers", lb: "D'Pappen", fr: "Les pères" },
    ausDerZucht:   { de: "Deckkater aus der Zucht ", en: "Stud from the cattery ",
                     lb: "Deckkueder aus der Zucht ", fr: "Mâle reproducteur de l'élevage " },
    zuchtLabel:    { de: "Zucht", en: "Cattery", lb: "Zucht", fr: "Élevage" },
    wissen:        { de: "Wissen", en: "Guides", lb: "Wëssen", fr: "Conseils" },

    /* Kleine Zeile ueber jeder Hauptueberschrift. Sie gehoert mit zur
       Ueberschrift und traegt den Begriff, nach dem Menschen suchen.   */
    suchUeberUns:  { de: "Heilige-Birma-Zucht in Trier", en: "Sacred Birman cattery in Trier",
                     lb: "Hellege Birma · Zucht zu Tréier", fr: "Élevage de Sacrés de Birmanie à Trèves" },
    suchKatze:     { de: "Unsere Birma-Zuchtkatze", en: "Our Birman queen",
                     lb: "Hellege Birma · Eis Zuchtkaz", fr: "Notre femelle Sacré de Birmanie" },
    suchKatzen:    { de: "Unsere Birma-Zuchtkatzen", en: "Our Birman breeding cats",
                     lb: "Hellege Birma · Eis Zuchtkazen", fr: "Nos Sacrés de Birmanie reproducteurs" },
    suchVater:     { de: "Deckkater", en: "Stud", lb: "Deckkueder", fr: "Mâle reproducteur" },
    suchKitten:    { de: "Heilige Birma Kitten", en: "Sacred Birman kittens",
                     lb: "Hellege Birma · Kitten", fr: "Chatons Sacré de Birmanie" },
    suchVermittlung: { de: "Vermittlung & Preis", en: "Rehoming & price",
                     lb: "Vermëttlung & Präis", fr: "Adoption & prix" },
    suchGesundheit:{ de: "Gesundheit der Heiligen Birma", en: "Sacred Birman health",
                     lb: "Hellege Birma · Gesondheet", fr: "Santé du Sacré de Birmanie" },

    suchRasse:     { de: "Rasseporträt", en: "Breed profile", lb: "Rasseportrait", fr: "Portrait de la race" },
    suchFragen:    { de: "Birma Kitten · Häufige Fragen", en: "Birman kittens · FAQ",
                     lb: "Birma Kitten · Froen", fr: "Chatons Birman · Questions" },
    suchWarteliste:{ de: "Warteliste für Birma-Kitten", en: "Waiting list for Birman kittens",
                     lb: "Waardelëscht", fr: "Liste d'attente chatons Birman" },
    suchRatgeber:  { de: "Ratgeber Heilige Birma", en: "Sacred Birman guides",
                     lb: "Rotgeber", fr: "Conseils Sacré de Birmanie" },
    ratgeber:      { de: "Ratgeber", en: "Guides", lb: "Rotgeber", fr: "Conseils" },
    weiterlesenKurz: { de: "Weiterlesen", en: "Read more", lb: "Weiderliesen", fr: "Lire la suite" },
    mehrRatgeber:  { de: "Weiterlesen im Ratgeber", en: "More guides", lb: "Méi Rotgeber", fr: "À lire aussi" },
    stand:         { de: "Stand:", en: "Last updated:", lb: "Stand:", fr: "Mise à jour :" },
    zurWarteliste: { de: "Kein passendes Kitten dabei? Zur Warteliste", en: "No kitten for you this time? Join the waiting list",
                     lb: "Keen Kitten fir dech derbäi? Op d'Waardelëscht", fr: "Pas de chaton pour vous ? Liste d'attente" },
    warteFrage:    { de: "Auf die Warteliste", en: "Join the waiting list", lb: "Op d'Waardelëscht", fr: "S'inscrire sur la liste" },
    warteBetreff:  { de: "Warteliste Praia da Ursa", en: "Waiting list Praia da Ursa",
                     lb: "Waardelëscht Praia da Ursa", fr: "Liste d'attente Praia da Ursa" },

    /* Bildbeschreibungen fuer Google und Vorleseprogramme */
    altKitten:     { de: "Heilige-Birma-Kitten", en: "Sacred Birman kitten",
                     lb: "Hellege-Birma-Kitten", fr: "Chaton Sacré de Birmanie" },
    altKatze:      { de: "Heilige-Birma-Katze", en: "Sacred Birman cat",
                     lb: "Hellege-Birma-Kaz", fr: "Chatte Sacré de Birmanie" },
    altKater:      { de: "Heilige-Birma-Kater", en: "Sacred Birman stud",
                     lb: "Hellege-Birma-Kueder", fr: "Chat Sacré de Birmanie" }
  };

  function u(schluessel) { return t(UI[schluessel]); }

  function esc(text) {
    return String(text).replace(/[&<>"']/g, function (z) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z];
    });
  }

  /* Absaetze: doppelter Zeilenumbruch in inhalte.js wird zu <p> */
  function absaetze(wert) {
    return t(wert).split(/\n\s*\n/).map(function (a) {
      return "<p>" + esc(a).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  /* Fuer Ratgeber, Fragen, Rasse und Warteliste: Zeilen mit "- " werden
     zur Aufzaehlung, [Text](seite.html) wird zum Link. Links auf Seiten,
     die es in dieser Sprache nicht gibt, bleiben einfacher Text.        */
  function verlinken(roh) {
    return esc(roh).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (ganz, text, ziel) {
      if (/^https:\/\/[^\s"<>]+$/.test(ziel)) {
        return '<a href="' + ziel + '" rel="noopener">' + text + "</a>";
      }
      var datei = ziel.split("#")[0];
      if (/^[a-z0-9][a-z0-9\-]*\.html$/.test(datei) && gibtEs(sprache, datei)) {
        return '<a href="' + ziel + '">' + text + "</a>";
      }
      return text;
    });
  }

  function reichtext(wert) {
    return t(wert).split(/\n\s*\n/).map(function (a) {
      var zeilen = a.split("\n");
      if (zeilen.every(function (z) { return /^\s*-\s+/.test(z); })) {
        return '<ul class="liste">' + zeilen.map(function (z) {
          return "<li>" + verlinken(z.replace(/^\s*-\s+/, "")) + "</li>";
        }).join("") + "</ul>";
      }
      return "<p>" + verlinken(a).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  function datum(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return esc(iso || "");
    var d = new Date(iso + "T12:00:00");
    var form = { day: "2-digit", month: "long", year: "numeric" };
    try { return d.toLocaleDateString(GEBIET[sprache] || "de-DE", form); }
    catch (e) { return d.toLocaleDateString("de-DE", form); }
  }

  /* ---------- Fotos und Videos ------------------------------ */

  var VIDEO = /\.(mp4|webm|m4v|mov)$/i;
  function istVideo(pfad) { return VIDEO.test(pfad || ""); }

  /* Wer am System "Bewegung reduzieren" eingestellt hat, bekommt
     keine automatisch laufenden Diashows und Videos.            */
  var ruhig = !!(window.matchMedia &&
                 window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* Ein Foto oder ein Video. Videos laufen stumm, im Fenster und nie
     im Vollbild; abgespielt werden sie erst, wenn sie zu sehen sind. */
  function medium(pfad, alt, inDiashow) {
    if (istVideo(pfad)) {
      return '<video src="' + esc(pfad) + '#t=0.1" data-pfad="' + esc(pfad) + '" ' +
        'muted playsinline preload="metadata" disablepictureinpicture ' +
        'disableremoteplayback controlslist="nofullscreen nodownload noremoteplayback"' +
        (inDiashow ? "" : " loop") +
        (alt ? ' aria-label="' + esc(t(alt)) + '"' : "") + "></video>";
    }
    return '<img src="' + esc(pfad) + '" alt="' + esc(t(alt)) + '" loading="lazy" ' +
      'data-pfad="' + esc(pfad) + '">';
  }

  function bild(pfad, alt, klassen) {
    if (!pfad) return "";
    return '<div class="bild-rahmen ' + (klassen || "") + '">' + medium(pfad, alt, false) + "</div>";
  }

  function spielen(video) {
    var versuch = video.play();
    if (versuch && versuch.catch) { versuch.catch(function () {}); }
  }

  /* Ersetzt fehlende Fotos und Videos durch eine getoente Flaeche */
  function bilderAbsichern(wurzel) {
    wurzel.querySelectorAll("img[data-pfad], video[data-pfad]").forEach(function (el) {
      el.addEventListener("error", function () {
        var rahmen = el.parentElement;
        if (!rahmen || rahmen.querySelector(".bild-fehlt")) return;
        rahmen.innerHTML = '<div class="bild-fehlt"><b>' + esc(u("bildFehlt")) + "</b>" +
          "<code>" + esc(el.getAttribute("data-pfad")) + "</code></div>";
      });
    });
  }

  /* ---------- Ornamente ------------------------------------ */

  var KRANZ =
    '<svg class="medaillon-svg" viewBox="0 0 360 410" fill="none" ' +
      'stroke-linecap="round" aria-hidden="true">' +

      /* innerer Ring am Bildrand */
      '<ellipse cx="180" cy="205" rx="106" ry="122" stroke="var(--blau)" stroke-width="1.2"/>' +

      /* Guilloche: zwei gegenlaeufige Wellen, die sich an jedem
         Knoten kreuzen und dadurch geflochten wirken. Rechnerisch
         erzeugt, damit der Ring exakt symmetrisch schliesst.      */
      '<path d="M300.0 205.0L302.6 208.2L304.2 211.4L304.1 214.6L302.2 217.6L299.2 220.5L296.3 223.1L294.2 225.8L293.8 228.8L294.9 232.1L297.0 235.7L299.0 239.5L299.9 243.0L299.1 246.1L296.7 248.6L293.3 250.6L289.8 252.4L287.3 254.5L286.4 257.3L286.8 260.8L288.1 264.9L289.3 269.1L289.5 272.8L288.1 275.6L285.3 277.4L281.6 278.4L277.9 279.3L275.1 280.7L273.6 283.2L273.3 286.7L273.8 291.0L274.2 295.4L273.6 299.1L271.8 301.5L268.7 302.5L264.9 302.6L261.1 302.5L258.0 303.2L256.1 305.2L255.2 308.6L254.8 312.9L254.3 317.2L253.1 320.7L250.8 322.5L247.6 322.7L243.8 321.8L240.2 320.8L237.1 320.7L234.8 322.1L233.3 325.2L232.1 329.3L230.7 333.5L228.9 336.5L226.3 337.7L223.1 337.1L219.6 335.3L216.3 333.3L213.3 332.4L210.8 333.2L208.7 335.8L206.7 339.5L204.6 343.2L202.2 345.7L199.5 346.2L196.5 344.8L193.4 342.1L190.5 339.4L187.8 337.7L185.2 337.9L182.6 339.9L180.0 343.0L177.2 346.0L174.4 347.8L171.6 347.7L169.0 345.5L166.6 342.1L164.3 338.7L161.9 336.4L159.3 335.9L156.5 337.2L153.3 339.5L150.0 341.8L146.9 342.8L144.2 341.9L142.1 339.2L140.4 335.3L138.8 331.3L136.9 328.5L134.5 327.3L131.5 327.8L127.9 329.3L124.3 330.7L121.1 330.9L118.6 329.4L117.1 326.1L116.2 321.8L115.4 317.6L114.1 314.3L112.0 312.6L108.9 312.3L105.2 312.9L101.4 313.3L98.2 312.7L96.1 310.5L95.2 307.0L95.1 302.6L95.2 298.2L94.6 294.7L92.9 292.5L89.9 291.5L86.2 291.0L82.4 290.5L79.4 289.0L77.8 286.4L77.6 282.7L78.4 278.4L79.3 274.2L79.4 270.6L78.1 268.0L75.5 266.3L71.9 264.9L68.3 263.3L65.7 261.2L64.6 258.2L65.1 254.6L66.7 250.6L68.4 246.7L69.2 243.3L68.5 240.4L66.2 238.0L63.0 235.7L59.8 233.3L57.7 230.5L57.2 227.4L58.4 223.9L60.8 220.5L63.2 217.1L64.6 213.9L64.5 211.0L62.7 208.0L60.0 205.0L57.4 201.8L55.8 198.6L55.9 195.4L57.8 192.4L60.8 189.5L63.7 186.9L65.8 184.2L66.2 181.2L65.1 177.9L63.0 174.3L61.0 170.5L60.1 167.0L60.9 163.9L63.3 161.4L66.7 159.4L70.2 157.6L72.7 155.5L73.6 152.7L73.2 149.2L71.9 145.1L70.7 140.9L70.5 137.2L71.9 134.4L74.7 132.6L78.4 131.6L82.1 130.7L84.9 129.3L86.4 126.8L86.7 123.3L86.2 119.0L85.8 114.6L86.4 110.9L88.2 108.5L91.3 107.5L95.1 107.4L98.9 107.5L102.0 106.8L103.9 104.8L104.8 101.4L105.2 97.1L105.7 92.8L106.9 89.3L109.2 87.5L112.4 87.3L116.2 88.2L119.8 89.2L122.9 89.3L125.2 87.9L126.7 84.8L127.9 80.7L129.3 76.5L131.1 73.5L133.7 72.3L136.9 72.9L140.4 74.7L143.7 76.7L146.7 77.6L149.2 76.8L151.3 74.2L153.3 70.5L155.4 66.8L157.8 64.3L160.5 63.8L163.5 65.2L166.6 67.9L169.5 70.6L172.2 72.3L174.8 72.1L177.4 70.1L180.0 67.0L182.8 64.0L185.6 62.2L188.4 62.3L191.0 64.5L193.4 67.9L195.7 71.3L198.1 73.6L200.7 74.1L203.5 72.8L206.7 70.5L210.0 68.2L213.1 67.2L215.8 68.1L217.9 70.8L219.6 74.7L221.2 78.7L223.1 81.5L225.5 82.7L228.5 82.2L232.1 80.7L235.7 79.3L238.9 79.1L241.4 80.6L242.9 83.9L243.8 88.2L244.6 92.4L245.9 95.7L248.0 97.4L251.1 97.7L254.8 97.1L258.6 96.7L261.8 97.3L263.9 99.5L264.8 103.0L264.9 107.4L264.8 111.8L265.4 115.3L267.1 117.5L270.1 118.5L273.8 119.0L277.6 119.5L280.6 121.0L282.2 123.6L282.4 127.3L281.6 131.6L280.7 135.8L280.6 139.4L281.9 142.0L284.5 143.7L288.1 145.1L291.7 146.7L294.3 148.8L295.4 151.8L294.9 155.4L293.3 159.4L291.6 163.3L290.8 166.7L291.5 169.6L293.8 172.0L297.0 174.3L300.2 176.7L302.3 179.5L302.8 182.6L301.6 186.1L299.2 189.5L296.8 192.9L295.4 196.1L295.5 199.0L297.3 202.0L300.0 205.0Z" stroke="var(--taupe)" stroke-width=".9"/>' +
      '<path d="M300.0 205.0L297.3 208.0L295.5 211.0L295.4 213.9L296.8 217.1L299.2 220.5L301.6 223.9L302.8 227.4L302.3 230.5L300.2 233.3L297.0 235.7L293.8 238.0L291.5 240.4L290.8 243.3L291.6 246.7L293.3 250.6L294.9 254.6L295.4 258.2L294.3 261.2L291.7 263.3L288.1 264.9L284.5 266.3L281.9 268.0L280.6 270.6L280.7 274.2L281.6 278.4L282.4 282.7L282.2 286.4L280.6 289.0L277.6 290.5L273.8 291.0L270.1 291.5L267.1 292.5L265.4 294.7L264.8 298.2L264.9 302.6L264.8 307.0L263.9 310.5L261.8 312.7L258.6 313.3L254.8 312.9L251.1 312.3L248.0 312.6L245.9 314.3L244.6 317.6L243.8 321.8L242.9 326.1L241.4 329.4L238.9 330.9L235.7 330.7L232.1 329.3L228.5 327.8L225.5 327.3L223.1 328.5L221.2 331.3L219.6 335.3L217.9 339.2L215.8 341.9L213.1 342.8L210.0 341.8L206.7 339.5L203.5 337.2L200.7 335.9L198.1 336.4L195.7 338.7L193.4 342.1L191.0 345.5L188.4 347.7L185.6 347.8L182.8 346.0L180.0 343.0L177.4 339.9L174.8 337.9L172.2 337.7L169.5 339.4L166.6 342.1L163.5 344.8L160.5 346.2L157.8 345.7L155.4 343.2L153.3 339.5L151.3 335.8L149.2 333.2L146.7 332.4L143.7 333.3L140.4 335.3L136.9 337.1L133.7 337.7L131.1 336.5L129.3 333.5L127.9 329.3L126.7 325.2L125.2 322.1L122.9 320.7L119.8 320.8L116.2 321.8L112.4 322.7L109.2 322.5L106.9 320.7L105.7 317.2L105.2 312.9L104.8 308.6L103.9 305.2L102.0 303.2L98.9 302.5L95.1 302.6L91.3 302.5L88.2 301.5L86.4 299.1L85.8 295.4L86.2 291.0L86.7 286.7L86.4 283.2L84.9 280.7L82.1 279.3L78.4 278.4L74.7 277.4L71.9 275.6L70.5 272.8L70.7 269.1L71.9 264.9L73.2 260.8L73.6 257.3L72.7 254.5L70.2 252.4L66.7 250.6L63.3 248.6L60.9 246.1L60.1 243.0L61.0 239.5L63.0 235.7L65.1 232.1L66.2 228.8L65.8 225.8L63.7 223.1L60.8 220.5L57.8 217.6L55.9 214.6L55.8 211.4L57.4 208.2L60.0 205.0L62.7 202.0L64.5 199.0L64.6 196.1L63.2 192.9L60.8 189.5L58.4 186.1L57.2 182.6L57.7 179.5L59.8 176.7L63.0 174.3L66.2 172.0L68.5 169.6L69.2 166.7L68.4 163.3L66.7 159.4L65.1 155.4L64.6 151.8L65.7 148.8L68.3 146.7L71.9 145.1L75.5 143.7L78.1 142.0L79.4 139.4L79.3 135.8L78.4 131.6L77.6 127.3L77.8 123.6L79.4 121.0L82.4 119.5L86.2 119.0L89.9 118.5L92.9 117.5L94.6 115.3L95.2 111.8L95.1 107.4L95.2 103.0L96.1 99.5L98.2 97.3L101.4 96.7L105.2 97.1L108.9 97.7L112.0 97.4L114.1 95.7L115.4 92.4L116.2 88.2L117.1 83.9L118.6 80.6L121.1 79.1L124.3 79.3L127.9 80.7L131.5 82.2L134.5 82.7L136.9 81.5L138.8 78.7L140.4 74.7L142.1 70.8L144.2 68.1L146.9 67.2L150.0 68.2L153.3 70.5L156.5 72.8L159.3 74.1L161.9 73.6L164.3 71.3L166.6 67.9L169.0 64.5L171.6 62.3L174.4 62.2L177.2 64.0L180.0 67.0L182.6 70.1L185.2 72.1L187.8 72.3L190.5 70.6L193.4 67.9L196.5 65.2L199.5 63.8L202.2 64.3L204.6 66.8L206.7 70.5L208.7 74.2L210.8 76.8L213.3 77.6L216.3 76.7L219.6 74.7L223.1 72.9L226.3 72.3L228.9 73.5L230.7 76.5L232.1 80.7L233.3 84.8L234.8 87.9L237.1 89.3L240.2 89.2L243.8 88.2L247.6 87.3L250.8 87.5L253.1 89.3L254.3 92.8L254.8 97.1L255.2 101.4L256.1 104.8L258.0 106.8L261.1 107.5L264.9 107.4L268.7 107.5L271.8 108.5L273.6 110.9L274.2 114.6L273.8 119.0L273.3 123.3L273.6 126.8L275.1 129.3L277.9 130.7L281.6 131.6L285.3 132.6L288.1 134.4L289.5 137.2L289.3 140.9L288.1 145.1L286.8 149.2L286.4 152.7L287.3 155.5L289.8 157.6L293.3 159.4L296.7 161.4L299.1 163.9L299.9 167.0L299.0 170.5L297.0 174.3L294.9 177.9L293.8 181.2L294.2 184.2L296.3 186.9L299.2 189.5L302.2 192.4L304.1 195.4L304.2 198.6L302.6 201.8L300.0 205.0Z" stroke="var(--taupe)" stroke-width=".9"/>' +

      /* gepunkteter Ring */
      '<ellipse cx="180" cy="205" rx="134" ry="154" stroke="var(--blau)" stroke-width="2.6" ' +
              'stroke-dasharray="1 8"/>' +

      /* die beiden aeusseren Rahmen — dahinter nichts mehr */
      '<ellipse cx="180" cy="205" rx="144" ry="166" stroke="var(--blau)" stroke-width="2.4"/>' +
      '<ellipse cx="180" cy="205" rx="150" ry="172" stroke="var(--taupe)" stroke-width="1"/>' +
    "</svg>";

  var STATUS_TEXT = {
    verfuegbar: { de: "Verfügbar", en: "Available", lb: "Disponibel", fr: "Disponible" },
    reserviert: { de: "Reserviert", en: "Reserved", lb: "Reservéiert", fr: "Réservé" },
    vergeben:   { de: "Vergeben",   en: "Homed",    lb: "Adoptéiert",  fr: "Adopté" }
  };
  /* Im Franzoesischen richtet sich das Wort nach dem Geschlecht */
  var STATUS_FR = {
    w: { verfuegbar: "Disponible", reserviert: "Réservée", vergeben: "Adoptée" },
    p: { verfuegbar: "Disponibles", reserviert: "Réservés", vergeben: "Adoptés" }
  };

  function statusMarke(status, geschlecht) {
    var s = STATUS_TEXT[status] ? status : "reserviert";
    var text = (sprache === "fr" && STATUS_FR[geschlecht]) ? STATUS_FR[geschlecht][s]
                                                          : t(STATUS_TEXT[s]);
    return '<span class="status status--' + s + '">' + esc(text) + "</span>";
  }

  /* "tel:" vertraegt nur Ziffern und ein fuehrendes Plus */
  function telefonLink() {
    return "tel:" + INHALTE.zucht.telefon.replace(/[^\d+]/g, "");
  }

  /* Pfad des Medaillonfotos — kommt aus dem Ordner 02-logo-medaillon */
  function logoPfad() {
    return INHALTE.zucht.logoBild || "bilder/logo-portrait.jpg";
  }

  var ZAHLWORT = {
    de: ["kein", "Ein", "Zwei", "Drei", "Vier", "Fünf", "Sechs",
         "Sieben", "Acht", "Neun", "Zehn", "Elf", "Zwölf"],
    en: ["no", "One", "Two", "Three", "Four", "Five", "Six",
         "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"],
    lb: ["keng", "Ee", "Zwee", "Dräi", "Véier", "Fënnef", "Sechs",
         "Siwen", "Aacht", "Néng", "Zéng", "Eelef", "Zwielef"],
    fr: ["aucun", "Un", "Deux", "Trois", "Quatre", "Cinq", "Six",
         "Sept", "Huit", "Neuf", "Dix", "Onze", "Douze"]
  };

  /* "Vier Kitten" statt einer festen Zahl — richtet sich nach dem Wurf */
  function kittenZahl(anzahl) {
    var woerter = ZAHLWORT[sprache] || ZAHLWORT.de;
    var wort = anzahl < woerter.length ? woerter[anzahl] : String(anzahl);
    if (sprache === "en") { return wort + (anzahl === 1 ? " kitten" : " kittens"); }
    if (sprache === "fr") { return wort + (anzahl === 1 ? " chaton" : " chatons"); }
    return wort + " Kitten";
  }

  function nochFrei(anzahl) {
    var texte = {
      de: anzahl + " noch verfügbar",
      en: anzahl + " still available",
      lb: anzahl + " nach disponibel",
      fr: anzahl + (anzahl === 1 ? " chaton encore disponible" : " chatons encore disponibles")
    };
    return texte[sprache] || texte.de;
  }

  function whatsappLink(text) {
    var z = INHALTE.zucht;
    return "https://wa.me/" + z.whatsapp.replace(/\D/g, "") +
      "?text=" + encodeURIComponent(t(text || z.whatsappText));
  }

  /* Ein Bildplatz. Liegen dafuer mehrere Fotos oder Videos vor
     (1.jpg, 1.1.mp4, 1.2.jpg ...), entsteht automatisch eine Diashow. */
  function bildplatz(gruppe, ersatz, alt, klassen) {
    var liste = (gruppe && gruppe.length) ? gruppe : (ersatz ? [ersatz] : []);
    if (!liste.length) return "";
    if (liste.length === 1) return bild(liste[0], alt, klassen);

    var dias = liste.map(function (pfad, i) {
      return '<div class="dia" data-aktiv="' + (i === 0) + '">' +
        medium(pfad, i === 0 ? alt : nummeriert(alt, i + 1), true) + "</div>";
    }).join("");

    var punkte = liste.map(function (pfad, i) {
      return '<button type="button" data-dia="' + i + '" aria-current="' + (i === 0) +
        '"><span class="nur-vorleser">' + esc(u("bild")) + " " + (i + 1) + "</span></button>";
    }).join("");

    return '<div class="diashow ' + (klassen || "") + '">' + dias +
      '<button class="dia-taste dia-taste--zurueck" type="button" aria-label="' +
        esc(u("bildZurueck")) + '">‹</button>' +
      '<button class="dia-taste dia-taste--vor" type="button" aria-label="' +
        esc(u("bildVor")) + '">›</button>' +
      '<div class="dia-punkte">' + punkte + "</div></div>";
  }

  /* "Heilige-Birma-Kitten Ash (Blue Silver Tabby Point)" */
  function bildText(art, name, farbe) {
    return u(art) + " " + name + (farbe ? " (" + farbe + ")" : "");
  }

  /* Weitere Fotos derselben Katze: "… · Bild 2" */
  function nummeriert(alt, nr) {
    var grund = t(alt);
    return grund ? grund + " · " + u("bild") + " " + nr : "";
  }

  /* Fotos, die nicht schon im ersten Bildplatz stecken */
  function restBilder(o) {
    var erste = (o.bildgruppen && o.bildgruppen[0]) ? o.bildgruppen[0].length : 1;
    return (o.bilder || []).slice(erste);
  }

  /* Waagerechter Galeriestreifen, anklickbar wie die uebrigen Galerien */
  function streifen(bilder, alt) {
    if (!bilder || !bilder.length) return "";
    return '<div class="streifen">' + bilder.map(function (pfad, i) {
      return '<button type="button" data-gross="' + esc(pfad) + '">' +
        bild(pfad, nummeriert(alt, i + 1), "hoch bogen gerahmt") + "</button>";
    }).join("") + "</div>";
  }

  function galerie(bilder, alt) {
    if (!bilder || !bilder.length) return "";
    return '<div class="galerie">' + bilder.map(function (p, i) {
      return '<button type="button" data-gross="' + esc(p) + '">' +
        bild(p, nummeriert(alt, i + 2), "quadr") + "</button>";
    }).join("") + "</div>";
  }

  /* ---------- Kopfzeile und Fusszeile ---------------------- */

  function kopfBauen(seite) {
    var z = INHALTE.zucht;
    var punkte = INHALTE.navigation.map(function (n) {
      var aktiv = n.datei === seite ? ' aria-current="page"' : "";
      return '<a href="' + esc(seitenPfad(n.datei)) + '"' + aktiv + ">" + esc(t(n.label)) + "</a>";
    }).join("");

    /* Auf fertig erzeugten Seiten fuehrt jede Sprache zu ihrer eigenen
       Adresse — so findet Google jede Sprachfassung einzeln.          */
    var umschalter = SPRACHEN.map(function (s) {
      if (BAU || STATISCH) {
        return '<a href="' + esc(seitenPfad(seite, s)) + '" lang="' + s + '" hreflang="' + s + '"' +
          (s === sprache ? ' aria-current="true"' : "") + ">" + s.toUpperCase() + "</a>";
      }
      return '<button type="button" data-sprache="' + s + '" lang="' + s + '" aria-pressed="' +
        (s === sprache) + '">' + s.toUpperCase() + "</button>";
    }).join("<span>/</span>");

    return '<a class="sprung" href="#inhalt">' + esc(u("sprung")) + "</a>" +
      '<header class="kopf">' +
        '<a class="wortmarke" href="' + esc(seitenPfad("index.html")) + '">' +
          '<span class="marke-oval">' + bild(logoPfad(), z.name, "") + "</span>" +
          '<span class="marke-schrift"><b>' + esc(z.name) + "</b>" +
            "<span>" + esc(t(z.untertitel)) + "</span></span>" +
        "</a>" +
        '<button class="menuetaste" type="button" aria-expanded="false" aria-controls="hauptmenue">' +
          esc(u("menue")) + "</button>" +
        '<nav class="navi" id="hauptmenue" aria-label="' + esc(u("hauptnavi")) + '">' +
          punkte +
          '<div class="sprachen" role="group" aria-label="' + esc(u("sprachwahl")) + '">' +
            umschalter + "</div>" +
        "</nav>" +
      "</header>";
  }

  function fussBauen() {
    var z = INHALTE.zucht;
    var punkte = INHALTE.navigation.map(function (n) {
      return "<li><a href=" + '"' + esc(seitenPfad(n.datei)) + '">' + esc(t(n.label)) + "</a></li>";
    }).join("");

    /* Zweite Spalte fuer Ratgeber, Rasse, Fragen und Warteliste — das
       Hauptmenue bleibt dadurch bei seinen Punkten.                    */
    var wissen = (INHALTE.wissen || []).filter(function (n) { return gibtEs(sprache, n.datei); });
    var wissenSpalte = wissen.length ? '<div><p class="marke">' + esc(u("wissen")) + "</p><ul>" +
      wissen.map(function (n) {
        return '<li><a href="' + esc(seitenPfad(n.datei)) + '">' + esc(t(n.label)) + "</a></li>";
      }).join("") + "</ul></div>" : "";

    return '<footer class="fuss"><div class="fuss-innen">' +
        "<div>" +
          '<p class="fuss-name">' + esc(z.name) + "</p>" +
          '<p class="leise" style="margin:0">' + esc(t(z.untertitel)) + "</p>" +
        "</div>" +
        '<div><p class="marke">' + esc(u("seiten")) + "</p><ul>" + punkte + "</ul></div>" +
        wissenSpalte +
        '<div><p class="marke">' + esc(u("kontakt")) + "</p><ul>" +
          '<li><a href="' + whatsappLink() + '" rel="noopener">WhatsApp</a></li>' +
          '<li><a href="mailto:' + esc(z.email) + '">' + esc(z.email) + "</a></li>" +
          (z.telefon ? '<li><a href="' + telefonLink() + '">' + esc(z.telefon) + "</a></li>" : "") +
          (z.instagram ? '<li><a href="' + esc(z.instagram) + '" rel="noopener">Instagram</a></li>' : "") +
        "</ul></div>" +
        '<div><p class="marke">' + esc(u("verband")) + "</p><ul>" +
          '<li><a href="' + esc(z.verband.url) + '" rel="noopener">' + esc(z.verband.name) + "</a></li>" +
        "</ul></div>" +
      "</div>" +
      '<div class="fuss-unten">' +
        "<span>© " + new Date().getFullYear() + " " + esc(z.name) + "</span>" +
        '<a href="' + esc(rechtsPfad("impressum.html")) + '">' + esc(u("impressum")) + "</a>" +
        '<a href="' + esc(rechtsPfad("datenschutz.html")) + '">' + esc(u("datenschutz")) + "</a>" +
      "</div></footer>";
  }

  /* ---------- Wiederkehrende Bausteine --------------------- */

  var FLEURON =
    '<svg class="zierrat" viewBox="0 0 140 22" fill="none" stroke="currentColor" ' +
      'stroke-width="1.2" stroke-linecap="round" aria-hidden="true">' +
      '<defs><g id="pdu-fleuron">' +
        '<path d="M62 11 C50 11 44 3 32 5 C21 6.5 19 15 29 16 C36 16.7 39 11 34 8.5"/>' +
        '<path d="M50 11 C44 16.5 36 17.5 29 14" stroke-width=".9"/>' +
      "</g></defs>" +
      '<use href="#pdu-fleuron"/>' +
      '<use href="#pdu-fleuron" transform="translate(140,0) scale(-1,1)"/>' +
      '<path d="M70 6 L74 11 L70 16 L66 11 Z" fill="currentColor" stroke="none"/>' +
    "</svg>";

  function seitenkopf(marke, titel, text) {
    return '<div class="seitenkopf"><div class="breit">' + FLEURON +
      '<h1 class="kopf-titel"><span class="marke">' + esc(t(marke)) + "</span> " +
        '<span class="titel">' + esc(t(titel)) + "</span></h1>" +
      (text ? '<div class="fliess leise">' + absaetze(text) + "</div>" : "") +
      "</div></div>";
  }

  function kontaktband(art) {
    var z = INHALTE.zucht;
    var warte = art === "warteliste";
    var wa = warte && INHALTE.warteliste ? whatsappLink(INHALTE.warteliste.whatsappText) : whatsappLink();
    var mail = "mailto:" + esc(z.email) + (warte ? "?subject=" + encodeURIComponent(u("warteBetreff")) : "");
    /* Unter den Knoepfen ein dezenter Hinweis auf die Warteliste —
       ueber sie entscheidet sich, wann der naechste Wurf kommt.      */
    var hinweis = !warte && gibtEs(sprache, "warteliste.html") && INHALTE.warteliste
      ? '<p class="warte-hinweis"><a href="' + esc(seitenPfad("warteliste.html")) + '">' +
        esc(u("zurWarteliste")) + "</a></p>" : "";
    return '<section class="abschnitt"><div class="eng" style="text-align:center">' +
      '<p class="marke">' + esc(u("kontaktMarke")) + "</p>" +
      '<h2 class="untertitel">' + esc(u(warte ? "warteFrage" : "frage")) + "</h2>" +
      '<div class="knopf-reihe" style="justify-content:center">' +
        '<a class="knopf knopf--voll" href="' + wa + '" rel="noopener">' +
          esc(u("perWhatsapp")) + "</a>" +
        '<a class="knopf" href="' + mail + '">' + esc(u("perMail")) + "</a>" +
        (z.telefon ? '<a class="knopf" href="' + telefonLink() + '">' + esc(u("anrufen")) + "</a>" : "") +
      "</div>" + hinweis + "</div></section>";
  }

  /* ---------- Die einzelnen Seiten ------------------------- */

  var SEITEN = {};

  SEITEN["index.html"] = function () {
    var z = INHALTE.zucht, s = INHALTE.start, w = INHALTE.wurf;

    var wurfteaser;
    if (w.vorhanden) {
      var frei = w.kitten.filter(function (k) { return k.status === "verfuegbar"; }).length;
      wurfteaser = '<p class="marke">' + esc(t(w.bezeichnung)) + "</p>" +
        '<h2 class="titel">' + esc(kittenZahl(w.kitten.length)) + "</h2>" +
        '<div class="fliess leise">' + absaetze(w.text) + "</div>" +
        '<p style="margin-top:1.5rem">' + statusMarke(frei ? "verfuegbar" : "reserviert", "p") + " " +
          '<span class="leise" style="margin-left:.5rem">' +
          esc(frei ? nochFrei(frei) : u("alleReserviert")) + "</span></p>" +
        '<div class="knopf-reihe"><a class="knopf" href="kitten.html">' +
          esc(u("kittenAnsehen")) + "</a></div>";
    } else {
      wurfteaser = '<p class="marke">' + esc(u("wuerfe")) + "</p>" +
        '<h2 class="titel">' + esc(u("inPlanung")) + "</h2>" +
        '<div class="fliess leise">' + absaetze(w.keinWurfText) + "</div>" +
        '<div class="knopf-reihe"><a class="knopf" href="kitten.html">' +
          esc(u("mehrDazu")) + "</a></div>";
    }

    /* Die Mutter gezielt suchen — die Ordner sind alphabetisch sortiert,
       "luigi" kaeme sonst vor "yoselin" und stuende unter "Die Mutter". */
    var katze = INHALTE.katzen.filter(function (k) { return k.rolle === "koenigin"; })[0] ||
                INHALTE.katzen[0];

    return '<section class="empfang">' +
        '<div class="medaillon">' + KRANZ +
          '<div class="medaillon-bild"><div class="bild-rahmen">' +
            '<img src="' + esc(logoPfad()) + '" data-pfad="' + esc(logoPfad()) + '" alt="' +
            esc(z.name + " · " + t(z.untertitel)) + '" fetchpriority="high"></div></div>' +
        "</div>" +
        '<h1 class="empfang-titel"><span class="empfang-name">' + esc(z.name) + "</span> " +
          (z.gegruendet ? '<span class="est">Est. ' + esc(z.gegruendet) + "</span> " : "") +
          '<span class="empfang-unter">' + esc(t(z.untertitel)) + "</span></h1>" +
        '<p class="empfang-satz">' + esc(t(z.leitsatz)) + "</p>" +
        '<a class="weiter" href="#zucht">' + esc(u("weiterlesen")) + "</a>" +
      "</section>" +

      '<section class="abschnitt" id="zucht"><div class="breit paar">' +
        "<div>" +
          '<p class="marke">' + esc(u("dieZucht")) + "</p>" +
          '<h2 class="titel">' + esc(t(s.zuchtTitel)) + "</h2>" +
          '<div class="fliess leise">' + absaetze(s.zuchtText) + "</div>" +
          '<div class="knopf-reihe"><a class="knopf" href="ueber-uns.html">' +
            esc(u("ueberUns")) + "</a></div>" +
        "</div>" +
        bildplatz(s.zuchtGruppe, s.zuchtBild, s.zuchtBildAlt, "hoch bogen gerahmt") +
      "</div></section>" +

      (katze ? '<section class="abschnitt"><div class="breit paar paar--umgekehrt">' +
        "<div>" +
          '<p class="marke">' + esc(u("dieMutter")) + "</p>" +
          '<h2 class="titel">' + esc(katze.rufname) + "</h2>" +
          '<div class="fliess leise">' + absaetze(katze.text) + "</div>" +
          '<div class="knopf-reihe"><a class="knopf" href="katzen.html">' +
            esc(u("ihrSteckbrief")) + "</a></div>" +
        "</div>" +
        bildplatz(katze.bildgruppen && katze.bildgruppen[0], katze.bilder[0],
                  bildText("altKatze", katze.rufname, t(katze.farbschlag)), "hoch bogen gerahmt") +
      "</div></section>" : "") +

      '<section class="abschnitt"><div class="breit paar">' +
        "<div>" + wurfteaser + "</div>" +
        bildplatz(w.bilder && w.bilder.length ? [w.bilder[0]] :
                    (w.vorhanden && w.kitten[0] ? w.kitten[0].bildgruppen[0] : null),
                  w.vorhanden && w.kitten[0] ? w.kitten[0].bilder[0] : "bilder/zucht.jpg",
                  UI.suchKitten, "hoch bogen gerahmt") +
      "</div></section>" +

      kontaktband();
  };

  SEITEN["ueber-uns.html"] = function () {
    var uu = INHALTE.ueberuns;
    var bloecke = uu.absaetze.map(function (a, i) {
      return '<section class="abschnitt">' +
        '<div class="breit paar' + (i % 2 ? " paar--umgekehrt" : "") + '">' +
          "<div>" +
            '<p class="marke">0' + (i + 1) + "</p>" +
            '<h2 class="untertitel">' + esc(t(a.titel)) + "</h2>" +
            '<div class="fliess leise">' + absaetze(a.text) + "</div>" +
          "</div>" +
          /* Jeder Abschnitt bekommt ein eigenes Foto, sofern vorhanden */
          bildplatz(uu.gruppen && uu.gruppen.length ? uu.gruppen[i % uu.gruppen.length] : null,
                    (uu.bilder && uu.bilder.length ? uu.bilder[i % uu.bilder.length] : uu.bild),
                    i === 0 ? uu.bildAlt : "", "hoch bogen gerahmt") +
        "</div></section>";
    }).join("");

    return seitenkopf(UI.suchUeberUns, UI.wieWirZuechten, UI.ueberUnsIntro) +
      bloecke + kontaktband();
  };

  SEITEN["katzen.html"] = function () {
    var rollen = [
      { schluessel: "koenigin",
        ein:  { de: "Mutter", en: "Mother", lb: "Mamm", fr: "Mère" },
        mehr: { de: "Mütter", en: "Mothers", lb: "Mammen", fr: "Mères" } },
      { schluessel: "kater",
        ein:  { de: "Vater", en: "Father", lb: "Papp", fr: "Père" },
        mehr: { de: "Väter", en: "Fathers", lb: "Pappen", fr: "Pères" } }
    ];

    var teile = rollen.map(function (r) {
      var tiere = INHALTE.katzen.filter(function (k) { return k.rolle === r.schluessel; });
      if (!tiere.length) return "";
      var einzeln = tiere.length === 1 ? " raster--einzeln" : "";
      return '<section class="abschnitt"><div class="breit">' +
        '<p class="marke">' + esc(t(tiere.length === 1 ? r.ein : r.mehr)) + "</p>" +
        '<div class="raster raster--zwei' + einzeln + '">' +
          tiere.map(katzenKarte).join("") +
        "</div></div></section>";
    }).join("");

    var eine = INHALTE.katzen.length === 1;
    return seitenkopf(eine ? UI.suchKatze : UI.suchKatzen,
                      eine ? UI.katzeTitelEine : UI.katzeTitelMehr, null) +
      teile + kontaktband();
  };

  function katzenKarte(k) {
    var eintraege = [
      [UI.geboren, datum(k.geboren)],
      [UI.farbschlag, esc(t(k.farbschlag))],
      [UI.vollerName, esc(k.vollerName)],
      [UI.blutgruppe, esc(k.blutgruppe)],
      [UI.gesundheit, (k.gentests || []).map(esc).join("<br>")],
      [UI.zuchtLabel, !k.zucht ? "" : (k.zuchtLink
        ? '<a href="' + esc(k.zuchtLink) + '" rel="noopener">' + esc(k.zucht) + "</a>"
        : esc(k.zucht))]
    ].filter(function (e) { return e[1]; });

    var farbe = t(k.farbschlag);
    var bt = bildText(k.rolle === "kater" ? "altKater" : "altKatze", k.rufname, farbe);
    return '<article class="karte" id="katze-' + esc(k.id) + '">' +
      '<div class="paar" style="align-items:start">' +
        bildplatz(k.bildgruppen && k.bildgruppen[0], k.bilder[0], bt, "hoch bogen gerahmt") +
        "<div>" +
          '<h2 class="karte-name">' + esc(k.rufname) + "</h2>" +
          (farbe ? '<p class="karte-zeile">' + esc(farbe) + "</p>" : "") +
          '<div class="fliess leise">' + absaetze(k.text) + "</div>" +
          '<dl class="steckbrief">' + eintraege.map(function (e) {
            return "<div><dt>" + esc(t(e[0])) + "</dt><dd>" + e[1] + "</dd></div>";
          }).join("") + "</dl>" +
        "</div>" +
      "</div>" +
      galerie(restBilder(k), bt) +
      "</article>";
  }

  /* Steht das Elterntier auf der Katzen-Seite, wird der Name ein Link */
  function elternteil(name) {
    var finden = function (liste) {
      return (liste || []).filter(function (k) { return k.rufname === name; })[0];
    };
    var tier = finden(INHALTE.katzen), seite = "katzen.html";
    if (!tier) { tier = finden(INHALTE.vaeter); seite = "vater.html"; }
    if (!tier) { return esc(name); }
    return '<a href="' + seite + "#katze-" + esc(tier.id) + '">' + esc(name) + "</a>";
  }

  SEITEN["kitten.html"] = function () {
    var w = INHALTE.wurf;

    if (!w.vorhanden) {
      return seitenkopf(UI.suchKitten, UI.keineKitten, w.keinWurfText) + kontaktband();
    }

    var kopfDaten = [
      [UI.mutter, elternteil(w.mutter)],
      [UI.vater, elternteil(w.vater)],
      [UI.geboren, datum(w.geboren)],
      [UI.auszugAb, esc(t(w.abgabeAb))]
    ];

    var karten = w.kitten.map(function (k) {
      var geschlecht = k.geschlecht === "w" ? u("kaetzin") : u("kater");
      var farbe = t(k.farbschlag);
      var bt = bildText("altKitten", k.name, farbe);
      return '<article class="karte">' +
        bildplatz(k.bildgruppen && k.bildgruppen[0], k.bilder[0], bt, "hoch bogen gerahmt") +
        '<h3 class="karte-name">' + esc(k.name) + "</h3>" +
        '<p class="karte-zeile">' + esc(geschlecht) + (farbe ? " · " + esc(farbe) : "") + "</p>" +
        "<p>" + statusMarke(k.status, k.geschlecht) + "</p>" +
        '<div class="karte-text fliess" style="margin-top:1rem">' + absaetze(k.text) + "</div>" +
        galerie(restBilder(k), bt) +
        "</article>";
    }).join("");

    var archiv = "";
    if (w.archiv && w.archiv.length) {
      archiv = '<section class="abschnitt abschnitt--sand"><div class="breit">' +
        '<p class="marke">' + esc(u("fruehereWuerfe")) + "</p>" +
        '<div class="raster">' + w.archiv.map(function (a) {
          return '<article class="karte">' + bild(a.bild, a.bezeichnung, "quadr") +
            '<h3 class="karte-name">' + esc(t(a.bezeichnung)) + "</h3>" +
            '<p class="karte-zeile">' + datum(a.geboren) + "</p></article>";
        }).join("") + "</div></div></section>";
    }

    return seitenkopf(UI.suchKitten, w.bezeichnung, null) +
      '<section class="abschnitt"><div class="breit">' +
        streifen(w.bilder, u("suchKitten") + " · " + t(w.bezeichnung)) +
        '<div class="wurfkopf">' +
          '<div class="fliess">' + absaetze(w.text) + "</div>" +
          '<dl class="steckbrief" style="margin:0">' + kopfDaten.map(function (e) {
            return "<div><dt>" + esc(t(e[0])) + "</dt><dd>" + e[1] + "</dd></div>";
          }).join("") + "</dl>" +
        "</div>" +
        '<div class="raster">' + karten + "</div>" +
      "</div></section>" + archiv + kontaktband();
  };

  /* Kater anderer Zuchten, etwa der Vater des aktuellen Wurfs */
  SEITEN["vater.html"] = function () {
    var v = INHALTE.vaeter || [], w = INHALTE.wurf;
    var eine = v.length === 1;
    var herkunft = null;
    if (eine && v[0].zucht) {
      herkunft = {};
      ["de", "en", "lb", "fr"].forEach(function (s) {
        herkunft[s] = UI.ausDerZucht[s] + v[0].zucht;
      });
    }
    return seitenkopf(u("suchVater") + (w.vorhanden ? " · " + t(w.bezeichnung) : ""),
                      eine ? UI.derVater : UI.dieVaeter, herkunft) +
      '<section class="abschnitt"><div class="breit">' +
        '<div class="raster raster--zwei' + (eine ? " raster--einzeln" : "") + '">' +
          v.map(katzenKarte).join("") +
        "</div></div></section>" + kontaktband();
  };

  SEITEN["vermittlung.html"] = function () {
    var v = INHALTE.vermittlung;
    return seitenkopf(UI.suchVermittlung, UI.vermittlungTitel, v.einleitung) +
      '<section class="abschnitt"><div class="breit">' +
        '<ol class="schritte">' + v.schritte.map(function (s) {
          return "<li><h3>" + esc(t(s.titel)) + "</h3>" +
            '<div class="schritt-text">' + absaetze(s.text) + "</div></li>";
        }).join("") + "</ol>" +
      "</div></section>" +
      '<section class="abschnitt"><div class="breit">' +
        '<p class="marke">' + esc(t(v.bedingungen.titel)) + "</p>" +
        '<h2 class="untertitel">' + esc(u("voraussetzen")) + "</h2>" +
        '<ul class="liste">' + v.bedingungen.punkte.map(function (p) {
          return "<li>" + esc(t(p)) + "</li>";
        }).join("") + "</ul>" +
      "</div></section>" +
      '<section class="abschnitt"><div class="breit mit-marke">' +
        '<p class="marke">' + esc(t(v.preis.titel)) + "</p>" +
        '<div class="fliess">' + absaetze(v.preis.text) + "</div>" +
      "</div></section>" + kontaktband();
  };

  SEITEN["gesundheit.html"] = function () {
    var g = INHALTE.gesundheit, z = INHALTE.zucht;
    return seitenkopf(UI.suchGesundheit, UI.gesundheitTitel, g.einleitung) +
      '<section class="abschnitt"><div class="breit"><div class="raster raster--zwei">' +
        g.bloecke.map(function (b) {
          return '<article class="karte"><hr class="haarlinie">' +
            '<h2 class="untertitel" style="margin-top:1.5rem">' + esc(t(b.titel)) + "</h2>" +
            '<p class="karte-text">' + esc(t(b.text)) + "</p></article>";
        }).join("") +
      "</div></div></section>" +
      '<section class="abschnitt"><div class="breit">' +
        '<p class="marke">' + esc(u("verband")) + "</p>" +
        '<h2 class="untertitel">' + esc(z.verband.name) + "</h2>" +
        '<div class="fliess leise"><p>' + esc(u("verbandVor")) +
          '<a href="' + esc(z.verband.url) + '" rel="noopener">' + esc(z.verband.name) + "</a>" +
          esc(u("verbandNach")) +
        "</p></div></div></section>" + kontaktband();
  };

  SEITEN["kontakt.html"] = function () {
    var z = INHALTE.zucht, k = INHALTE.kontakt;
    return seitenkopf(u("kontakt") + " · " + t(z.ort), UI.sprichUnsAn, k.einleitung) +
      '<section class="abschnitt"><div class="breit">' +
        '<div class="kontaktreihe">' +
          '<div><p class="marke">WhatsApp</p>' +
            '<a href="' + whatsappLink() + '" rel="noopener">' + esc(u("chatStarten")) + "</a></div>" +
          '<div><p class="marke">' + esc(u("email")) + "</p>" +
            '<a href="mailto:' + esc(z.email) + '">' + esc(z.email) + "</a></div>" +
          (z.telefon ? '<div><p class="marke">' + esc(u("telefon")) + "</p>" +
            '<a href="' + telefonLink() + '">' + esc(z.telefon) + "</a></div>" : "") +
          '<div><p class="marke">' + esc(u("woWirSind")) + "</p>" +
            "<p style='margin:0'>" + esc(t(z.ort)) + "</p></div>" +
          (z.instagram ? '<div><p class="marke">Instagram</p><a href="' +
            esc(z.instagram) + '" rel="noopener">@' + esc(z.name) + "</a></div>" : "") +
        "</div>" +
        (t(k.hinweis) ? '<div class="fliess leise" style="margin-top:3rem"><p>' +
          esc(t(k.hinweis)) + "</p></div>" : "") +
      "</div></section>";
  };

  /* ---------- Rasseportraet, Fragen, Warteliste, Ratgeber ----------
     Gebaut ausschliesslich aus vorhandenen Bausteinen — dieselben
     Abschnitte, Karten und Schritte wie auf den uebrigen Seiten.      */

  /* Fotos der eigenen Katzen fuer das Rasseportraet: echte Birmas
     statt Archivbildern. Je Tier das erste Foto, dann die naechsten. */
  function fotoVorrat() {
    var tiere = [];
    (INHALTE.katzen || []).forEach(function (k) {
      tiere.push({ bilder: k.bilder, alt: bildText(k.rolle === "kater" ? "altKater" : "altKatze",
                                                   k.rufname, t(k.farbschlag)) });
    });
    ((INHALTE.wurf && INHALTE.wurf.kitten) || []).forEach(function (k) {
      tiere.push({ bilder: k.bilder, alt: bildText("altKitten", k.name, t(k.farbschlag)) });
    });
    (INHALTE.vaeter || []).forEach(function (k) {
      tiere.push({ bilder: k.bilder, alt: bildText("altKater", k.rufname, t(k.farbschlag)) });
    });
    var vorrat = [];
    for (var runde = 0; runde < 3; runde++) {
      tiere.forEach(function (tier) {
        var p = (tier.bilder || []).filter(function (x) { return !istVideo(x); })[runde];
        if (p) { vorrat.push({ pfad: p, alt: tier.alt }); }
      });
    }
    return vorrat;
  }

  SEITEN["heilige-birma.html"] = function () {
    var r = INHALTE.rasse, vorrat = fotoVorrat();
    var bloecke = r.abschnitte.map(function (a, i) {
      var foto = vorrat[i];
      return '<section class="abschnitt"><div class="breit' + (foto ? " paar" : "") +
          (foto && i % 2 ? " paar--umgekehrt" : "") + '">' +
        "<div>" +
          '<p class="marke">0' + (i + 1) + "</p>" +
          '<h2 class="untertitel">' + esc(t(a.titel)) + "</h2>" +
          '<div class="fliess leise">' + reichtext(a.text) + "</div>" +
        "</div>" +
        (foto ? bild(foto.pfad, foto.alt, "hoch bogen gerahmt") : "") +
      "</div></section>";
    }).join("");
    return seitenkopf(UI.suchRasse, r.titel, r.einleitung) + bloecke + kontaktband();
  };

  SEITEN["fragen.html"] = function () {
    var f = INHALTE.fragen;
    return seitenkopf(UI.suchFragen, f.titel, f.einleitung) +
      '<section class="abschnitt"><div class="breit"><div class="raster raster--zwei">' +
        f.eintraege.map(function (e) {
          return '<article class="karte"><hr class="haarlinie">' +
            '<h2 class="untertitel" style="margin-top:1.5rem">' + esc(t(e.frage)) + "</h2>" +
            '<div class="karte-text fliess">' + reichtext(e.antwort) + "</div></article>";
        }).join("") +
      "</div></div></section>" + kontaktband();
  };

  SEITEN["warteliste.html"] = function () {
    var w = INHALTE.warteliste;
    var schritte = w.schritte.length ? '<section class="abschnitt"><div class="breit">' +
        '<p class="marke">' + esc(t(w.schritteTitel)) + "</p>" +
        '<ol class="schritte">' + w.schritte.map(function (s) {
          return "<li><h3>" + esc(t(s.titel)) + "</h3>" +
            '<div class="schritt-text">' + reichtext(s.text) + "</div></li>";
        }).join("") + "</ol></div></section>" : "";
    var abschnitte = w.abschnitte.map(function (a) {
      return '<section class="abschnitt"><div class="breit">' +
        '<h2 class="untertitel">' + esc(t(a.titel)) + "</h2>" +
        '<div class="fliess">' + reichtext(a.text) + "</div></div></section>";
    }).join("");
    return seitenkopf(UI.suchWarteliste, w.titel, w.einleitung) + schritte + abschnitte +
      kontaktband("warteliste");
  };

  function artikelKarten(liste) {
    return '<div class="raster raster--zwei">' + liste.map(function (a) {
      return '<article class="karte"><hr class="haarlinie">' +
        '<p class="marke" style="margin-top:1.5rem">' + esc(t(a.thema)) + "</p>" +
        '<h2 class="untertitel"><a href="' + esc(a.datei) + '">' + esc(t(a.titel)) + "</a></h2>" +
        '<p class="karte-text">' + esc(t(a.kurztext)) + "</p>" +
        '<div class="knopf-reihe"><a class="knopf" href="' + esc(a.datei) + '">' +
          esc(u("weiterlesenKurz")) + "</a></div></article>";
    }).join("") + "</div>";
  }

  SEITEN["ratgeber.html"] = function () {
    var r = INHALTE.ratgeberSeite;
    return seitenkopf(UI.suchRatgeber, r.titel, r.einleitung) +
      '<section class="abschnitt"><div class="breit">' + artikelKarten(INHALTE.ratgeber || []) +
      "</div></section>" + kontaktband();
  };

  function artikelSeite(a) {
    var alle = INHALTE.ratgeber || [];
    var verwandt = (a.verwandt || []).map(function (d) {
      return alle.filter(function (x) { return x.datei === d; })[0];
    }).filter(Boolean);
    var text = a.abschnitte.map(function (b) {
      return '<h2 class="untertitel">' + esc(t(b.titel)) + "</h2>" +
        '<div class="fliess">' + reichtext(b.text) + "</div>";
    }).join("");
    return seitenkopf(u("ratgeber") + " · " + t(a.thema), a.titel, a.einleitung) +
      '<section class="abschnitt"><div class="artikel">' + text +
        '<p class="artikel-stand leise">' + esc(u("stand")) + " " + datum(a.datum) + "</p>" +
      "</div></section>" +
      (verwandt.length ? '<section class="abschnitt"><div class="breit">' +
        '<p class="marke">' + esc(u("mehrRatgeber")) + "</p>" + artikelKarten(verwandt) +
        "</div></section>" : "") +
      kontaktband();
  }

  /* Fertige Seiten laden inhalte.js nicht — dort ist nichts zu registrieren. */
  ((typeof INHALTE !== "undefined" && INHALTE.ratgeber) || []).forEach(function (a) {
    SEITEN[a.datei] = function () { return artikelSeite(a); };
  });

  /* Impressum und Datenschutz stehen als Text in ihren HTML-Dateien.
     Eingeblendet wird die passende Fassung; gibt es keine, die erste
     aus der Ersatzreihe (Luxemburgisch zeigt so die deutsche).      */
  function rechtstexteUmschalten() {
    var bloecke = document.querySelectorAll("[data-sprachfassung]");
    if (!bloecke.length) return;
    var vorhanden = {};
    bloecke.forEach(function (b) { vorhanden[b.getAttribute("data-sprachfassung")] = true; });
    var reihe = ERSATZ[sprache] || ["de"];
    var gewaehlt = "de";
    for (var i = 0; i < reihe.length; i++) {
      if (vorhanden[reihe[i]]) { gewaehlt = reihe[i]; break; }
    }
    bloecke.forEach(function (b) {
      b.hidden = b.getAttribute("data-sprachfassung") !== gewaehlt;
    });
    document.querySelectorAll("[data-nur-sprache]").forEach(function (el) {
      el.hidden = el.getAttribute("data-nur-sprache") !== sprache;
    });
  }

  /* ---------- Leuchtkasten fuer Galeriebilder -------------- */
  function leuchtkastenOeffnen(pfad, alt) {
    var dlg = document.createElement("dialog");
    dlg.className = "leuchtkasten";
    dlg.innerHTML = '<button class="leuchtkasten-zu" type="button">' + esc(u("schliessen")) +
      "</button>" +
      (istVideo(pfad)
        ? '<video src="' + esc(pfad) + '" muted playsinline loop controls ' +
          'controlslist="nofullscreen nodownload"></video>'
        : '<img src="' + esc(pfad) + '" alt="' + esc(alt || "") + '">');
    document.body.appendChild(dlg);
    var v = dlg.querySelector("video");
    if (v) { v.muted = true; if (!ruhig) { spielen(v); } }
    dlg.addEventListener("close", function () { dlg.remove(); });
    dlg.querySelector("button").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    if (typeof dlg.showModal === "function") { dlg.showModal(); }
    else { window.open(pfad, "_blank", "noopener"); dlg.remove(); }
  }

  /* ---------- Videos ausserhalb von Diashows --------------- */
  var videoWaechter = null;

  function videosVorbereiten(wurzel) {
    if (videoWaechter) { videoWaechter.disconnect(); videoWaechter = null; }
    if ("IntersectionObserver" in window) {
      videoWaechter = new IntersectionObserver(function (eintraege) {
        eintraege.forEach(function (e) {
          if (e.isIntersecting) { spielen(e.target); } else { e.target.pause(); }
        });
      }, { threshold: 0.3 });
    }
    wurzel.querySelectorAll("video[data-pfad]").forEach(function (v) {
      /* stumm muss auch als Eigenschaft gesetzt sein, sonst verweigern
         manche Browser das automatische Abspielen                  */
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      if (ruhig) { v.controls = true; return; }
      if (v.closest(".dia")) { return; }            /* das regelt die Diashow */
      if (videoWaechter) { videoWaechter.observe(v); } else { spielen(v); }
    });
  }

  /* ---------- Diashow in Gang setzen -----------------------
     Fotos bleiben sechs Sekunden stehen. Ein Video laeuft einmal
     ganz durch, danach kommt das naechste Bild.                 */
  var FOTO_DAUER = 6000;
  var VIDEO_HOECHSTENS = 65000;

  function diashowStarten(wurzel) {
    wurzel.querySelectorAll(".diashow").forEach(function (show) {
      var dias   = [].slice.call(show.querySelectorAll(".dia"));
      var punkte = [].slice.call(show.querySelectorAll("[data-dia]"));
      if (dias.length < 2) { return; }

      var aktiv = 0, uhr = null, angehalten = false, sichtbar = true;

      function videoVon(i) { return dias[i].querySelector("video"); }

      function stoppen() { if (uhr) { clearTimeout(uhr); uhr = null; } }

      function planen() {
        stoppen();
        if (ruhig || angehalten || !sichtbar) { return; }
        var v = videoVon(aktiv);
        uhr = setTimeout(function () { zeige(aktiv + 1); },
                         v ? VIDEO_HOECHSTENS : FOTO_DAUER);
      }

      function videosAbgleichen() {
        dias.forEach(function (d, i) {
          var v = videoVon(i);
          if (!v) { return; }
          if (i === aktiv && sichtbar && !ruhig) { spielen(v); } else { v.pause(); }
        });
      }

      function zeige(n) {
        aktiv = (n + dias.length) % dias.length;
        dias.forEach(function (d, i) { d.setAttribute("data-aktiv", String(i === aktiv)); });
        punkte.forEach(function (b, i) { b.setAttribute("aria-current", String(i === aktiv)); });
        var v = videoVon(aktiv);
        if (v) { try { v.currentTime = 0; } catch (e) {} }
        videosAbgleichen();
        planen();
      }

      dias.forEach(function (d) {
        var v = d.querySelector("video");
        if (!v) { return; }
        v.addEventListener("ended", function () {
          if (angehalten || ruhig) { try { v.currentTime = 0; } catch (e) {} spielen(v); }
          else { zeige(aktiv + 1); }
        });
      });

      show.querySelector(".dia-taste--vor")
          .addEventListener("click", function () { zeige(aktiv + 1); });
      show.querySelector(".dia-taste--zurueck")
          .addEventListener("click", function () { zeige(aktiv - 1); });
      punkte.forEach(function (b, i) {
        b.addEventListener("click", function () { zeige(i); });
      });

      function anhalten() { angehalten = true; stoppen(); }
      function weiter() { angehalten = false; planen(); }
      show.addEventListener("mouseenter", anhalten);
      show.addEventListener("mouseleave", weiter);
      show.addEventListener("focusin", anhalten);
      show.addEventListener("focusout", weiter);

      /* Ausserhalb des Bildschirms ruht die Diashow — spart Akku und Daten */
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (eintraege) {
          sichtbar = eintraege[0].isIntersecting;
          videosAbgleichen();
          planen();
        }, { threshold: 0.3 }).observe(show);
      }

      videosAbgleichen();
      planen();
    });
  }

  /* ---------- Zusammenbauen -------------------------------- */
  function aufbauen() {
    var seite = document.body.getAttribute("data-seite") || "index.html";

    var kopfZiel = document.getElementById("kopfzeile");
    var inhalt   = document.getElementById("inhalt");
    var fussZiel = document.getElementById("fusszeile");

    if (STATISCH) {
      /* Alte geteilte Links wie kitten.html?lang=fr fuehren weiterhin
         zur richtigen Sprachfassung.                                  */
      var gewuenscht = null;
      try { gewuenscht = new URLSearchParams(location.search).get("lang"); } catch (e) {}
      if (gewuenscht && gewuenscht !== sprache && SPRACHEN.indexOf(gewuenscht) > -1) {
        location.replace(seitenPfad(seite, gewuenscht) + location.hash);
        return;
      }
    } else {
      document.documentElement.lang = sprache;
      kopfZiel.innerHTML = kopfBauen(seite);
      if (SEITEN[seite]) { inhalt.innerHTML = SEITEN[seite](); }
      fussZiel.innerHTML = fussBauen();
      rechtstexteUmschalten();
    }

    bilderAbsichern(document.body);
    videosVorbereiten(document.body);
    diashowStarten(document.body);

    /* Sprachumschalter */
    kopfZiel.querySelectorAll("[data-sprache]").forEach(function (b) {
      b.addEventListener("click", function () { spracheSetzen(b.getAttribute("data-sprache")); });
    });

    /* Mobiles Menue */
    var taste = kopfZiel.querySelector(".menuetaste");
    var menue = kopfZiel.querySelector(".navi");
    if (taste && menue) {
      taste.addEventListener("click", function () {
        var offen = menue.getAttribute("data-offen") === "true";
        menue.setAttribute("data-offen", String(!offen));
        taste.setAttribute("aria-expanded", String(!offen));
        /* Geoeffnet nur ein schmales Kreuz — "Schliessen" waere auf kleinen
           Bildschirmen zu breit (luxemburgisch "Zoumaachen"). Vorleseprogramme
           hoeren trotzdem das Wort in der gewaehlten Sprache.            */
        if (!offen) { taste.textContent = "\u2715"; taste.setAttribute("aria-label", u("schliessen")); }
        else { taste.textContent = u("menue"); taste.removeAttribute("aria-label"); }
      });
    }

    /* Galerie */
    inhalt.querySelectorAll("[data-gross]").forEach(function (b) {
      b.addEventListener("click", function () {
        var img = b.querySelector("img");
        leuchtkastenOeffnen(b.getAttribute("data-gross"), img ? img.alt : "");
      });
    });
  }

  /* Titel und Beschreibung der Seite ergaenzen */
  function kopfdatenSetzen() {
    if (STATISCH) { return; }                 /* Titel steht schon im HTML */
    var z = INHALTE.zucht;
    if (!document.title || document.title.indexOf("|") === -1) {
      document.title = z.name + " | " + t(z.untertitel);
    }
  }

  /* Beim Erzeugen der Seiten: nur die Bausteine bereitstellen,
     nichts im (nicht vorhandenen) Browserfenster anfassen.      */
  if (BAU) {
    window.PDU = {
      sprache: function (s) { sprache = s; },
      kopf: kopfBauen,
      fuss: fussBauen,
      seite: function (datei) { return SEITEN[datei] ? SEITEN[datei]() : ""; },
      ui: u,
      text: t
    };
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { kopfdatenSetzen(); aufbauen(); });
  } else { kopfdatenSetzen(); aufbauen(); }
})();
