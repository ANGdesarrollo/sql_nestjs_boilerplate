import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BaseTypeOrmRepositoryImpl } from '../../../Shared/Infrastructure/BaseTypeOrmRepositoryImpl';
import { FileDomain } from '../../Domain/Entities/FileDomain';
import { FilePayload } from '../../Domain/Payloads/FilePayload';

@Injectable()
export class FileRepository extends BaseTypeOrmRepositoryImpl<FilePayload, FileDomain>
{
  constructor(
    @Inject('FILE_REPOSITORY')
      fileRepository: Repository<FileDomain>
  )
  {
    super(fileRepository, 'FileEntity');
  }

  async findByPath(path: string, bucketName: string): Promise<FileDomain | null>
  {
    try
    {
      return await this.repository.findOne({
        where: { path, bucketName }
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByPath');
    }
  }

  async findByTenantId(tenantId: number): Promise<FileDomain[]>
  {
    try
    {
      return await this.repository.find({
        where: { tenantId }
      });
    }
    catch (error)
    {
      this.handleTypeOrmError(error, 'findByTenantId');
    }
  }
}


