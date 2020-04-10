import { escape } from '../util';
import Service from '../service';
import { Node, Options } from '../types';
const escapes: [
  RegExp,
  string | ((substring: string, ...args: any[]) => string)
][] = [
  [
    /(.*)\|(.*)/g,
    (match, p1, p2) => {
      if (match.match(/\`.*\|.*\`/)) {
        return `${p1}\|${p2}`;
      }
      return `${p1}\\|${p2}`;
    },
  ],
];

var every = Array.prototype.every;
var indexOf = Array.prototype.indexOf;

function cell(content: string, node: Node, options?: Options) {
  var index = node.parentNode
    ? indexOf.call(node.parentNode.childNodes, node)
    : -1;
  var prefix = ' ';
  if (options && options.convertNoHeaderTable) {
    content = content.replace(/\n+/g, '<br>');
  }
  if (index === 0) prefix = '| ';
  return prefix + escape(escapes, content) + ' |';
}
function isFirstTbody(element: Node & ParentNode) {
  var previousSibling = element.previousSibling;
  return (
    element.nodeName === 'TBODY' &&
    (!previousSibling ||
      (previousSibling.nodeName === 'THEAD' &&
        /^\s*$/i.test(previousSibling.textContent || '')))
  );
}
function isHeadingRow(tr: Node) {
  var parentNode = tr.parentNode;
  return parentNode
    ? parentNode.nodeName === 'THEAD' ||
        (parentNode.firstChild === tr &&
          (parentNode.nodeName === 'TABLE' ||
            isFirstTbody(parentNode as Node)) &&
          every.call(tr.childNodes, function(n: HTMLElement) {
            return n.nodeName === 'TH';
          }))
    : false;
}

export const applyTableRule = (service: Service) => {
  service.keep(function(node: Node) {
    return (
      node.nodeName === 'TABLE' &&
      !isHeadingRow((node as HTMLTableElement).rows[0])
    );
  });

  service.addRule('table', {
    filter: function(node) {
      return (
        node.nodeName === 'TABLE' &&
        isHeadingRow((node as HTMLTableElement).rows[0])
      );
    },

    replacement: function(content) {
      // Ensure there are no blank lines
      content = content.replace('\n\n', '\n');
      return '\n\n' + content + '\n\n';
    },
  });

  service.addRule('tableSection', {
    filter: ['thead', 'tbody', 'tfoot'],
    replacement: function(content: string) {
      return content;
    },
  });

  service.addRule('tableRow', {
    filter: 'tr',
    replacement: function(content, node) {
      var borderCells = '';
      const alignMap: { [key: string]: string } = {
        left: ':--',
        right: '--:',
        center: ':-:',
      };

      if (isHeadingRow(node)) {
        for (var i = 0; i < node.childNodes.length; i++) {
          var border = '---';
          const curNode = node.childNodes[i] as HTMLElement;
          var align = (
            curNode.getAttribute('align') ||
            curNode.style.textAlign ||
            ''
          ).toLowerCase();

          if (align) border = alignMap[align] || border;

          borderCells += cell(border, curNode);
        }
      }
      return '\n' + content + (borderCells ? '\n' + borderCells : '');
    },
  });

  service.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: function(content: string, node: Node, options) {
      return cell(content, node, options);
    },
  });

  service.addRule('noHeaderTable', {
    filter: function(node, options) {
      const hasHead = Array.from(node.childNodes).some(
        n => n.nodeName === 'THEAD'
      );
      if (
        node.nodeName === 'TABLE' &&
        !hasHead &&
        options.convertNoHeaderTable
      ) {
        try {
          const tr = node.querySelector('tr');
          if (tr) {
            const length = tr.cells.length;
            const header = (node as HTMLTableElement).createTHead();
            const row = header.insertRow(0);
            // console.dir(node);
            for (let i = 0; i < length; i++) {
              const cell = row.insertCell(i);
              cell.innerHTML = ' ';
            }
          }
        } catch (e) {
          console.log(e);
          return false;
        }
        return true;
      }
      return false;
    },

    replacement: function(content) {
      return content;
    },
  });
};
