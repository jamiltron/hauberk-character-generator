import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { BornLifepath } from '../App';

interface Props {
  bornSituation: BornLifepath;
}

const BornSituationList: React.FC<Props> = ({ bornSituation }) => {
  return (
    <ListGroup>
      <ListGroup.Item>Lifepath: {bornSituation.lifepath}</ListGroup.Item>
    </ListGroup>
  );
};

export default BornSituationList;
