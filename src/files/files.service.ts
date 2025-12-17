import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

    getImageProduct(imageName: string) {

        const path = join(__dirname, '../../static/uploads', imageName);
        if (!existsSync(path))
            throw new BadRequestException(`No se encontro la imagen del producto ${imageName}`)

        return path
    }

}

