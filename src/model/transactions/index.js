import Model from '../Model';
import Account from '../accounts';
import schema from './schema';

export default class Transaction extends Model {
  constructor(db, userId) {
    super(db, userId);
    this.collName = 'transactions';
    this.schema = schema;
  }

  async post({
    source, destination, amount, createdAt = new Date(),
  }, session) {
    const Accounts = new Account(this.db, this.userId);
    const sourceAccount = await Accounts.findByName(source);
    const destAccount = await Accounts.findByName(destination);

    if (!sourceAccount) {
      throw new Error(`Account "${source}" not found`);
    }
    if (!destAccount) {
      throw new Error(`Account "${destination}" not found`);
    }

    const transObj = {
      source: { name: sourceAccount.name, type: sourceAccount.type },
      destination: { name: destAccount.name, type: destAccount.type },
      amount,
      createdAt,
    };
    // TODO: apply to budget
    const insertedId = await this.postFunc(transObj, session);
    return insertedId;
  }

  async postFunc(transObj, session) {
    try {
      session.startTransaction();
      const { insertedId } = await super.insertOne(transObj, { session });
      const Accounts = new Account(this.db, this.userId);
      await Accounts.addAmount(transObj.source.name, -transObj.amount, session);
      await Accounts.addAmount(transObj.destination.name, transObj.amount, session);
      await session.commitTransaction();
      return insertedId;
    } catch (error) {
      await session.abortTransaction();
      if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') >= 0) {
        // console.log('TransientTransactionError, retrying transaction ...');
        return this.postFunc(transObj, session);
      }
      throw error;
    }
  }

  async unpost(_id, session) {
    try {
      session.startTransaction();
      const { value } = await super.findOneAndDelete(
        { _id },
        { projection: { source: 1, destination: 1, amount: 1 } },
      );
      if (!value) { throw new Error('Transaction not found'); }
      const { source, destination, amount } = value;
      const Accounts = new Account(this.db, this.userId);
      await Accounts.addAmount(source.name, amount, session);
      await Accounts.addAmount(destination.name, -amount, session);
      // TODO: apply to budget
    } catch (e) {
      await session.abortTransaction();
      throw e;
    }

    await session.commitTransaction();
  }

  async update(_id, {
    source, destination, amount, createdAt,
  }, session) {
    const trans = await super.findOne({ _id });
    if (!trans) { throw new Error('Transaction not found'); }

    if (source || destination || amount) {
      await this.unpost(_id, session);
      const transObj = {
        source: source || trans.source.name,
        destination: destination || trans.destination.name,
        amount: amount || trans.amount,
        createdAt: createdAt || trans.createdAt,
      };

      const insertedId = await this.post(transObj, session);
      return insertedId;
    }
    if (createdAt) {
      await super.updateOne({ _id }, { $set: { createdAt } });
      return _id;
    }
    return null;
  }
}
