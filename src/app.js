import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import resources from './locales/index.js';
import initView from './view.js';
import parseRss from './parser.js';

const routes = {
  proxyPath: (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${url}`,
};

const rssValidateSchema = (feeds) => {
  yup.setLocale({
    string: {
      url: () => ({ key: 'error.validation.url' }),
    },
    mixed: {
      notOneOf: () => ({ key: 'error.validation.notOneOf' }),
    },
  });

  return yup.string().url().notOneOf(feeds);
};

const setIdsForRssData = (rssData) => {
  const { feed, items } = rssData;
  feed.id = uniqueId();

  items.forEach((item) => {
    item.id = uniqueId();
    item.feedId = feed.id;
  });

  return { feed, items };
};

export default () => {
  const elements = {
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('button[type="submit"]'),
    feedbackContainer: document.querySelector('p.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
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
          console.log(rssData, 'rssData111111111111');
          const { feed, items } = setIdsForRssData(rssData);
          watchedState.data.feeds.push(feed);
          watchedState.data.posts.push(...items);
          watchedState.form.processState = 'success';

          watchedState.validLinks.push(inputValue);
        }
      })
      .catch((error) => {
        watchedState.form.processState = 'error';
        watchedState.form.valid = false;

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
      });
  });
};
