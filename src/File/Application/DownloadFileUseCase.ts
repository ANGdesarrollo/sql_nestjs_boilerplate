import { Injectable, NotFoundException } from '@nestjs/common';

import { DownloadFilePayload } from '../Domain/Payloads/FilePayload';
import { MinioService } from '../Domain/Services/MinioService';
import { FileRepository } from '../Infrastructure/Repositories/FileRepository';

interface DownloadResult {
  file: Buffer;
  originalName: string;
  mimeType: string;
}

@Injectable()
export class DownloadFileUseCase
{
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly minioService: MinioService
  ) {}

  async execute(payload: DownloadFilePayload): Promise<DownloadResult>
  {
    const fileMetadata = await this.fileRepository.findOneBy({ id : payload.fileId });

    if (!fileMetadata)
    {
      throw new NotFoundException(`File with ID ${payload.fileId} not found`);
    }

    const fileBuffer = await this.minioService.downloadFile(
      fileMetadata.path,
      fileMetadata.isPublic
    );

    return {
      file: fileBuffer,
      originalName: fileMetadata.originalName,
      mimeType: fileMetadata.mimeType
    };
  }
}
