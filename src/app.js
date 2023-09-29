import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import initView from './view.js';
import parseRss from './parser.js';

const routes = {
  proxyPath: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`,
};

const rssValidateSchema = (feeds) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'error.validation.url' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'error.validation.notOneOf' }),
      required: () => ({ key: 'error.validation.required' }),
    },
  });

  return yup.string().required().url().notOneOf(feeds);
};

const setIdsForRssData = (rssData) => {
  const { feed, items } = rssData;

  items.forEach((item) => {
    item.id = uniqueId();
  });

  return { feed, items };
};

const updateData = (watchedState) => {
  const interval = 5000;
  watchedState.form.processState = 'filling';
  const { validLinks } = watchedState;

  if (validLinks.length <= 0) {
    setTimeout(() => {
      updateData(watchedState);
    }, interval);
    return;
  }

  const { posts } = watchedState.data;

  const promises = validLinks.map((link) => axios.get(routes.proxyPath(link)));

  Promise.all(promises)
    .then((responses) => {
      responses.forEach((response) => {
        const newRssData = parseRss(response.data.contents);
        if (!newRssData) {
          throw new Error('Error while parsing RSS');
        }

        watchedState.form.processState = 'updating';
        const { items } = setIdsForRssData(newRssData);
        const newItems = items.filter((item) => !posts.some((post) => item.title === post.title));

        posts.unshift(...newItems);
      });
    })
    .catch((error) => {
      throw new Error(error);
    })
    .finally(() => {
      setTimeout(() => {
        updateData(watchedState);
      }, interval);
    });
};

export default () => {
  const elements = {
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('button[type="submit"]'),
    feedbackContainer: document.querySelector('p.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const defaultLang = 'ru';

  const state = {
    form: {
      processState: 'filling',
      valid: true,
      error: null,
    },
    validLinks: [],
    data: {
      feeds: [],
      posts: [],
    },
    uiState: {
      readPostsId: [],
      currentPost: null,
      modal: '',
    },
  };

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const watchedState = onChange(state, initView(elements, state, i18n));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    const formData = new FormData(e.target);
    const inputValue = formData.get('url').trim();

    rssValidateSchema(watchedState.validLinks)
      .validate(inputValue)
      .then((link) => {
        watchedState.form.error = null;
        watchedState.form.valid = true;
        return link;
      })
      .then((validLink) => {
        watchedState.form.processState = 'sending';
        return axios.get(routes.proxyPath(validLink));
      })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`networkError: ${response.status}`);
        }
        const rssData = parseRss(response.data.contents);
        if (!rssData) {
          throw new Error('parseError');
        } else {
          const { feed, items } = setIdsForRssData(rssData);
          watchedState.data.feeds.unshift(feed);
          watchedState.data.posts.unshift(...items);
          watchedState.form.processState = 'success';

          watchedState.validLinks.push(inputValue);
        }
      })
      .catch((error) => {
        switch (error.name) {
          case 'ValidationError':
            watchedState.form.error = error.message;
            break;
          case 'Error':
            watchedState.form.error = { [error.message]: `error.${error.message}` };
            break;
          case 'AxiosError':
            watchedState.form.error = { [error.name]: `error.${error.name}` };
            break;
          default:
            watchedState.form.error = { unknown: 'error.unknown' };
        }

        watchedState.form.processState = 'error';
        watchedState.form.valid = false;
      });
  });

  elements.modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const currentPostId = button.dataset.id;
    const currentPost = watchedState.data.posts.find((post) => post.id === currentPostId);

    watchedState.uiState.currentPost = currentPost;
    if (!watchedState.uiState.readPostsId.includes(currentPostId)) {
      watchedState.uiState.readPostsId.push(currentPostId);
    }
    watchedState.uiState.modal = 'modalOpen';
  });

  elements.modal.addEventListener('hidden.bs.modal', () => {
    watchedState.uiState.currentPost = null;
    watchedState.uiState.modal = 'modalClose';
  });

  updateData(watchedState);
};
