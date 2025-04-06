// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class CreateSuperUserCliCommand
// {
//   constructor(private readonly createSuperUserUseCase: CreateSuperUserUseCase)
//   {
//   }
//
//   async run(): Promise<void>
//   {
//     try
//     {
//       await this.createSuperUserUseCase.execute();
//       console.log('Super user has been created successfully');
//       process.exit(0);
//     }
//     catch (error)
//     {
//       console.error('Error while creating super user:', error.message);
//       process.exit(1);
//     }
//   }
// }
