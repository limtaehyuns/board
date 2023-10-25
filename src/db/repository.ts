import { NotFoundException } from '@nestjs/common';
import { DbService } from './db.service';
import { Pagination, PaginationResult } from 'src/interface/Pagination';
import { Where } from 'src/interface/Query';

export class Repository<T> extends DbService<T> {
  constructor(private readonly entity: string) {
    super();
  }

  public pagination(items: T[], pagination: Pagination): PaginationResult<T> {
    const { page, limit } = pagination;

    return {
      pagination: {
        limit,
        page: items.length / limit,
        total: items.length,
      },
      data: items.slice((page - 1) * limit, page * limit),
    };
  }

  public async lastId(): Promise<number> {
    const items = await this.readFile(this.entity);
    return items.length ? items[items.length - 1]['id'] : 0;
  }

  public async findAll(pagination: Pagination): Promise<PaginationResult<T>> {
    return this.pagination(await this.where({}), pagination);
  }

  public async findOne(where: Where<T>): Promise<T> {
    const data = await this.where(where);
    if (data.length < 1) throw new NotFoundException('resource not found');

    return data[0];
  }

  public async where(where: Where<T>): Promise<T[]> {
    console.log(where);
    const queryResult = (await this.readFile(this.entity)).filter((item) => {
      for (const key in where) {
        if (where[key]['$eq'] && where[key]['$eq'] !== undefined) {
          if (item[key] !== where[key]['$eq']) return false;
        } else if (where[key]['$in'] && where[key]['$in'] !== undefined) {
          if (!where[key]['$in'].includes(item[key])) return false;
        } else if (item[key] !== where[key]) return false;
      }

      return true;
    });

    // console.log(queryResult);
    return queryResult;
  }

  public async insert(data: T): Promise<T> {
    this.writeFile(this.entity, [...this.readFile(this.entity), data]);

    return this.findOne(data);
  }

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
