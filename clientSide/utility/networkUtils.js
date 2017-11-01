const axios = require('axios');
const _ = require('lodash');

/**
 * Fills the listOfOptions passed in (a datalist) with options that are table names found to
 * be similar to the searchCriteria passed in
 * @param {array} urls - The text of the search box, used for the URL queries
 * @param {function} accumulator - What to do with the resulting response data.
 * @param (function) successHandler - What to do in case of a success.
 * @param (function) errorHandler - What to do in case of a failure.
 * @data  (object) The data processed so far.
 */

const getReduce = (urls, accumulator, successHandler, errorHandler, data) => {
  const getJSONRequest = { method: 'get', responseType: 'json' };
  if (urls.length <= 0) {
    successHandler(data);
  } else {
    axios(_.extend({ url: urls.shift() }, getJSONRequest))
      .then((response) => {
        const newData = accumulator(data, response);
        getReduce(urls, accumulator, successHandler,
          errorHandler, newData);
      })
      .catch((error) => {
        errorHandler(error, data);
      });
  }
};

module.exports.getReduce = getReduce;
