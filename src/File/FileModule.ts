import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { FileUseCases } from './Application';
import { MinioService } from './Domain/Services/MinioService';
import { FileRepository } from './Infrastructure/Repositories/FileRepository';
import { FileEntity } from './Infrastructure/Schemas/FileSchema';
import { FileControllers } from './Presentation/Controllers';

@Module({
  controllers: [
    ...FileControllers
  ],
  providers: [
    ...FileUseCases,
    FileRepository,
    MinioService,
    {
      provide: 'FILE_REPOSITORY',
      useFactory: (dataSource: DataSource) => dataSource.getRepository(FileEntity),
      inject: ['DATA_SOURCE']
    }
  ]
})

export class FileModule {}
