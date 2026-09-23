#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRAIA DA URSA — Inhalte uebernehmen

Liest den Ordner MEINE-INHALTE aus und erzeugt daraus
  * inhalte.js   (alle Texte der Website)
  * bilder/      (alle Fotos, passend benannt)

Aufruf: Doppelklick auf aktualisieren.command
        oder  python3 werkzeuge/uebernehmen.py
"""

import json
import os
import re
import shutil
import subprocess
import sys
import datetime

WURZEL   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUELLE   = os.path.join(WURZEL, "MEINE-INHALTE")
BILDER   = os.path.join(WURZEL, "bilder")
ZIEL     = os.path.join(WURZEL, "inhalte.js")
BILD_END = (".jpg", ".jpeg", ".png", ".webp")

fehler = []
hinweise = []


# ---------------------------------------------------------------- lesen

def eintraege(ordner, sprache):
    """Liest text-<sprache>.txt und gibt eine Liste von Eintraegen zurueck.
       Ein Eintrag ist {"felder": {...}, "absaetze": [...]}."""
    pfad = os.path.join(QUELLE, ordner, "text-%s.txt" % sprache)
    if not os.path.exists(pfad):
        return None
    with open(pfad, encoding="utf-8") as f:
        roh = f.read()

    ergebnis = []
    for block in re.split(r"^===\s*$", roh, flags=re.M):
        zeilen = [z for z in block.split("\n") if not z.lstrip().startswith("#")]
        block = "\n".join(zeilen)

        if "\n---" in "\n" + block:
            kopf, _, koerper = block.partition("---")
        else:
            kopf, koerper = "", block

        felder = {}
        for zeile in kopf.split("\n"):
            if ":" in zeile:
                name, _, wert = zeile.partition(":")
                name = name.strip()
                if name:
                    felder[name.lower()] = wert.strip()

        absaetze = [a.strip() for a in re.split(r"\n\s*\n", koerper) if a.strip()]

        # Typischer Tippfehler: ein === fehlt, dadurch landen eine
        # Ueberschrift und ein --- mitten im Fliesstext.
        for absatz in absaetze:
            for zeile in absatz.split("\n"):
                if zeile.strip() == "---" or zeile.strip().lower().startswith("titel:"):
                    fehler.append(
                        "%s/text-%s.txt: Mitten im Text steht \"%s\".\n"
                        "      Dort fehlt vermutlich eine Trennzeile === davor."
                        % (ordner, sprache, zeile.strip()[:40]))
                    break

        if felder or absaetze:
            ergebnis.append({"felder": felder, "absaetze": absaetze})
    return ergebnis


def zweisprachig(ordner, index=0, feld=None):
    """Holt denselben Wert auf Deutsch und Englisch.
       Fehlt Englisch, wird Deutsch verwendet."""
    de = eintraege(ordner, "de")
    en = eintraege(ordner, "en")
    if de is None:
        fehler.append("Datei fehlt: MEINE-INHALTE/%s/text-de.txt" % ordner)
        return {"de": "", "en": ""}
    if en is not None and len(en) != len(de) and index == 0:
        fehler.append(
            "%s: die deutsche Datei hat %d Bloecke, die englische %d.\n"
            "      Dadurch wuerden die Uebersetzungen gegeneinander "
            "verrutschen. Bitte gleiche Anzahl === verwenden."
            % (ordner, len(de), len(en)))
    if en is None or len(en) <= index:
        # Nur melden, wenn die englische Datei wirklich fehlt oder kuerzer
        # ist als die deutsche. Ein Block, den BEIDE nicht haben, ist
        # kein Fehler — dann ist das Feld schlicht leer.
        fehlt = en is None or (len(en) <= index < len(de))
        if fehlt and ordner not in [h.split(":")[0] for h in hinweise]:
            hinweise.append("%s: keine englische Fassung, es wird die deutsche verwendet." % ordner)
        en = de

    def hol(liste, i):
        if i >= len(liste):
            return ""
        e = liste[i]
        if feld:
            return e["felder"].get(feld.lower(), "")
        return "\n\n".join(e["absaetze"])

    return {"de": hol(de, index), "en": hol(en, index)}


def feldwert(ordner, name, index=0, standard=""):
    """Ein einzelnes Kopffeld, nur aus der deutschen Datei."""
    de = eintraege(ordner, "de")
    if not de or index >= len(de):
        return standard
    return de[index]["felder"].get(name.lower(), standard)


ROLLEN = {
    "koenigin": "koenigin", "königin": "koenigin", "mutter": "koenigin",
    "queen": "koenigin", "weiblich": "koenigin", "w": "koenigin",
    "kater": "kater", "vater": "kater", "stud": "kater",
    "maennlich": "kater", "männlich": "kater", "m": "kater",
}


def rolle_deuten(wert):
    """Akzeptiert Mutter, Koenigin, Vater, Kater ... und uebersetzt
       in die zwei Werte, die die Website kennt."""
    schluessel = ROLLEN.get(wert.strip().lower())
    if schluessel:
        return schluessel
    hinweise.append("Rolle \"%s\" nicht erkannt, es wird koenigin verwendet." % wert)
    return "koenigin"


def anzahl(ordner):
    de = eintraege(ordner, "de")
    return len(de) if de else 0


# ---------------------------------------------------------------- bilder

MAX_KANTE = 1600     # laengste Bildkante in Pixeln
QUALITAET = 80       # JPEG-Qualitaet
gespart = [0]        # Bytes, nur fuer die Meldung am Ende


def verkleinern(pfad):
    """Rechnet grosse Handyfotos auf Webgroesse herunter.
       Nutzt sips, das auf jedem Mac vorhanden ist. Die Originale
       in MEINE-INHALTE bleiben unveraendert."""
    vorher = os.path.getsize(pfad)
    try:
        subprocess.run(["sips", "-Z", str(MAX_KANTE), pfad],
                       check=True, capture_output=True)
        if pfad.lower().endswith((".jpg", ".jpeg")):
            subprocess.run(["sips", "-s", "formatOptions", str(QUALITAET), pfad],
                           check=True, capture_output=True)
    except Exception:
        hinweise.append("Foto %s konnte nicht verkleinert werden."
                        % os.path.basename(pfad))
        return
    gespart[0] += vorher - os.path.getsize(pfad)


def sortierschluessel(datei):
    """1.jpg vor 1.1.jpg vor 1.2.jpg vor 2.jpg; Namen ohne Zahl danach."""
    stamm = os.path.splitext(datei)[0]
    teile = stamm.split(".")
    try:
        haupt = (0, int(teile[0]), "")
    except ValueError:
        haupt = (1, 0, teile[0].lower())
    unter = 0
    if len(teile) > 1:
        try:
            unter = int(teile[1])
        except ValueError:
            unter = 0
    return haupt + (unter,)


def fotos(ordner, praefix):
    """Kopiert alle Bilder eines Ordners nach bilder/.

       Rueckgabe: (flache Liste, Gruppen). Dateien, deren Name vor dem
       ersten Punkt gleich ist, bilden eine Gruppe — aus 1.jpg, 1.1.jpg
       und 1.2.jpg wird also EIN Bildplatz mit Diashow."""
    quelle = os.path.join(QUELLE, ordner)
    if not os.path.isdir(quelle):
        return [], []
    dateien = sorted((d for d in os.listdir(quelle)
                      if d.lower().endswith(BILD_END) and not d.startswith(".")),
                     key=sortierschluessel)

    flach, gruppen, letzter = [], [], None
    for nr, datei in enumerate(dateien, 1):
        endung = os.path.splitext(datei)[1].lower()
        if endung == ".jpeg":
            endung = ".jpg"
        name = "%s-%d%s" % (praefix, nr, endung) if praefix != "logo-portrait" \
               else "logo-portrait" + endung
        ziel = os.path.join(BILDER, name)
        shutil.copy2(os.path.join(quelle, datei), ziel)
        verkleinern(ziel)
        pfad = "bilder/" + name
        flach.append(pfad)

        schluessel = os.path.splitext(datei)[0].split(".")[0]
        if schluessel == letzter and gruppen:
            gruppen[-1].append(pfad)
        else:
            gruppen.append([pfad])
            letzter = schluessel
    return flach, gruppen


# ---------------------------------------------------------------- bauen

def bauen():
    os.makedirs(BILDER, exist_ok=True)

    logo, _ = fotos("02-logo-medaillon", "logo-portrait")

    zucht = {
        "name":        feldwert("01-zucht-und-kontakt", "Zuchtname", standard="Praia da Ursa"),
        "untertitel":  zweisprachig("01-zucht-und-kontakt", feld="Untertitel"),
        "ort":         feldwert("01-zucht-und-kontakt", "Ort"),
        "gegruendet":  feldwert("01-zucht-und-kontakt", "Gegruendet"),
        "verband": {
            "name": feldwert("01-zucht-und-kontakt", "Verband"),
            "url":  feldwert("01-zucht-und-kontakt", "VerbandLink"),
        },
        "whatsapp":    re.sub(r"\D", "", feldwert("01-zucht-und-kontakt", "WhatsApp")),
        "whatsappText": zweisprachig("01-zucht-und-kontakt", feld="WhatsAppText"),
        "telefon":     feldwert("01-zucht-und-kontakt", "Telefon"),
        "email":       feldwert("01-zucht-und-kontakt", "EMail"),
        "instagram":   feldwert("01-zucht-und-kontakt", "Instagram"),
        "logoBild":    logo[0] if logo else "bilder/logo-portrait.jpg",
        "leitsatz":    zweisprachig("01-zucht-und-kontakt"),
    }

    start_bilder, start_gruppen = fotos("03-startseite-die-zucht", "zucht")
    start = {
        "zuchtTitel":  zweisprachig("03-startseite-die-zucht", feld="Titel"),
        "zuchtText":   zweisprachig("03-startseite-die-zucht"),
        "zuchtBild":   start_bilder[0] if start_bilder else "bilder/zucht.jpg",
        "zuchtGruppe": start_gruppen[0] if start_gruppen else [],
        "zuchtBildAlt": zweisprachig("03-startseite-die-zucht", feld="Bildbeschreibung"),
    }

    ueber_bilder, ueber_gruppen = fotos("04-ueber-uns", "ueber-uns")
    ueberuns = {
        "absaetze": [
            {"titel": zweisprachig("04-ueber-uns", i, "Titel"),
             "text":  zweisprachig("04-ueber-uns", i)}
            for i in range(anzahl("04-ueber-uns"))
        ],
        "bild":    ueber_bilder[0] if ueber_bilder else "bilder/ueber-uns.jpg",
        "bilder":  ueber_bilder,
        "gruppen": ueber_gruppen,
        "bildAlt": zweisprachig("04-ueber-uns", 0, "Bildbeschreibung"),
    }

    katzen = []
    for ordner in sorted(o for o in os.listdir(QUELLE) if o.startswith("05-katze-")):
        kurz = re.sub(r"^\d+-", "", ordner.replace("05-katze-", ""))
        k_flach, k_gruppen = fotos(ordner, kurz)   # nur EINMAL aufrufen,
        katzen.append({                            # sonst wird doppelt verkleinert
            "id":         kurz,
            "rolle":      rolle_deuten(feldwert(ordner, "Rolle", standard="koenigin")),
            "rufname":    feldwert(ordner, "Rufname"),
            "vollerName": feldwert(ordner, "VollerName"),
            "geboren":    feldwert(ordner, "Geboren"),
            "farbschlag": zweisprachig(ordner, feld="Farbschlag"),
            "blutgruppe": feldwert(ordner, "Blutgruppe"),
            "gentests":   [t.strip() for t in feldwert(ordner, "Gentests").split(";") if t.strip()],
            "text":       zweisprachig(ordner),
            "bilder":      k_flach,
            "bildgruppen": k_gruppen,
        })

    kitten = []
    # Die Zahl im Ordnernamen bestimmt die Reihenfolge auf der Website.
    # 06-kitten-1-ash kommt vor 06-kitten-2-amber.
    for ordner in sorted(o for o in os.listdir(QUELLE) if o.startswith("06-kitten-")):
        kurz = re.sub(r"^\d+-", "", ordner.replace("06-kitten-", ""))
        j_flach, j_gruppen = fotos(ordner, kurz)
        kitten.append({
            "id":         kurz,
            "name":       feldwert(ordner, "Name"),
            "geschlecht": feldwert(ordner, "Geschlecht", standard="w"),
            "status":     feldwert(ordner, "Status", standard="verfuegbar"),
            "farbschlag": zweisprachig(ordner, feld="Farbschlag"),
            "text":       zweisprachig(ordner),
            "bilder":      j_flach,
            "bildgruppen": j_gruppen,
        })

    wurf_bilder, wurf_gruppen = fotos("07-wurf", "wurf")

    wurf = {
        "vorhanden":    feldwert("07-wurf", "Wurf vorhanden", standard="ja").lower()
                        in ("ja", "true", "yes", "1"),
        "bezeichnung":  feldwert("07-wurf", "Bezeichnung"),
        "mutter":       feldwert("07-wurf", "Mutter"),
        "vater":        feldwert("07-wurf", "Vater"),
        "geboren":      feldwert("07-wurf", "Geboren"),
        "abgabeAb":     zweisprachig("07-wurf", feld="AbgabeAb"),
        "text":         zweisprachig("07-wurf"),
        "bilder":       wurf_bilder,
        "kitten":       kitten,
        "keinWurfText": zweisprachig("07-wurf", 1),
        "archiv":       [],
    }

    vermittlung = {
        "einleitung":  zweisprachig("08-vermittlung", 0),
        "schritte":    [{"titel": zweisprachig("08-vermittlung", i, "Titel"),
                         "text":  zweisprachig("08-vermittlung", i)}
                        for i in range(1, anzahl("08-vermittlung"))],
        "bedingungen": {
            "titel":  zweisprachig("09-bedingungen", 0, "Titel"),
            "punkte": [zweisprachig("09-bedingungen", i)
                       for i in range(1, anzahl("09-bedingungen"))],
        },
        "preis": {
            "titel": zweisprachig("10-preis", 0, "Titel"),
            "text":  zweisprachig("10-preis", 0),
        },
    }
    gesundheit = {
        "einleitung": zweisprachig("11-gesundheit", 0),
        "bloecke":    [{"titel": zweisprachig("11-gesundheit", i, "Titel"),
                        "text":  zweisprachig("11-gesundheit", i)}
                       for i in range(1, anzahl("11-gesundheit"))],
    }

    kontakt = {
        "einleitung": zweisprachig("12-kontakt", 0),
        "hinweis":    zweisprachig("12-kontakt", 1),
    }

    return {
        "zucht": zucht, "start": start, "ueberuns": ueberuns,
        "katzen": katzen, "wurf": wurf, "vermittlung": vermittlung,
        "gesundheit": gesundheit, "kontakt": kontakt,
        "navigation": [
            {"datei": "ueber-uns.html",   "label": {"de": "Über uns",      "en": "About us"}},
            {"datei": "katzen.html",
             "label": {"de": "Unsere Katze" if len(katzen) == 1 else "Unsere Katzen",
                       "en": "Our cat" if len(katzen) == 1 else "Our cats"}},
            {"datei": "kitten.html",      "label": {"de": "Kitten",        "en": "Kittens"}},
            {"datei": "vermittlung.html",
             "label": {"de": "Vermittlung & Preis", "en": "Rehoming & price"}},
            {"datei": "gesundheit.html",  "label": {"de": "Gesundheit",    "en": "Health"}},
            {"datei": "kontakt.html",     "label": {"de": "Kontakt",       "en": "Contact"}},
        ],
    }


# ---------------------------------------------------------------- schreiben

def schreiben(daten):
    if os.path.exists(ZIEL):
        sicherung = os.path.join(WURZEL, "werkzeuge", "inhalte-vorher.js")
        shutil.copy2(ZIEL, sicherung)

    stempel = datetime.datetime.now().strftime("%d.%m.%Y um %H:%M Uhr")
    kopf = (
        "/* ============================================================\n"
        "   PRAIA DA URSA — INHALTE\n"
        "   ============================================================\n"
        "   ACHTUNG: Diese Datei wird automatisch erzeugt.\n"
        "   Bearbeite stattdessen den Ordner MEINE-INHALTE und starte\n"
        "   danach aktualisieren.command per Doppelklick.\n\n"
        "   Zuletzt erzeugt am " + stempel + "\n"
        "   ============================================================ */\n\n"
        "const INHALTE = "
    )
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(kopf)
        f.write(json.dumps(daten, ensure_ascii=False, indent=2))
        f.write(";\n")


def main():
    if not os.path.isdir(QUELLE):
        print("FEHLER: Der Ordner MEINE-INHALTE wurde nicht gefunden.")
        return 1

    daten = bauen()

    if fehler:
        print("\nEs gab Probleme:\n")
        for f in fehler:
            print("  ! " + f)
        print("\nEs wurde nichts geaendert. Bitte die Dateien pruefen.")
        return 1

    schreiben(daten)

    bilder = sum(len(k["bilder"]) for k in daten["katzen"])
    bilder += sum(len(k["bilder"]) for k in daten["wurf"]["kitten"])
    print("\n  Fertig.\n")
    bilder += len(daten["ueberuns"].get("bilder", [])) + 1
    print("  %d Katzen, %d Kitten, %d Fotos uebernommen." %
          (len(daten["katzen"]), len(daten["wurf"]["kitten"]), bilder))
    if gespart[0] > 0:
        print("  %.1f MB durch Verkleinern eingespart." % (gespart[0] / 1048576.0))
    if hinweise:
        print("\n  Hinweise:")
        for h in hinweise:
            print("    - " + h)
    print("\n  Die Website ist aktualisiert. Oeffne index.html zum Ansehen.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
