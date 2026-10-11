#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRAIA DA URSA — Seiten vorab erzeugen

Laesst assets/seite.js einmal in der macOS-eigenen JavaScript-Maschine
(osascript, JXA) laufen und schreibt das Ergebnis als fertiges HTML.
Dadurch steht der gesamte Text direkt in jeder Seite — Google muss kein
JavaScript mehr ausfuehren, um ihn zu finden. Weil exakt derselbe Code
den Text erzeugt wie bisher im Browser, sieht jede Seite genauso aus.

Ausserdem entstehen hier:
  * die Sprachordner /en/, /lb/, /fr/
  * Titel, Beschreibung, canonical und hreflang je Seite
  * strukturierte Daten (JSON-LD)
  * sitemap.xml und robots.txt

Wird von uebernehmen.py aufgerufen; nichts davon muss man von Hand tun.
"""

import html
import json
import os
import re
import subprocess
import tempfile

DOMAIN   = "https://praiadaursa.de"
SPRACHEN = ("de", "en", "lb", "fr")
OG_LOCALE = {"de": "de_DE", "en": "en_GB", "lb": "lb_LU", "fr": "fr_FR"}

# Die Seiten, die es in jeder Sprache gibt
KERN = ["index.html", "ueber-uns.html", "katzen.html", "vater.html", "kitten.html",
        "vermittlung.html", "gesundheit.html", "kontakt.html"]

STARTSEITE = {"de": "Startseite", "en": "Home", "lb": "Haaptsäit", "fr": "Accueil"}


# ---------------------------------------------------------------- welche Seiten

def seiten_je_sprache(daten):
    """Welche Seite gibt es in welcher Sprache? Grundlage fuer Links,
       hreflang und die Sitemap."""
    kern = [s for s in KERN if s != "vater.html" or daten.get("vaeter")]
    ergebnis = {s: list(kern) for s in SPRACHEN}
    for seite in daten.get("zusatzseiten", []):
        for s in seite["sprachen"]:
            ergebnis[s].append(seite["datei"])
    return ergebnis


# ---------------------------------------------------------------- Pfade

def adresse(sprache, datei):
    """Vollstaendige, kanonische Adresse einer Seite."""
    pfad = "" if datei == "index.html" else datei
    if sprache == "de":
        return DOMAIN + "/" + pfad
    return DOMAIN + "/" + sprache + "/" + pfad


def ausgabepfad(wurzel, sprache, datei):
    if sprache == "de":
        return os.path.join(wurzel, datei)
    return os.path.join(wurzel, sprache, datei)


def hochstufen(text):
    """In den Sprachordnern liegen Fotos und Gestaltung eine Ebene hoeher."""
    return re.sub(r'(=")(bilder|assets)/', r'\1../\2/', text)


# ---------------------------------------------------------------- JXA

VORSPANN = r"""
ObjC.import('Foundation');
var window = this;
var document = { readyState: "complete", body: null,
                 documentElement: { getAttribute: function () { return null; } } };
var location = { search: "", href: "https://praiadaursa.de/", hash: "" };
var localStorage = { getItem: function () { return null; }, setItem: function () {} };
var history = { replaceState: function () {} };
function URLSearchParams() { this.get = function () { return null; }; }
window.PDU_VORRENDERN = { sprache: "de" };
"""

NACHSPANN = r"""
var aus = {};
Object.keys(AUFTRAG).forEach(function (s) {
  PDU.sprache(s);
  aus[s] = {};
  AUFTRAG[s].forEach(function (d) {
    aus[s][d] = { kopf: PDU.kopf(d), inhalt: PDU.seite(d), fuss: PDU.fuss() };
  });
});
$.NSString.alloc.initWithUTF8String(JSON.stringify(aus))
  .writeToFileAtomicallyEncodingError($(ZIELDATEI), true, $.NSUTF8StringEncoding, null);
"ok";
"""


def bausteine_erzeugen(wurzel, daten, auftrag):
    """Fuehrt seite.js in JXA aus und gibt {sprache: {seite: {kopf,inhalt,fuss}}}."""
    with open(os.path.join(wurzel, "assets", "seite.js"), encoding="utf-8") as f:
        seite_js = f.read()
    with tempfile.TemporaryDirectory() as tmp:
        ziel = os.path.join(tmp, "aus.json")
        skript = os.path.join(tmp, "bauen.js")
        with open(skript, "w", encoding="utf-8") as f:
            f.write(VORSPANN)
            f.write("var INHALTE = " + json.dumps(daten, ensure_ascii=False) + ";\n")
            f.write("var AUFTRAG = " + json.dumps(auftrag) + ";\n")
            f.write("var ZIELDATEI = " + json.dumps(ziel) + ";\n")
            f.write(seite_js)
            f.write(NACHSPANN)
        lauf = subprocess.run(["osascript", "-l", "JavaScript", skript],
                              capture_output=True, text=True, timeout=300)
        if lauf.returncode != 0 or not os.path.exists(ziel):
            raise RuntimeError("Seitenaufbau fehlgeschlagen:\n" + lauf.stderr.strip())
        with open(ziel, encoding="utf-8") as f:
            return json.load(f)


# ---------------------------------------------------------------- Kopfdaten

def esc(text):
    return html.escape(text or "", quote=True)


def kopfdaten(meta, sprache, datei):
    """Titel und Beschreibung aus MEINE-INHALTE/00-suchmaschinen."""
    eintrag = meta.get(sprache, {}).get(datei) or meta.get("de", {}).get(datei) or {}
    return eintrag.get("titel", "Praia da Ursa"), eintrag.get("beschreibung", "")


def telefon_international(nummer):
    return re.sub(r"[^\d+]", "", nummer or "")


def jsonld_betrieb(daten, beschreibung):
    z = daten["zucht"]
    gebiet = [g.strip() for g in z.get("einzugsgebiet", "").split(";") if g.strip()]
    betrieb = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": DOMAIN + "/#zucht",
        "name": z["name"],
        "description": beschreibung,
        "url": DOMAIN + "/",
        "image": DOMAIN + "/" + z["logoBild"],
        "logo": DOMAIN + "/" + z["logoBild"],
        "telephone": telefon_international(z.get("telefon")),
        "email": z.get("email"),
        "address": {
            "@type": "PostalAddress",
            "postalCode": z.get("plz"),
            "addressLocality": z.get("ort", {}).get("de", "Trier"),
            "addressRegion": z.get("region"),
            "addressCountry": "DE",
        },
        "areaServed": [{"@type": "Place", "name": g} for g in gebiet],
        "memberOf": {"@type": "Organization", "name": z["verband"]["name"],
                     "url": z["verband"]["url"]},
        "knowsLanguage": list(SPRACHEN),
    }
    if z.get("gegruendet"):
        betrieb["foundingDate"] = z["gegruendet"]
    if z.get("instagram"):
        betrieb["sameAs"] = [z["instagram"]]
    # leere Felder nicht ausgeben
    betrieb["address"] = {k: v for k, v in betrieb["address"].items() if v}
    return {k: v for k, v in betrieb.items() if v}


def jsonld_brotkrumen(sprache, datei, titel, eltern=None):
    kette = [(STARTSEITE[sprache], adresse(sprache, "index.html"))]
    if eltern:
        kette.append(eltern)
    kette.append((titel.split(" | ")[0], adresse(sprache, datei)))
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
            for i, (n, u) in enumerate(kette)
        ],
    }


def html_seite(daten, meta, seiten, sprache, datei, teile, versionen, zusatz_ld=None):
    titel, beschreibung = kopfdaten(meta, sprache, datei)
    vor = "" if sprache == "de" else "../"
    logo = DOMAIN + "/" + daten["zucht"]["logoBild"]

    alternativen = [s for s in SPRACHEN if datei in seiten[s]]
    hreflang = ""
    if len(alternativen) > 1:
        hreflang = "".join('<link rel="alternate" hreflang="%s" href="%s">\n' %
                           (s, adresse(s, datei)) for s in alternativen)
        hreflang += '<link rel="alternate" hreflang="x-default" href="%s">\n' % \
                    adresse("de", datei)

    ld = []
    if datei in ("index.html", "kontakt.html"):
        index_beschreibung = kopfdaten(meta, sprache, "index.html")[1]
        ld.append(jsonld_betrieb(daten, index_beschreibung))
    if datei != "index.html":
        ld.append(jsonld_brotkrumen(sprache, datei, titel,
                                    (zusatz_ld or {}).get("eltern")))
    for extra in (zusatz_ld or {}).get("daten", []):
        ld.append(extra)
    ld_html = "".join('<script type="application/ld+json">%s</script>\n' %
                      json.dumps(x, ensure_ascii=False).replace("</", "<\\/") for x in ld)

    # Welche Seiten es in welcher Sprache gibt — fuer den Sprachumschalter
    seitenliste = json.dumps(seiten, ensure_ascii=False)

    inhalt = teile["inhalt"]
    kopf = teile["kopf"]
    fuss = teile["fuss"]
    if sprache != "de":
        kopf, inhalt, fuss = hochstufen(kopf), hochstufen(inhalt), hochstufen(fuss)

    return (
        '<!doctype html>\n'
        '<html lang="%(lang)s" data-sprache="%(lang)s">\n'
        '<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<title>%(titel)s</title>\n'
        '<meta name="description" content="%(besch)s">\n'
        '<link rel="canonical" href="%(kanon)s">\n'
        '%(hreflang)s'
        '<meta property="og:title" content="%(titel)s">\n'
        '<meta property="og:description" content="%(besch)s">\n'
        '<meta property="og:image" content="%(logo)s">\n'
        '<meta property="og:url" content="%(kanon)s">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:locale" content="%(locale)s">\n'
        '<meta property="og:site_name" content="Praia da Ursa">\n'
        '<link rel="icon" href="%(vor)sbilder/favicon.svg" type="image/svg+xml">\n'
        '<link rel="stylesheet" href="%(vor)sassets/stil.css?v=%(v_css)s">\n'
        '%(ld)s'
        '</head>\n'
        '<body data-seite="%(datei)s" data-vorgerendert>\n\n'
        '<div id="kopfzeile">%(kopf)s</div>\n\n'
        '<main id="inhalt">%(inhalt)s</main>\n\n'
        '<div id="fusszeile">%(fuss)s</div>\n\n'
        '<script>window.PDU_SEITEN = %(seitenliste)s;</script>\n'
        '<script src="%(vor)sassets/seite.js?v=%(v_js)s"></script>\n'
        '</body>\n'
        '</html>\n'
    ) % {
        "lang": sprache, "titel": esc(titel), "besch": esc(beschreibung),
        "kanon": adresse(sprache, datei), "hreflang": hreflang, "logo": logo,
        "locale": OG_LOCALE[sprache], "vor": vor, "ld": ld_html, "datei": datei,
        "kopf": kopf, "inhalt": inhalt, "fuss": fuss, "seitenliste": seitenliste,
        "v_css": versionen.get("assets/stil.css", ""),
        "v_js": versionen.get("assets/seite.js", ""),
    }


# ---------------------------------------------------------------- Sitemap

def sitemap_schreiben(wurzel, seiten, datum):
    zeilen = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
              '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    alle = []
    for s in SPRACHEN:
        for d in seiten[s]:
            alle.append((s, d))
    for s, d in alle:
        zeilen.append("  <url>")
        zeilen.append("    <loc>%s</loc>" % esc(adresse(s, d)))
        zeilen.append("    <lastmod>%s</lastmod>" % datum)
        alternativen = [x for x in SPRACHEN if d in seiten[x]]
        if len(alternativen) > 1:
            for x in alternativen:
                zeilen.append('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>' %
                              (x, esc(adresse(x, d))))
            zeilen.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' %
                          esc(adresse("de", d)))
        zeilen.append("  </url>")
    zeilen.append("</urlset>")
    with open(os.path.join(wurzel, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(zeilen) + "\n")
    return len(alle)


ROBOTS = """# Praia da Ursa — Hinweise fuer Suchmaschinen
User-agent: *
Allow: /
# Arbeitsordner und Notizen gehoeren nicht in die Suchergebnisse
Disallow: /MEINE-INHALTE/
Disallow: /werkzeuge/
Disallow: /docs/
Disallow: /*.md$

Sitemap: %s/sitemap.xml
""" % DOMAIN


# ---------------------------------------------------------------- alles

def alles_erzeugen(wurzel, daten, meta, versionen, datum):
    seiten = seiten_je_sprache(daten)
    bausteine = bausteine_erzeugen(wurzel, daten, seiten)

    zusatz = {z["datei"]: z for z in daten.get("zusatzseiten", [])}

    # Sprachordner anlegen und dort alte, nicht mehr erzeugte Seiten entfernen
    for s in SPRACHEN:
        if s != "de":
            ordner = os.path.join(wurzel, s)
            os.makedirs(ordner, exist_ok=True)
            for alt in os.listdir(ordner):
                if alt.endswith(".html") and alt not in seiten[s]:
                    os.remove(os.path.join(ordner, alt))

    anzahl = 0
    for s in SPRACHEN:
        for d in seiten[s]:
            z = zusatz.get(d, {})
            extra = {"daten": z.get("jsonld", {}).get(s, []),
                     "eltern": None}
            if z.get("eltern"):
                eltern_datei = z["eltern"]
                eltern_titel = kopfdaten(meta, s, eltern_datei)[0].split(" | ")[0]
                extra["eltern"] = (eltern_titel, adresse(s, eltern_datei))
            text = html_seite(daten, meta, seiten, s, d, bausteine[s][d], versionen, extra)
            with open(ausgabepfad(wurzel, s, d), "w", encoding="utf-8") as f:
                f.write(text)
            anzahl += 1

    url_anzahl = sitemap_schreiben(wurzel, seiten, datum)
    with open(os.path.join(wurzel, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(ROBOTS)
    return anzahl, url_anzahl
