import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import AttributeList from './components/AttributeList';
import BornSituationList from './components/BornLifepathList';
import FamilySituationList from './components/FamilySituationList';

type ProbabilityEntry = {
  name: string;
  probability: number;
}

// TODO: I should generalize this to any attribute
type SocRange = {
  min: number;
  max: number;
}

type CareerProbability = {
  name: string;
  setting: Setting;
  SOC_range: SocRange;
  careers: ProbabilityEntry[];
}

const loadCareerProbabilities = async (): Promise<CareerProbability[]> => {
  const response = await fetch('/json/career_probabilities.json',
  {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  const careerProbabilities = await response.json();
  return careerProbabilities;
};

export type Setting = '' | 'Rural' | 'Urban' | 'Religious' | 'Arcane';

export interface Character {
  attributes: Attribute[];
  setting: Setting;
  familySituation: FamilySituation;
  bornSituation: BornLifepath;
}

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

const generateSetting = (): Setting => {
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

const generateCareer = async (setting: string, SOC: number): Promise<string> => {
  let careerProbs = await loadCareerProbabilities();
  console.log(careerProbs);
  const careerGroup = careerProbs.find(  //careerProbabilities.find(
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

const stringToSetting = (str?: string): Setting => {
  if (str === 'Rural') {
    return 'Rural';
  } else if (str === 'Urban') {
    return 'Urban';
  } else if (str === 'Religious') {
    return 'Religious';
  } else if (str === 'Arcane') {
    return 'Arcane';
  }
  else {
    return '';
  }
}

const generateBornSituation = async (
  SOC: number,
  setting: string,
  parentalSituation: string
): Promise<BornLifepath> => {
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
  } else if (SOC >= 16 && setting === 'Rural' && !isReligiousOrMagic) {
    lifepath = 'Born Noble';
  } else if (setting === 'Urban') {
    lifepath = 'Born Townsfolk';
  }

  let guardianCareer = await generateCareer(setting, SOC);

  // Add more conditions for other lifepaths based on the rules.
  return { lifepath, guardianCareer };
};

const App: React.FC = () => {
  const [character, setCharacter] = useState<Character>({
    attributes: [],
    setting: '',
    familySituation: {
      siblingRank: 0,
      familySize: 0,
      parentalSituation: '',
    },
    bornSituation: { lifepath: '', guardianCareer: '' },
  });

  const attributesRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (character.attributes && attributesRef.current) {
      attributesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [character.attributes]);

  const settingRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (character.setting && settingRef.current) {
      settingRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [character.setting]);

  const familySituationRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (character.familySituation.siblingRank > 0 && familySituationRef.current) {
      familySituationRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [character.familySituation.siblingRank]);

  const lifepathRef = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    if (character.bornSituation.lifepath && lifepathRef.current) {
      lifepathRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [character.bornSituation.lifepath]);

  const handleGenerateAttributes = () => {
    const newAttributes = generateAttributes();
    setCharacter({ ...character, attributes: newAttributes });
  };

  const handleGenerateSetting = (newSetting?: string) => {
    const generatedSetting = stringToSetting(newSetting) || generateSetting();
    setCharacter({ ...character, setting: generatedSetting });
  };

  const handleGenerateFamilySituation = () => {
    const SOC = character.attributes.find((attr) => attr.name === 'SOC')?.value || 0;
    const generatedFamilySituation = generateFamilySituation(SOC);
    setCharacter({ ...character, familySituation: generatedFamilySituation });

    if (generatedFamilySituation.parentalSituation.toLowerCase().includes('religious institution')) {
      handleGenerateSetting('Religious');
    } else if (generatedFamilySituation.parentalSituation.toLowerCase().includes('magic-user')) {
      handleGenerateSetting('Arcane');
    }
  };

  const handleGenerateBornSituation = async () => {
    const SOC = character.attributes.find((attr) => attr.name === 'SOC')?.value || 0;
    const generatedBornSituation = await generateBornSituation(SOC, character.setting, character.familySituation.parentalSituation);
    setCharacter({ ...character, bornSituation: generatedBornSituation });
  };

  return (
    <div className="App">
      <h1>Hauberk! Character Generator</h1>
      <Button onClick={handleGenerateAttributes}>Generate Attributes</Button>
      <AttributeList attributes={character.attributes} />
      {character.attributes.length > 0 && (
        <>
          <h2>Setting</h2>
          <DropdownButton
            id="dropdown-settings"
            title={character.setting || 'Select a Setting'}
            onSelect={(eventKey: string | null) => setCharacter({...character, setting: stringToSetting(eventKey || '')})}
          >
            <Dropdown.Item eventKey="Rural">Rural</Dropdown.Item>
            <Dropdown.Item eventKey="Urban">Urban</Dropdown.Item>
          </DropdownButton>
          <Button className="ml-2" onClick={() => handleGenerateSetting()}>
            Generate Setting<div ref={settingRef}></div>
          </Button>
          {character.setting !== '' && character.setting !== null && (
            <>
              <h2 ref={familySituationRef}>Family Situation</h2>
              <Button onClick={handleGenerateFamilySituation}>
                Generate Family Situation
              </Button>
              {character.familySituation.siblingRank > 0 && (
                <FamilySituationList familySituation={character.familySituation} />
              )}
            </>
          )}
          {character.familySituation.parentalSituation && (
            <>
              <h2 ref={lifepathRef}>Born Situation</h2>
              <Button onClick={handleGenerateBornSituation}>Generate Born Situation</Button>
              {character.bornSituation.lifepath && <BornSituationList bornSituation={character.bornSituation} />}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default App;
