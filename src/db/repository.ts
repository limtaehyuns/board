import { NotFoundException } from '@nestjs/common';
import { DbService } from './db.service';
import { Pagination } from 'src/interface/Pagination';

export class Repository<T> extends DbService<T> {
  constructor(private readonly entity: string) {
    super();
  }

  private async pagination(items: T[], pagination: Pagination): Promise<T[]> {
    const { page, limit } = pagination;
    return items.slice(page * limit, (page + 1) * limit);
  }

  public async lastId(): Promise<number> {
    const items = await this.readFile(this.entity);
    return items.length ? items[items.length - 1]['id'] : 0;
  }

  public async findAll(pagination: Pagination): Promise<T[]> {
    return this.pagination(await this.readFile(this.entity), pagination);
  }

  public async findOne(where: Partial<T>): Promise<T> {
    const data = await this.where(where, { page: 0, limit: 1 });
    if (data.length < 1) throw new NotFoundException('resource not found');

    return data[0];
  }

  public async where(where: Partial<T>, pagination: Pagination): Promise<T[]> {
    return this.pagination(
      await this.readFile(this.entity).filter((item) => {
        for (const key in where) {
          if (item[key] !== where[key]) return false;
        }
        return true;
      }),
      pagination,
    );
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
