import { NotFoundException } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { v4 as uuidv4 } from 'uuid';

import { GetFileUseCase } from '../../src/File/Application/GetFileUseCase';
import { MinioService } from '../../src/File/Domain/Services/MinioService';
import { FileRepository } from '../../src/File/Infrastructure/Repositories/FileRepository';
import { Logger } from '../../src/Shared/Presentation/Utils/Logger';
import { faker } from '@faker-js/faker';

describe('GetFileUseCase - Integration Test', () =>
{
  let app: NestFastifyApplication;
  let getFileUseCase: GetFileUseCase;
  let fileRepository: FileRepository;
  let minioService: MinioService;

  beforeAll(async() =>
  {
    const testEnv = await global.getTestEnv();
    app = testEnv.app;

    getFileUseCase = app.get(GetFileUseCase);
    fileRepository = app.get(FileRepository);
    minioService = app.get(MinioService);
  });

  afterAll(async() =>
  {
    await app.close();
  });

  describe('execute', () =>
  {
    it('should return the file with a generated URL when the file exists', async() =>
    {
      const mockedUrl = 'http://mocked-url.com';
      jest.spyOn(minioService, 'getFileUrl').mockResolvedValue(mockedUrl);

      const testFile = await fileRepository.create({
        originalName: 'test-file.txt',
        mimeType: 'text/plain',
        size: 1024,
        bucketName: 'test-bucket',
        path: 'storage-path/test-file.txt',
        tenantId: faker.number.int({
          min: 100,
          max: 200
        }),
        isPublic: false
      });

      const result = await getFileUseCase.execute(testFile.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testFile.id);
      expect(result.originalName).toBe('test-file.txt');
      expect(result.path).toBe(mockedUrl);
      expect(minioService.getFileUrl).toHaveBeenCalledWith('storage-path/test-file.txt', false, 3600);
    });

    it('should throw NotFoundException when the file does not exist', async() =>
    {
      const nonExistentId = faker.number.int({
        min: 10000,
        max: 20000
      });

      await expect(getFileUseCase.execute(nonExistentId)).rejects.toThrow(
        new NotFoundException(`File with ID ${nonExistentId} not found`)
      );
    });

    it('should return the file without a URL when URL generation fails', async() =>
    {
      const errorMessage = 'Failed to generate URL';
      jest.spyOn(minioService, 'getFileUrl').mockRejectedValue(new Error(errorMessage));

      const testFile = await fileRepository.create({
        originalName: 'test-file.txt',
        mimeType: 'text/plain',
        size: 1024,
        bucketName: 'test-bucket',
        path: 'storage-path/test-file.txt',
        tenantId: faker.number.int({
          min: 100,
          max: 200
        }),
        isPublic: false
      });

      const loggerSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});

      const result = await getFileUseCase.execute(testFile.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(testFile.id);
      expect(result.originalName).toBe('test-file.txt');
      expect(result.path).toBe('storage-path/test-file.txt');
      expect(minioService.getFileUrl).toHaveBeenCalledWith('storage-path/test-file.txt', false, 3600);
      expect(loggerSpy).toHaveBeenCalledWith(`Failed to generate URL for file ${testFile.id}:`, errorMessage);
    });
  });
});
