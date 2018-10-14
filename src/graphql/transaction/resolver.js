import { ObjectId } from 'mongodb';
import { GraphQLError } from 'graphql';

export const Transaction = {
  id: ({ _id }) => _id.toString(),
  date: ({ createdAt }) => createdAt,
  source({ source }, _, { dataloaders, userId }) {
    return dataloaders.accountByName.load({ ...source, userId });
  },
  destination({ destination }, _, { dataloaders, userId }) {
    return dataloaders.accountByName.load({ ...destination, userId });
  },
};

export const Mutation = {
  async addTransaction(root, { input }, { models: { transactionModel }, connection }) {
    const {
      source, destination, amount, date: createdAt,
    } = input;
    const transObj = {
      source,
      destination,
      amount,
      createdAt,
    };

    let _id;
    await connection.withSession(async (session) => {
      _id = await transactionModel.post(transObj, session);
    });

    const transaction = await transactionModel.findOne({ _id });

    return {
      transaction,
    };
  },
  async deleteTransaction(root, { id }, { models: { transactionModel }, connection }) {
    try {
      await connection.withSession(session => transactionModel.unpost(ObjectId(id), session));
    } catch (err) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      id,
    };
  },
  async updateTransaction(root, { id, input }, { models: { transactionModel }, connection }) {
    const {
      amount, source, destination, date: createdAt,
    } = input;
    const updates = {
      source,
      destination,
      amount,
      createdAt,
    };
    try {
      let updatedId;
      await connection.withSession(async (session) => {
        updatedId = await transactionModel.update(ObjectId(id), updates, session);
      });
      const transaction = await transactionModel.findOne({ _id: updatedId });
      return { transaction };
    } catch (err) {
      throw new GraphQLError(err.message);
    }
  },
};

export const Query = {
  async transactions(_, /* eslint-disable-next-line object-curly-newline */
    { dateStart, dateEnd, page, itemsPerPage },
    { models: { transactionModel } }) {
    const query = {};
    if (dateEnd) {
      query.$and = [
        { createdAt: { $gte: dateStart } },
        { createdAt: { $lte: dateEnd } },
      ];
    } else {
      query.createdAt = { $gte: dateStart };
    }

    return transactionModel.find(query)
      .skip(page * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();
  },
  transaction(_, { id }, { models: { transactionModel } }) {
    return transactionModel.findById(id);
  },
};
