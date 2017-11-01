/**
 * An object that represents a Link,
 * which connects cells (tables) that have a relationship
 *
 * The relationship(s) between tables are shown with the relationship type
 * (one-to-many, one-to-one, etc), which is stored in the sourceRelationshipType
 * and destinationRelationshipType fields.
 */

module.exports.Link = class {
  constructor(source, destination, sourceType, destinationType) {
    this.source = source;
    this.destination = destination;
    this.sourceRelationshipType = sourceType;
    this.destinationRelationshipType = destinationType;
  }
};
