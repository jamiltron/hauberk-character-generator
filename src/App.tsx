import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AttributeList from './components/AttributeList';
import BornSituationList from './components/BornLifepathList';
import FamilySituationList from './components/FamilySituationList';

export interface Attribute {
  name: string;
  value: number;
}

const rollDice = (numDice: number, numSides: number): number => {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * numSides) + 1;
  }
  return total;
};

const generateAttributes = (): Attribute[] => {
  return [
    { name: 'STR', value: rollDice(3, 6) },
    { name: 'DEX', value: rollDice(3, 6) },
    { name: 'CON', value: rollDice(3, 6) },
    { name: 'CHA', value: rollDice(3, 6) },
    { name: 'POW', value: rollDice(3, 6) },
    { name: 'SOC', value: rollDice(3, 6) },
    { name: 'INT', value: rollDice(2, 6) + 6 },
    { name: 'SIZ', value: rollDice(2, 6) + 6 },
  ];
};

const generateSetting = (): string => {
  const roll = Math.random();
  if (roll < 0.6) {
    return 'Rural';
  } else {
    return 'Urban';
  }
};

const generateSiblingRank = (): number => {
  const roll = rollDice(1, 100);
  if (roll <= 25) return 1;
  if (roll <= 50) return 2;
  if (roll <= 70) return 3;
  if (roll <= 85) return 4;
  if (roll <= 95) return 5;
  return 6;
};

export interface FamilySituation {
  siblingRank: number;
  familySize: number;
  parentalSituation: string;
}

const generateFamilySituation = (SOC: number): FamilySituation => {  
  const siblingRank = generateSiblingRank();
  const familySize = rollDice(1, 6) - 1 + siblingRank;
  const parentalSituation = generateParentalSituation(SOC);
  return { siblingRank, familySize, parentalSituation };
};

const generateOffspringSituation = (): string => {
  const roll = rollDice(1, 100);
  if (roll <= 60) return 'Both parents still alive and together';
  if (roll <= 70) return `Father absent (${rollDice(1, 2) === 1 ? 'divorce' : 'desertion'})`;
  if (roll <= 75) return `Mother absent (${rollDice(1, 2) === 1 ? 'divorce' : 'desertion'})`;
  if (roll <= 80) return 'Father dead';
  if (roll <= 85) return 'Father dead, mother remarried';
  if (roll <= 90) return 'Mother dead';
  return 'Mother dead, father remarried';
};

const generateFosteredSituation = (SOC: number): string => {
  const roll = rollDice(1, 10);
  if (roll === 10) return 'Fostered with a magic-user';
  if (SOC >= 16) return 'Warded with another prosperous family';
  if (SOC >= 13) return 'Apprenticed with a tradesperson/crafter';
  return rollDice(1, 2) === 1 ? 'Fostered with another family' : 'Fostered in a religious institution';
};

const generateOrphanedSituation = (): string => {
  const roll = rollDice(1, 100);
  if (roll <= 80) return 'Fostered at a religious institution';
  if (roll <= 95) return 'Adopted by another family';
  return 'Fostered by a magic-user';
};

const generateParentalSituation = (SOC: number): string => {
  const roll = rollDice(1, 100);
  let situation = '';

  if (roll <= 50) {
    situation = 'Offspring - ' + generateOffspringSituation();
  } else if (roll <= 70) {
    situation = 'Fostered - ' + generateFosteredSituation(SOC);
  } else if (roll <= 75) {
    situation = 'Adopted by another family';
  } else if (roll <= 90) {
    const acknowledgeRoll = rollDice(1, 100);
    situation = `Bastard by a noble parent${acknowledgeRoll >= 76 && acknowledgeRoll <= 80 ? ' (acknowledged)' : '(not acknowledged)'}`;
  } else {
    situation = 'Orphaned - ' + generateOrphanedSituation();
  }

  return situation;
};

export interface BornLifepath {
  lifepath: string;
}

const generateBornSituation = (
  SOC: number,
  setting: string,
  parentalSituation: string
): BornLifepath => {
  const isReligiousOrMagic =
    parentalSituation.includes('religious institution') || parentalSituation.includes('magic-user');

  let lifepath = '';

  if (SOC >= 6 && SOC <= 15 && setting === 'Rural' && !isReligiousOrMagic) {
    lifepath = 'Born Villager';
  }

  // Add more conditions for other lifepaths based on the rules.

  return { lifepath };
};


const App: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [setting, setSetting] = useState<string>('');
  const [familySituation, setFamilySituation] = useState<FamilySituation>({
    siblingRank: 0,
    familySize: 0,
    parentalSituation: '',
  });
  const [bornSituation, setBornSituation] = useState<BornLifepath>({ lifepath: '' });

  const attributesRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (attributes && attributesRef.current) {
      attributesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [attributes]);

  const settingRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (setting && settingRef.current) {
      settingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [setting]);

  const familySituationRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (familySituation.siblingRank > 0 && familySituationRef.current) {
      familySituationRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [familySituation.siblingRank]);

  const lifepathRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (bornSituation.lifepath && lifepathRef.current) {
      lifepathRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [bornSituation.lifepath]);

  const handleGenerateAttributes = () => {
    setAttributes(generateAttributes());
  };

  const handleGenerateSetting = () => {
    setSetting(generateSetting());
  };

  const handleGenerateFamilySituation = () => {
    const SOC = attributes.find((attr) => attr.name === 'SOC')?.value || 0;
    setFamilySituation(generateFamilySituation(SOC));
  };

  const handleGenerateBornSituation = () => {
    const SOC = attributes.find((attr) => attr.name === 'SOC')?.value || 0;
    setBornSituation(generateBornSituation(SOC, setting, familySituation.parentalSituation));
  };

  return (
    <div className="App">
      <h1>Hauberk! Character Generator</h1>
      <Button onClick={handleGenerateAttributes}>Generate Attributes</Button>
      <AttributeList attributes={attributes} />
      {attributes.length > 0 && (
        <>
          <h2>Setting</h2>
          <DropdownButton
            id="dropdown-settings"
            title={setting || 'Select a Setting'}
            onSelect={(eventKey: string | null) => setSetting(eventKey || '')}
          >
            <Dropdown.Item eventKey="Rural">Rural</Dropdown.Item>
            <Dropdown.Item eventKey="Urban">Urban</Dropdown.Item>
          </DropdownButton>
          <Button className="ml-2" onClick={handleGenerateSetting}>
            Generate Setting<div ref={settingRef}></div>
          </Button>
          {setting !== '' && setting !== null && (
            <>
              <h2 ref={familySituationRef}>Family Situation</h2>
              <Button onClick={handleGenerateFamilySituation}>
                Generate Family Situation
              </Button>
              {familySituation.siblingRank > 0 && (
                <FamilySituationList familySituation={familySituation} />
              )}
            </>
          )}
          {familySituation.parentalSituation && (
            <>
              <h2 ref={lifepathRef}>Born Situation</h2>
              <Button onClick={handleGenerateBornSituation}>Generate Born Situation</Button>
              {bornSituation.lifepath && <BornSituationList bornSituation={bornSituation} />}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
