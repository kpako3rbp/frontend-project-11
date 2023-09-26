export default (response) => {
	const htmlText = response.data.contents;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

	const elements = {
		title: doc.querySelector('title'),

	}

  console.log(doc,'doc');
};
