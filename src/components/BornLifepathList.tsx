import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { BornLifepath } from '../App';

interface Props {
  bornSituation: BornLifepath;
}

const BornSituationList: React.FC<Props> = ({ bornSituation }) => {
  return (
    <ListGroup>
      <ListGroup.Item><b>Lifepath:</b> {bornSituation.lifepath}</ListGroup.Item>
      <ListGroup.Item><b>Guardian Career:</b> {bornSituation.guardianCareer}</ListGroup.Item>
    </ListGroup>
  );
};

export default BornSituationList;
