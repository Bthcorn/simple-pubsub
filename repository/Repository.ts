export interface IRepository<T> {
  findById(id: string): T | undefined;
  add(object: T): void;
  remove(id: string): void;
  update(id: string, object: T): void;
}
