import TurndownService from 'turndown';
import { applyListRule } from './plugins/list';
import { applyHrRule } from './plugins/hr';
import { applyParagraphRule } from './plugins/paragraph';

export class Sitdown {
  defaultOptions: TurndownService.Options;
  service: TurndownService;

  constructor(options?: TurndownService.Options) {
    this.defaultOptions = { headingStyle: 'atx' };
    this.service = new TurndownService({
      ...this.defaultOptions,
      ...options,
    });
    applyListRule(this.service);
    applyHrRule(this.service);
    applyParagraphRule(this.service);
  }

  HTMLToMD(html: string) {
    return this.service.turndown.call(this.service, html);
  }
}
