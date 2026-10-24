import test from 'node:test';
import assert from 'node:assert/strict';
import { documentRoute, listSources, rewriteUrl } from '../site/lib/paths.mjs';
import { describe } from '../site/lib/describe.mjs';
import { navigation } from '../site/lib/nav.mjs';
import remarkLinks from '../site/lib/remark-links.mjs';
import { fileURLToPath } from 'node:url';

test('Markdown routes preserve index and contributor locations', () => {
  assert.equal(documentRoute('docs/README.md'), 'docs/');
  assert.equal(documentRoute('docs/moduletwo.md'), 'docs/moduletwo/');
  assert.equal(documentRoute('site/README.md'), 'docs/website/');
});

test('every published page is in the documentation navigation', () => {
  const navigable = navigation.flatMap(([, pages]) => pages.map(([source]) => source));
  const published = listSources().filter(source => source !== 'docs/README.md');
  assert.deepEqual([...navigable].sort(), published);
});

test('page descriptions are the first prose paragraph as plain text', () => {
  const markdown = '# Title\n\n![badge](x.svg)\n\n> note\n\nA [guide](a.md) with `code` and **bold**\ntext.\n\nSecond paragraph.';
  assert.equal(describe(markdown, 'fallback'), 'A guide with code and bold text.');
  assert.equal(describe('# Only a title\n\n- item', 'fallback'), 'fallback');
  assert.equal(describe('<!<!-- x -->--\n\nHi', 'fallback'), 'Hi');
  assert.equal(describe('<!-- a\n\nb -->\n\nReal text', 'fallback'), 'Real text');
  const long = describe(`${'word '.repeat(60)}end`, 'fallback');
  assert.ok(long.length <= 160 && long.endsWith('…'));
});

test('source-relative links retain fragments and query strings under the base', () => {
  assert.equal(rewriteUrl('README.md', 'docs/voltbridge.md'), '/custom-mygrid/docs/');
  assert.equal(rewriteUrl('../site/README.md#local-development', 'docs/README.md'), '/custom-mygrid/docs/website/#local-development');
  assert.equal(rewriteUrl('moduletwo.md?from=index#known-issue-port-502-refuses-connections', 'docs/README.md'), '/custom-mygrid/docs/moduletwo/?from=index#known-issue-port-502-refuses-connections');
  assert.equal(rewriteUrl('../docs/voltbridge.md', 'site/README.md'), '/custom-mygrid/docs/voltbridge/');
});

test('images and downloads use the prefixed static assets', () => {
  assert.equal(rewriteUrl('assets/meter.png', 'docs/voltbridge.md'), '/custom-mygrid/docs/assets/meter.png');
  assert.equal(rewriteUrl('../assets/icon.svg', 'docs/README.md'), '/custom-mygrid/assets/icon.svg');
  assert.equal(rewriteUrl('../LICENSE', 'docs/README.md'), '/custom-mygrid/LICENSE');
});

test('external, mail and same-page links remain intact', () => {
  for (const url of ['https://example.com/page.md', 'mailto:support@mygrid.energy', '#setup', '//example.com/image.png']) {
    assert.equal(rewriteUrl(url, 'docs/README.md'), url);
  }
  assert.equal(rewriteUrl('../package.json', 'docs/README.md'), 'https://github.com/tjorim/custom-mygrid/blob/main/package.json');
});

test('Remark handles direct links, images and reference definitions', () => {
  const nodes = ['link', 'image', 'definition'].map(type => ({ type, url: '../assets/icon.svg' }));
  remarkLinks()({ children: nodes }, { path: fileURLToPath(new URL('../docs/README.md', import.meta.url)) });
  for (const node of nodes) assert.equal(node.url, '/custom-mygrid/assets/icon.svg');
});
