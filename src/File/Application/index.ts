import { DownloadFileUseCase } from './DownloadFileUseCase';
import { GetFileUseCase } from './GetFileUseCase';
import { UploadFileUseCase } from './UploadFileUseCase';

export const FileUseCases = [
  UploadFileUseCase,
  DownloadFileUseCase,
  GetFileUseCase
];
