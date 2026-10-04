import type { Document } from "mongoose";

export abstract class BaseRepository<T> {

  constructor(
    protected model: { create(data: unknown): Promise<Document>; findById(id: string): Promise<Document | null>; findByIdAndUpdate(id: string, data: unknown, opts: { new: boolean }): Promise<Document | null>; findByIdAndDelete(id: string): Promise<Document | null> },
    protected toEntity: (document: Document) => T
  ) { }

  async create(data: Partial<T>): Promise<T> {

    const createdDocument = await this.model.create(data);

    return this.toEntity(createdDocument);

  }

  async findById(id: string): Promise<T | null> {

    const document = await this.model.findById(id);

    if (!document) {

      return null;

    }

    return this.toEntity(document);

  }

  async update(id: string, data: Partial<T>): Promise<T | null> {

    const updatedDocument = await this.model.findByIdAndUpdate(

      id,

      data,

      { new: true }

    );

    if (!updatedDocument) {
      
      return null;
    
    }

    return this.toEntity(updatedDocument);
    
  }

  async delete(id: string): Promise<boolean> {
    const deletedDocument = await this.model.findByIdAndDelete(id);
    return !!deletedDocument;
  }
}