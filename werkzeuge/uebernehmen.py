#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRAIA DA URSA — Inhalte uebernehmen

Liest den Ordner MEINE-INHALTE aus und erzeugt daraus
  * inhalte.js   (alle Texte der Website, in allen Sprachen)
  * bilder/      (alle Fotos und Videos, passend benannt und verkleinert)

Aufruf: Doppelklick auf aktualisieren.command
        oder  python3 werkzeuge/uebernehmen.py
"""

import datetime
import hashlib
import json
import os
import re
import shutil
import struct
import subprocess
import sys

WURZEL    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUELLE    = os.path.join(WURZEL, "MEINE-INHALTE")
BILDER    = os.path.join(WURZEL, "bilder")
ZIEL      = os.path.join(WURZEL, "inhalte.js")
ZWISCHEN  = os.path.join(WURZEL, "werkzeuge", "zwischenspeicher")

BILD_END  = (".jpg", ".jpeg", ".png", ".webp")
VIDEO_END = (".mp4", ".mov", ".m4v", ".webm")

# Deutsch ist Pflicht, alle anderen Sprachen sind optional.
SPRACHEN = ("de", "en", "lb", "fr")
SPRACHNAME = {"en": "englische", "lb": "luxemburgische", "fr": "franzoesische"}

fehler = []
hinweise = []


def melden(liste, text):
    """Jede Meldung nur einmal, auch wenn sie mehrfach ausgeloest wird."""
    if text not in liste:
        liste.append(text)


# ---------------------------------------------------------------- lesen

_gelesen = {}


def eintraege(ordner, sprache):
    """Liest text-<sprache>.txt und gibt eine Liste von Eintraegen zurueck.
       Ein Eintrag ist {"felder": {...}, "absaetze": [...]}.
       Fehlt die Datei, kommt None zurueck."""
    schluessel = (ordner, sprache)
    if schluessel in _gelesen:
        return _gelesen[schluessel]

    pfad = os.path.join(QUELLE, ordner, "text-%s.txt" % sprache)
    if not os.path.exists(pfad):
        _gelesen[schluessel] = None
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
                    melden(fehler,
                        "%s/text-%s.txt: Mitten im Text steht \"%s\".\n"
                        "      Dort fehlt vermutlich eine Trennzeile === davor."
                        % (ordner, sprache, zeile.strip()[:40]))
                    break

        if felder or absaetze:
            ergebnis.append({"felder": felder, "absaetze": absaetze})

    _gelesen[schluessel] = ergebnis
    return ergebnis


def _hol(liste, i, feld):
    if i >= len(liste):
        return ""
    e = liste[i]
    if feld:
        return e["felder"].get(feld.lower(), "")
    return "\n\n".join(e["absaetze"])


def mehrsprachig(ordner, index=0, feld=None):
    """Holt denselben Wert in allen Sprachen.

       Fehlt eine Sprache, wird sie weggelassen — die Website zeigt dann
       automatisch eine Ersatzsprache (siehe ERSATZ in assets/seite.js)."""
    de = eintraege(ordner, "de")
    if de is None:
        melden(fehler, "Datei fehlt: MEINE-INHALTE/%s/text-de.txt" % ordner)
        return {"de": ""}

    ergebnis = {"de": _hol(de, index, feld)}
    for spr in SPRACHEN[1:]:
        liste = eintraege(ordner, spr)
        if liste is None:
            melden(hinweise, "%s: keine %s Fassung, dort erscheint die Ersatzsprache."
                   % (ordner, SPRACHNAME[spr]))
            continue
        if len(liste) != len(de):
            melden(fehler,
                "%s: die deutsche Datei hat %d Bloecke, die %s %d.\n"
                "      Dadurch wuerden die Uebersetzungen gegeneinander "
                "verrutschen. Bitte gleiche Anzahl === verwenden."
                % (ordner, len(de), SPRACHNAME[spr], len(liste)))
            continue
        wert = _hol(liste, index, feld)
        if wert:
            ergebnis[spr] = wert
    return ergebnis


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
    melden(hinweise, "Rolle \"%s\" nicht erkannt, es wird koenigin verwendet." % wert)
    return "koenigin"


def anzahl(ordner):
    de = eintraege(ordner, "de")
    return len(de) if de else 0


# ---------------------------------------------------------------- fotos

MAX_KANTE = 1600     # laengste Bildkante in Pixeln
QUALITAET = 80       # JPEG-Qualitaet
statistik = {"gespart": 0, "fotos": 0, "videos": 0}


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
        melden(hinweise, "Foto %s konnte nicht verkleinert werden."
               % os.path.basename(pfad))
        return
    statistik["gespart"] += vorher - os.path.getsize(pfad)


# ---------------------------------------------------------------- videos

MAX_SEKUNDEN = 60    # laengere Videos werden gekuerzt
UMWANDLUNG_VERSION = 2
WARNGROESSE  = 40    # MB; darueber wird es fuer GitHub und Handys zaeh


def _mp4_dauer(pfad):
    """Liest die Laenge direkt aus dem Dateikopf (mvhd-Atom in moov).
       Funktioniert fuer .mp4 und .mov, auch fuer frisch kopierte Dateien,
       die Spotlight noch nicht kennt. Liest nur die noetigen Bytes."""
    try:
        with open(pfad, "rb") as f:
            gesamt = os.path.getsize(pfad)

            def boxen(start, ende):
                pos = start
                while pos + 8 <= ende:
                    f.seek(pos)
                    kopf = f.read(8)
                    if len(kopf) < 8:
                        return
                    laenge, typ = struct.unpack(">I4s", kopf)
                    kopflaenge = 8
                    if laenge == 1:
                        laenge = struct.unpack(">Q", f.read(8))[0]
                        kopflaenge = 16
                    elif laenge == 0:
                        laenge = ende - pos
                    if laenge < kopflaenge:
                        return
                    yield typ, pos + kopflaenge, pos + laenge
                    pos += laenge

            for typ, anfang, ende in boxen(0, gesamt):
                if typ != b"moov":
                    continue
                for typ2, anfang2, _ in boxen(anfang, ende):
                    if typ2 != b"mvhd":
                        continue
                    f.seek(anfang2)
                    d = f.read(32)
                    if d[0] == 1:
                        einheit, dauer = struct.unpack(">IQ", d[20:32])
                    else:
                        einheit, dauer = struct.unpack(">II", d[12:20])
                    return dauer / float(einheit) if einheit else None
    except Exception:
        return None
    return None


def videodauer(pfad):
    """Laenge in Sekunden; None, wenn sie sich nicht bestimmen laesst."""
    dauer = _mp4_dauer(pfad)
    if dauer:
        return dauer
    try:
        aus = subprocess.run(["mdls", "-raw", "-name", "kMDItemDurationSeconds", pfad],
                             capture_output=True, text=True, timeout=10).stdout.strip()
        return float(aus)
    except Exception:
        return None


def video_uebernehmen(quelle, ziel):
    """Wandelt ein Handyvideo in webtaugliches MP4 um (720p, H.264).

       avconvert gehoert zu macOS und entfernt dabei auch Standortdaten.
       Umgewandelte Videos landen im Zwischenspeicher, damit sie nicht
       bei jedem Lauf neu berechnet werden muessen."""
    st = os.stat(quelle)
    # UMWANDLUNG_VERSION erhoehen, wenn sich die Einstellungen aendern —
    # dann werden alte Ergebnisse im Zwischenspeicher nicht mehr verwendet.
    kennung = "v%d|%s|%d|%d" % (UMWANDLUNG_VERSION, os.path.relpath(quelle, QUELLE),
                                st.st_size, int(st.st_mtime))
    zwischen = os.path.join(ZWISCHEN, hashlib.sha1(kennung.encode("utf-8")).hexdigest()[:16] + ".mp4")
    name = os.path.relpath(quelle, QUELLE)

    dauer = videodauer(quelle)

    if not os.path.exists(zwischen):
        os.makedirs(ZWISCHEN, exist_ok=True)
        print("    wandle Video um: %s" % name)
        vorlaeufig = zwischen + ".teil.mp4"
        befehl = ["avconvert", "--source", quelle, "--preset", "Preset1280x720",
                  "--output", vorlaeufig, "--replace"]
        # Achtung: --duration kuerzt nicht nur, es FUELLT kuerzere Videos
        # mit einem stehenden Bild auf. Deshalb nur bei wirklich zu langen.
        if dauer and dauer > MAX_SEKUNDEN:
            befehl += ["--duration", str(MAX_SEKUNDEN)]
        try:
            subprocess.run(befehl, check=True, capture_output=True, timeout=1800)
            os.replace(vorlaeufig, zwischen)
        except Exception:
            if os.path.exists(vorlaeufig):
                os.remove(vorlaeufig)
            if quelle.lower().endswith((".mp4", ".webm")):
                shutil.copy2(quelle, ziel)
                melden(hinweise, "Video %s liess sich nicht umwandeln und wurde "
                       "unveraendert uebernommen." % name)
                return True
            melden(hinweise, "Video %s liess sich nicht umwandeln und fehlt "
                   "deshalb auf der Website." % name)
            return False

    shutil.copy2(zwischen, ziel)

    if dauer and dauer > MAX_SEKUNDEN + 1:
        melden(hinweise, "Video %s ist %d Sekunden lang und wurde auf %d Sekunden "
               "gekuerzt." % (name, dauer, MAX_SEKUNDEN))
    mb = os.path.getsize(ziel) / 1048576.0
    if mb > WARNGROESSE:
        melden(hinweise, "Video %s ist nach dem Umwandeln noch %.0f MB gross — "
               "am Handy laedt das langsam." % (name, mb))
    return True


# ---------------------------------------------------------------- medien

verwendet = set()    # alle Dateien in bilder/, die die Website braucht


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
    """Uebernimmt alle Fotos UND Videos eines Ordners nach bilder/.

       Rueckgabe: (flache Liste, Gruppen). Dateien, deren Name vor dem
       ersten Punkt gleich ist, bilden eine Gruppe — aus 1.jpg, 1.1.jpg
       und 1.2.mp4 wird also EIN Bildplatz mit Diashow, in der das Video
       mitlaeuft."""
    quelle = os.path.join(QUELLE, ordner)
    if not os.path.isdir(quelle):
        return [], []
    dateien = sorted((d for d in os.listdir(quelle)
                      if d.lower().endswith(BILD_END + VIDEO_END) and not d.startswith(".")),
                     key=sortierschluessel)

    flach, gruppen, letzter = [], [], None
    nr = 0
    for datei in dateien:
        ist_video = datei.lower().endswith(VIDEO_END)
        if ist_video:
            endung = ".webm" if datei.lower().endswith(".webm") else ".mp4"
        else:
            endung = os.path.splitext(datei)[1].lower()
            if endung == ".jpeg":
                endung = ".jpg"
            # Das Logo ist ein Standbild — ein Video hat dort nichts verloren
        if ist_video and praefix == "logo-portrait":
            melden(hinweise, "Im Ordner 02-logo-medaillon ist nur ein Foto moeglich, "
                   "das Video %s wurde uebersprungen." % datei)
            continue

        nr += 1
        name = "%s-%d%s" % (praefix, nr, endung) if praefix != "logo-portrait" \
               else "logo-portrait" + endung
        ziel = os.path.join(BILDER, name)

        if ist_video:
            if not video_uebernehmen(os.path.join(quelle, datei), ziel):
                nr -= 1
                continue
            statistik["videos"] += 1
        else:
            shutil.copy2(os.path.join(quelle, datei), ziel)
            verkleinern(ziel)
            statistik["fotos"] += 1

        verwendet.add(name)
        pfad = "bilder/" + name
        flach.append(pfad)

        schluessel = os.path.splitext(datei)[0].split(".")[0]
        if schluessel == letzter and gruppen:
            gruppen[-1].append(pfad)
        else:
            gruppen.append([pfad])
            letzter = schluessel
    return flach, gruppen


def bilder_aufraeumen():
    """Entfernt aus bilder/ alles, was die Website nicht mehr verwendet —
       etwa umbenannte oder geloeschte Fotos. bilder/ wird vollstaendig
       aus MEINE-INHALTE erzeugt, dabei geht also nichts verloren."""
    behalten = verwendet | {"favicon.svg"}
    entfernt = 0
    for datei in os.listdir(BILDER):
        if datei.startswith(".") or datei in behalten:
            continue
        os.remove(os.path.join(BILDER, datei))
        entfernt += 1
    return entfernt


# ---------------------------------------------------------------- bauen

def bauen():
    os.makedirs(BILDER, exist_ok=True)

    logo, _ = fotos("02-logo-medaillon", "logo-portrait")

    zucht = {
        "name":        feldwert("01-zucht-und-kontakt", "Zuchtname", standard="Praia da Ursa"),
        "untertitel":  mehrsprachig("01-zucht-und-kontakt", feld="Untertitel"),
        "ort":         mehrsprachig("01-zucht-und-kontakt", feld="Ort"),
        "gegruendet":  feldwert("01-zucht-und-kontakt", "Gegruendet"),
        "verband": {
            "name": feldwert("01-zucht-und-kontakt", "Verband"),
            "url":  feldwert("01-zucht-und-kontakt", "VerbandLink"),
        },
        "whatsapp":    re.sub(r"\D", "", feldwert("01-zucht-und-kontakt", "WhatsApp")),
        "whatsappText": mehrsprachig("01-zucht-und-kontakt", feld="WhatsAppText"),
        "telefon":     feldwert("01-zucht-und-kontakt", "Telefon"),
        "email":       feldwert("01-zucht-und-kontakt", "EMail"),
        "instagram":   feldwert("01-zucht-und-kontakt", "Instagram"),
        "logoBild":    logo[0] if logo else "bilder/logo-portrait.jpg",
        "leitsatz":    mehrsprachig("01-zucht-und-kontakt"),
    }

    start_bilder, start_gruppen = fotos("03-startseite-die-zucht", "zucht")
    start = {
        "zuchtTitel":  mehrsprachig("03-startseite-die-zucht", feld="Titel"),
        "zuchtText":   mehrsprachig("03-startseite-die-zucht"),
        "zuchtBild":   start_bilder[0] if start_bilder else "bilder/zucht.jpg",
        "zuchtGruppe": start_gruppen[0] if start_gruppen else [],
        "zuchtBildAlt": mehrsprachig("03-startseite-die-zucht", feld="Bildbeschreibung"),
    }

    ueber_bilder, ueber_gruppen = fotos("04-ueber-uns", "ueber-uns")
    ueberuns = {
        "absaetze": [
            {"titel": mehrsprachig("04-ueber-uns", i, "Titel"),
             "text":  mehrsprachig("04-ueber-uns", i)}
            for i in range(anzahl("04-ueber-uns"))
        ],
        "bild":    ueber_bilder[0] if ueber_bilder else "bilder/ueber-uns.jpg",
        "bilder":  ueber_bilder,
        "gruppen": ueber_gruppen,
        "bildAlt": mehrsprachig("04-ueber-uns", 0, "Bildbeschreibung"),
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
            "farbschlag": mehrsprachig(ordner, feld="Farbschlag"),
            "blutgruppe": feldwert(ordner, "Blutgruppe"),
            "gentests":   [t.strip() for t in feldwert(ordner, "Gentests").split(";") if t.strip()],
            "text":       mehrsprachig(ordner),
            "bilder":      k_flach,
            "bildgruppen": k_gruppen,
        })

    # Kater anderer Zuchten (z.B. der Vater eines Wurfs) bekommen eine
    # eigene Seite und stehen NICHT unter "Unsere Katzen".
    vaeter = []
    for ordner in sorted(o for o in os.listdir(QUELLE) if o.startswith("05-vater-")):
        kurz = re.sub(r"^\d+-", "", ordner.replace("05-vater-", ""))
        v_flach, v_gruppen = fotos(ordner, kurz)
        vaeter.append({
            "id":         kurz,
            "rolle":      "kater",
            "rufname":    feldwert(ordner, "Rufname"),
            "vollerName": feldwert(ordner, "VollerName"),
            "geboren":    feldwert(ordner, "Geboren"),
            "farbschlag": mehrsprachig(ordner, feld="Farbschlag"),
            "blutgruppe": feldwert(ordner, "Blutgruppe"),
            "gentests":   [t.strip() for t in feldwert(ordner, "Gentests").split(";") if t.strip()],
            "zucht":      feldwert(ordner, "Zucht"),
            "zuchtLink":  feldwert(ordner, "ZuchtLink"),
            "text":       mehrsprachig(ordner),
            "bilder":      v_flach,
            "bildgruppen": v_gruppen,
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
            "farbschlag": mehrsprachig(ordner, feld="Farbschlag"),
            "text":       mehrsprachig(ordner),
            "bilder":      j_flach,
            "bildgruppen": j_gruppen,
        })

    wurf_bilder, wurf_gruppen = fotos("07-wurf", "wurf")

    wurf = {
        "vorhanden":    feldwert("07-wurf", "Wurf vorhanden", standard="ja").lower()
                        in ("ja", "true", "yes", "1"),
        "bezeichnung":  mehrsprachig("07-wurf", feld="Bezeichnung"),
        "mutter":       feldwert("07-wurf", "Mutter"),
        "vater":        feldwert("07-wurf", "Vater"),
        "geboren":      feldwert("07-wurf", "Geboren"),
        "abgabeAb":     mehrsprachig("07-wurf", feld="AbgabeAb"),
        "text":         mehrsprachig("07-wurf"),
        "bilder":       wurf_bilder,
        "kitten":       kitten,
        "keinWurfText": mehrsprachig("07-wurf", 1),
        "archiv":       [],
    }

    vermittlung = {
        "einleitung":  mehrsprachig("08-vermittlung", 0),
        "schritte":    [{"titel": mehrsprachig("08-vermittlung", i, "Titel"),
                         "text":  mehrsprachig("08-vermittlung", i)}
                        for i in range(1, anzahl("08-vermittlung"))],
        "bedingungen": {
            "titel":  mehrsprachig("09-bedingungen", 0, "Titel"),
            "punkte": [mehrsprachig("09-bedingungen", i)
                       for i in range(1, anzahl("09-bedingungen"))],
        },
        "preis": {
            "titel": mehrsprachig("10-preis", 0, "Titel"),
            "text":  mehrsprachig("10-preis", 0),
        },
    }
    gesundheit = {
        "einleitung": mehrsprachig("11-gesundheit", 0),
        "bloecke":    [{"titel": mehrsprachig("11-gesundheit", i, "Titel"),
                        "text":  mehrsprachig("11-gesundheit", i)}
                       for i in range(1, anzahl("11-gesundheit"))],
    }

    kontakt = {
        "einleitung": mehrsprachig("12-kontakt", 0),
        "hinweis":    mehrsprachig("12-kontakt", 1),
    }

    eine = len(katzen) == 1
    return {
        "zucht": zucht, "start": start, "ueberuns": ueberuns,
        "katzen": katzen, "vaeter": vaeter, "wurf": wurf, "vermittlung": vermittlung,
        "gesundheit": gesundheit, "kontakt": kontakt,
        "navigation": [
            {"datei": "ueber-uns.html",
             "label": {"de": "Über uns", "en": "About us",
                       "lb": "Iwwer eis", "fr": "À propos"}},
            {"datei": "katzen.html",
             "label": {"de": "Unsere Katze" if eine else "Unsere Katzen",
                       "en": "Our cat" if eine else "Our cats",
                       "lb": "Eis Kaz" if eine else "Eis Kazen",
                       "fr": "Notre femelle" if eine else "Nos chats"}},
            {"datei": "kitten.html",
             "label": {"de": "Kitten", "en": "Kittens",
                       "lb": "Kitten", "fr": "Chatons"}},
        ] + ([
            {"datei": "vater.html",
             "label": {"de": "Der Vater" if len(vaeter) == 1 else "Die Väter",
                       "en": "The father" if len(vaeter) == 1 else "The fathers",
                       "lb": "De Papp" if len(vaeter) == 1 else "D'Pappen",
                       "fr": "Le père" if len(vaeter) == 1 else "Les pères"}},
        ] if vaeter else []) + [
            {"datei": "vermittlung.html",
             "label": {"de": "Vermittlung & Preis", "en": "Rehoming & price",
                       "lb": "Vermëttlung & Präis", "fr": "Adoption & prix"}},
            {"datei": "gesundheit.html",
             "label": {"de": "Gesundheit", "en": "Health",
                       "lb": "Gesondheet", "fr": "Santé"}},
            {"datei": "kontakt.html",
             "label": {"de": "Kontakt", "en": "Contact",
                       "lb": "Kontakt", "fr": "Contact"}},
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
    entfernt = bilder_aufraeumen()

    print("\n  Fertig.\n")
    print("  %d Katze(n), %d Kitten, %d Fotos, %d Videos uebernommen." %
          (len(daten["katzen"]), len(daten["wurf"]["kitten"]),
           statistik["fotos"], statistik["videos"]))
    if statistik["gespart"] > 0:
        print("  %.1f MB durch Verkleinern der Fotos eingespart." %
              (statistik["gespart"] / 1048576.0))
    if entfernt:
        print("  %d nicht mehr verwendete Datei(en) aus bilder/ entfernt." % entfernt)
    if hinweise:
        print("\n  Hinweise:")
        for h in hinweise:
            print("    - " + h)
    print("\n  Die Website ist aktualisiert. Oeffne index.html zum Ansehen.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
