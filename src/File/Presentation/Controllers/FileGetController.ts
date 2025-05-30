// src/File/Presentation/Controllers/FileController.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  Res,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

import { RequestWithUserPayload } from '../../../Auth/Domain/Payloads/RequestWithUserPayload';
import { AuthGuard } from '../../../Auth/Presentation/Guards/AuthGuard';
import { DownloadFileUseCase } from '../../Application/DownloadFileUseCase';
import { GetFileUseCase } from '../../Application/GetFileUseCase';
import { UploadFileUseCase } from '../../Application/UploadFileUseCase';


@Controller('files')
export class FileGetController
{
  constructor(
    private readonly downloadFileUseCase: DownloadFileUseCase,
    private readonly getFileUseCase: GetFileUseCase
  ) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async getFile(@Param('id') id: number)
  {
    try
    {
      const file = await this.getFileUseCase.execute(id);

      return {
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        bucketName: file.bucketName,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      };
    }
    catch (error)
    {
      if (error instanceof NotFoundException)
      {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get file: ${error.message}`);
    }
  }

  @Get(':id/download')
  @UseGuards(AuthGuard)
  async downloadFile(
    @Param('id') id: number,
    @Req() request: RequestWithUserPayload,
    @Res() reply: FastifyReply
  )
  {
    try
    {
      const downloadResult = await this.downloadFileUseCase.execute({
        fileId: id
      });

      reply.header('Content-Type', downloadResult.mimeType);
      reply.header('Content-Disposition', `attachment; filename="${downloadResult.originalName}"`);

      return reply.send(downloadResult.file);
    }
    catch (error)
    {
      if (error instanceof NotFoundException)
      {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to download file: ${error.message}`);
    }
  }
}
