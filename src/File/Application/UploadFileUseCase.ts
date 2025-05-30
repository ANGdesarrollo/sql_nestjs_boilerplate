import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { FileDomain } from '../Domain/Entities/FileDomain';
import { UploadFilePayload } from '../Domain/Payloads/FilePayload';
import { MinioService } from '../Domain/Services/MinioService';
import { FileRepository } from '../Infrastructure/Repositories/FileRepository';

@Injectable()
export class UploadFileUseCase
{
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly minioService: MinioService
  ) {}

  async execute(payload: UploadFilePayload): Promise<FileDomain>
  {
    const filePath = payload.path || this.generateFilePath(payload.originalName);

    await this.minioService.uploadFile(
      filePath,
      payload.file,
      payload.isPublic
    );

    const bucketName = this.minioService.getBucketName(payload.isPublic);

    const fileMetadata = {
      originalName: payload.originalName,
      mimeType: payload.mimeType,
      size: payload.file.length,
      bucketName,
      path: filePath,
      tenantId: payload.tenantId,
      isPublic: payload.isPublic
    };

    return this.fileRepository.create(fileMetadata);
  }

  private generateFilePath(originalName: string): string
  {
    const uniqueId = uuidv4();
    const fileExtension = originalName.split('.').pop() || '';
    return `${uniqueId}${fileExtension ? `.${  fileExtension}` : ''}`;
  }
}
