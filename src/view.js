const renderErrors = (errors, elements) => {
  if (errors.length <= 0) {
    elements.errorsContainer.innerHTML = '';
  }
  errors.forEach((error) => {
    const errorText = document.createTextNode(error);
    elements.errorsContainer.appendChild(errorText);
  });
};

const handleProcessState = (state, elements) => {
  switch (state) {
    case 'success':
      elements.form.reset();
      elements.input.focus();
      break;
    default:
      break;
  }
};

const initView = (elements) => (path, value, prevValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(value, elements);
      break;
    case 'form.processState':
      handleProcessState(value, elements);
      break;
    default:
      break;
  }
};

export default initView;
