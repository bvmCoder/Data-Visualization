const ErrorMessages = require('../../app/utility/messages').ErrorMessages;

/**
 * A class used to enable zooming for a jointJS paper
 */
module.exports.PaperZoomer = class {
  /**
   * Create a PaperZoomer
   * @param {Object} paper - the paper for which to enable zooming
   */
  constructor(paper) {
    this.SCALING_FACTOR = 0.05; // +0.05x increase in zoom per delta
    this.MIN_SCALE = 0.25;      // Minimum of 0.25x zoom
    this.MAX_SCALE = 2;         // Maximum of 2x zoom

    /**
     *    This is the 'blank:mousewheel' event
     *    The 'this' in this situation is the paper.
     *    This event is fired when the mousewheel is used in a blank space in the paper.
     *    @param {Object} evt - the event object
     *    @param {number} x - the x position at which the mousewheel was used
     *    @param {number} y - the y position at which the mousewheel was used
     *    @param {number} delta - the direction of the spinning of the mousewheel
     */
    this.blankMouseWheelHandler = (evt, x, y, delta) => {
      this.zoom(evt, delta);
    };

    /**
     *    This is the 'cell:mousewheel' event
     *    This event is fired when the mousewheel is used in cell in the paper.
     *    @param {Object} cellView - the cellView for the cell - contains a reference to the paper
     *    @param {Object} evt - the event object
     *    @param {number} x - the x position at which the mousewheel was used
     *    @param {number} y - the y position at which the mousewheel was used
     *    @param {number} delta - the direction of the spinning of the mousewheel
     */
    this.cellMouseWheelHandler = (cellView, evt, x, y, delta) => {
      this.zoom(evt, delta);
    };

    if (!paper) throw new Error(ErrorMessages.INVALID_PAPER.ZOOMER);

    this.setPaper(paper).addEvents();
  }

  /**
   * Add all the necessary event listeners for zooming
   * @return {Object} - the current zoomer instance - for method chaining
   */
  addEvents() {
    if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.ZOOMER);

    this.getPaper().on('blank:mousewheel', this.blankMouseWheelHandler);
    this.getPaper().on('cell:mousewheel', this.cellMouseWheelHandler);
    return this;
  }

  /**
   * Set a paper
   * @param {Object} paper - the paper for which to enable zooming
   * @return {Object} - the current zoomer instance - for method chaining
   */
  setPaper(paper) {
    this.paper = paper;
    return this;
  }

  /**
   * Get a paper
   * @return {Object} - the paper attached to the zoomer
   */
  getPaper() {
    return this.paper;
  }

  /**
   * Returns whether or not the paper has been set for the zoomer
   * @return {boolean} - whether or not the paper has been set
   */
  hasPaper() {
    return Boolean(this.getPaper());
  }

  /**
   * The event handler for zooming
   * This event handler does not actually get added to any elements as an event handler. The event
   *  handlers for the mousewheel events are translated to be handled by this function.
   * Based on the delta and the current scaling of the paper, it calculates the new x and y scaling
   *  and applies it to the paper.
   *  @param {Object} evt   - the event object for the mousewheel event
   *  @param {number} delta - indicates the magnitude and direction (positive or negative) of the
   *                            scroll
   *                        - positive delta means an increase in scaling
   *                        - negative delta means a decrease in scaling
   *  @return {Object} - the current zoomer instance - for method chaining
   */
  zoom(evt, delta) {
    if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.ZOOMER);
    if (!evt) throw new Error(ErrorMessages.INVALID_EVT_OBJECT);

    evt.preventDefault();
    const oldScale = this.getPaper().scale();
    const newScale = {};
    newScale.x = oldScale.sx + (delta * this.SCALING_FACTOR);
    newScale.y = oldScale.sy + (delta * this.SCALING_FACTOR);
    newScale.x = Math.min(Math.max(newScale.x, this.MIN_SCALE), this.MAX_SCALE);
    newScale.y = Math.min(Math.max(newScale.y, this.MIN_SCALE), this.MAX_SCALE);
    this.getPaper().scale(newScale.x, newScale.y);
    return this;
  }
};
