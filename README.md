
# SubQuantum Grid Observer

Der SubQuantum Grid Observer ist eine interaktive Webanwendung, die eine Multi-Agenten-Simulation in einer dynamischen 2D-Grid-Welt visualisiert. Die Besonderheit dieser Simulation ist die Beeinflussung durch ein fiktives "SubQuantenSystem" (SQS), das unvorhersehbare globale Ereignisse auslöst und so die Umgebungsbedingungen und das Verhalten der Agenten beeinflusst. Die narrativen Beschreibungen dieser Ereignisse werden mithilfe der Google Gemini API generiert.

## Inhaltsverzeichnis

1.  [Überblick](#überblick)
2.  [Technologien](#technologien)
3.  [Benutzeroberfläche](#benutzeroberfläche)
    *   [Gitteranzeige](#gitteranzeige)
    *   [Informationspanel](#informationspanel)
    *   [Steuerelemente](#steuerelemente)
    *   [Einstellungspanel (Settings Panel)](#einstellungspanel-settings-panel)
4.  [Das SubQuantenSystem (SQS)](#das-subquantensystem-sqs)
    *   [Grundkonzept](#grundkonzept)
    *   [Wellenmechanik](#wellenmechanik)
    *   [Globale Knoten (SQK-Ereignisse)](#globale-knoten-sqk-ereignisse)
    *   [SQK-Effekte](#sqk-effekte)
    *   [Kommunikationsförderlichkeit](#kommunikationsförderlichkeit)
    *   [Wichtige SQS-Parameter](#wichtige-sqs-parameter)
5.  [Agentenverhalten](#agentenverhalten)
    *   [Grundlagen](#grundlagen)
    *   [Energie](#energie)
    *   [Ressourcensammlung](#ressourcensammlung)
    *   [Niedrigenergie-Logik](#niedrigenergie-logik)
    *   [Bewegung und Kollision](#bewegung-und-kollision)
6.  [Google Gemini API Integration](#google-gemini-api-integration)
7.  [Simulationsablauf](#simulationsablauf)
8.  [Projektstruktur](#projektstruktur)
9.  [Setup und Start](#setup-und-start)

## 1. Überblick

Die Anwendung simuliert eine Umgebung, in der mehrere autonome Agenten Ressourcen sammeln, ihre Energie verwalten und auf dynamische Ereignisse reagieren, die vom SubQuantenSystem ausgelöst werden. Ziel ist es, ein visuell ansprechendes und interaktives Erlebnis zu schaffen, das die Komplexität emergenter Systeme und die Auswirkungen unvorhersehbarer externer Faktoren demonstriert. Benutzer können nun viele Simulationsparameter dynamisch anpassen.

## 2. Technologien

*   **React 19:** Für die Erstellung der Benutzeroberfläche.
*   **TypeScript:** Für typsichere JavaScript-Entwicklung.
*   **Tailwind CSS:** Für schnelles und responsives UI-Styling.
*   **Google Gemini API (@google/genai):** Zur Generierung von narrativen Texten für SubQuanten-Ereignisse.
*   **ESM (über esm.sh):** Für das Laden von Modulen direkt im Browser ohne lokalen Build-Schritt.

## 3. Benutzeroberfläche

Die Benutzeroberfläche ist in zwei Hauptbereiche unterteilt: die Gitteranzeige und das Informationspanel, ergänzt durch Steuerelemente und ein neues Einstellungspanel.

### Gitteranzeige

*   Zeigt das 2D-Gitter an, dessen Größe (`gridRows` x `gridCols`) nun dynamisch über das Einstellungspanel konfiguriert werden kann.
*   Jede Zelle (`ResourceCell`) stellt einen bestimmten Ressourcentyp (z.B. Erz, Baum, Wasser, Ladestation) oder ein Hindernis dar. Die Farben sind in `constants.ts` definiert.
*   "Geboostete" Ressourcenzellen (durch einen SQK-Effekt) werden visuell hervorgehoben (pulsierender Rahmen).
*   Agenten (`AgentSprite`) werden als farbige Kreise dargestellt, die sich über das Gitter bewegen. Ihre Farbe dient zur Unterscheidung. Ein kleiner Balken am unteren Rand des Agenten visualisiert dessen aktuellen Energiestatus relativ zur (ggf. dynamisch angepassten) `initialEnergy`.
*   Die Größe der Zellen (`CELL_SIZE_PX`) ist aktuell konstant, während die Anzahl der Agenten (`numAgents`) und deren Eigenschaften dynamisch sind.

### Informationspanel

Das Panel auf der rechten Seite zeigt detaillierte Informationen zur laufenden Simulation:

*   **Simulationsstatus:**
    *   Aktueller Simulationsschritt (`Step`).
    *   Gesamte Simulationszeit (`SQS Time`), die für die Berechnung der SQS-Wellen relevant ist.
*   **SubQuantenSystem:**
    *   Zeigt gerundete Werte der Energie- und Phasenwelle (basierend auf `sqsDecimalPrecision`).
    *   Optional (via Einstellungspanel): Anzeige der rohen, ungerundeten Wellenwerte.
    *   Status der Kommunikationsförderlichkeit (OFFEN/GESCHLOSSEN).
    *   Der `Re(s)` Projektionswert des letzten erkannten globalen Knotens.
*   **Aktiver SQK-Effekt:**
    *   Wenn ein SubQuantenKnoten-Effekt aktiv ist, wird dessen Typ, verbleibende Dauer und eine von der Gemini API generierte narrative Beschreibung angezeigt. Dies könnte im Informationspanel beispielsweise so aussehen:

        ```
        Aktiver SQK-Effekt!
        Agenten-Geschwindigkeits-Boost

        Dauer: 11 Schritte

        Gemini-Narrativ:

        "[SYSTEMWARNUNG] SubQuantenKnoten detektiert! Alle Agentengeschwindigkeiten sind nun für begrenzte Zeit um x1.7 erhöht. Nutzt diesen Beschleunigungsschub für schnellere Bewegung und verbesserte Erkundung!"
        ```
*   **Agentenübersicht:**
    *   Liste aller Agenten mit ihrer ID und ihrem Energiestatus (relativ zur `initialEnergy` aus den aktuellen Einstellungen).
    *   Ein Klick auf einen Agenten wählt diesen aus und zeigt detailliertere Informationen an.
*   **Details des ausgewählten Agenten:**
    *   Energie (numerisch und als Balken).
    *   Aktuelle Position (Reihe, Spalte).
    *   Basisgeschwindigkeit und Tragekapazität (gemäß aktuellen Einstellungen).
    *   Inventar: Auflistung der gesammelten Ressourcen und deren Mengen.
    *   Wenn ein Agent keine Energie mehr hat, wird ein "INAKTIV"-Status angezeigt.

### Steuerelemente

Oberhalb der Gitteranzeige befinden sich Schaltflächen zur Steuerung der Simulation:

*   **Simulation Anhalten/Fortsetzen:** Schaltet den Simulationsfortschritt um.
*   **Simulation Zurücksetzen:** Setzt die gesamte Simulation auf ihren Anfangszustand zurück, wobei die aktuell im Einstellungspanel *angewandten* Parameter verwendet werden. Startet die Simulation neu.
*   **Einstellungen Öffnen/Schließen:** Zeigt das Einstellungspanel an oder verbirgt es. Das Öffnen pausiert die Simulation.

### Einstellungspanel (Settings Panel)

Ein neues, umfassendes Panel erlaubt die dynamische Anpassung vieler Simulationsparameter:

*   **Presets Laden:** Auswahl vordefinierter Konfigurationen (z.B. "Default", "Chaotisch", "Harmonisch").
*   **Grid & Agenten:**
    *   `Grid Rows`, `Grid Cols`: Größe des Gitters.
    *   `Num Agents`: Anzahl der Agenten.
    *   `Initial Energy`, `Energy Depletion Rate`, `Low Energy Threshold`: Energieparameter der Agenten.
    *   `Agent Base Speed`, `Agent Carry Capacity`: Basisattribute der Agenten.
*   **Ressourcen & Aufladen:**
    *   `Resource Recharge Amount`, `Plant Recharge Multiplier`: Energiemenge beim Sammeln.
    *   `Obstacle Density`, `Resource Respawn Rate`: Dichte und Nachwachsrate.
    *   `Charging Station Recharge`: Energiemenge pro Schritt an der Ladestation.
*   **SubQuantenSystem (SQS):**
    *   `SQS F Energy`, `SQS F Phase`: Frequenzen der SQS-Wellen.
    *   `SQS Noise Factor`: Einfluss des Zufallsrauschens auf die Wellen.
    *   `SQS Threshold S`: Schwellenwert für die Detektion von SQK-Ereignissen.
    *   `SQS Decimal Precision`: Genauigkeit für Kohärenzprüfung der Wellen.
    *   `SQS Max Sim Time Period`: Periode der SQS-Wellen.
    *   `SQS Re(s) Projection C`: Konstante für die Re(s)-Projektion.
    *   `SQS Comm Threshold Factor`, `SQS Comm Decimal Precision`: Parameter für die Kommunikationsförderlichkeit.
*   **SQK Effekte & Simulation:**
    *   `SQK Effect Duration Min/Max`: Minimale und maximale Dauer von SQK-Effekten.
    *   `SQK Speed Boost Min/Max`: Multiplikatorbereich für Geschwindigkeitsboosts.
    *   `Simulation Tick (ms)`: Geschwindigkeit der Simulationsschritte.
*   **Anzeigeoptionen:**
    *   `Show Internal SQS Wave Values`: Checkbox, um die rohen SQS-Wellenwerte im Info-Panel anzuzeigen.
*   **Schaltflächen:**
    *   "Cancel": Schließt das Panel ohne Änderungen zu übernehmen (zeigt wieder die zuletzt angewandten Einstellungen).
    *   "Apply Settings & Restart": Übernimmt die aktuellen Einstellungen und startet die Simulation mit diesen neuen Parametern neu.

Änderungen im Einstellungspanel werden erst nach Klick auf "Apply Settings & Restart" wirksam.

## 4. Das SubQuantenSystem (SQS)

Das SubQuantenSystem ist das Herzstück der dynamischen Ereignisse in der Simulation. Es ist ein fiktives System, dessen Zustand sich über die Zeit ändert und unter bestimmten Bedingungen globale "Knoten" (SQK-Ereignisse) auslösen kann, die die Spielwelt beeinflussen. Viele seiner Parameter sind nun über das Einstellungspanel konfigurierbar.

### Grundkonzept

Das SQS wird durch zwei primäre, oszillierende Wellen beschrieben: eine Energiewelle und eine Phasenwelle. Diese Wellen entwickeln sich unabhängig voneinander im Laufe der Simulationszeit. Ihre Interaktion und spezifische Konstellationen führen zu den SQK-Ereignissen.

### Wellenmechanik

*   **Energiewelle (`energyWaveValue`):**
    *   Wird durch eine Sinusfunktion mit einer spezifischen Frequenz (einstellbar: `sqsFEnergy`) berechnet.
    *   Die Zeit für die Sinusfunktion wird normalisiert basierend auf `sqsMaxSimTimePeriod`, um eine periodische Entwicklung zu ermöglichen.
    *   Ein Rauschfaktor (einstellbar: `sqsNoiseFactor`) wird addiert, um eine gewisse Unvorhersehbarkeit einzuführen.
    *   Der resultierende Wert wird auf einen Bereich von ca. 0 bis 1.5 begrenzt.
*   **Phasenwelle (`phaseWaveValue`):**
    *   Funktioniert analog zur Energiewelle, verwendet jedoch eine Frequenz (einstellbar: `sqsFPhase`).
    *   Auch hier wird Rauschen addiert und der Wert begrenzt.

### Globale Knoten (SQK-Ereignisse)

Ein globaler Knoten (SubQuantenKnoten-Ereignis, SQK-Event) tritt auf, wenn folgende Bedingungen gleichzeitig erfüllt sind:

1.  **Schwellenwertüberschreitung:** Sowohl der Wert der Energiewelle als auch der Wert der Phasenwelle liegen über einem definierten Schwellenwert (einstellbar: `sqsThresholdS`).
2.  **Wellenkohärenz:** Die auf `sqsDecimalPrecision` (einstellbar) Dezimalstellen gerundeten Werte der Energie- und Phasenwelle sind nahezu identisch.

Wenn ein Knoten detektiert wird:

*   **Knotenstärke (`knotStrengthMetric`):** Wird als Durchschnitt der beiden Wellenwerte zum Zeitpunkt des Knotens berechnet.
*   **Re(s)-Projektion:** Ein spekulativer Wert, beeinflusst durch `sqsReSProjectionC` (einstellbar).
*   Der Knoten wird in der `knotHistory` des SQS gespeichert.
*   Ein **SQK-Effekt** wird ausgelöst.

### SQK-Effekte

Wenn ein globaler Knoten auftritt, wird zufällig einer der folgenden Effekte für eine begrenzte Dauer (einstellbar: `sqkEffectBaseDurationMin` bis `sqkEffectBaseDurationMax` Schritte) aktiviert:

*   **`RESOURCE_BOOST` (Ressourcen-Boost):** Details wie oben beschrieben.
*   **`AGENT_SPEED_BOOST` (Agenten-Geschwindigkeits-Boost):** Multiplikator (einstellbar: `sqkSpeedBoostMultiplierMin` bis `sqkSpeedBoostMultiplierMax`).
*   **`GOAL_REVEAL` (Ziel-Enthüllung):** Primär narrativer Natur.

### Kommunikationsförderlichkeit (`isCommunicationConducive`)

Bestimmt durch SQS-Wellen und die Parameter `sqsCommThresholdFactor` und `sqsCommDecimalPrecision` (beide einstellbar).

### Wichtige SQS-Parameter

Viele dieser Parameter sind nun über das Einstellungspanel zugänglich und modifizierbar (siehe Abschnitt Einstellungspanel).

## 5. Agentenverhalten

Das Verhalten der Agenten wird durch ihre internen Zustände und die (nun dynamisch konfigurierbaren) Umgebungsparameter bestimmt.

### Grundlagen

*   Anzahl der Agenten (`numAgents`), Basisgeschwindigkeit (`agentBaseSpeed`) und Tragekapazität (`agentBaseCarryCapacity`) sind einstellbar.
*   Agenten starten mit `initialEnergy` (einstellbar).

### Energie

*   Energieverlust pro Schritt (`energyDepletionRate`) und Energiegewinn durch Ressourcen (`resourceRechargeAmount`, `plantRechargeMultiplier`) sind einstellbar.
*   Das Aufladen an der `CHARGING_STATION_POSITION` gibt `chargingStationRechargePerStep` Energie (einstellbar).

### Ressourcensammlung

Logik bleibt gleich, aber die Energiemengen sind dynamisch.

### Niedrigenergie-Logik (`chooseActionForAgent`)

Agenten versuchen bei niedrigem Energiestand (definiert durch `lowEnergyThreshold`, einstellbar) zur Ladestation zu gelangen.

### Bewegung und Kollision

Die Gittergröße (`gridRows`, `gridCols`) und Hindernisdichte (`obstacleDensity`) sind einstellbar und beeinflussen die Bewegungsmöglichkeiten.

## 6. Google Gemini API Integration

Die Integration der Gemini API zur Generierung narrativer Texte für SQK-Ereignisse bleibt unverändert. Der API-Schlüssel muss weiterhin als Umgebungsvariable `process.env.API_KEY` bereitgestellt werden.

## 7. Simulationsablauf

1.  Die Simulation wird mit den `DEFAULT_SIMULATION_SETTINGS` oder den zuletzt angewandten Einstellungen aus dem Einstellungspanel initialisiert.
2.  In jedem Simulationsschritt (`simulationTickMs`, einstellbar):
    *   Das SQS aktualisiert seine Wellenwerte.
    *   Wenn ein SQK-Ereignis detektiert wird, wird ein entsprechender Effekt aktiviert und eine narrative Beschreibung von Gemini angefordert.
    *   Aktive SQK-Effekte werden dekrementiert und ggf. beendet.
    *   Jeder aktive Agent wählt eine Aktion basierend auf seinem Zustand und der Umgebung (inkl. Niedrigenergie-Logik).
    *   Aktionen werden ausgeführt (Bewegung, Sammeln, Aufladen).
    *   Energie wird verbraucht/gewonnen.
    *   Ressourcen können nachwachsen (`resourceRespawnRate`, einstellbar).
    *   Der Zustand wird aktualisiert und im UI gerendert.
3.  Der Benutzer kann die Simulation pausieren, fortsetzen, zurücksetzen oder die Einstellungen über das Panel ändern (was zu einem Neustart mit den neuen Parametern führt).

## 8. Projektstruktur

Die Hauptkomponenten sind:

*   `index.html`: Einstiegspunkt.
*   `index.tsx`: Mountet die React-Anwendung.
*   `App.tsx`: Hauptkomponente, verwaltet den Simulationszustand, die Einstellungen und den Simulationsloop.
*   `types.ts`: Definiert TypeScript-Interfaces und Enums.
*   `constants.ts`: Enthält jetzt `DEFAULT_SIMULATION_SETTINGS`, `PRESETS` und einige statische Konstanten.
*   `services/simulationService.ts`: Kernlogik der Simulation, Agentenverhalten, SQS-Implementierung. Nimmt nun `SimulationSettings` entgegen.
*   `services/geminiService.ts`: Interaktion mit der Gemini API.
*   `components/`:
    *   `GridDisplay.tsx`: Rendert das Gitter und die Agenten.
    *   `ResourceCell.tsx`: Rendert eine einzelne Zelle.
    *   `AgentSprite.tsx`: Rendert einen Agenten.
    *   `InfoPanel.tsx`: Zeigt Simulationsdetails an.
    *   `SettingsPanel.tsx`: (Neu) UI zur dynamischen Anpassung von Simulationsparametern.
*   `README.md`: Diese Datei.

## 9. Setup und Start

Da die Anwendung auf `esm.sh` für das Laden von Modulen setzt, ist kein lokaler Build-Schritt oder `npm install` zwingend notwendig, um die Kernfunktionalität im Browser zu testen, solange eine Internetverbindung besteht.

1.  **API-Schlüssel (Optional, für Narrative):**
    *   Um die narrative Generierung durch die Gemini API zu nutzen, benötigen Sie einen API-Schlüssel von Google AI Studio.
    *   Dieser Schlüssel muss in Ihrer Umgebung als `process.env.API_KEY` verfügbar sein. Da dies eine reine Frontend-Anwendung ist, die direkt im Browser läuft, ist das Setzen von `process.env` nicht direkt wie in Node.js möglich. Für lokale Entwicklung oder einfache Tests könnte man den API-Schlüssel temporär direkt im Code (`geminiService.ts`) einsetzen (NICHT FÜR PRODUKTION EMPFOHLEN!) oder über einen lokalen Entwicklungsserver bereitstellen, der Umgebungsvariablen injizieren kann. **Achtung: API-Schlüssel niemals öffentlich in Client-seitigem Code exponieren!** Für dieses Projekt wird angenommen, dass `process.env.API_KEY` irgendwie im Ausführungskontext verfügbar gemacht wird (z.B. durch ein übergeordnetes Framework oder manuelle Einrichtung beim lokalen Testen).
2.  **Öffnen:**
    *   Laden Sie die Dateien herunter.
    *   Öffnen Sie die `index.html` Datei in einem modernen Webbrowser.
3.  **Interagieren:**
    *   Nutzen Sie die Steuerelemente, um die Simulation zu starten, pausieren oder zurückzusetzen.
    *   Öffnen Sie das Einstellungspanel, um Parameter anzupassen und Presets zu laden.
    *   Beobachten Sie das Verhalten der Agenten und die Auswirkungen der SQS-Ereignisse.

Die Anwendung ist darauf ausgelegt, die Komplexität und Unvorhersehbarkeit von Systemen zu demonstrieren, die von vielschichtigen, sich verändernden Bedingungen beeinflusst werden.
