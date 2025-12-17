import { PartialType } from '@nestjs/swagger';
import { CreateAccessControlDto } from './create-access-control.dto';

export class UpdateAccessControlDto extends PartialType(CreateAccessControlDto) {}
