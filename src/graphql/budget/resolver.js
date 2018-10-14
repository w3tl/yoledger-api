export const Budget = {
  id: ({ _id }) => _id.toString(),
  account({ account }, _, { dataloaders, userId }) {
    return dataloaders.accountByName.load({ ...account, userId });
  },
};

export const Query = {
  async budgets(root, { dateStart, dateEnd }, { models: { budgetModel } }) {
    const accounts = await budgetModel.aggregate([
      {
        $match: { $and: [{ date: { $gte: dateStart } }, { date: { $lte: dateEnd } }] },
      },
      {
        $group: {
          _id: { account: '$account' },
        },
      },
      {
        $project: {
          account: '$_id.account',
        },
      },
      {
        $replaceRoot: { newRoot: '$account' },
      },
    ]).toArray();
    return { accounts };
  },
  async budget(root, { account, dateStart, dateEnd }, { models: { budgetModel } }) {
    const budget = await budgetModel.find({
      'account.name': account,
      $and: [{ date: { $gte: dateStart } }, { date: { $lte: dateEnd } }],
    }).toArray();
    return budget;
  },
};

export const Mutation = {
  async upsertBudget(root, { input }, { models: { budgetModel } }) {
    const { account, date, amount } = input;
    const ok = await budgetModel.upsertBudget({ account, date, amount });
    const budget = await budgetModel.findOne({ 'account.name': account, date });
    return {
      success: !!ok,
      budget,
    };
  },
};
