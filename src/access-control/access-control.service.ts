import { Injectable } from '@nestjs/common';
import { CreateAccessControlDto } from './dto/create-access-control.dto';
import { UpdateAccessControlDto } from './dto/update-access-control.dto';

@Injectable()
export class AccessControlService {
  create(createAccessControlDto: CreateAccessControlDto) {
    return 'This action adds a new accessControl';
  }

  findAll() {
    return `This action returns all accessControl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accessControl`;
  }

  update(id: number, updateAccessControlDto: UpdateAccessControlDto) {
    return `This action updates a #${id} accessControl`;
  }

  remove(id: number) {
    return `This action removes a #${id} accessControl`;
  }
}
