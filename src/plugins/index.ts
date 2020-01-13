import TurndownService from '../../lib/turndown';
// @ts-ignore
import * as turndownPluginGfm from 'turndown-plugin-gfm';
import { applyListRule } from './list';
import { applyHrRule } from './hr';
import { applyParagraphRule } from './paragraph';
import { applyHeadingRule } from './heading';
import { applyFenceRule } from './fencedCodeBlock';
import { applyCodeRule } from './code';
import { applyReferenceLinkRule } from './referenceLinks';
const gfm = turndownPluginGfm.gfm;
const tables = turndownPluginGfm.tables;
const strikethrough = turndownPluginGfm.strikethrough;

const filters = ['div', 'style'];
export default (turndownService: TurndownService) => {
  turndownService.use([
    applyListRule,
    applyHrRule,
    applyParagraphRule,
    applyHeadingRule,
    applyFenceRule,
    applyCodeRule,
    applyReferenceLinkRule,
  ]);

  // turndownService.keep(['div', 'style']);
  turndownService.keep(node => {
    const isKeep = filters.some(
      filter => filter === node.nodeName.toLowerCase()
    );
    if (isKeep) {
      if (node.parentNode) {
        const index = Array.from(node.parentNode.childNodes).findIndex(
          n => n === node
        );
        const next: ChildNode & { unNeedEscape?: boolean } =
          node.parentNode.childNodes[index + 1];
        next && (next.unNeedEscape = true);
      }
      return true;
    }
    return false;
  });

  // Use the gfm plugin
  turndownService.use(gfm);

  // Use the table and strikethrough plugins only
  turndownService.use([tables, strikethrough]);
};
