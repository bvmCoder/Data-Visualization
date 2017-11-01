/**
 * Handles clearing the database cache.
 * @param req - The request to clear the cache.
 * @param res - The response regarding cache clearing.
 */
module.exports.deleteCacheData = (req, res) => {
  try {
    req.app.locals.dbCache.flushAll();
    res.status(200).send();
  } catch (err) {
    res.status(500).send({
      message: 'Something went wrong clearing the server database cache.',
    });
  }
};
