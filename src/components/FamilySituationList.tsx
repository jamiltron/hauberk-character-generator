import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FamilySituation } from '../App';

interface Props {
  familySituation: FamilySituation;
}

const FamilySituationList: React.FC<Props> = ({ familySituation }) => {
  return (
    <ListGroup>
      <ListGroup.Item>
        <b>Sibling Rank:</b> {familySituation.siblingRank}
      </ListGroup.Item>
      <ListGroup.Item>
        <b>Family Size:</b> {familySituation.familySize}
      </ListGroup.Item>
      <ListGroup.Item>
        <b>Parental Situation:</b> {familySituation.parentalSituation}
      </ListGroup.Item>
    </ListGroup>
  );
};

export default FamilySituationList;
