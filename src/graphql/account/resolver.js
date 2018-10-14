import { GraphQLError } from 'graphql';

export const Account = {
  id: ({ _id }) => _id.toString(),
};

export const Query = {
  async accounts(root, { type }, { models: { accountModel } }) {
    return accountModel.find({ type }).toArray();
  },
  async account(root, { id }, { models: { accountModel } }) {
    return accountModel.findById(id);
  },
};

export const Mutation = {
  async addAccount(root, { input }, { models: { accountModel } }) {
    const { name, type, balance } = input;
    const existsAccount = await accountModel.findOne({ name, type });
    if (existsAccount && existsAccount.type === type) {
      throw new GraphQLError(`${name} already exists`);
    }
    const { insertedId } = await accountModel.create({
      name,
      balance,
      type,
    });

    return {
      account: await accountModel.findOne({ _id: insertedId }),
    };
  },
};
