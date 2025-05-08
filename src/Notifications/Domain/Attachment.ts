export interface Attachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}
