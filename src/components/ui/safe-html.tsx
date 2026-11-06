import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

/**
 * Renders CMS rich text. A CMS role admin writes this HTML and customers read it on the
 * origin where script can reach their API token, so it is never trusted as written.
 *
 * DOMPurify needs a real DOM, so it runs after mount. The server sends nothing for this
 * block, which keeps an unsanitized copy out of the first paint and out of the HTML.
 */
export default function SafeHtml({ html, className }: { html?: string | null; className?: string }) {
  const [clean, setClean] = useState('');

  useEffect(() => {
    setClean(html ? DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }) : '');
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
