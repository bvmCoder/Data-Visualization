const ErrorMessages = require('../../app/utility/messages').ErrorMessages;

/**
 * Adds menu items and search functionality as a dropdown menu to the visualization.
 */
module.exports = class VisualizationControls {
  /**
   * Creates the VisualizationControls
   * @param {String|DOMElement|jQuery} container - the container to add the menu button to
      (required)
   * @throws {Error} - Throws an error if a container is invalid, not provided, or does not exist in
   *  the page
   */
  constructor(container) {
    if (!container || !$(container).length) {
      throw new Error(ErrorMessages.INVALID_OR_MISSING_CONTAINER);
    }
    this.container = $(container);

    this.button = $('<button></button>');
    this.button.addClass('btn btn-primary settings dropdown-toggle');
    this.button.attr('data-toggle', 'dropdown');

    this.menu = $('<div></div>');
    this.menu.addClass('dropdown-menu dropdown-menu-right');

    this.ul = $('<ul></ul>');

    this.menu.append(this.ul);
  }

  /**
   * Initializes the controls element and adds it to the container
   * @returns {jQuery} - the controls element
   */
  createControlsElement() {
    this.el = $('<div></div>');
    this.el.attr('id', 'visualization-controls');
    this.el.append(this.button);
    this.el.append(this.menu);
    this.container.append(this.el);
    return this.el;
  }

  /**
   * Adds a menu item to the list. Throws an error if text is not provided. Does not throw an error,
   *  if an onClick method is not provided. The menu item just won't do anything.
   * @param {String} text - the text to show for the menu item (required)
   * @param {function} onClick - the callback to perform when the menu item is clicked (optional)
   * @returns {jQuery} - the new list item
   * @throws {Error} - Throws an error if the menu text is invalid or not provided.
   */
  addItem(text, onClick) {
    if (!this.el) this.createControlsElement();
    if (!text) throw new Error(ErrorMessages.INVALID_OR_MISSING_MENU_TEXT);
    const li = $('<li></li>');
    li.text(text);
    if (onClick) {
      li.click(onClick);
    }
    this.ul.append(li);
    return li;
  }

  /**
   * Adds a search bar to the menu. Throws an error if placeholder text is not provided.
   * @param {String} placeholder - the placeholder text to show inside of the search bar (required)
   * @returns {jQuery} - the new search input item
   * @throws {Error} - Throws an error if the placeholder text is not provided
   */
  addSearch(placeholder) {
    if (!this.el) this.createControlsElement();
    if (!placeholder) throw new Error(ErrorMessages.INVALID_OR_MISSING_PLACEHOLDER_TEXT);
    const input = $('<input></input>');
    input.attr('type', 'text');
    input.attr('placeholder', placeholder);

    this.menu.append(input);
    return input;
  }
};
