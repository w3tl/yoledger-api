import Model from '../Model';
import Account from '../accounts';
import schema from './schema';

export default class Budget extends Model {
  constructor(db, userId) {
    super(db, userId);
    this.collName = 'budget';
    this.schema = schema;
  }

  async upsertBudget({ account, date, amount }) {
    const accountModel = new Account(this.db, this.userId);
    const accountDoc = await accountModel.findByName(account, {
      projection: { _id: 0, name: 1, type: 1 },
    });
    if (!accountDoc) {
      throw new Error(`Account "${account}" not found`);
    }
    const periodDate = typeof date === 'string'
      ? new Date(date) : date;
    const { upsertedId, modifiedCount } = await super.updateOne({
      date: periodDate, account: accountDoc,
    }, {
      $set: { amount },
    }, {
      upsert: true,
    });
    return upsertedId || modifiedCount;
  }
}
