import { useEffect } from 'react';

const DEFAULT_TITLE = 'Awutu Bawjiase Community Archive';
const DEFAULT_DESCRIPTION =
  'A digital sanctuary preserving royal heritage, community memory, ceremonial information, and cultural archives.';

export default function Seo({ title, description = DEFAULT_DESCRIPTION }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
    document.title = fullTitle;

    const ensureMeta = (name) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      return element;
    };

    ensureMeta('description').setAttribute('content', description);
    ensureMeta('theme-color').setAttribute('content', '#f4ede4');
  }, [description, title]);

  return null;
}
