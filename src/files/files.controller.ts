import { diskStorage } from 'multer';
import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Res, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import type { Response } from 'express';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helpers';
import { fileNamer } from './helpers/fileNamer.helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }

  @Get('product/:imageName')
  getImageProduct(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ) {

    const path = this.filesService.getImageProduct(imageName)

    res.sendFile(path)
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/uploads',
      filename: fileNamer
    })
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File) {

    if (!file)
      return new BadRequestException('No se envio ningun archivo')

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`

    return { secureUrl }
  }

}
