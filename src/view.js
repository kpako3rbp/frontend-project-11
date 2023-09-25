const renderErrors = (errors, i18n, elements) => {
  const { feedbackContainer, input } = elements;
  feedbackContainer.innerHTML = '';
  feedbackContainer.classList.add('text-danger');
  feedbackContainer.classList.remove('text-success');
  if (errors.length <= 0) {
    feedbackContainer.innerHTML = '';
    input.classList.remove('is-invalid');
  }
  Object.entries(errors).forEach(([, path]) => {
    const errorText = document.createTextNode(i18n.t(path));
    feedbackContainer.appendChild(errorText);
    input.classList.add('is-invalid');
  });
};

const renderSuccess = (i18n, elements) => {
  const { feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';
  feedbackContainer.classList.remove('text-danger');
  feedbackContainer.classList.add('text-success');
  feedbackContainer.innerHTML = i18n.t('success');
};

const handleProcessState = (state, i18n, elements) => {
  switch (state) {
    case 'success':
      elements.form.reset();
      elements.input.focus();
      renderSuccess(i18n, elements);
      break;
    default:
      break;
  }
};

const initView = (elements, i18n) => (path, value) => {
  switch (path) {
    case 'form.errors':
      renderErrors(value, i18n, elements);
      break;
    case 'form.processState':
      handleProcessState(value, i18n, elements);
      break;
    default:
      break;
  }
};

export default initView;
