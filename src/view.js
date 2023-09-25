const renderErrors = (errors, i18n, elements) => {
  elements.errorsContainer.innerHTML = '';
  if (errors.length <= 0) {
    elements.errorsContainer.innerHTML = '';
    elements.input.classList.remove('is-invalid');
  }
  Object.entries(errors).forEach(([_, path]) => {
    const errorText = document.createTextNode(i18n.t(path));
    elements.errorsContainer.appendChild(errorText);
    elements.input.classList.add('is-invalid');
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

const initView = (elements, i18n) => (path, value, prevValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(value, i18n, elements);
      break;
    case 'form.processState':
      handleProcessState(value, elements);
      break;
    default:
      break;
  }
};

export default initView;
