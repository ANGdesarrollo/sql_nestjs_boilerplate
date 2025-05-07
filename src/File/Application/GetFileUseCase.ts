import { Injectable, NotFoundException } from '@nestjs/common';

import { Logger } from '../../Shared/Presentation/Utils/Logger';
import { FileDomain } from '../Domain/Entities/FileDomain';
import { MinioService } from '../Domain/Services/MinioService';
import { FileRepository } from '../Infrastructure/Repositories/FileRepository';

interface FileWithUrl extends FileDomain {
  url?: string;
}

@Injectable()
export class GetFileUseCase
{
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly minioService: MinioService
  ) {}

  async execute(fileId: string): Promise<FileWithUrl>
  {
    const file = await this.fileRepository.findOneBy('id', fileId);

    if (!file)
    {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }


    try
    {
      const url = await this.minioService.getFileUrl(file.path, file.isPublic, 3600);
      return { ...file, path: url };
    }
    catch (error)
    {
      Logger.error(`Failed to generate URL for file ${fileId}:`, error.message);
      return file;
    }
  }
}
