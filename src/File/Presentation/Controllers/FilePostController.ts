//@ts-nocheck
import { BadRequestException, Controller, InternalServerErrorException, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

import { RequestWithUserPayload } from '../../../Auth/Domain/Payloads/RequestWithUserPayload';
import { RequirePermissions } from '../../../Auth/Presentation/Decorators/RequirePermissions';
import { AuthGuard } from '../../../Auth/Presentation/Guards/AuthGuard';
import { Permissions } from '../../../Config/Permissions';
import { UploadFileUseCase } from '../../Application/UploadFileUseCase';

@Controller('files')
export class FilePostController
{
  constructor(private readonly uploadFileUseCase: UploadFileUseCase) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @RequirePermissions(Permissions.FILE.UPLOAD)
  async uploadFile(
    @Req() request: FastifyRequest & RequestWithUserPayload,
    @Query('isPublic') isPublic: string = 'false',
    @Query('path') path?: string
  )
  {
    try
    {
      const data = await request.file();

      if (!data)
      {
        throw new BadRequestException('No file uploaded');
      }

      const file = await data.toBuffer();
      const { mimetype, filename } = data;

      const { tenantId } = request.user;

      const isFilePublic = isPublic.toLowerCase() === 'true';

      return this.uploadFileUseCase.execute({
        file,
        originalName: filename,
        mimeType: mimetype,
        bucketName: '',
        path,
        tenantId,
        isPublic: isFilePublic
      });
    }
    catch (error)
    {
      if (error instanceof BadRequestException)
      {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }
}
