document.addEventListener('DOMContentLoaded', () => {
  window.ipcApi.registerEventListener('error', data => {
    error(data.text, data.title);
  });

  window.ipcApi.registerEventListener('confirmRun', data => {
    Swal.fire({
      title: 'Confirm',
      text: data.text,
      icon: 'question',
      showCancelButton: true,
    }).then(res => {
      return window.ipcApi.confirmFunctionResponse({
        id: data.id,
        response: res.isConfirmed,
      });
    });
  });
});

const alerting = {
  /**
   * Shows an error on the screen
   * @param {*} message The main message of the screen
   * @param {*} title The title of the error
   */
  error: (message, title = 'Error') => {
    Swal.fire({
      title,
      text: message,
      icon: 'error',
    });
  },
};
