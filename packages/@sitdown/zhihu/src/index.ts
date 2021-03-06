import Service from 'sitdown/dist/service';
import { applyParagraphRule } from './p';

export const applyZhihuRule = (service: Service) => {
  service.addRule('zhizhuImg', {
    filter: 'img',

    replacement: function(
      _content: string,
      node: HTMLElement & { isFormula?: boolean }
    ) {
      var formula = node.getAttribute('data-formula');
      // Info：这个图片是公式
      if (formula) {
        var isBlockFormula =
          node.parentElement &&
          node.parentElement.nodeName === 'P' &&
          node.parentElement.innerHTML === node.outerHTML;

        node.isFormula = true;
        return isBlockFormula ? `$$\n${formula}\n$$` : `$${formula}$`;
      }
      var alt = node.getAttribute('alt') || '';
      var src =
        node.getAttribute('data-actualsrc') || node.getAttribute('src') || '';
      var title = node.title || '';
      var titlePart = title ? ' "' + title + '"' : '';
      return src ? '![' + alt + ']' + '(' + src + titlePart + ')' : '';
    },
  });
  service.addRule('zhihuNoscript', {
    filter: 'noscript',

    replacement: function() {
      return '';
    },
  });
  applyParagraphRule(service);
};
