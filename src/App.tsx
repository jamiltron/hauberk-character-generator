import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AttributeList from './components/AttributeList';
import BornSituationList from './components/BornLifepathList';
import FamilySituationList from './components/FamilySituationList';
import careerProbabilities from '../src/assets/career_probabilities.json'

export type Setting = 'Rural' | 'Urban';

export interface Attribute {
  name: string;
  value: number;
}

export interface FamilySituation {
  siblingRank: number;
  familySize: number;
  parentalSituation: string;
}

export interface BornLifepath {
  lifepath: string;
  guardianCareer: string;
}

interface CareerGroup {
  name: string;
  setting: Setting;
  soc_range: SOC_Range;
  careers: ProbabilityEntry[];
}

interface ProbabilityEntry {
  name: string;
  probability: number;
}

interface SOC_Range {
  min: number;
  max: number;
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

const generateEntertainerRole = (): string => {
  const roll = rollDice(1, 100);

  if (roll < 50) {
    return 'Minstrel';
  } else if (roll < 65) {
    return 'Storyteller';
  } else if (roll < 80) {
    return 'Actor';
  } else if (roll < 85) {
    return 'Comedian';
  } else if (roll < 88) {
    return 'Magician';
  } else if (roll < 91) {
    return 'Dancer';
  } else if (roll < 94) {
    return 'Juggler';
  } else if (roll < 97) {
    return 'Acrobat';
  } else if (roll < 99) {
    return 'Puppeteer';
  } else if (roll < 100) {
    return 'Contortionist';
  } else {
    return 'Fire Artist';
  }
}

const generateItinerantCraftsmenRole = (): string => {
  const roles = [
    'Smith',
    'Carpenter',
    'Tinkerer',
    'Weaver',
    'Leatherworker',
    'Farrier',
    'Baker',
    'Tailor',
    'Thatcher',
    'Fletcher',
    'Bowyer',
    'Potter',
    'Cooper'
  ]

  const index = Math.floor(Math.random() * roles.length);
  return roles[index];
}

const generateCareer = (setting: string, SOC: number): string => {
  const careerGroup = careerProbabilities.find(
    (group) =>
      group.setting === setting &&
      group.SOC_range.min <= SOC &&
      group.SOC_range.max >= SOC
  );

  // Return null if no matching career group found
  if (!careerGroup) return '';

  // Generate a random number between 0 and 1
  const random = Math.random();

  // Calculate the cumulative probability
  let cumulativeProbability = 0;

  // Iterate through the careers to find the matching career based on probability
  for (const career of careerGroup.careers) {
    cumulativeProbability += career.probability;
    if (random <= cumulativeProbability) {
      return career.name;
    }
  }

  return '';
};

const generateBornSituation = (
  SOC: number,
  setting: string,
  parentalSituation: string
): BornLifepath => {
  const isReligious = parentalSituation.toLowerCase().includes('religious institution');
  const isMagical = parentalSituation.toLowerCase().includes('magic-user');
  const isReligiousOrMagic = isReligious || isMagical;

  let lifepath = '';

  if (isReligious) {
    lifepath = "Raised in a Monastary";

  } else if (isMagical) {
    lifepath = "Raised by a Magic-User";
  } else if (SOC <= 3) {
    lifepath = "Born Outcast";
  } else if (SOC >= 4 && SOC <= 5) {
    lifepath = 'Born Wanderer';
  } else if (SOC >= 6 && SOC <= 15 && setting === 'Rural' && !isReligiousOrMagic) {
    lifepath = 'Born Villager';
  } else if (setting === 'Urban') {
    lifepath = 'Born Townsfolk';
  }

  let guardianCareer = generateCareer(setting, SOC);

  // Add more conditions for other lifepaths based on the rules.
  return { lifepath, guardianCareer };
};

const App: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [setting, setSetting] = useState<string>('');
  const [familySituation, setFamilySituation] = useState<FamilySituation>({
    siblingRank: 0,
    familySize: 0,
    parentalSituation: '',
  });
  const [bornSituation, setBornSituation] = useState<BornLifepath>({ lifepath: '', guardianCareer: '' });

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
