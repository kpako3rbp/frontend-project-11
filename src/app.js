import * as yup from 'yup';
import onChange from 'on-change';
import initView from './view.js';

export default () => {
  const state = {
    form: {
      valid: true,
      fields: {
        this: '',
      },
      processState: 'filling',
      feeds: [],
      errors: [],
    },
  };

  const elements = {
    form: document.querySelector('form.rss-form'),
    input: document.querySelector('#url-input'),
    submit: document.querySelector('button[type="submit"]'),
    errorsContainer: document.querySelector('p.feedback'),
  };

  const watchedState = onChange(state, initView(elements));

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
        watchedState.form.fields.this = '';
        watchedState.form.errors = [];
        watchedState.form.processState = 'success';
        watchedState.form.valid = true;
      })
      .catch((error) => {
        watchedState.form.processState = 'failed';
        watchedState.form.valid = false;
        watchedState.form.errors.push(error.message);
      });
  });
};
