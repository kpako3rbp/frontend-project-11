const renderError = (error, i18n, elements) => {
  const { feedbackContainer, input } = elements;
  feedbackContainer.innerHTML = '';
  feedbackContainer.classList.add('text-danger');
  feedbackContainer.classList.remove('text-success');

  Object.entries(error).forEach(([, path]) => {
    feedbackContainer.innerHTML = i18n.t(path);
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

const renderSendingMessage = (i18n, elements) => {
  const { feedbackContainer } = elements;
  feedbackContainer.innerHTML = '';
  feedbackContainer.innerHTML = i18n.t('sending');
};

const generateContainer = (container, title) => {
  container.innerHTML = '';

  const cardBorderEl = document.createElement('div');
  cardBorderEl.className = 'card border-0';
  container.appendChild(cardBorderEl);

  const cardBodyEl = document.createElement('div');
  cardBodyEl.className = 'card-body';
  cardBorderEl.appendChild(cardBodyEl);

  const h2 = document.createElement('h2');
  h2.className = 'card-title h4';
  cardBodyEl.appendChild(h2);
  h2.textContent = title;

  const ul = document.createElement('ul');
  ul.className = 'list-group border-0 rounded-0';
  cardBorderEl.appendChild(ul);

  return ul;
};

const renderFeeds = (state, i18n, elements) => {
  const { feeds } = state.data;
  if (feeds.length <= 0) {
    return;
  }
  const { feedsContainer } = elements;
  const ul = generateContainer(feedsContainer, i18n.t('feeds'));

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

const renderPosts = (state, i18n, elements) => {
  const { posts } = state.data;
  if (posts.length <= 0) {
    return;
  }

  const { postsContainer } = elements;
  const ul = generateContainer(postsContainer, i18n.t('posts'));

  posts.forEach(({ title, link, id }) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

    const a = document.createElement('a');
    const className = state.uiState.readPostsId.includes(id) ? 'fw-normal link-secondary' : 'fw-bold';
    a.className = className;
    a.setAttribute('href', link);
    a.setAttribute('data-id', id);
    a.textContent = title;

    const button = document.createElement('button');
    button.className = 'btn btn-outline-primary btn-sm';
    button.setAttribute('data-id', id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('show');

    li.append(a, button);
    ul.appendChild(li);
  });
};

const renderReadPosts = (state) => {
  const { id } = state.uiState.currentPost;
  const currentPostEl = document.querySelector(`[data-id="${id}"]`);
  currentPostEl.className = 'fw-normal link-secondary';
};

const renderModalContent = (state, elements) => {
  const { modal } = elements;
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const readMoreBtn = modal.querySelector('.btn');

  const { title, description, link } = state.uiState.currentPost;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  readMoreBtn.setAttribute('href', link);

  renderReadPosts(state);
};

const initView = (elements, state, i18n) => (path, value) => {
  switch (value) {
    case 'success':
      elements.form.reset();
      elements.input.focus();
      renderSuccessMessage(i18n, elements);
      renderFeeds(state, i18n, elements);
      renderPosts(state, i18n, elements);
      break;
    case 'error':
      renderError(state.form.error, i18n, elements);
      break;
    case 'sending':
      renderSendingMessage(i18n, elements);
      break;
    case 'updating':
      renderPosts(state, i18n, elements);
      break;
    case 'modalOpen':
      renderModalContent(state, elements);
      break;
    default:
      break;
  }
};

export default initView;
