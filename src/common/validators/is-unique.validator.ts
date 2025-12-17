import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget } from 'typeorm';

type IsUniqueConstraints = [EntityTarget<any>, string, string?];

@ValidatorConstraint({ name: 'IsUnique', async: true })
@Injectable()
export class IsUniqueValidator implements ValidatorConstraintInterface {
  constructor(private readonly dataSource: DataSource) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) {
      return true; // Si no hay valor, dejamos que otros validators (IsNotEmpty, etc) lo manejen
    }

    const constraints = args.constraints as IsUniqueConstraints;
    const entity = constraints[0];
    const column = constraints[1];
    const excludeColumn = constraints[2]; // ej: 'id' para excluir el registro actual

    if (!entity || !column) {
      console.error(
        'Entity and column must be specified for IsUnique validator',
      );
      return false;
    }

    const repository =
      this.dataSource.getRepository<Record<string, unknown>>(entity);

    // Construir la condición where
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const whereCondition: any = { [column]: value };

    const record: Record<string, unknown> | null = await repository.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: whereCondition,
    });

    // Si no existe ningún registro con ese valor, es único
    if (!record) {
      return true;
    }

    // Si existe un registro pero debemos excluir el actual (para actualizaciones)
    if (excludeColumn) {
      const excludeValue = (args.object as Record<string, unknown>)[
        excludeColumn
      ];

      // Si el registro encontrado tiene el mismo ID que estamos excluyendo, es válido
      if (excludeValue && record[excludeColumn] === excludeValue) {
        return true;
      }
    }

    // Existe un registro duplicado
    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    const constraints = args.constraints as IsUniqueConstraints;
    const entity = constraints[0];
    const column = constraints[1];

    let entityName = 'Entity';
    if (typeof entity === 'function') {
      entityName = entity.name;
    } else if (typeof entity === 'string') {
      entityName = entity;
    }
    return `${entityName} with ${column} "${args.value ?? 'unknown'}" already exists`;
  }
}

export function IsUnique(
  entity: EntityTarget<any>,
  column: string,
  excludeColumn?: string,
  validationOptions?: ValidationOptions,
) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entity, column, excludeColumn],
      validator: IsUniqueValidator,
    });
  };
}
