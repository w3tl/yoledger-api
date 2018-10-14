import {
  User, Account, Transaction, Budget,
} from '../model';

export default async function initDb(client) {
  const db = client.db();
  // COMBAK: indexes
  const userModel = new User(db, 'admin');
  userModel.init();
  const admin = await userModel.findOne();
  if (!admin) {
    await userModel.create({ password: 'password' });
  }

  const Accounts = new Account(db, 'admin');
  await Accounts.init();

  const Transactions = new Transaction(db, 'admin');
  await Transactions.init();

  const Budgets = new Budget(db, 'admin');
  await Budgets.init();
}
