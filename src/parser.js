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

  const getItems = (els) => {
    const items = Array.from(els).reduce((acc, item) => {
      const title = item.querySelector('title').textContent;
      const description = item.querySelector('description').textContent;
      const link = item.querySelector('link').textContent;
      acc.push({ title, description, link });
      return acc;
    }, []);

    return items;
  };

  return {
    feed: {
      title: titleEl.textContent,
      description: descriptionEl.textContent,
    },
    items: getItems(itemEls),
  };
};
