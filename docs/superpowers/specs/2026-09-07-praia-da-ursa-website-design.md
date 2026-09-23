# Website Praia da Ursa — Design

Stand: 2026-09-07

## 1. Ausgangslage

Praia da Ursa ist eine junge Heilige-Birma-Zucht in Trier, Mitglied im
Felidae e.V. Aktueller Bestand: eine Katze, Yoselin, geboren am
20.04.2025. Ein erster Wurf ist noch nicht gefallen.

Die Website soll seriös, persönlich und ästhetisch anspruchsvoll
wirken, ohne mehr zu behaupten, als es gibt. Sie muss von einer Person
ohne Programmierkenntnisse gepflegt werden können — insbesondere die
Bilder, die jederzeit selbst austauschbar sein sollen.

### Gestalterische Referenzen

- **perrotin.com** — Struktur und Typografie: reines Weiß, Schwarz als
  einzige Textfarbe, Neo-Grotesk in Versalien mit weiter Laufweite,
  sehr kleine Navigation, strenges Raster, große Bilder, viel Weißraum.
- **velvet-poodles.de** — der romantische Gegenpol: warmes Creme
  (#EAD7C8), kreisrundes Medaillon-Portrait mit dünnem Zierring,
  klassizistische Serife. Von hier stammt auch die Logo-Idee.

Die Synthese: Perrotins Strenge als Gerüst, die romantischen Elemente
sparsam und wiederkehrend als Akzent.

## 2. Ziele und Nicht-Ziele

### Ziele

1. Vertrauen aufbauen: Haltung, Gesundheit und Aufzucht sichtbar machen.
2. Qualifizierte Anfragen erzeugen, unpassende vorab herausfiltern.
3. Vollständig ohne Code pflegbar: eine Inhaltsdatei, ein Bilderordner.
4. Rechtssicher in der EU: kein externer Dienst, keine Cookies,
   kein Cookie-Banner.

### Nicht-Ziele

- Kein Shop, keine Zahlungsabwicklung, keine Reservierung online.
- Kein Blog, kein Gästebuch, keine Kommentare.
- Keine Analytics, kein Tracking, keine Social-Media-Einbettungen.
- Kein Login-Bereich, keine Warteliste mit Datenbank.

## 3. Farbwelt: Vintage-Buchseite

Zwei verworfene Fassungen liegen hinter dieser. Die erste war
durchgehend cremefarben und wirkte flach. Die zweite setzte dagegen
große dunkle Bänder in Seal und Tintenblau — und wurde als
"blockartig" und "fürchterlich" abgelehnt. Die Lehre daraus: Tiefe darf
hier nicht aus Farbflächen kommen.

Die gültige Fassung hält **einen** warmen Creme über die ganze Seite.
Struktur entsteht aus Typografie, Haarlinien und Ornament. Farbe
erscheint als Zierrat, nicht als Fläche.

| Rolle | Hex | Beschreibung |
|---|---|---|
| `--grund` | `#F6F0E4` | Warmer Creme, durchgehend |
| `--flaeche` | `#EFE7D7` | Nur Bildrahmen und Platzhalter |
| `--linie` | `#D8CCB8` | Taupe-Haarlinien |
| `--linie-fein` | `#E4DAC8` | Feinere Trennlinien |
| `--text` | `#33291F` | Dunkelbraun, Fließtext |
| `--text-leise` | `#6A6058` | Taupe-Grau, Zweittext |
| `--blau` | `#122A42` | Dunkles Blau, Ornament und Links |
| `--taupe` | `#9C8B75` | Hellbraun, ausschließlich Linien und Formen |
| `--balken` | `#AA9A86` | Taupe für Kopf- und Fußzeile |

Kopf- und Fußzeile sitzen als Balken in `--balken` und rahmen die
cremefarbene Seite wie die Deckel eines Buches.

Der Ton entstand in zwei Schritten. Erst wurde er von Sandgelb auf
Taupe gekühlt — die Differenz zwischen Rot- und Blaukanal fiel von 50
auf 23. Dann wurde er deutlich abgedunkelt, weil die Seite sonst flach
wirkte: sie besaß nur zwei Helligkeitsstufen, Creme und fast schwarze
Schrift, ohne Mittelton dazwischen. Der Abstand zwischen Balken und
Seitengrund stieg dadurch von 1.44 auf **2.41**.

`#AA9A86` ist dabei die rechnerische Untergrenze mit Sicherheitsabstand.
Der aktive Menüpunkt steht in `--blau` und erreicht darauf noch 5.35:1;
bei etwa `#A1917C` fiele er unter die geforderten 4.5:1. Ein wirklich
dunkler Balken wäre nur möglich, wenn der aktive Menüpunkt auf ein
helles Blau wechselt.

Innerhalb der Balken fällt `--text-leise` mit `--text` zusammen — nur
die volle Textfarbe besteht dort den Kontrasttest (5.19:1).

Braun, Taupe-Grau und Creme tragen die Seite; das Blau erscheint nur
im Kartuschenrahmen, in den Schnörkel-Trennern, in Links, in den
kleinen Versalzeilen und im Status "verfügbar".

**`--taupe` ist als Textfarbe gesperrt.** Es erreicht auf dem Grund nur
2.9:1. Bei der Prüfung war es versehentlich in drei Textelementen
gelandet und wurde dort durch `--text-leise` ersetzt.

## 4. Typografie

Zwei Schriften, klar getrennt nach Aufgabe.

- **Jost** trägt alles: Fließtext, Navigation, Überschriften,
  Auszeichnungen. Eine geometrische Grotesk in der Futura-Linie der
  1920er — zeitlos und mit eigenem Charakter. Sie ersetzt Inter, das
  als Systemschrift ohne Eigenart empfunden wurde, und schließt an die
  Ausgangsreferenz velvet-poodles an, die Futura Light verwendet.
- **Cormorant Garamond** nur noch für Eigennamen: die Wortmarke
  "Praia da Ursa", die Namen der Katzen und Kitten sowie die Ziffern
  der Vermittlungsschritte. Ein Akzent, kein Grundton. Die Ziffern
  stehen in `--blau` (12.9:1), alle übrigen Serifen in `--text`.

Überschriften laufen in Jost Light (300), in Versalien mit 0.15em
Laufweite — serifenlos, elegant, zeitlos. Der Grundschriftgrad wurde
von 17px auf 15px zurückgenommen; die erste Fassung war im Verhältnis
zu groß. Der Lesetext in `.fliess` steht bei 16px.

Die Wortmarke bleibt unverändert. Sie war von Anfang an das Element,
das getragen hat.

Alle fünf Schnitte liegen als WOFF2 lokal im Projekt. Kein Aufruf an
fonts.googleapis.com, damit keine IP-Übertragung in die USA und kein
Einwilligungsbedarf. Beide Familien stehen unter der SIL Open Font
License; die Lizenztexte liegen bei.

## 5. Logo

Eine ornamentierte Kartusche, gezeichnet als SVG.

Ein Oval, sonst nichts. Zwei Zwischenschritte — eine gestochene
Kartusche mit Schnörkeln, danach eine Fassung mit seitlichen Schwingen
nach dem Vorbild klassischer Monogramm-Abzeichen — wurden verworfen.
Außerhalb des äußersten Ovals steht jetzt kein Ornament mehr.

Aufbau von innen nach außen:

1. dünner blauer Ring am Bildrand (rx 106, ry 122)
2. **Guilloche** — zwei gegenläufige Wellen um rx 120 / ry 138
3. gepunkteter blauer Ring (rx 134, ry 154)
4. kräftiger blauer Rahmen (rx 144, ry 166)
5. feiner Taupe-Abschluss (rx 150, ry 172)

Die Guilloche ist das einzige unruhige Element und trägt die Spannung.
Beide Wellen folgen `r(θ) = R · (1 + 0.038 · sin(28θ + φ))`, die zweite
um π versetzt. Dadurch kreuzen sie sich an jedem Knoten und wirken
geflochten — dasselbe Prinzip wie bei Urkunden und Banknoten. Die
Pfade werden aus 280 Stützpunkten je Welle erzeugt, damit der Ring
exakt symmetrisch schließt; von Hand gezeichnet wäre das nicht
zuverlässig zu treffen.

Eine **verkleinerte Fassung** steht in der Kopfzeile jeder Seite: das
Oval mit doppelter Haarlinie in 28 × 34 Pixeln, daneben die Wortmarke
und darunter die Zeile "Heilige Birma · Trier".

### Trennung zwischen Abschnitten

Statt wechselnder Hintergrundflächen sitzt zwischen zwei Abschnitten
ein **Schnörkel** — zwei gespiegelte Voluten mit einer Raute in der
Mitte, als SVG-Data-URI im Pseudoelement `.abschnitt + .abschnitt::before`.
Die Data-URI muss mit **einfachen** Anführungszeichen im SVG gebaut
werden; doppelte beenden die CSS-Zeichenkette und die Grafik erscheint
nicht.

Die beiden Ornamente sind farblich gegeneinander gesetzt: der große
Trenner zwischen den Abschnitten trägt `--blau`, der kleine Schnörkel
über jeder Seitenüberschrift das hellere `--taupe`. Beide sind reine
Dekoration und tragen keinen Text. Die umgekehrte Verteilung wurde
ausprobiert und verworfen.

## 6. Seitenstruktur

Neun Seiten. Die Navigation umfasst sechs Punkte — der Zuchtname in der
Kopfzeile führt zur Startseite; Impressum und Datenschutz stehen in der
Fußzeile.

### 6.1 Start (`index.html`)

Der romantische Moment der Website.

- Vollflächiger Empfang auf `--grund`: das Medaillon-Logo mittig,
  darunter ein Satz Haltung, darunter ein dezenter Hinweis nach unten.
- Abschnitt "Die Zucht": drei bis vier Sätze, daneben ein Hochformat.
- Abschnitt "Yoselin": Portrait mit Bogenabschluss oben, Kurzsteckbrief.
- Abschnitt "Wurfplanung": aktueller Stand, verlinkt auf die Wurfseite.
- Abschluss: Kontaktzeile mit WhatsApp-Schaltfläche.

### 6.2 Über uns (`ueber-uns.html`)

Philosophie, Aufzucht im Wohnbereich, Sozialisierung, wer dahintersteht,
Mitgliedschaft im Felidae e.V. mit Verweis auf felidae-ev.de.

### 6.3 Unsere Katzen (`katzen.html`)

Raster aus Portraitkarten, getrennt nach Königinnen und Katern.
Aktuell eine Karte: Yoselin. Jede Karte öffnet einen Steckbrief mit:
Rufname, voller Name, Geburtsdatum, Farbschlag, Gentests, Blutgruppe,
Titel, Stammbaum-Link, Bildergalerie.

Bei einer einzelnen Katze wird das Raster zu einer großformatigen
Einzeldarstellung — kein halbleeres Gitter.

### 6.4 Kitten und Würfe (`kitten.html`)

Zwei Zustände, gesteuert über ein Feld in der Inhaltsdatei. Aktuell
aktiv ist der A-Wurf mit vier Kitten.

- **Wurf vorhanden** (aktuell): Wurfkopf mit Eltern, Wurfdatum und Abgabetermin;
  darunter je Kitten eine Karte mit Name, Geschlecht, Farbschlag,
  Status (verfügbar / reserviert / vergeben) und eigener Bildergalerie.
  Videos werden als lokale Dateien eingebunden, nicht über YouTube.
- **Kein Wurf**: gestalteter Zustand mit dem Stand der Planung statt
  einer leeren Seite. Bleibt für die Zeit zwischen zwei Würfen erhalten.

Darunter das Archiv vergangener Würfe, aktuell leer und ausgeblendet.

### 6.5 Vermittlung (`vermittlung.html`)

Ablauf in Schritten, Abgabebedingungen, Abgabealter, Preisrahmen, was
im Preis enthalten ist, Kaufvertrag, Schutzgebühr, Kastrationspflicht,
Hinweis zur Zweitkatze.

### 6.6 Gesundheit (`gesundheit.html`)

HCM- und PKD-Untersuchung, FeLV/FIV, Blutgruppenbestimmung,
Impfungen und Entwurmung, Ernährung, Stammbaum und Zuchtordnung des
Felidae e.V.

### 6.7 Kontakt (`kontakt.html`)

WhatsApp als primäre Schaltfläche mit vorformulierter Nachricht über
`wa.me`, E-Mail gleichrangig daneben, Region Trier, optional Social
Media. Kein Formular, kein externer Formulardienst.

### 6.8 Impressum (`impressum.html`)

Nach § 5 DDG. Pflichtangaben: vollständiger Name, ladungsfähige
Anschrift, E-Mail, Telefon, Verantwortlicher nach § 18 Abs. 2 MStV.
Wird als vollständige Vorlage mit klar markierten Lücken angelegt.

### 6.9 Datenschutz (`datenschutz.html`)

Nach DSGVO. Da die Seite keine Cookies setzt, kein Tracking und keine
externen Dienste nutzt, bleibt die Erklärung kurz und wahrheitsgemäß:
Verantwortlicher, Server-Logfiles beim Hoster mit Rechtsgrundlage und
Speicherdauer, Kontaktaufnahme per E-Mail und WhatsApp einschließlich
Hinweis auf die Datenübermittlung an Meta, lokal gehostete Schriften,
Speicherung der Sprachwahl im Browser, Betroffenenrechte,
Beschwerderecht bei der Aufsichtsbehörde Rheinland-Pfalz.

Beides sind sorgfältig erstellte Vorlagen, keine Rechtsberatung. Vor
dem Livegang sollten sie geprüft werden.

## 7. Technische Umsetzung

### 7.1 Aufbau

Statische Website aus HTML, CSS und etwas JavaScript. Kein Build, kein
Framework, keine Abhängigkeiten, kein Server.

```
index.html … datenschutz.html    Seitengerüste, je ~15 Zeilen
inhalte.js                       ALLE Texte und Daten, zweisprachig
bilder/                          alle Fotos
assets/stil.css                  Gestaltung, Farben als Variablen
assets/seite.js                  baut Navigation, Kopf, Fuß, Inhalte
assets/schriften/                Inter und Cormorant als WOFF2
AUSFUELLEN.md                    Liste der offenen Platzhalter
LIESMICH.md                      Anleitung zum Pflegen und Hochladen
```

Jede HTML-Datei ist ein dünnes Gerüst, das `inhalte.js` und
`seite.js` lädt und die Seiten-Kennung nennt. Navigation, Kopfzeile,
Fußzeile und Inhalte werden daraus erzeugt. Dadurch existiert die
Navigation genau einmal und nicht neunmal.

### 7.2 Datenmodell in `inhalte.js`

Ein einziges Objekt. Zweisprachige Texte stehen als
`{ de: "…", en: "…" }` direkt nebeneinander, damit beim Ändern nie eine
Übersetzung vergessen wird.

```js
const INHALTE = {
  zucht: {
    name: "Praia da Ursa",
    untertitel: { de: "Heilige Birma · Trier", en: "Sacred Birman · Trier" },
    verband: { name: "Felidae e.V.", url: "https://www.felidae-ev.de/" },
    whatsapp: "49XXXXXXXXXX",
    email: "PLATZHALTER@example.de"
  },

  katzen: [
    { id: "yoselin",
      rolle: "koenigin",              // koenigin | kater
      rufname: "Yoselin",
      geboren: "2025-04-20",
      farbschlag: { de: "Seal Tabby Point", en: "Seal Tabby Point" },
      gentests: ["HCM: PLATZHALTER", "PKD: PLATZHALTER"],
      bilder: ["bilder/yoselin-1.jpg", "bilder/yoselin-2.jpg"],
      text: { de: "…", en: "…" } }
  ],

  wurf: {
    vorhanden: true,                  // der eine Schalter
    geplantText: { de: "…", en: "…" },
    kitten: []
  }
};
```

Ein neues Kitten anzulegen heißt: Block kopieren, Werte ändern, Foto in
`bilder/` legen, Dateiname eintragen. Kein weiterer Schritt.

### 7.3 Bilder

Der ausdrückliche Wunsch, Bilder jederzeit selbst zu tauschen, prägt
die Umsetzung:

- Alle Fotos liegen flach in `bilder/`, ohne Unterordner.
- Bezug ausschließlich über den Dateinamen in `inhalte.js`.
- Das Layout gibt jedem Bild ein festes Seitenverhältnis vor und
  beschneidet mittig. Dadurch zerstört ein Foto in abweichender Größe
  nie das Layout.
- Ein Bild wird ersetzt, indem die Datei unter gleichem Namen
  überschrieben wird — ganz ohne Codeänderung.
- Fehlt eine Datei, erscheint eine getönte Fläche mit dem erwarteten
  Dateinamen statt eines defekten Bildes.
- Alle Bilder laden verzögert und tragen einen Alternativtext aus
  `inhalte.js`.

### 7.4 Zweisprachigkeit

Umschalter DE/EN oben rechts in der Kopfzeile. Die Wahl wird in
`localStorage` gemerkt und in der Adresszeile als `?lang=en` abgebildet,
damit ein englischer Link teilbar ist. Das `lang`-Attribut der Seite
wird mitgeführt.

Bekannter Kompromiss: die Texte werden im Browser eingesetzt. Google
verarbeitet das zwar, fest eingebautes HTML wäre aber stärker. Für eine
Zucht, die über Direktlinks, Instagram und den Verband gefunden wird,
ist das vertretbar. Ein optionales Skript, das daraus echtes statisches
HTML erzeugt, kann später nachgereicht werden, ohne dass sich an der
Pflege etwas ändert.

### 7.5 Anforderungen an die Qualität

- Mobil zuerst; getestet bei 375px, 768px und 1440px.
- Bedienbar per Tastatur, sichtbarer Fokusrahmen im Akzentblau.
- Kontraste nach WCAG AA, im gerenderten Zustand nachgemessen statt
  geschätzt: Fließtext 5.4:1, Versalzeilen 12.9:1, Navigation 12.5:1,
  Bildhinweis 5.0:1. Schlechtester Wert der ganzen Seite: 4.98:1,
  gefordert sind 4.5:1. `--taupe` ist als Textfarbe gesperrt.
- Ohne JavaScript erscheint ein verständlicher Hinweis statt einer
  leeren Seite.
- Sprechende Seitentitel, Beschreibungen, Open-Graph-Bild, `favicon`.

## 8. Hosting und Domain

Empfehlung: Domain `praia-da-ursa.de` bei einem deutschen Anbieter
(All-Inkl, Hetzner oder Netcup). Gründe: Server in Deutschland,
Auftragsverarbeitungsvertrag ohne Zusatzaufwand verfügbar, keine
Drittlandübermittlung in der Datenschutzerklärung nötig, Kosten unter
fünf Euro monatlich. Das Hochladen geschieht per FTP durch Kopieren des
Projektordners.

Alternative ohne Kosten: Cloudflare Pages oder Netlify. Beides
US-Unternehmen, was einen Absatz zur Drittlandübermittlung in der
Datenschutzerklärung erfordert.

## 9. Offene Punkte

Diese Angaben fehlen noch und werden als markierte Platzhalter angelegt
sowie in `AUSFUELLEN.md` gesammelt:

1. Vollständiger Name und ladungsfähige Anschrift für das Impressum —
   rechtlich zwingend vor dem Livegang, nicht als Platzhalter
   veröffentlichbar.
2. E-Mail-Adresse und WhatsApp-Nummer im Format 49XXXXXXXXXX.
3. Yoselins vollständiger Zuchtname, Gentestergebnisse, Blutgruppe.
4. Zum A-Wurf: Wurfdatum, Deckkater mit Zuchtname, sowie je Kitten
   Rufname, Geschlecht, Farbschlag und Status. Bis dahin stehen dort
   deutlich markierte Beispielwerte.
5. Fotos von Yoselin und den vier Kitten, darunter eines für das
   Medaillon-Logo.
6. Ob Instagram oder Facebook verlinkt werden soll.

Ein separater rechtlicher Hinweis: Wer gewerbsmäßig mit Wirbeltieren
züchtet, benötigt in Deutschland eine Erlaubnis nach § 11 TierSchG.
Ob eine Hobbyzucht darunterfällt, hängt vom Umfang ab und ist mit dem
zuständigen Veterinäramt in Trier zu klären. Die Website trifft dazu
keine Aussage.
