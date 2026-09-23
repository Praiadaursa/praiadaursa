# Praia da Ursa — Website

Heilige-Birma-Zucht in Trier. Statische Website ohne Baukasten,
ohne Datenbank, ohne Abhängigkeiten.

---

## Das Wichtigste in drei Sätzen

1. Du arbeitest **nur im Ordner `MEINE-INHALTE`**. Dort liegt für jede
   Stelle der Website ein eigener Unterordner mit Textdatei und Platz
   für Fotos.
2. Danach **Doppelklick auf `aktualisieren.command`** — das überträgt
   alles in die Website.
3. `index.html` öffnen und nachsehen.

Die ausführliche Anleitung steht in `MEINE-INHALTE/ANLEITUNG.txt`.

`inhalte.js` wird dabei automatisch erzeugt und sollte **nicht mehr von
Hand bearbeitet** werden — beim nächsten Durchlauf würden die Änderungen
überschrieben.

---

## Die Seite lokal ansehen

Doppelklick auf `index.html` genügt für einen ersten Blick. Wenn du es
genau wie im Netz sehen willst, öffne ein Terminal in diesem Ordner und
starte einen kleinen Server:

```bash
python3 -m http.server 8123
```

Dann im Browser `http://localhost:8123` aufrufen. Beenden mit `Strg + C`.

---

## Ein Bild austauschen

Das ist bewusst der einfachste Vorgang von allen.

**Gleiches Foto, neue Aufnahme:** Speichere das neue Bild unter dem
alten Dateinamen in `bilder/` und überschreibe die alte Datei. An der
Website änderst du **gar nichts**.

**Neues Foto mit anderem Namen:** Leg es in `bilder/` und trage den
Dateinamen in `inhalte.js` ein, zum Beispiel:

```js
bilder: ["bilder/yoselin-neu.jpg", "bilder/yoselin-2.jpg"]
```

Das erste Bild der Liste ist immer das Hauptbild. Alle weiteren
erscheinen als Galerie und lassen sich anklicken.

**Zum Format:** Die Seite schneidet jedes Bild automatisch passend zu.
Ein Foto in falscher Größe zerstört das Layout also nicht. Am besten
sehen hochkante Aufnahmen aus, nur `logo-portrait.jpg` sollte quadratisch
sein. Speichere Fotos möglichst unter 500 KB, sonst lädt die Seite am
Handy langsam.

Solange ein Bild fehlt, zeigt die Seite eine sandfarbene Fläche mit
Katzenumriss und dem gesuchten Dateinamen. Nichts geht kaputt.

---

## Ein Kitten ändern

In `inhalte.js` im Abschnitt `wurf:`. Ein Kitten sieht so aus:

```js
{ id: "a1", name: "Amália", geschlecht: "w", status: "verfuegbar",
  farbschlag: { de: "Seal Tabby Point", en: "Seal Tabby Point" },
  text: { de: "Die Ruhigste im Wurf.", en: "The calmest of the litter." },
  bilder: ["bilder/a1-1.jpg", "bilder/a1-2.jpg"] },
```

- **Status ändern:** `status:` auf `"verfuegbar"`, `"reserviert"` oder
  `"vergeben"` setzen. Die Markierung auf der Seite ändert sich sofort,
  und die Startseite zählt automatisch neu, wie viele noch frei sind.
- **Kitten hinzufügen:** den ganzen Block von `{` bis `},` kopieren,
  darunter einfügen, `id` und `name` ändern.
- **Geschlecht:** `"w"` für Kätzin, `"m"` für Kater.

---

## Der nächste Wurf

Wenn alle Kitten ausgezogen sind, setze in `inhalte.js`:

```js
wurf: {
  vorhanden: false,
```

Dann verschwindet die Wurfübersicht und stattdessen erscheint der Text
aus `keinWurfText`. Beim nächsten Wurf wieder auf `true` setzen,
`bezeichnung` auf `"B-Wurf"` ändern und die Kitten neu eintragen.

---

## Die drei Regeln beim Bearbeiten

1. Texte stehen immer zwischen `"Anführungszeichen"`.
2. Nach jedem Eintrag steht ein Komma, außer beim letzten in einer Liste.
3. `{ de: "…", en: "…" }` sind die deutsche und die englische Fassung.
   Wenn du kein Englisch brauchst, schreib denselben Text zweimal.

**Wenn die Seite nach einer Änderung leer bleibt**, ist fast immer ein
Anführungszeichen oder ein Komma verrutscht. Öffne die Seite im Browser,
drücke `F12` und schau in den Reiter „Konsole" — dort steht die Zeile,
in der der Fehler steckt. Am einfachsten: die letzte Änderung rückgängig
machen und in kleineren Schritten wiederholen.

Ein Apostroph im Text ist unproblematisch, solange du ihn nicht als
Anführungszeichen verwendest.

---

## Ins Netz stellen

Die Website besteht nur aus Dateien. Hochladen genügt.

**Empfohlen: ein deutscher Anbieter** wie All-Inkl, Netcup oder Hetzner
(ab etwa 3 € im Monat). Vorteile: Server in Deutschland, ein Vertrag zur
Auftragsverarbeitung ist verfügbar, und in der Datenschutzerklärung
brauchst du keinen Absatz über Datenübermittlung in die USA.

1. Domain bestellen, zum Beispiel `praia-da-ursa.de`
2. Vertrag zur Auftragsverarbeitung (AVV) beim Hoster abschließen —
   das geht meist mit einem Klick im Kundenkonto
3. Den **kompletten Inhalt dieses Ordners** per FTP in das
   Webverzeichnis kopieren (heißt meist `htdocs`, `httpdocs` oder `www`)
4. Name und Anschrift des Hosters in `datenschutz.html` eintragen

Die Ordnerstruktur muss dabei erhalten bleiben: `index.html` liegt oben,
daneben die Ordner `assets/` und `bilder/`.

**Kostenlose Alternative:** Cloudflare Pages oder Netlify. Beides
US-Unternehmen — dann muss die Datenschutzerklärung um einen Absatz zur
Übermittlung in ein Drittland ergänzt werden.

---

## Aufbau der Dateien

```
index.html … kontakt.html   Seitengerüste, je etwa 30 Zeilen
impressum.html              Impressum, Text steht direkt in der Datei
datenschutz.html            Datenschutzerklärung, ebenso
inhalte.js         ←        HIER bearbeitest du alles Redaktionelle
bilder/            ←        HIER liegen alle Fotos
assets/stil.css             Gestaltung; Farben stehen ganz oben
assets/seite.js             baut die Seiten zusammen — nicht nötig anzufassen
assets/schriften/           die beiden Schriftarten
AUSFUELLEN.md               was noch fehlt
```

Die Navigation steht **einmal** in `inhalte.js` und wird auf allen
Seiten daraus erzeugt. Du musst nie neun Dateien einzeln ändern.

---

## Farben ändern

Ganz oben in `assets/stil.css` im Block `:root`.

Die Seite hat **einen** Hintergrundton, `--grund`. Es gibt bewusst keine
farbigen Bänder — Struktur entsteht aus Linien, Ornamenten und
Abstand. Wenn du den Grundton änderst, ändert sich die ganze Seite.

`--blau` ist der Zierrat: Kartuschenrahmen, Schnörkel-Trenner, Links,
kleine Versalzeilen, Status „verfügbar". `--taupe` ist ausschließlich
für Linien und Formen — **niemals für Text.** Es erreicht als Schrift
nur 2,9:1 Kontrast und wäre am Handy in der Sonne unlesbar.

Wenn du Farben austauschst, prüfe den Kontrast kostenlos beim „WebAIM
Contrast Checker". Textfarben sollten mindestens 4,5 erreichen. Die
aktuelle Palette liegt überall bei 4,98 oder darüber.

---

## Das Logo anpassen

Die Kartusche besteht aus drei unabhängigen Teilen:

1. **Das Foto** — `bilder/logo-portrait.jpg`, quadratisch. Überschreiben
   genügt, der Rahmen bleibt unberührt. Dasselbe Bild erscheint
   automatisch verkleinert in der Kopfzeile aller Seiten.
   Es wird oval beschnitten, der Kopf gehört also mittig.
2. **Der Ornamentrahmen** — als SVG in `assets/seite.js` unter `KRANZ`.
   Gezeichnet ist nur ein Viertel; die anderen drei entstehen durch
   Spiegelung. Wer den Schnörkel schlichter möchte, löscht einzelne
   `<path>`-Zeilen aus der Gruppe `pdu-viertel` — die Spiegelungen
   folgen von selbst.
3. **Die Gravurzeile** — „EST. 2025". Das Jahr steht in `inhalte.js`
   als `gegruendet:`. Ein leerer Wert `""` blendet die Zeile aus.
