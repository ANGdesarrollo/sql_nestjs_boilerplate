import { NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { DownloadFileUseCase } from '../../src/File/Application/DownloadFileUseCase';
import { FileDomain } from '../../src/File/Domain/Entities/FileDomain';
import { DownloadFilePayload } from '../../src/File/Domain/Payloads/FilePayload';
import { MinioService } from '../../src/File/Domain/Services/MinioService';
import { FileRepository } from '../../src/File/Infrastructure/Repositories/FileRepository';

describe('DownloadFileUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let downloadFileUseCase: DownloadFileUseCase;
  let fileRepository: FileRepository;
  let minioService: MinioService;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    downloadFileUseCase = app.get(DownloadFileUseCase);
    fileRepository = app.get(FileRepository);
    minioService = app.get(MinioService);

    jest.spyOn(minioService, 'downloadFile').mockImplementation(async(path: string, isPublic: boolean) =>
    {
      return Buffer.from('mocked file content');
    });
  });

  afterAll(async() =>
  {
    await app.close();
  });

  describe('execute', () =>
  {
    it('should download the file and return the expected result when it exists', async() =>
    {
      const testFile = await fileRepository.create({
        originalName: 'test-file.txt',
        mimeType: 'text/plain',
        size: 1024,
        bucketName: 'test-bucket',
        path: 'test-path/test-file.txt',
        tenantId: 'test-tenant',
        isPublic: false
      });

      const payload: DownloadFilePayload = { fileId: testFile.id };

      const result = await downloadFileUseCase.execute(payload);

      expect(result).toBeDefined();
      expect(result.file).toBeInstanceOf(Buffer);
      expect(result.file.toString()).toBe('mocked file content');
      expect(result.originalName).toBe('test-file.txt');
      expect(result.mimeType).toBe('text/plain');

      // Verify that downloadFile was called correctly
      expect(minioService.downloadFile).toHaveBeenCalledTimes(1);
      expect(minioService.downloadFile).toHaveBeenCalledWith('test-path/test-file.txt', false);
    });

    it('should throw NotFoundException when the file does not exist', async() =>
    {
      const nonExistentFileId = uuidv4();
      const payload: DownloadFilePayload = { fileId: nonExistentFileId };

      const file = await fileRepository.findOneBy({ id: nonExistentFileId });
      expect(file).toBeNull();

      await expect(downloadFileUseCase.execute(payload)).rejects.toThrow(
        new NotFoundException(`File with ID ${nonExistentFileId} not found`)
      );
    });
  });
});
