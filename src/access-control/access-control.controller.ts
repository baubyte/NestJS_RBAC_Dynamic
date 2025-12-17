import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { CreateAccessControlDto } from './dto/create-access-control.dto';
import { UpdateAccessControlDto } from './dto/update-access-control.dto';

@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Post()
  create(@Body() createAccessControlDto: CreateAccessControlDto) {
    return this.accessControlService.create(createAccessControlDto);
  }

  @Get()
  findAll() {
    return this.accessControlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessControlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccessControlDto: UpdateAccessControlDto) {
    return this.accessControlService.update(+id, updateAccessControlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessControlService.remove(+id);
  }
}
