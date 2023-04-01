import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { Attribute } from '../App';

interface Props {
  attributes: Attribute[];
}

const AttributeList: React.FC<Props> = ({ attributes }) => {
  return (
    <ListGroup>
      {attributes.map((attr) => (
        <ListGroup.Item key={attr.name}>
          <b>{attr.name}:</b> {attr.value}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default AttributeList;
