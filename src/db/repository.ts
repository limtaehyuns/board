import { NotFoundException } from '@nestjs/common';
import { DbService } from './db.service';
// import { Pagination, PaginationResult } from 'src/interface/Pagination';
import { Where } from 'src/interface/Query';

export class Repository<T> extends DbService<T> {
  constructor(private readonly entity: string) {
    super();
  }

  public async lastId(): Promise<number> {
    const items = await this.readFile(this.entity);
    return items.length ? items[items.length - 1]['id'] : 0;
  }

  public async findAll(): Promise<T[]> {
    return await this.where({});
  }

  public async findOne(where: Where<T>): Promise<T> {
    const data = await this.where(where);
    if (data.length < 1) throw new NotFoundException('resource not found');

    return data[0];
  }

  public async where(where: Where<T>): Promise<T[]> {
    const queryResult = (await this.readFile(this.entity)).filter((item) => {
      for (const key in where) {
        if (where[key] instanceof Object) {
          const operator = Object.keys(where[key])[0];
          const value = where[key][operator];
          if (value === undefined) return true;

          switch (operator) {
            case '$eq':
              if (item[key] !== value) return false;
              break;
            case '$in':
              if (!value.includes(item[key])) return false;
              break;
            case '$like':
              if (!item[key].includes(value)) return false;
              break;
            case '$gt':
              if (item[key] <= value) return false;
              break;
            case '$gte':
              if (item[key] < value) return false;
              break;
            case '$lt':
              if (item[key] >= value) return false;
              break;
            case '$lte':
              if (item[key] > value) return false;
              break;
            default:
              break;
          }
        }
      }

      return true;
    });

    // console.log(queryResult);
    return queryResult;
  }

  // public async insert(data: T): Promise<T> {
  //   this.writeFile(this.entity, [...this.readFile(this.entity), data]);

  //   return this.findOne(data);
  // }

  public async update(data: T, where: Partial<T>): Promise<void> {
    const item = await this.findOne(where);
    if (!item) throw new NotFoundException('resource not found');

    const index = this.readFile(this.entity).indexOf(item);
    const items = this.readFile(this.entity);
    items[index] = data;

    this.writeFile(this.entity, items);
  }

  public async delete(where: Partial<T>): Promise<void> {
    const item = await this.findOne(where);
    if (!item) throw new NotFoundException('resource not found');

    const index = this.readFile(this.entity).indexOf(item);
    const items = this.readFile(this.entity);
    items.splice(index, 1);

    this.writeFile(this.entity, items);
  }
}
