import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Definieren eines Typs für die Fragen
type Question = {
  id: number;
  text: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswerId?: string;
  type: 'multiple-choice' | 'text';
  explanation?: string;
};

// Funktion, um Fragen basierend auf dem Kurs zu generieren
const generateQuestionsForCourse = (course: any): Question[] => {
  if (!course) return [];

  // Grundlagen der Aktien
  if (course.id === 1) {
    return [
      {
        id: 1,
        text: "Was ist eine Aktie?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine Schuldverschreibung eines Unternehmens" },
          { id: "b", text: "Ein Anteil am Eigenkapital eines Unternehmens" },
          { id: "c", text: "Ein Kredit an eine Bank" },
          { id: "d", text: "Eine Immobilieninvestition" }
        ],
        correctAnswerId: "b",
        explanation: "Eine Aktie ist ein Anteil am Eigenkapital eines Unternehmens und macht dich zum Miteigentümer der Firma."
      },
      {
        id: 2,
        text: "Wo werden Aktien gehandelt?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Nur in Banken" },
          { id: "b", text: "Auf Wochenmärkten" },
          { id: "c", text: "An Börsen" },
          { id: "d", text: "In Supermärkten" }
        ],
        correctAnswerId: "c",
        explanation: "Aktien werden an Börsen gehandelt, die als Marktplätze für den Handel mit Wertpapieren dienen."
      },
      {
        id: 3,
        text: "Was ist ein Aktienkurs?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Der Preis, zu dem eine Aktie aktuell gehandelt wird" },
          { id: "b", text: "Die Wegbeschreibung zur Börse" },
          { id: "c", text: "Ein Seminar über Aktien" },
          { id: "d", text: "Die Anzahl der verfügbaren Aktien" }
        ],
        correctAnswerId: "a",
        explanation: "Der Aktienkurs ist der aktuelle Marktpreis einer Aktie, der durch Angebot und Nachfrage bestimmt wird."
      },
      {
        id: 4,
        text: "Was bedeutet Dividende?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Steuer, die auf Aktiengewinne gezahlt werden muss" },
          { id: "b", text: "Der Gewinn, den man durch den Verkauf von Aktien erzielt" },
          { id: "c", text: "Ein Teil des Unternehmensgewinns, der an Aktionäre ausgezahlt wird" },
          { id: "d", text: "Eine Gebühr für den Aktienkauf" }
        ],
        correctAnswerId: "c",
        explanation: "Die Dividende ist der Teil des Unternehmensgewinns, den das Unternehmen an seine Aktionäre auszahlt."
      },
      {
        id: 5,
        text: "Was ist ein Wertpapierdepot?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein Lagerraum für physische Aktienzertifikate" },
          { id: "b", text: "Ein spezielles Konto zur Verwahrung von Wertpapieren" },
          { id: "c", text: "Eine App für Aktienkurse" },
          { id: "d", text: "Die Bilanz eines Unternehmens" }
        ],
        correctAnswerId: "b",
        explanation: "Ein Wertpapierdepot ist ein spezielles Konto, auf dem deine gekauften Wertpapiere verwahrt werden."
      },
      {
        id: 6,
        text: "Was ist ein Börsenindex?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Öffnungszeiten der Börse" },
          { id: "b", text: "Eine Kennzahl, die die Entwicklung einer Gruppe von Aktien widerspiegelt" },
          { id: "c", text: "Das Verzeichnis aller Börsen weltweit" },
          { id: "d", text: "Die Adresse der Börse" }
        ],
        correctAnswerId: "b",
        explanation: "Ein Börsenindex ist eine Kennzahl, die die Entwicklung einer bestimmten Gruppe von Aktien zusammenfasst (z.B. DAX für die 40 größten deutschen Unternehmen)."
      },
      {
        id: 7,
        text: "Was ist der Unterschied zwischen Stamm- und Vorzugsaktien?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Stammaktien sind älter als Vorzugsaktien" },
          { id: "b", text: "Vorzugsaktien sind teurer als Stammaktien" },
          { id: "c", text: "Stammaktien bieten Stimmrechte, Vorzugsaktien meist höhere Dividenden ohne Stimmrecht" },
          { id: "d", text: "Es gibt keinen Unterschied" }
        ],
        correctAnswerId: "c",
        explanation: "Stammaktien bieten Stimmrechte bei der Hauptversammlung, während Vorzugsaktien meist keine Stimmrechte, dafür aber eine höhere oder bevorzugte Dividendenzahlung bieten."
      },
      {
        id: 8,
        text: "Was bedeutet der Begriff 'Volatilität' bei Aktien?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Geschwindigkeit, mit der Aktien gekauft werden können" },
          { id: "b", text: "Das Schwankungsausmaß des Aktienkurses" },
          { id: "c", text: "Die maximale Höhe einer Aktie" },
          { id: "d", text: "Die Lebensdauer einer Aktie" }
        ],
        correctAnswerId: "b",
        explanation: "Volatilität bezeichnet das Ausmaß der Schwankungen eines Aktienkurses. Hohe Volatilität bedeutet starke Kursschwankungen und wird oft mit höherem Risiko verbunden."
      },
      {
        id: 9,
        text: "Was ist eine Marktkapitalisierung?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Der Gesamtwert aller ausstehenden Aktien eines Unternehmens" },
          { id: "b", text: "Die maximale Anzahl an Aktien, die ein Unternehmen ausgeben darf" },
          { id: "c", text: "Der Preis der teuersten Aktie eines Unternehmens" },
          { id: "d", text: "Das Startkapital eines Börsenhändlers" }
        ],
        correctAnswerId: "a",
        explanation: "Die Marktkapitalisierung ist der Gesamtwert aller ausstehenden Aktien eines Unternehmens, berechnet durch Multiplikation des aktuellen Aktienkurses mit der Anzahl der ausgegebenen Aktien."
      },
      {
        id: 10,
        text: "Was versteht man unter dem KGV (Kurs-Gewinn-Verhältnis)?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Das Verhältnis zwischen Käufern und Verkäufern einer Aktie" },
          { id: "b", text: "Das Verhältnis zwischen dem aktuellen Kurs einer Aktie und dem Gewinn pro Aktie" },
          { id: "c", text: "Die Beziehung zwischen Kurs und Gesamtvermögen" },
          { id: "d", text: "Das Verhältnis zwischen Kursen verschiedener Börsen" }
        ],
        correctAnswerId: "b",
        explanation: "Das KGV ist das Verhältnis zwischen dem aktuellen Kurs einer Aktie und dem Gewinn pro Aktie. Es gibt an, wie viel ein Investor für einen Euro Unternehmensgewinn zahlen muss und wird oft zur Bewertung von Aktien verwendet."
      }
    ];
  } 
  // ETFs und passive Investmentstrategien
  else if (course.id === 2) {
    return [
      {
        id: 1,
        text: "Was ist ein ETF?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein elektronisches Transferformular" },
          { id: "b", text: "Ein Exchange Traded Fund - ein börsengehandelter Indexfonds" },
          { id: "c", text: "Eine spezielle Aktie für Einsteiger" },
          { id: "d", text: "Eine Europäische Trading Firma" }
        ],
        correctAnswerId: "b",
        explanation: "Ein ETF (Exchange Traded Fund) ist ein börsengehandelter Indexfonds, der die Wertentwicklung eines zugrunde liegenden Index nachbildet."
      },
      {
        id: 2,
        text: "Was bedeutet passive Anlagestrategie?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Man muss nichts tun, das Geld vermehrt sich von selbst" },
          { id: "b", text: "Man investiert in Indizes statt einzelne Aktien auszuwählen" },
          { id: "c", text: "Man investiert nur in Unternehmen, die keine aktive Geschäftstätigkeit haben" },
          { id: "d", text: "Man handelt nur an bestimmten Wochentagen" }
        ],
        correctAnswerId: "b",
        explanation: "Bei einer passiven Anlagestrategie versucht man nicht, den Markt zu schlagen, sondern bildet ihn durch Indexfonds oder ETFs einfach nach."
      },
      {
        id: 3,
        text: "Wie unterscheidet sich ein ETF von einem klassischen Investmentfonds?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "ETFs werden an der Börse gehandelt, klassische Fonds nicht" },
          { id: "b", text: "ETFs gibt es nur für Aktien, klassische Fonds für alle Anlageklassen" },
          { id: "c", text: "ETFs sind immer riskanter als klassische Fonds" },
          { id: "d", text: "ETFs existieren erst seit 2020" }
        ],
        correctAnswerId: "a",
        explanation: "Der Hauptunterschied besteht darin, dass ETFs wie Aktien direkt an der Börse gehandelt werden können, während klassische Investmentfonds über die Fondsgesellschaft oder Banken ge- und verkauft werden."
      },
      {
        id: 4,
        text: "Was sind die typischen Vorteile von ETFs gegenüber aktiv gemanagten Fonds?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Garantierte höhere Renditen" },
          { id: "b", text: "Niedrigere Kosten und hohe Transparenz" },
          { id: "c", text: "Staatliche Absicherung gegen Verluste" },
          { id: "d", text: "Persönliche Beratung inklusive" }
        ],
        correctAnswerId: "b",
        explanation: "ETFs haben typischerweise niedrigere Verwaltungsgebühren als aktiv gemanagte Fonds und bieten eine hohe Transparenz, da sie bekannte Indizes nachbilden."
      },
      {
        id: 5,
        text: "Was ist ein Themen-ETF?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein ETF, der nur an bestimmten Feiertagen gehandelt wird" },
          { id: "b", text: "Ein ETF, der in Unternehmen aus einem bestimmten Sektor oder Thema investiert" },
          { id: "c", text: "Ein ETF, der nach einem Zeitplan automatisch verkauft wird" },
          { id: "d", text: "Ein ETF nur für professionelle Anleger" }
        ],
        correctAnswerId: "b",
        explanation: "Ein Themen-ETF investiert in Unternehmen, die einem bestimmten Thema oder Sektor zugeordnet werden können, wie z.B. erneuerbare Energien, Künstliche Intelligenz oder Gesundheitswesen."
      },
      {
        id: 6,
        text: "Was ist ein physisch replizierender ETF?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein ETF, der in physische Güter wie Gold investiert" },
          { id: "b", text: "Ein ETF, der die Wertpapiere des Index tatsächlich kauft" },
          { id: "c", text: "Ein ETF, der nur in der physischen Welt, nicht digital existiert" },
          { id: "d", text: "Ein ETF mit Papierkupons für die Dividende" }
        ],
        correctAnswerId: "b",
        explanation: "Ein physisch replizierender ETF bildet einen Index nach, indem er die im Index enthaltenen Wertpapiere tatsächlich kauft und hält."
      },
      {
        id: 7,
        text: "Was bedeutet TER bei ETFs?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Total Exchange Rate - der Wechselkurs für internationale ETFs" },
          { id: "b", text: "Total Expense Ratio - die Gesamtkostenquote des ETFs" },
          { id: "c", text: "Trading Efficiency Rating - die Handelseffizienz eines ETFs" },
          { id: "d", text: "Tax Exemption Ratio - der steuerfreie Anteil der Erträge" }
        ],
        correctAnswerId: "b",
        explanation: "TER steht für Total Expense Ratio und gibt die jährlichen Gesamtkosten eines ETFs an, ausgedrückt als Prozentsatz des verwalteten Vermögens."
      },
      {
        id: 8,
        text: "Was ist der Vorteil der Diversifikation bei ETFs?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Man kann sich die besten Aktien aussuchen" },
          { id: "b", text: "Es gibt höhere staatliche Förderungen" },
          { id: "c", text: "Das Risiko wird durch Investition in viele verschiedene Wertpapiere gestreut" },
          { id: "d", text: "Die Steuern sind niedriger" }
        ],
        correctAnswerId: "c",
        explanation: "Durch die breite Streuung des investierten Kapitals auf viele verschiedene Wertpapiere wird das Risiko reduziert, da nicht alle Wertpapiere gleichzeitig an Wert verlieren."
      },
      {
        id: 9,
        text: "Was ist der Dollar-Cost-Averaging-Effekt (Durchschnittskosteneffekt)?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Der Umrechnungskurs zwischen Euro und Dollar" },
          { id: "b", text: "Eine Strategie, bei der regelmäßig der gleiche Betrag investiert wird, unabhängig vom Kurs" },
          { id: "c", text: "Eine Gebühr für den Handel mit US-ETFs" },
          { id: "d", text: "Ein Rabatt beim Kauf großer ETF-Anteile" }
        ],
        correctAnswerId: "b",
        explanation: "Beim Dollar-Cost-Averaging investiert man regelmäßig den gleichen Betrag, wodurch man bei niedrigeren Kursen automatisch mehr Anteile kauft und bei höheren Kursen weniger, was den durchschnittlichen Einstiegspreis optimieren kann."
      },
      {
        id: 10,
        text: "Was ist ein ETF-Sparplan?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein Plan, um Geld beim ETF-Kauf zu sparen" },
          { id: "b", text: "Eine automatische, regelmäßige Investition in ETFs" },
          { id: "c", text: "Eine Versicherung für ETF-Verluste" },
          { id: "d", text: "Ein staatlich gefördertes ETF-Programm" }
        ],
        correctAnswerId: "b",
        explanation: "Ein ETF-Sparplan ermöglicht es, automatisch und regelmäßig (z.B. monatlich) einen festen Betrag in einen oder mehrere ETFs zu investieren, oft schon ab kleinen Beträgen."
      }
    ];
  } 
  // Anleihen und festverzinsliche Wertpapiere
  else if (course.id === 3) {
    return [
      {
        id: 1,
        text: "Was ist eine Anleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein Kredit, den man einem Unternehmen oder Staat gibt" },
          { id: "b", text: "Ein Anteil an einem Unternehmen" },
          { id: "c", text: "Eine Form der Versicherung" },
          { id: "d", text: "Ein Investment in Immobilien" }
        ],
        correctAnswerId: "a",
        explanation: "Eine Anleihe ist im Grunde ein Kredit, den der Anleger einem Unternehmen, Staat oder einer anderen Institution gibt. Der Emittent verspricht, den geliehenen Betrag zu einem festgelegten Zeitpunkt zurückzuzahlen und regelmäßige Zinszahlungen zu leisten."
      },
      {
        id: 2,
        text: "Was bedeutet der Begriff 'Kupon' bei Anleihen?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein Rabatt beim Kauf der Anleihe" },
          { id: "b", text: "Der Zinssatz, der auf die Anleihe gezahlt wird" },
          { id: "c", text: "Die Laufzeit der Anleihe" },
          { id: "d", text: "Die Mindeststückelung einer Anleihe" }
        ],
        correctAnswerId: "b",
        explanation: "Der Kupon ist der Zinssatz, den der Emittent der Anleihe dem Anleger jährlich zahlt. Er wird als Prozentsatz des Nennwerts angegeben, z.B. würde eine Anleihe mit 5% Kupon jährlich 50€ Zinsen auf einen Nennwert von 1.000€ zahlen."
      },
      {
        id: 3,
        text: "Was ist die Laufzeit einer Anleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Zeit, die es dauert, um die Anleihe zu verkaufen" },
          { id: "b", text: "Der Zeitraum, für den die Anleihe ausgegeben wird" },
          { id: "c", text: "Die Bearbeitungszeit der Bank" },
          { id: "d", text: "Die Zeit bis zur ersten Zinszahlung" }
        ],
        correctAnswerId: "b",
        explanation: "Die Laufzeit ist der Zeitraum von der Ausgabe der Anleihe bis zu ihrer Fälligkeit, wenn der Emittent den Nennwert an den Anleihegläubiger zurückzahlt."
      },
      {
        id: 4,
        text: "Wie verhält sich der Preis einer Anleihe, wenn die Marktzinsen steigen?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Der Preis steigt" },
          { id: "b", text: "Der Preis fällt" },
          { id: "c", text: "Der Preis bleibt unverändert" },
          { id: "d", text: "Es gibt keine Beziehung zwischen Anleihekursen und Marktzinsen" }
        ],
        correctAnswerId: "b",
        explanation: "Wenn die Marktzinsen steigen, sinkt der Preis bestehender Anleihen. Das liegt daran, dass neue Anleihen mit höheren Zinssätzen ausgegeben werden, wodurch ältere Anleihen mit niedrigeren Zinssätzen weniger attraktiv werden."
      },
      {
        id: 5,
        text: "Was ist der Unterschied zwischen einer Staats- und einer Unternehmensanleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Unternehmensanleihen haben immer höhere Zinsen" },
          { id: "b", text: "Staatsanleihen haben immer niedrigere Zinsen" },
          { id: "c", text: "Staatsanleihen werden von Regierungen ausgegeben, Unternehmensanleihen von Unternehmen" },
          { id: "d", text: "Staatsanleihen können nur von Banken gekauft werden" }
        ],
        correctAnswerId: "c",
        explanation: "Der Hauptunterschied liegt im Emittenten: Staatsanleihen werden von staatlichen Stellen ausgegeben, während Unternehmensanleihen von Unternehmen emittiert werden. Typischerweise gelten Staatsanleihen (besonders von stabilen Industrieländern) als risikoärmer und bieten daher oft niedrigere Zinsen als Unternehmensanleihen."
      },
      {
        id: 6,
        text: "Was ist eine Junk Bond (Hochzinsanleihe)?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine wertlose Anleihe eines bankrotten Unternehmens" },
          { id: "b", text: "Eine Anleihe mit sehr hohen Zinsen und höherem Ausfallrisiko" },
          { id: "c", text: "Eine Anleihe mit sehr kurzer Laufzeit" },
          { id: "d", text: "Eine Anleihe, die nur an bestimmten Börsen gehandelt werden kann" }
        ],
        correctAnswerId: "b",
        explanation: "Junk Bonds oder Hochzinsanleihen sind Anleihen mit einem niedrigeren Rating (unter Investment Grade), die ein höheres Ausfallrisiko haben. Als Ausgleich für dieses Risiko bieten sie in der Regel höhere Zinsen als sichere Anleihen."
      },
      {
        id: 7,
        text: "Was versteht man unter dem 'Nennwert' einer Anleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Der Preis, zu dem die Anleihe aktuell gehandelt wird" },
          { id: "b", text: "Der Betrag, den der Emittent bei Fälligkeit zurückzahlt" },
          { id: "c", text: "Der Name des Emittenten der Anleihe" },
          { id: "d", text: "Der tägliche Wertzuwachs der Anleihe" }
        ],
        correctAnswerId: "b",
        explanation: "Der Nennwert oder Nominalwert ist der auf der Anleihe aufgedruckte Betrag, den der Emittent dem Anleihegläubiger bei Fälligkeit zurückzahlt. Er dient auch als Grundlage für die Berechnung der Zinszahlungen."
      },
      {
        id: 8,
        text: "Was ist der Unterschied zwischen Anleihen mit festem und variablem Zinssatz?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Bei festem Zinssatz bleibt der Kupon während der gesamten Laufzeit unverändert" },
          { id: "b", text: "Anleihen mit variablem Zinssatz existieren nicht" },
          { id: "c", text: "Festverzinsliche Anleihen können nur von Privatpersonen gekauft werden" },
          { id: "d", text: "Anleihen mit variablem Zinssatz haben immer eine längere Laufzeit" }
        ],
        correctAnswerId: "a",
        explanation: "Bei einer Anleihe mit festem Zinssatz bleibt der Kupon während der gesamten Laufzeit gleich. Bei einer Anleihe mit variablem Zinssatz (Floating Rate Note) wird der Zinssatz in regelmäßigen Abständen an einen Referenzzinssatz angepasst."
      },
      {
        id: 9,
        text: "Was ist das Rating einer Anleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Bewertung der Anleihe auf einer Skala von 1 bis 10 durch Anleger" },
          { id: "b", text: "Die Laufzeit der Anleihe in Jahren" },
          { id: "c", text: "Die Bewertung der Kreditwürdigkeit des Emittenten durch Ratingagenturen" },
          { id: "d", text: "Die Höhe der jährlichen Zinszahlung" }
        ],
        correctAnswerId: "c",
        explanation: "Das Rating ist eine Bewertung der Kreditwürdigkeit des Emittenten durch spezialisierte Ratingagenturen wie Standard & Poor's, Moody's oder Fitch. Es gibt Anlegern eine Einschätzung des Risikos, dass der Emittent seinen Zahlungsverpflichtungen nicht nachkommen kann."
      },
      {
        id: 10,
        text: "Was ist eine Nullkuponanleihe?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine Anleihe ohne Zinszahlungen, die mit einem Abschlag zum Nennwert verkauft wird" },
          { id: "b", text: "Eine Anleihe, die keine Rendite bietet" },
          { id: "c", text: "Eine kostenlose Anleihe für Neukunden" },
          { id: "d", text: "Eine Anleihe, bei der der Emittent den Nennwert nicht zurückzahlen muss" }
        ],
        correctAnswerId: "a",
        explanation: "Eine Nullkuponanleihe zahlt keine regelmäßigen Zinsen (Kupons). Stattdessen wird sie mit einem Abschlag zum Nennwert (Diskont) verkauft, und der Anleger erhält bei Fälligkeit den vollen Nennwert zurück. Die Rendite ergibt sich aus der Differenz zwischen Kaufpreis und Nennwert."
      }
    ];
  }
  // Finanzplanung & Budgetierung
  else if (course.id === 4) {
    return [
      {
        id: 1,
        text: "Was ist ein persönliches Budget?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Ein Kredit von der Bank" },
          { id: "b", text: "Ein Plan, der Einnahmen und Ausgaben für einen bestimmten Zeitraum auflistet" },
          { id: "c", text: "Das gesamte Vermögen einer Person" },
          { id: "d", text: "Eine App zur Finanzverwaltung" }
        ],
        correctAnswerId: "b",
        explanation: "Ein persönliches Budget ist ein Finanzplan, der deine Einnahmen und Ausgaben für einen bestimmten Zeitraum (meist monatlich) auflistet und dir hilft, deine Finanzen zu planen und zu kontrollieren."
      },
      {
        id: 2,
        text: "Was ist die 50-30-20-Regel bei der Budgetierung?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "50% Bargeld, 30% Kreditkarte, 20% Online-Zahlungen" },
          { id: "b", text: "50% für Bedürfnisse, 30% für Wünsche, 20% für Sparen und Schuldenabbau" },
          { id: "c", text: "50% für Miete, 30% für Lebensmittel, 20% für Transport" },
          { id: "d", text: "50% für Aktien, 30% für Anleihen, 20% für Bargeld" }
        ],
        correctAnswerId: "b",
        explanation: "Die 50-30-20-Regel ist eine einfache Budgetierungsmethode, bei der du 50% deines Einkommens für Notwendigkeiten (Miete, Lebensmittel, Transport), 30% für Wünsche (Unterhaltung, Hobbys) und 20% für Sparen und Schuldenabbau verwendest."
      },
      {
        id: 3,
        text: "Was ist der Unterschied zwischen fixen und variablen Ausgaben?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Fixe Ausgaben sind einmalig, variable Ausgaben wiederholen sich" },
          { id: "b", text: "Fixe Ausgaben sind für Luxus, variable für Notwendigkeiten" },
          { id: "c", text: "Fixe Ausgaben sind gleich, variable Ausgaben schwanken monatlich" },
          { id: "d", text: "Es gibt keinen Unterschied" }
        ],
        correctAnswerId: "c",
        explanation: "Fixe Ausgaben fallen regelmäßig in gleicher Höhe an (z.B. Miete, Versicherungen), während variable Ausgaben schwanken können und oft beeinflussbarer sind (z.B. Lebensmittel, Kleidung, Unterhaltung)."
      },
      {
        id: 4,
        text: "Was ist ein Notfallfonds?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine staatliche Unterstützung bei Arbeitslosigkeit" },
          { id: "b", text: "Ein Fonds für außergewöhnliche Einkäufe" },
          { id: "c", text: "Eine Geldreserve für unerwartete Ausgaben oder finanzielle Engpässe" },
          { id: "d", text: "Eine Krankenversicherung" }
        ],
        correctAnswerId: "c",
        explanation: "Ein Notfallfonds ist eine Geldreserve, die du für unerwartete Ausgaben oder finanzielle Notfälle (z.B. Jobverlust, Autoreparatur, medizinische Notfälle) zurücklegst. Finanzexperten empfehlen oft, 3-6 Monatsausgaben als Reserve zu haben."
      },
      {
        id: 5,
        text: "Was bedeutet der Begriff 'Liquidität'?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Fähigkeit, Verbindlichkeiten pünktlich zu bezahlen" },
          { id: "b", text: "Das Gesamtvermögen einer Person" },
          { id: "c", text: "Die monatlichen Ausgaben" },
          { id: "d", text: "Die Höhe des Einkommens" }
        ],
        correctAnswerId: "a",
        explanation: "Liquidität bezieht sich auf die Fähigkeit, finanzielle Verpflichtungen termingerecht zu erfüllen, also ausreichend verfügbares Geld zu haben. Liquide Mittel sind Bargeld oder Vermögenswerte, die schnell in Bargeld umgewandelt werden können."
      },
      {
        id: 6,
        text: "Was ist eine Bedarfsanalyse in der Finanzplanung?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine Übersicht aller Einkäufe des letzten Monats" },
          { id: "b", text: "Eine Analyse der aktuellen und zukünftigen finanziellen Bedürfnisse" },
          { id: "c", text: "Eine Liste der monatlichen Abonnements" },
          { id: "d", text: "Ein Test zur Bestimmung des Kreditrahmens" }
        ],
        correctAnswerId: "b",
        explanation: "Eine Bedarfsanalyse ist ein wichtiger Schritt in der Finanzplanung, bei dem du deine aktuellen und zukünftigen finanziellen Bedürfnisse ermittelst, um darauf basierend einen passenden Finanzplan zu erstellen."
      },
      {
        id: 7,
        text: "Was versteht man unter dem Begriff 'Cashflow'?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Bargeldmenge, die man immer dabei haben sollte" },
          { id: "b", text: "Der Saldo auf dem Girokonto" },
          { id: "c", text: "Der Geldfluss – die Bewegung von Geld ein und aus deinem Budget" },
          { id: "d", text: "Eine spezielle Art von Kreditkarte" }
        ],
        correctAnswerId: "c",
        explanation: "Der Cashflow beschreibt den Geldfluss – also die Bewegung von Geld in dein Budget hinein (Einnahmen) und aus deinem Budget heraus (Ausgaben) über einen bestimmten Zeitraum. Ein positiver Cashflow bedeutet, dass mehr Geld eingeht als ausgegeben wird."
      },
      {
        id: 8,
        text: "Was ist der Vorteil einer langfristigen Finanzplanung?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Man kann mehr Geld ausgeben" },
          { id: "b", text: "Man spart Steuern" },
          { id: "c", text: "Sie hilft, langfristige Ziele zu erreichen und finanzielle Sicherheit aufzubauen" },
          { id: "d", text: "Man benötigt keine Versicherungen mehr" }
        ],
        correctAnswerId: "c",
        explanation: "Eine langfristige Finanzplanung hilft dir, größere Ziele zu erreichen (z.B. Hauskauf, Ruhestand), Risiken zu minimieren, fundierte Entscheidungen zu treffen und finanzielle Stabilität und Sicherheit aufzubauen."
      },
      {
        id: 9,
        text: "Was ist das Ziel eines Haushaltsbuches?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Seine Schulden zu verstecken" },
          { id: "b", text: "Den Überblick über Einnahmen und Ausgaben zu behalten" },
          { id: "c", text: "Seine Einkäufe zu planen" },
          { id: "d", text: "Einen Kredit zu bekommen" }
        ],
        correctAnswerId: "b",
        explanation: "Ein Haushaltsbuch hilft dir, alle Einnahmen und Ausgaben zu erfassen und zu kategorisieren. Es gibt dir einen genauen Überblick über deine Finanzen, hilft Sparpotenziale zu identifizieren und unterstützt dich bei der Erreichung deiner finanziellen Ziele."
      },
      {
        id: 10,
        text: "Was ist der Unterschied zwischen Sparen und Investieren?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Sparen ist für Reiche, Investieren für alle anderen" },
          { id: "b", text: "Beim Sparen wird Geld sicher aufbewahrt, beim Investieren wird es für potenzielle Rendite eingesetzt" },
          { id: "c", text: "Sparen ist kurzfristig, Investieren nur langfristig" },
          { id: "d", text: "Es gibt keinen Unterschied, beide Begriffe bedeuten dasselbe" }
        ],
        correctAnswerId: "b",
        explanation: "Beim Sparen legst du Geld sicher beiseite, oft mit geringer oder keiner Rendite, aber mit hoher Sicherheit und Liquidität. Beim Investieren setzt du Geld ein, um potenzielle Renditen zu erzielen, wobei ein gewisses Risiko besteht, dass du nicht den gesamten investierten Betrag zurückerhältst."
      }
    ];
  } 
  // Fallback für andere Kurse
  else {
    return [
      {
        id: 1,
        text: "Welche grundlegende Finanzregel ist wichtig für langfristigen finanziellen Erfolg?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Immer alle verfügbaren Kredite nutzen" },
          { id: "b", text: "Weniger ausgeben als man einnimmt" },
          { id: "c", text: "Nur in Bitcoin investieren" },
          { id: "d", text: "Nie Geld sparen, immer alles ausgeben" }
        ],
        correctAnswerId: "b",
        explanation: "Eine der wichtigsten Finanzregeln ist, weniger auszugeben als man einnimmt. Dies ermöglicht Sparen und Investieren, was langfristig zu finanzieller Stabilität und Vermögensaufbau führt."
      },
      {
        id: 2,
        text: "Was ist ein ETF?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine europäische Finanzbehörde" },
          { id: "b", text: "Ein börsengehandelter Indexfonds" },
          { id: "c", text: "Eine spezielle Kreditkarte" },
          { id: "d", text: "Eine Steuerart" }
        ],
        correctAnswerId: "b",
        explanation: "ETF steht für Exchange Traded Fund (börsengehandelter Fonds). Es handelt sich um einen Investmentfonds, der an der Börse gehandelt wird und meist einen Index nachbildet."
      },
      {
        id: 3,
        text: "Was ist der Zinseszinseffekt?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine Steuerersparnis" },
          { id: "b", text: "Die Verzinsung von bereits verdienten Zinsen" },
          { id: "c", text: "Ein spezieller Kredit" },
          { id: "d", text: "Eine Bankenregulierung" }
        ],
        correctAnswerId: "b",
        explanation: "Der Zinseszinseffekt beschreibt das Phänomen, dass nicht nur das ursprüngliche Kapital, sondern auch die bereits verdienten Zinsen verzinst werden, was langfristig zu einem exponentiellen Wachstum führt."
      },
      {
        id: 4,
        text: "Was ist eine Diversifikation?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine spezielle Anlagestrategie, bei der man alles auf eine Aktie setzt" },
          { id: "b", text: "Die Streuung des investierten Vermögens auf verschiedene Anlageklassen" },
          { id: "c", text: "Eine Art Steueroptimierung" },
          { id: "d", text: "Ein spezielles Bankkonto" }
        ],
        correctAnswerId: "b",
        explanation: "Diversifikation bezeichnet die Streuung des investierten Vermögens auf verschiedene Anlageklassen (z.B. Aktien, Anleihen, Immobilien) und innerhalb dieser Klassen, um das Risiko zu reduzieren."
      },
      {
        id: 5,
        text: "Was ist der Unterschied zwischen brutto und netto beim Gehalt?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Brutto ist das Gehalt mit Bonus, Netto ohne Bonus" },
          { id: "b", text: "Brutto ist das Gehalt vor Abzügen, Netto nach Abzügen wie Steuern und Sozialabgaben" },
          { id: "c", text: "Brutto ist das monatliche Gehalt, Netto das jährliche Gehalt" },
          { id: "d", text: "Es gibt keinen Unterschied" }
        ],
        correctAnswerId: "b",
        explanation: "Das Bruttogehalt ist der vereinbarte Lohn vor jeglichen Abzügen. Das Nettogehalt ist der Betrag, der nach Abzug von Steuern, Sozialversicherungsbeiträgen und anderen Pflichtabgaben tatsächlich ausgezahlt wird."
      },
      {
        id: 6,
        text: "Was ist ein P/E-Ratio (KGV) bei Aktien?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Anzahl der Mitarbeiter geteilt durch den Aktienkurs" },
          { id: "b", text: "Der Preis einer Aktie geteilt durch den Gewinn pro Aktie" },
          { id: "c", text: "Die prozentuale Steigerung einer Aktie im letzten Jahr" },
          { id: "d", text: "Die Auszahlungsquote der Dividende" }
        ],
        correctAnswerId: "b",
        explanation: "Das Price-to-Earnings-Ratio (P/E-Ratio) oder Kurs-Gewinn-Verhältnis (KGV) ist eine wichtige Kennzahl zur Bewertung von Aktien. Es berechnet sich als Verhältnis zwischen dem aktuellen Aktienkurs und dem Gewinn pro Aktie und gibt an, wie viel ein Investor für einen Euro Unternehmensgewinn zahlen muss."
      },
      {
        id: 7,
        text: "Was versteht man unter einer Asset Allocation?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Die Aufteilung des Vermögens auf verschiedene Anlageklassen" },
          { id: "b", text: "Die Anzahl der Aktien im Depot" },
          { id: "c", text: "Ein spezielles Finanzprodukt" },
          { id: "d", text: "Die Höhe der Steuerrückerstattung" }
        ],
        correctAnswerId: "a",
        explanation: "Die Asset Allocation beschreibt die strategische Aufteilung des Vermögens auf verschiedene Anlageklassen wie Aktien, Anleihen, Immobilien und Bargeld, basierend auf den individuellen Zielen, der Risikotoleranz und dem Anlagehorizont des Investors."
      },
      {
        id: 8,
        text: "Was ist ein Notgroschen und wie hoch sollte er sein?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine Münze für Notfälle, ca. 2 Euro" },
          { id: "b", text: "Ein finanzielles Polster für Notfälle, 3-6 Monatsausgaben" },
          { id: "c", text: "Eine spezielle Kreditlinie, mindestens 10.000 Euro" },
          { id: "d", text: "Erspartes für den Urlaub, 1 Monatsgehalt" }
        ],
        correctAnswerId: "b",
        explanation: "Ein Notgroschen ist ein finanzielles Polster für unvorhergesehene Ausgaben oder Notfälle. Finanzexperten empfehlen, 3-6 Monatsausgaben als Notgroschen auf einem leicht zugänglichen Konto zu haben."
      },
      {
        id: 9,
        text: "Was ist eine Inflation?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Eine gestiegene Nachfrage nach Konsumgütern" },
          { id: "b", text: "Ein allgemeiner Anstieg des Preisniveaus und damit Wertverlust des Geldes" },
          { id: "c", text: "Eine Form der Geldanlage" },
          { id: "d", text: "Die Erhöhung des Leitzinses" }
        ],
        correctAnswerId: "b",
        explanation: "Inflation bezeichnet einen allgemeinen und anhaltenden Anstieg des Preisniveaus von Gütern und Dienstleistungen, was gleichzeitig einen Wertverlust des Geldes bedeutet. Bei einer Inflationsrate von 2% verliert Geld in einem Jahr etwa 2% seiner Kaufkraft."
      },
      {
        id: 10,
        text: "Was ist ein wichtiger Vorteil des langfristigen Investierens?",
        type: "multiple-choice",
        options: [
          { id: "a", text: "Es garantiert sichere Renditen" },
          { id: "b", text: "Man muss die Märkte nicht timen und profitiert vom Zinseszinseffekt" },
          { id: "c", text: "Man kann kurzfristige Gewinne maximieren" },
          { id: "d", text: "Es erfordert kein Wissen über Finanzmärkte" }
        ],
        correctAnswerId: "b",
        explanation: "Langfristiges Investieren hat mehrere Vorteile: Man muss nicht versuchen, den perfekten Ein- und Ausstiegszeitpunkt zu finden (Market Timing), was nachweislich sehr schwierig ist. Zudem profitiert man vom Zinseszinseffekt, der über lange Zeiträume zu einem exponentiellen Wachstum führen kann. Historisch gesehen haben langfristige Investitionen in breit diversifizierte Portfolios auch Marktkrisen überstanden und positive Renditen erzielt."
      }
    ];
  }
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState<number>(0);
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: userCourses, isLoading: isLoadingUserCourses } = useQuery({
    queryKey: ["/api/user/courses"],
    enabled: !!user,
  });

  const startCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/start`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/courses"] });
      toast({
        title: "Kurs gestartet",
        description: "Du hast erfolgreich einen neuen Kurs begonnen.",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ courseId, lessonsCompleted }: { courseId: number, lessonsCompleted: number }) => {
      const res = await apiRequest("PUT", `/api/courses/${courseId}/progress`, { lessonsCompleted });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/level-details"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/activities"] });
      
      setSelectedCourse(null);
      toast({
        title: "Fortschritt aktualisiert",
        description: "Dein Kursfortschritt wurde erfolgreich aktualisiert.",
      });
    },
  });

  // Get user course for a course id
  const getUserCourse = (courseId: number) => {
    return userCourses?.find(uc => uc.courseId === courseId);
  };

  // Start course handler
  const handleStartCourse = (course: any) => {
    startCourseMutation.mutate(course.id);
  };

  // useEffect to load course questions and simulate loading
  useEffect(() => {
    if (selectedCourse) {
      if (lessonProgress < 100) {
        setIsLoadingLesson(true);
        
        // Generate questions for the course
        const generatedQuestions = generateQuestionsForCourse(selectedCourse);
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        
        // Simulate the lesson loading
        const timer = setInterval(() => {
          setLessonProgress(prev => {
            const newProgress = prev + 20;
            if (newProgress >= 100) {
              clearInterval(timer);
              setIsLoadingLesson(false);
            }
            return Math.min(newProgress, 100);
          });
        }, 800); // Update every 800ms
        
        return () => clearInterval(timer);
      }
    } else {
      // Reset states when course is closed
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
    }
  }, [selectedCourse, lessonProgress]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Complete lesson handler in dialog
  const handleCompleteLesson = () => {
    if (!selectedCourse) return;
    
    const userCourse = getUserCourse(selectedCourse.id);
    if (!userCourse) return;
    
    const newProgress = userCourse.lessonsCompleted + 1;
    updateProgressMutation.mutate({ 
      courseId: selectedCourse.id, 
      lessonsCompleted: newProgress
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow grid main-grid">
        <Sidebar />

        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-100 overflow-y-auto pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
              <h1 className="text-2xl font-bold text-neutral-800 mb-4">Finanzkurse</h1>
              <p className="text-neutral-600 mb-6">
                Erweitere dein Finanzwissen mit unseren interaktiven Kursen. Jeder abgeschlossene Kurs bringt dich näher zu deinem Ziel, finanziell gebildet zu sein.
              </p>

              {isLoadingCourses || isLoadingUserCourses ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {courses?.map(course => {
                    const userCourse = getUserCourse(course.id);
                    const isStarted = !!userCourse;
                    const isCompleted = userCourse && userCourse.lessonsCompleted >= course.totalLessons;
                    const progress = isStarted ? Math.floor((userCourse.lessonsCompleted / course.totalLessons) * 100) : 0;

                    return (
                      <Card key={course.id} className="overflow-hidden">
                        <CardHeader className="bg-primary bg-opacity-10 pb-2">
                          <CardTitle className="flex items-start">
                            <span className="material-icons text-primary mr-2">school</span>
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <p className="text-neutral-600 text-sm mb-4">
                            {course.description}
                          </p>
                          <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
                            <span>{course.totalLessons} Lektionen</span>
                            {isStarted && (
                              <span>{userCourse.lessonsCompleted}/{course.totalLessons} abgeschlossen</span>
                            )}
                          </div>
                          {isStarted && (
                            <Progress value={progress} className="h-2" />
                          )}
                        </CardContent>
                        <CardFooter>
                          {!isStarted ? (
                            <Button 
                              className="w-full"
                              onClick={() => handleStartCourse(course)}
                              disabled={startCourseMutation.isPending}
                            >
                              {startCourseMutation.isPending ? (
                                <span className="material-icons animate-spin mr-2">refresh</span>
                              ) : null}
                              Kurs starten
                            </Button>
                          ) : isCompleted ? (
                            <Button variant="outline" className="w-full" disabled>
                              <span className="material-icons text-success mr-2">check_circle</span>
                              Abgeschlossen
                            </Button>
                          ) : (
                            <Button 
                              className="w-full"
                              onClick={() => {
                                setSelectedCourse(course);
                                setLessonProgress(0);
                                setIsLoadingLesson(false);
                              }}
                            >
                              Fortsetzen
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className={lessonProgress >= 100 && questions.length > 0 ? "sm:max-w-2xl max-h-[80vh] overflow-y-auto" : "sm:max-w-md"}>
          <DialogHeader>
            <DialogTitle>{lessonProgress >= 100 && questions.length > 0 ? "Lektion: " : ""}
              {selectedCourse?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse && (
                <>
                  {lessonProgress < 100 ? (
                    <div className="space-y-2 mt-2">
                      <div className="text-sm">Lektion wird geladen...</div>
                      <Progress 
                        value={lessonProgress} 
                        className="h-2"
                      />
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-sm text-success flex items-center mt-2">
                      <span className="material-icons mr-1">check_circle</span>
                      Lektion erfolgreich abgeschlossen!
                    </div>
                  ) : (
                    <div className="lesson-content mt-4">
                      {/* Fortschrittsanzeige für Fragen */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Frage {currentQuestionIndex + 1} von {questions.length}</span>
                        <span>{Math.round((Object.keys(selectedAnswers).length / questions.length) * 100)}% beantwortet</span>
                      </div>
                      <Progress
                        value={(currentQuestionIndex / questions.length) * 100}
                        className="h-1 mb-4"
                      />

                      {/* Aktuelle Frage anzeigen */}
                      {questions[currentQuestionIndex] && (
                        <div className="question-container">
                          <h3 className="text-lg font-semibold mb-3">
                            {questions[currentQuestionIndex].text}
                          </h3>
                          
                          {questions[currentQuestionIndex].type === 'multiple-choice' && (
                            <RadioGroup
                              value={selectedAnswers[questions[currentQuestionIndex].id] || ''}
                              onValueChange={(value) => handleAnswerSelect(questions[currentQuestionIndex].id, value)}
                              className="space-y-2 mb-4"
                            >
                              {questions[currentQuestionIndex].options?.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50">
                                  <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                  <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                                    {option.text}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}

                          {/* Erklärung nach Auswahl zeigen */}
                          {selectedAnswers[questions[currentQuestionIndex].id] && questions[currentQuestionIndex].explanation && (
                            <div className={`explanation-box p-3 rounded-lg mt-3 ${
                              selectedAnswers[questions[currentQuestionIndex].id] === 
                              questions[currentQuestionIndex].correctAnswerId 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-amber-50 border border-amber-200'
                            }`}>
                              <div className="flex items-start">
                                <span className={`material-icons mr-2 ${
                                  selectedAnswers[questions[currentQuestionIndex].id] === 
                                  questions[currentQuestionIndex].correctAnswerId 
                                    ? 'text-green-600' 
                                    : 'text-amber-600'
                                }`}>
                                  {selectedAnswers[questions[currentQuestionIndex].id] === 
                                   questions[currentQuestionIndex].correctAnswerId 
                                    ? 'check_circle' 
                                    : 'info'}
                                </span>
                                <div>
                                  <p className={`font-medium ${
                                    selectedAnswers[questions[currentQuestionIndex].id] === 
                                    questions[currentQuestionIndex].correctAnswerId 
                                      ? 'text-green-700' 
                                      : 'text-amber-700'
                                  }`}>
                                    {selectedAnswers[questions[currentQuestionIndex].id] === 
                                     questions[currentQuestionIndex].correctAnswerId 
                                      ? 'Richtig!' 
                                      : 'Guter Versuch!'}
                                  </p>
                                  <p className="text-sm mt-1">
                                    {questions[currentQuestionIndex].explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Navigation zwischen Fragen */}
                          <div className="flex justify-between mt-6">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handlePrevQuestion}
                              disabled={currentQuestionIndex === 0}
                            >
                              <span className="material-icons mr-1">arrow_back</span>
                              Zurück
                            </Button>
                            <Button
                              type="button"
                              onClick={handleNextQuestion}
                              disabled={currentQuestionIndex === questions.length - 1}
                            >
                              Weiter
                              <span className="material-icons ml-1">arrow_forward</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setSelectedCourse(null)}
            >
              Schließen
            </Button>
            {lessonProgress >= 100 && (
              <Button 
                type="button"
                disabled={updateProgressMutation.isPending}
                onClick={handleCompleteLesson}
              >
                {updateProgressMutation.isPending ? (
                  <span className="material-icons animate-spin mr-2">refresh</span>
                ) : null}
                Als abgeschlossen markieren
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MobileNavigation />
    </div>
  );
}
