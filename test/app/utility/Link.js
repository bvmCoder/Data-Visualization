const Link = require('../../../app/utility/Link').Link;
const chai = require('chai');
const linkTypes = require('../../../app/utility/linkConnectionTypes').connectionTypes;

const expect = chai.expect;

describe('Link', () => {
  it('should construct a link with attributes the same as the parameters passed in', () => {
    const link = new Link(0, 1, linkTypes.MANY, linkTypes.ONE);
    expect(link.source).to.equal(0);
    expect(link.destination).to.equal(1);
    expect(link.sourceRelationshipType).to.equal(linkTypes.MANY);
    expect(link.destinationRelationshipType).to.equal(linkTypes.ONE);
  });
});
