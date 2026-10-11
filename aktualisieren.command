#!/bin/bash
# Doppelklick auf diese Datei uebernimmt alles aus MEINE-INHALTE
# in die Website. Danach kannst du index.html oeffnen.
cd "$(dirname "$0")" || exit 1
echo ""
echo "  Praia da Ursa — Inhalte uebernehmen"
echo "  -----------------------------------"
python3 werkzeuge/uebernehmen.py
ergebnis=$?
echo ""
if [ $ergebnis -ne 0 ]; then
  echo "  Es ist etwas schiefgegangen. Siehe Meldung oben."
fi
echo "  Dieses Fenster kannst du jetzt schliessen."
echo ""
read -n 1 -s -r -p "  (Taste druecken zum Beenden)"
echo ""
