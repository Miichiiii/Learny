# Learny

Initialisierung und Installation
Klone zunächst das Repository auf deinen Computer.

Öffne ein Terminal im Projektverzeichnis und führe folgende Befehle aus:

# Installiere alle Abhängigkeiten
npm install
# Optional: Wenn du Fehler bekommst, versuche
npm install --legacy-peer-deps
Starten der Anwendung
Nach der Installation kannst du die Anwendung mit einem der folgenden Befehle starten:

# Normale Ausführung
npm run dev
# Oder falls das nicht funktioniert:
npx tsx server/index.ts
Der Server sollte dann unter http://localhost:5000 erreichbar sein.

Mögliche Probleme und Lösungen
Problem mit Node.js-Version: Stelle sicher, dass du Node.js Version 18 oder höher verwendest. Du kannst deine Version prüfen mit:

node -v
Port bereits belegt: Wenn Port 5000 bereits verwendet wird, kannst du die server/index.ts Datei anpassen und einen anderen Port angeben.

Typfehler: Falls du TypeScript-Fehler bekommst, führe folgendes aus:

npm install typescript@latest @types/node @types/express --save-dev
Fehlende Abhängigkeiten: Wenn bestimmte Module fehlen, installiere sie einzeln:

npm install package-name
Konfiguration für die Entwicklung
Für die Entwicklung könnte es hilfreich sein, die tsconfig.json zu überprüfen, um sicherzustellen, dass alle Pfade korrekt konfiguriert sind.

Wenn du die Datenbank neu initialisieren möchtest, kannst du das mit npx drizzle-kit push tun, falls du das Schema geändert hast.
