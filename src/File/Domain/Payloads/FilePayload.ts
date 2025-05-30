export interface FilePayload {
  originalName: string;
  mimeType: string;
  size: number;
  bucketName: string;
  path: string;
  tenantId?: number;
  isPublic: boolean;
}

export interface UploadFilePayload {
  file: Buffer;
  originalName: string;
  mimeType: string;
  bucketName: string;
  path?: string;
  tenantId?: number;
  isPublic: boolean;
}

export interface DownloadFilePayload {
  fileId: number;
}
