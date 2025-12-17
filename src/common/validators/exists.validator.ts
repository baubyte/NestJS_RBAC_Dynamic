import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget } from 'typeorm';

type ExistsConstraints = [EntityTarget<any>, string?];

@ValidatorConstraint({ name: 'Exists', async: true })
@Injectable()
export class ExistsValidator implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Si no hay valor, dejamos que otros validators (IsNotEmpty, etc) lo manejen
    }

    const constraints = args.constraints as ExistsConstraints;
    const entity = constraints[0];
    const column = constraints[1] ?? 'id';

    if (!entity) {
      console.error('Entity must be specified for Exists validator');
      return false;
    }

    const repository =
      this.dataSource.getRepository<Record<string, unknown>>(entity);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const whereCondition: any = { [column]: value };
    const record: Record<string, unknown> | null = await repository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: whereCondition,
    });

    return !!record;
  }

  defaultMessage(args: ValidationArguments): string {
    const constraints = args.constraints as ExistsConstraints;
    const entity = constraints[0];
    let entityName = 'Entity';
    if (typeof entity === 'function') {
      entityName = entity.name;
    } else if (typeof entity === 'string') {
      entityName = entity;
    }
    return `${entityName} with id ${args.value ?? 'unknown'} does not exist`;
  }
}

export function Exists(
  entity: EntityTarget<any>,
  column: string = 'id',
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, column],
      validator: ExistsValidator,
    });
  };
}
