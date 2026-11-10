import { importedPages } from './upstream.mjs';
// Documentation navigation: groups of [Markdown source, label]. scripts/site-links.test.mjs
// fails when a published page is missing here, so new pages cannot be forgotten.
export const navigation = [
  ['Set up', [
    ['docs/moduletwo.md', 'ModuleTwo setup'],
    ['docs/voltbridge.md', 'VoltBridge setup'],
  ]],
  ['Reference', [
    ['docs/voltbridge-api.md', 'VoltBridge API'],
    ['docs/architecture.md', 'Architecture'],
  ]],
  ['Upstream guides', importedPages.filter(page => !['docs/moduletwo.md', 'docs/voltbridge.md', 'docs/voltbridge-api.md'].includes(page.source)).map(page => [page.source, page.title])],
  ['Project', [
    ['site/README.md', 'Website development'],
  ]],
];
