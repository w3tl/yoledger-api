import {
  User, Account, Transaction, Budget,
} from '../model';
import accounts from '../../mocks/accounts';
import transactions from '../../mocks/transactions';
import budgets from '../../mocks/budgets';

export default async function fillDB(client) {
  const db = client.db();

  const userModel = new User(db, 'admin');
  await userModel.clear();
  await userModel.create({ password: 'password' });

  const Accounts = new Account(db, 'admin');
  await Accounts.clear();
  const promises = accounts.map(Accounts.create.bind(Accounts));
  await Promise.all(promises);

  const Transactions = new Transaction(db, 'admin');
  await Transactions.clear();

  await Promise.all(
    transactions.map(
      trans => client.withSession(s => Transactions.post(trans, s)),
    ),
  );

  const budgetModel = new Budget(db, 'admin');
  await budgetModel.clear();
  await budgetModel.insertMany(
    budgets.map(({ date, ...other }) => ({ ...other, date: new Date(date) })),
  );

  await client.close();
}
