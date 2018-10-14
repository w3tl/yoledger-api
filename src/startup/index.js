import { MongoClient } from 'mongodb';
import config from '../config';
import initDb from './init';
import fillDb from './fill';

const mongoUri = config.get('mongoUri');

export default async function startup() {
  const client = await MongoClient.connect(mongoUri, {
    useNewUrlParser: true,
  });
  await initDb(client);
  if (config.get('env') === 'development') {
    await fillDb(client);
  }
  await client.close();
}
