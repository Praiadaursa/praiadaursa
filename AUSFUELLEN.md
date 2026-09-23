# Was noch fehlt

Alles hier ist auf der Website bereits vorbereitet und muss nur noch
ersetzt werden. Reihenfolge nach Dringlichkeit.

---

## Vor dem Livegang zwingend

Ohne diese Angaben darf die Seite nicht öffentlich erreichbar sein.
Ein Impressum ohne ladungsfähige Anschrift ist abmahnfähig.

### In `impressum.html` und `datenschutz.html`

Alle Stellen sind im Browser **sandfarben hinterlegt und blau
unterstrichen** — du findest sie, indem du beide Seiten einmal
durchscrollst.

| Angabe | Kommt vor in |
|---|---|
| Vollständiger Vor- und Nachname | beiden Dateien |
| Straße und Hausnummer | beiden Dateien |
| Postleitzahl von Trier | beiden Dateien |
| Telefonnummer | beiden Dateien |
| Name und Anschrift des Hosters | `datenschutz.html` |
| Löschfrist der Server-Logdateien in Tagen (fragt dein Hoster) | `datenschutz.html` |
| Datum der letzten Änderung | `datenschutz.html` |
| Geschützter Zwingername beim Felidae e.V. | `impressum.html` |
| Zuchtstättennummer, falls vergeben | `impressum.html` |
| Erlaubnis nach § 11 TierSchG — oder Absatz löschen | `impressum.html` |
| Umsatzsteuer-Angabe — oder Absatz löschen | `impressum.html` |
| Name der Fotografin oder des Fotografen | `impressum.html` |

**Erledigt:** E-Mail (`magnani.giasophie@gmail.com`) und Telefon
(`+49 177 1530695`) sind überall eingetragen — in `inhalte.js`, im
Impressum, in der Datenschutzerklärung und in jeder `noscript`-Zeile.
Die WhatsApp-Nummer steht im nötigen Format `491771530695`.

Die Telefonnummer steht jetzt zusätzlich als eigener Kontaktweg in
`inhalte.js` unter `telefon:` — sie erscheint als Karte auf der
Kontaktseite, in der Fußzeile und als Schaltfläche „Anrufen".

Bedenke dabei: die Mobilnummer ist damit doppelt öffentlich sichtbar.
Willst du einen der beiden Wege nicht, leere in `inhalte.js` die Zeile
`whatsapp:` oder `telefon:` — der jeweilige Kontaktweg verschwindet
dann überall von selbst.

---

## Inhaltlich, damit die Seite stimmt

Alles in `inhalte.js`, jeweils mit `// PLATZHALTER` markiert.

### Yoselin
- `Yoselin von den Schneeblumen` — ihr voller Zuchtname
- `blutgruppe` — A oder B
- `HCM, PKD und FeLV/FIV` — Ergebnisse zu HCM, PKD und FeLV/FIV

### A-Wurf
- `Luigi Gatos del alma` — Zuchtname des Deckkaters
- `29.01.2025` — echtes Wurfdatum im Format `JJJJ-MM-TT`
- `01.11.2026` — wann die Kitten ausziehen dürfen

Namen und Geschlecht der vier Kitten stimmen: **Ash** (Kater),
**Amber** (Kätzin), **Autumn** (Kätzin), **Atlas** (Kater).

Offen bleiben pro Kitten:
- `Seal Tabby Point` — steht bei allen vieren auf „Seal Tabby Point".
  Das ist geraten, bitte prüfen.
- `Reserviert` — steht bei allen vieren auf `"verfuegbar"`. Sobald ein
  Kitten reserviert oder vergeben ist, auf `"reserviert"`
  beziehungsweise `"vergeben"` ändern.
- `text` — die kurzen Wesensbeschreibungen sind von mir erfunden.
  Schreib dort, was wirklich zu jedem passt; das liest sich für
  Interessenten am wertvollsten.

### Vermittlung
- `preis` → im Text steht `PLATZHALTER €`. Trage den Betrag ein,
  **auf Deutsch und Englisch.**

---

## Fotos

Alle Bilder gehören flach in den Ordner `bilder/`. Solange eine Datei
fehlt, zeigt die Seite an dieser Stelle eine sandfarbene Fläche mit
Katzenumriss und dem erwarteten Dateinamen — du siehst also sofort,
wo welches Foto hingehört.

| Dateiname | Wofür | Format |
|---|---|---|
| `logo-portrait.jpg` | Medaillon auf der Startseite | **quadratisch**, Kopf mittig — wird oval beschnitten |
| `zucht.jpg` | Startseite, Abschnitt „Die Zucht" | hochkant |
| `ueber-uns.jpg` | Seite „Über uns" | hochkant |
| `yoselin-1.jpg` bis `-3.jpg` | Yoselins Steckbrief und Galerie | hochkant, 1. Bild als Portrait |
| `ash-1.jpg`, `ash-2.jpg` | Ash | hochkant |
| `amber-1.jpg` | Amber | hochkant |
| `autumn-1.jpg` | Autumn | hochkant |
| `atlas-1.jpg` | Atlas | hochkant |

Das erste Bild in jeder Liste ist das Hauptbild, alle weiteren
erscheinen als Galerie darunter.

---

## Optional

- `instagram:` in `inhalte.js` — solange leer, verschwindet der Punkt
  überall von selbst. Trage die volle Adresse ein, um ihn einzublenden.
- `gegruendet:` in `inhalte.js` — steht auf `"2025"` und erscheint als
  Gravurzeile „EST. 2025" unter dem Medaillon. Trag das richtige Jahr
  ein oder setze `""`, um die Zeile auszublenden.
- Weitere Katzen: einen kompletten Block in `katzen:` kopieren und
  `rolle: "kater"` setzen, dann erscheint automatisch der Bereich „Kater".
