import { Injectable, NotFoundException } from '@nestjs/common';

import { FileDomain } from '../Domain/Entities/FileDomain';
import { FileRepository } from '../Infrastructure/Repositories/FileRepository';

@Injectable()
export class GetFileUseCase
{
  constructor(
    private readonly fileRepository: FileRepository
  ) {}

  async execute(fileId: string): Promise<FileDomain>
  {
    const file = await this.fileRepository.findOneBy('id', fileId);

    if (!file)
    {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    return file;
  }
}
