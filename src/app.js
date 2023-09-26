import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/index.js';
import initView from './view.js';
import parseRss from './parser.js';

const routes = {
  proxyPath: () => 'https://allorigins.hexlet.app/get',
};

export default () => {
  const elements = {
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('button[type="submit"]'),
    feedbackContainer: document.querySelector('p.feedback'),
  };

  const defaultLang = 'ru';

  const state = {
    form: {
      processState: 'filling',
      valid: true,
      fields: {
        this: '',
      },
      feeds: [],
      errors: [],
    },
  };

  yup.setLocale({
    string: {
      url: () => ({ key: 'errors.validation.url' }),
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
    },
  });

  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  });

  const watchedState = onChange(state, initView(elements, i18n));

  elements.input.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'filling';
    const { value } = e.target;
    watchedState.form.fields.this = value.trim();
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.processState = 'sending';

    const schema = yup.object().shape({
      this: yup.string().url().notOneOf(watchedState.form.feeds),
    });

    schema
      .validate(watchedState.form.fields)
      .then(() => {
        watchedState.form.feeds.push(watchedState.form.fields.this);
        //watchedState.form.fields.this = '';
        watchedState.form.errors = [];

        watchedState.form.valid = true;

        axios
          .get(routes.proxyPath(), {
            params: {
              url: watchedState.form.fields.this,
            },
          })
          .then((response) => {
            watchedState.form.processState = 'success';
            parseRss(response);
						console.log(response, 'RESPONSE')
            //console.log(response, 'data', watchedState.form.fields.this, 'watchedState.form.fields.this');
          })
          .catch((error) => {
            watchedState.form.processState = 'failed';
            //console.log(watchedState, 'watchedState', watchedState.form.fields.this, 'watchedState.form.fields.this');
            console.error(error, 'ERROR!!!');
          });
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.valid = false;

        watchedState.form.errors = { ...watchedState.form.errors, [error.type]: `errors.validation.${error.type}` };
      });
  });
};
