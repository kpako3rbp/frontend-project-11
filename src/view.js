const renderError = (error, i18n, elements) => {
  const { feedbackContainer, input } = elements;
  feedbackContainer.innerHTML = '';
  feedbackContainer.classList.add('text-danger');
  feedbackContainer.classList.remove('text-success');

  if (!error) {
    return;
  }

  Object.entries(error).forEach(([, path]) => {
    const errorText = document.createTextNode(i18n.t(path));
    feedbackContainer.appendChild(errorText);
    input.classList.add('is-invalid');
  });
};

const renderSuccessMessage = (i18n, elements) => {
  const { feedbackContainer, input } = elements;
  feedbackContainer.innerHTML = '';
  input.classList.remove('is-invalid');
  feedbackContainer.classList.remove('text-danger');
  feedbackContainer.classList.add('text-success');
  feedbackContainer.innerHTML = i18n.t('success');
};

const renderFeeds = (feeds, i18n, elements) => {
  const { feedsContainer, postsContainer } = elements;
  feedsContainer.innerHTML = '';

  const cardBorderEl = document.createElement('div');
  cardBorderEl.className = 'card border-0';
  feedsContainer.appendChild(cardBorderEl);

  const cardBodyEl = document.createElement('div');
  cardBodyEl.className = 'card-body';
  cardBorderEl.appendChild(cardBodyEl);

  const h2 = document.createElement('h2');
  h2.className = 'card-title h4';
  cardBodyEl.appendChild(h2);
  h2.textContent = i18n.t('feeds');

  const ul = document.createElement('ul');
  ul.className = 'list-group border-0 rounded-0';
  cardBorderEl.appendChild(ul);

  feeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.className = 'list-group-item border-0 border-end-0';

    const h3 = document.createElement('h3');
    h3.className = 'h6 m-0';
    h3.textContent = title;

    const p = document.createElement('p');
    p.className = 'm-0 small text-black-50';
    p.textContent = description;

    li.append(h3, p);
    ul.appendChild(li);
  });
};

/* const renderFeedback = (error, i18n, elements) => {
  const { feedbackContainer, input } = elements;
  feedbackContainer.innerHTML = '';

  if (!error) {
    input.classList.remove('is-invalid');
    feedbackContainer.classList.remove('text-danger');
    feedbackContainer.classList.add('text-success');
    feedbackContainer.innerHTML = i18n.t('success');
    return;
  }

  input.classList.add('is-invalid');
  feedbackContainer.classList.add('text-danger');
  feedbackContainer.classList.remove('text-success');
  Object.entries(error).forEach(([, path]) => {
    const errorText = document.createTextNode(i18n.t(path));
    feedbackContainer.appendChild(errorText);
  });
}; */

/* const handleProcessState = (state, i18n, elements) => {
  switch (state) {
    case 'success':
      elements.form.reset();
      elements.input.focus();
      renderSuccessMessage(i18n, elements);
      break;
    default:
      break;
  }
}; */

const initView = (elements, state, i18n) => (path, value) => {
  switch (value) {
    case 'error':
      renderError(state.form.error, i18n, elements);
      break;
    case 'success':
			elements.form.reset();
      elements.input.focus();
      renderSuccessMessage(i18n, elements);
			renderFeeds(state.data.feeds, i18n, elements);
      break;
    case 'filling':
      break;
    case 'sending':
      break;
    default:
      break;
  }
};

export default initView;
