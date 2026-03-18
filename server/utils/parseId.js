import { ObjectId } from 'mongodb';

export function parseId(str) {
  try {
    return ObjectId.createFromHexString(str);
  } catch {
    return null;
  }
}
