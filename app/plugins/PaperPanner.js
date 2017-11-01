const jointjs = require('jointjs');
const ErrorMessages = require('../utility/messages.js').ErrorMessages;

/**
 * A class used to enable panning for a jointJS paper
 */
module.exports.PaperPanner = class {
  /**
   * Create a PaperPanner
   * @param {Object} paper - the paper for which to enable panning
   */
  constructor(paper) {
    /**
     * The event handler for the mouse click
     * Sets the initial origin and mouse, and adds the mousemove event listener
     *    to the SVG
     * Hooked up to the paper by:
     *    paper.on('blank:pointerdown', panner.startPanning);
     * @param {Object} evt - the event object for the mouse click
     */
    this.startPanning = (evt) => {
      if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);
      if (!evt) throw new Error(ErrorMessages.INVALID_EVT_OBJECT);

      this.setMousePosition(evt.clientX, evt.clientY);
      this.setStartOrigin();

      this.getPaper().svg.addEventListener('mousemove', this.pan);
    };

    /**
     * The event handler for mouse movement
     * There is no event for this in the paper API, so it needs to be hooked up
     *    via the SVG element, which can be found in the paper object:
     *      paper.svg.addEventListener('mousemove', this.panner.pan);
     * The event should only be added when panning starts, and removed when
     *    panning stops.
     * @param {Object} evt - the event object for the mousemove event
     */
    this.pan = (evt) => {
      if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);
      if (!evt) throw new Error(ErrorMessages.INVALID_EVT_OBJECT);

      // jointJS does this for every event it implements, for mobile support
      evt.preventDefault();
      // eslint-disable-next-line no-param-reassign
      evt = jointjs.util.normalizeEvent(evt);
      this.updateOrigin(evt.clientX, evt.clientY);
    };

    /**
     * The event handler for the mouse up event
     * Removes the mousemove event listener from the SVG
     * Hooked up to the paper by:
     *    this.paper.on('blank:pointerup', this.stopPanning);
     */
    this.stopPanning = () => {
      if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);

      this.getPaper().svg.removeEventListener('mousemove', this.pan);
    };

    if (!paper) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);

    this.setPaper(paper).addEvents();
  }

  /**
   * Add all the necessary event listeners for panning
   * @return {Object} - the current panner instance - for method chaining
   */
  addEvents() {
    if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);

    this.getPaper().on('blank:pointerdown', this.startPanning);
    this.getPaper().on('blank:pointerup', this.stopPanning);
    return this;
  }

  /**
   * Set a paper
   * @param {Object} paper - the paper for which to enable panning
   * @return {Object} - the current panner instance - for method chaining
   */
  setPaper(paper) {
    this.paper = paper;
    return this;
  }

  /**
   * Get a paper
   * @return {Object} - the paper attached to the panner
   */
  getPaper() {
    return this.paper;
  }

  /**
   * Returns whether or not the paper has been set for the panner
   * @return {boolean} - whether or not the paper has been set
   */
  hasPaper() {
    return Boolean(this.getPaper());
  }

  /**
   * Store the current origin for the paper
   * @return {Object} - the current panner instance - for method chaining
   */
  setStartOrigin() {
    if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);

    this.startOrigin = {};
    const translate = this.getPaper().translate();
    this.startOrigin.x = translate.tx;
    this.startOrigin.y = translate.ty;

    return this;
  }

  /**
   * Translate the paper based on the mouse's movement
   * @param {number} x - the mouse's x position
   * @param {number} y - the mouse's y position
   * @return {Object} - the current panner instance - for method chaining
   */
  updateOrigin(x, y) {
    if (!this.hasPaper()) throw new Error(ErrorMessages.INVALID_PAPER.PANNER);

    const d = {};
    d.x = x - this.mousePosition.x;
    d.y = y - this.mousePosition.y;

    this.getPaper().translate(this.startOrigin.x + d.x, this.startOrigin.y + d.y);
    return this;
  }

  /**
   * Store the mouse's current position
   * @param {number} x - the mouse's x position
   * @param {number} y - the mouse's y position
   * @return {Object} - the current panner instance - for method chaining
   */
  setMousePosition(x, y) {
    this.mousePosition = {};
    this.mousePosition.x = x;
    this.mousePosition.y = y;
    return this;
  }
};
