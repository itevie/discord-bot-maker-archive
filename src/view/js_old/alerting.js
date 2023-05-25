document.addEventListener("DOMContentLoaded", () => {
  window.electron.registerEventListener('error', (data) => {
    error(data.text, data.title);
  });

  window.electron.registerEventListener('confirmRun', (data) => {
    Swal.fire({
      title: "Confirm",
      text: data.text,
      icon: "question",
      showCancelButton: true
    }).then(res => {
      return window.electron.confirmFunctionResponse({
        id: data.id,
        response: res.isConfirmed
      });
    });
  });
});

function error(message, title = "Error") {
  Swal.fire({
    title,
    text: message,
    icon: "error"
  });
}