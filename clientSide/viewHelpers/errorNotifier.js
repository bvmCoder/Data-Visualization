/**
 * Formats an error alert in a bootstrap template and appends it to an error dock.
 *
 * @param {Object} error JSON object representing error
 * @param {string} error.message user-friendly message describing the error which occurred
 * @param {string} [containerID='error-dock'] div to append the error to
 * @param {Number} [durationOfDisplay=10000] the amount of time the alert is displayed
 *  in milliseconds
 */
module.exports.alertError = (error, containerID = 'error-dock', durationOfDisplay = 10000) => {
  const message = error.message || 'No message supplied.';

  // Only one error should be displayed on the error dock at once.
  $(`#${containerID}`).find('.alert-danger').remove();

  const timestamp = Date.now();

  $(`#${containerID}`).append(`
    <div id="alert-error" class="alert alert-danger alert-dismissible" role="alert" data-timestamp=${timestamp}>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
      </button>
      <strong>${message}</strong>
    </div>
  `);

  /*
   * Removes only the error message with a timestamp that matches,
   * so younger error messages are not removed too early.
   */
  setTimeout(
    () => { $(`#${containerID}`).find(`.alert-danger[data-timestamp=${timestamp}]`).remove(); },
    durationOfDisplay);
};
