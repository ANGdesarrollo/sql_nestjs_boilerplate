import { Module } from '@nestjs/common';

import { AuthControllers } from './Presentation/Controllers';

@Module({
  imports: [],
  controllers: [...AuthControllers],
  providers: []
})
export class AuthModule {}
