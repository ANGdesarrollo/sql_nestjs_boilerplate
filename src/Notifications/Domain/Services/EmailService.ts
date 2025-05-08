export abstract class EmailService
{
  abstract send(params: {
    to: string[];
    subject: string;
    body: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[];
  }): Promise<void>;
}
