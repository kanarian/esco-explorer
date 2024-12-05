"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { OCCUPATIONS } from "~/app/data/occ";
import { ISCO } from "~/app/data/isco";

import { ChevronUp, ChevronDown, Info, X } from "lucide-react";
import { occToSkills } from "~/app/data/occToSkills";

import dynamic from "next/dynamic";
import { Badge } from "~/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
const DynamicReactSelect = dynamic(
  () => import("~/components/ui/react-select"),
  { ssr: false },
);
const getNodeType = (nodeId: string) => {
  if (nodeId.startsWith("http://data.europa.eu/esco/occupation/")) {
    return "occupation";
  }
  return "iscoGroup";
};

const getNodeInformationOccupation = (nodeId: string) => {
  return OCCUPATIONS.find((el) => el.conceptUri === nodeId);
};

const getNodeInformationIscoGroup = (nodeId: string) => {
  return ISCO.find((el) => el.conceptUri === nodeId);
};

const InformationCardIscoGroup = ({ nodeId }: { nodeId: string }) => {
  if (!nodeId) return null;
  const nodeInformation = getNodeInformationIscoGroup(nodeId);
  if (!nodeInformation) return null;

  return (
    <>
      <CardHeader>
        <CardTitle>{nodeInformation.preferredLabel}</CardTitle>
        <CardDescription>ISCO Groep</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>ISCO Code:</strong> {nodeInformation.code}
          </p>
        </div>
      </CardContent>
    </>
  );
};

const CollapsibleSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{title}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
};

const InformationCardOccupation = ({ nodeId }: { nodeId: string }) => {
  if (!nodeId) return null;
  const nodeInformation = getNodeInformationOccupation(nodeId);
  if (!nodeInformation) return null;
  function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }
  return (
    <>
      <CardHeader>
        <CardTitle>
          {capitalizeFirstLetter(nodeInformation.preferredLabel)}
        </CardTitle>
        <CardDescription>ESCO-Beroep</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 space-y-2 overflow-y-scroll">
          <p>
            <strong>ESCO Code:</strong> {nodeInformation.code}
          </p>
          {nodeInformation.altLabels && (
            <p>
              <strong>Ook bekend als:</strong>{" "}
              {nodeInformation.altLabels.split("\n").slice(0, 3).join(", ")}
            </p>
          )}
          <p>
            <strong>Beschrijving:</strong> {nodeInformation.description}
          </p>
          {[
            {
              title: "Nodige vaardigheden",
              key: "essential_skills",
              variant: "default",
            },
            {
              title: "Optionele vaardigheden",
              key: "optional_skills",
              variant: "secondary",
            },
            {
              title: "Nodige kennis",
              key: "essential_knowledge",
              variant: "destructive",
            },
            {
              title: "Optionele kennis",
              key: "optional_knowledge",
              variant: "outline",
            },
          ].map(({ title, key, variant }) => (
            <div key={key} className="space-y-2">
              <CollapsibleSection title={title}>
                <div className="flex flex-wrap gap-2">
                  {occToSkills[nodeId as keyof typeof occToSkills]?.[
                    key as keyof (typeof occToSkills)[keyof typeof occToSkills]
                  ]?.map((item, index) => <Badge key={index}>{item}</Badge>)}
                </div>
              </CollapsibleSection>
            </div>
          ))}
        </div>
      </CardContent>
    </>
  );
};

const EscoOccupationGraphDynamic = dynamic(
  () => import("./EscoOccupationGraph"),
  {
    ssr: false,
  },
);

export default function ClientSideOccupationGraphPage() {
  const [currentSelectedNode, setCurrentSelectedNode] = useState<string | null>(
    null,
  );
  const [isInfoOpen, setIsInfoOpen] = useState(true);

  const handleNodeSelect = (nodeId: string) => {
    setCurrentSelectedNode(nodeId);
  };

  const handleResetGraph = () => {
    setCurrentSelectedNode(null);
  };
  const occupationOptions = OCCUPATIONS.map((el) => {
    return {
      label: el.preferredLabel + " - " + el.code,
      value: el.conceptUri,
    };
  });
  const iscoOptions = ISCO.map((el) => {
    return {
      label: el.preferredLabel + " - " + el.code,
      value: el.conceptUri,
    };
  });
  const allNodeOptions = [...occupationOptions, ...iscoOptions].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-0">
        <EscoOccupationGraphDynamic
          currentSelectedNode={currentSelectedNode}
          setCurrentSelectedNode={setCurrentSelectedNode}
        />
      </div>

      <div className="absolute left-4 top-4 z-10 flex items-center space-x-2">
        <Button variant="outline" onClick={handleResetGraph}>
          Grafiek Resetten
        </Button>
        <DynamicReactSelect
          placeholder="Selecteer een beroep of beroepsgroep"
          className="w-[320px] rounded-md bg-white"
          options={allNodeOptions}
          value={
            allNodeOptions.find((el) => el.value === currentSelectedNode) ??
            null
          }
          onChange={(e) => {
            const selectedOption = Array.isArray(e) ? e[0] : e;
            if (selectedOption?.value) {
              setCurrentSelectedNode(selectedOption.value);
            }
          }}
        />
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-4 z-10"
        onClick={() => setIsInfoOpen(!isInfoOpen)}
      >
        <Info className="h-4 w-4" />
      </Button>

      {isInfoOpen && (
        <Card className="absolute right-4 top-16 z-20 w-96 bg-white/70 text-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Hoe gebruik je deze tool</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsInfoOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                Deze grafiek visualiseert de hiërarchische relaties tussen ESCO
                beroepen en ISCO beroepsgroepen.
              </p>

              <div>
                <h3 className="mb-2 font-semibold">Bolletjes:</h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>Lichtblauwe bolletjes: ESCO beroepen</li>
                  <li>Donkerblauwe bolletjes: ISCO beroepsgroepen</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Navigatie:</h3>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    Klik op een bolletje om de onderliggende structuur te zien
                  </li>
                  <li>Sleep bolletjes om de layout aan te passen</li>
                  <li>Scroll om in en uit te zoomen</li>
                </ul>
              </div>

              <p>
                Selecteer een bolletje om gedetailleerde informatie over het
                beroep of de beroepsgroep te zien. Je kunt voor elk beroep ook
                zien welke optionele en essentiële vaardigheden en kennis er bij
                horen.
              </p>

              <p>
                Gebruik de{" "}
                <span className="font-semibold">
                  &apos;Grafiek Resetten&apos;
                </span>{" "}
                knop om terug te keren naar het volledige overzicht.
              </p>
              <p>
                Deze applicatie is gemaakt door het team van{" "}
                <a
                  href="https://loopbaanlola.nl"
                  target="_blank"
                  className="font-semibold underline"
                >
                  Loopbaan Lola
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="absolute bottom-4 left-4 right-4 z-20 max-w-2xl bg-white/70 text-sm">
        {currentSelectedNode ? (
          getNodeType(currentSelectedNode) === "occupation" ? (
            <InformationCardOccupation nodeId={currentSelectedNode} />
          ) : (
            <InformationCardIscoGroup nodeId={currentSelectedNode} />
          )
        ) : (
          <>
            <CardHeader>
              <CardTitle>Geselecteerde Informatie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Klik op een bolletje in de grafiek om de details ervan te
                bekijken.
              </p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
