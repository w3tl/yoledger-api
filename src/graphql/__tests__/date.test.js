import { Kind } from 'graphql/language';
import DateType from '../date';

test('the value that comes from the client must turn into a date object', () => {
  const parseValue = DateType.parseValue('2017-06-18');
  expect(parseValue).toEqual(new Date('2017-06-18'));

  const parseLiteral = DateType.parseLiteral({ value: '2017-06-19', kind: Kind.STRING });
  expect(parseLiteral).toEqual(new Date('2017-06-19'));
});

test('the client should return a string', () => {
  const serialize = DateType.serialize(new Date('2017-06-20'));
  expect(new Date(serialize)).toEqual(new Date('2017-06-20'));
});
