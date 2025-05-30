import { Injectable, Logger } from '@nestjs/common';
import { Client, ClientOptions, BucketItem } from 'minio';

import { EnvService } from '../../../Config/Env/EnvService';

@Injectable()
export class MinioService
{
  private readonly client: Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly publicBucketName: string;
  private readonly privateBucketName: string;

  constructor(private readonly envService: EnvService)
  {
    const minioConfig = this.envService.minio;

    const options: ClientOptions = {
      endPoint: minioConfig.host,
      port: minioConfig.port,
      useSSL: minioConfig.useSSL,
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey
    };

    this.client = new Client(options);

    this.publicBucketName = minioConfig.publicBucket || 'public';
    this.privateBucketName = minioConfig.privateBucket || 'private';

    void this.initializeBuckets();
  }

  private async initializeBuckets(): Promise<void>
  {
    try
    {
      await this.initializeBucket(this.publicBucketName, true);
      await this.initializeBucket(this.privateBucketName, false);
    }
    catch (error)
    {
      this.logger.error(`Failed to initialize buckets: ${error.message}`);
    }
  }

  private async initializeBucket(bucketName: string, isPublic: boolean): Promise<void>
  {
    try
    {
      const bucketExists = await this.client.bucketExists(bucketName);

      if (!bucketExists)
      {
        await this.client.makeBucket(bucketName, this.envService.minio.region);
        this.logger.log(`Bucket '${bucketName}' created successfully`);

        if (isPublic)
        {
          await this.setPublicBucketPolicy(bucketName);
        }
      }
      else
      {
        this.logger.log(`Bucket '${bucketName}' already exists`);

        if (isPublic)
        {
          await this.setPublicBucketPolicy(bucketName);
        }
      }
    }
    catch (error)
    {
      this.logger.error(`Failed to initialize bucket ${bucketName}: ${error.message}`);
    }
  }

  private async setPublicBucketPolicy(bucketName: string): Promise<void>
  {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };

    await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
    this.logger.log(`Public policy set for bucket '${bucketName}'`);
  }

  /**
   * Get the appropriate bucket name based on whether the file is public or private
   */
  getBucketName(isPublic: boolean): string
  {
    return isPublic ? this.publicBucketName : this.privateBucketName;
  }

  async uploadFile(
    objectName: string,
    file: Buffer,
    isPublic: boolean
  ): Promise<string>
  {
    try
    {
      const bucketName = this.getBucketName(isPublic);

      await this.client.putObject(bucketName, objectName, file);
      this.logger.log(`File '${objectName}' uploaded to bucket '${bucketName}' successfully`);

      return objectName;
    }
    catch (error)
    {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(objectName: string, isPublic: boolean): Promise<Buffer>
  {
    try
    {
      const bucketName = this.getBucketName(isPublic);
      const dataStream = await this.client.getObject(bucketName, objectName);

      return new Promise<Buffer>((resolve, reject) =>
      {
        const chunks: Buffer[] = [];

        dataStream.on('data', (chunk) =>
        {
          chunks.push(chunk);
        });

        dataStream.on('end', () =>
        {
          resolve(Buffer.concat(chunks));
        });

        dataStream.on('error', (err) =>
        {
          reject(new Error(`Failed to download file: ${err.message}`));
        });
      });
    }
    catch (error)
    {
      this.logger.error(`Failed to download file: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async getFileUrl(objectName: string, isPublic: boolean, expiryInSeconds = 60): Promise<string>
  {
    try
    {
      const bucketName = this.getBucketName(isPublic);

      // If public, return direct URL
      if (isPublic)
      {
        const { host, port, useSSL } = this.envService.minio;
        const protocol = useSSL ? 'https' : 'http';
        return `${protocol}://${host}:${port}/${bucketName}/${objectName}`;
      }

      return await this.client.presignedGetObject(bucketName, objectName, expiryInSeconds);
    }
    catch (error)
    {
      this.logger.error(`Failed to generate URL: ${error.message}`);
      throw new Error(`Failed to generate URL: ${error.message}`);
    }
  }

  async listFiles(isPublic: boolean, prefix?: string): Promise<BucketItem[]>
  {
    try
    {
      const bucketName = this.getBucketName(isPublic);
      const stream = this.client.listObjectsV2(bucketName, prefix, true);
      const items: BucketItem[] = [];

      return new Promise<BucketItem[]>((resolve, reject) =>
      {
        stream.on('data', (item) =>
        {
          items.push(item);
        });

        stream.on('error', (err) =>
        {
          reject(new Error(`Failed to list files: ${err.message}`));
        });

        stream.on('end', () =>
        {
          resolve(items);
        });
      });
    }
    catch (error)
    {
      this.logger.error(`Failed to list files: ${error.message}`);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }
}
