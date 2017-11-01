/**
 * Generates a message that a failed call to neat-contract's contract method would.
 * @param {String} variableName - The name of the target of the type testing.
 * @param {String} expectedType - The type that the target should be.
 * @param {String} actualType - The type that the target variable was determined to be.
 * @param value - the value of the target variable.
 * @returns {String} A message in the format of the message of the exception returned by
 * a failed call to the 'neat-contract' package's 'contract' method.
 */
function contractErrorStringGenerator(variableName, expectedType, actualType, value) {
  return `\`${variableName}\` should be an \`${expectedType}\`, but got \`${actualType}\`: ${value}`;
}

module.exports.contractErrorStringGenerator = contractErrorStringGenerator;
