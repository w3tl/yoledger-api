import { ObjectId } from 'mongodb';

export default class Model {
  constructor(db, userId) {
    this.db = db;
    this.userId = userId;
  }

  async init() {
    const validator = {
      $jsonSchema: this.schema,
    };
    const collections = await this.db.collections();
    if (collections.indexOf(this.collName) === -1) {
      await this.db.createCollection(this.collName, {
        validator,
      });
    } else {
      await this.db.command({
        collMod: this.collName,
        validator,
      });
    }
  }

  get collection() { return this.db.collection(this.collName); }

  clear() {
    return this.collection.deleteMany({ userId: this.userId });
  }

  deleteOne(filter = {}, options) {
    filter.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.deleteOne(filter, options);
  }

  find(query = {}, options) {
    query.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.find(query, options);
  }

  findOne(query = {}, options) {
    query.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.findOne(query, options);
  }

  findById(id, options) {
    return this.collection.findOne({ _id: ObjectId(id) }, options);
  }

  findOneAndDelete(filter = {}, options) {
    filter.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.findOneAndDelete(filter, options);
  }

  insertOne(doc = {}, options) {
    doc.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.insertOne(doc, options);
  }

  insertMany(docs, options) {
    const docsWithUserId = docs.map(doc => ({ ...doc, ...{ userId: this.userId } }));
    return this.collection.insertMany(docsWithUserId, options);
  }

  updateOne(filter = {}, update, options) {
    filter.userId = this.userId; // eslint-disable-line no-param-reassign
    return this.collection.updateOne(filter, update, options);
  }

  aggregate(pipeline, options) {
    let [firstPipe, ...pipes] = pipeline; // eslint-disable-line prefer-const
    if ('$match' in firstPipe) {
      firstPipe.$match.userId = this.userId;
      return this.collection.aggregate([firstPipe, ...pipes], options);
    }
    firstPipe = { $match: { userId: this.userId } };
    return this.collection.aggregate([firstPipe, ...pipeline], options);
  }
}
