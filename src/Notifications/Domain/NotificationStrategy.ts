import { Attachment } from './Attachment';

export interface NotificationStrategy<T> {
  buildSubject(data: T): string;
  buildBody(data: T): string;
  getRecipients(data: T): string[];
  buildAttachments?(data: T): Attachment[];
}
