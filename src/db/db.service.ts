import { Injectable } from '@nestjs/common';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';

@Injectable()
export class DbService<T> {
  private path = './db';
  constructor() {}

  public readFile(entity: string): T[] {
    if (!existsSync(`${this.path}/${entity}.json`)) {
      if (!existsSync(this.path)) mkdirSync(this.path);
      writeFileSync(`${this.path}/${entity}.json`, '[]');
    }

    return JSON.parse(readFileSync(`${this.path}/${entity}.json`, 'utf8'));
  }

  public writeFile(entity: string, data: T[]): void {
    writeFileSync(`${this.path}/${entity}.json`, JSON.stringify(data));
  }
}
