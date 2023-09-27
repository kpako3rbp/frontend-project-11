export default (stringHtml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stringHtml, 'application/xml');
  const channel = doc.querySelector('channel');
  const errorNode = doc.querySelector('parsererror');

  if (errorNode) {
    return false;
  }

  const titleEl = channel.querySelector('title');
  const descriptionEl = channel.querySelector('description');
  const itemEls = channel.querySelectorAll('item');

  const getItems = (itemEls) => {
    return Array.from(itemEls).reduce((acc, item) => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      acc.push({ title, link });
      return acc;
    }, []);
  };

  return {
    feed: {
      title: titleEl.textContent,
      description: descriptionEl.textContent,
    },
    items: getItems(itemEls),
  };
};
