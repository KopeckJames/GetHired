import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '~/utils/db.server';
import type { User, CreateUserData } from '~/types/user';
import { serializeUser } from '~/types/user';

interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
}

function mapUserDocument(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    picture: doc.picture,
    createdAt: doc.createdAt,
  };
}

export async function createUser(data: CreateUserData): Promise<User> {
  const db = await getDb();
  
  // Check if user already exists
  const existingUser = await db
    .db()
    .collection<UserDocument>('users')
    .findOne({ email: data.email });

  if (existingUser) {
    return mapUserDocument(existingUser);
  }

  const newUser: Omit<UserDocument, '_id'> = {
    ...data,
    createdAt: new Date(),
  };

  const result = await db
    .db()
    .collection<UserDocument>('users')
    .insertOne(newUser as UserDocument);

  return {
    id: result.insertedId.toString(),
    ...data,
    createdAt: new Date(),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getDb();
  const user = await db
    .db()
    .collection<UserDocument>('users')
    .findOne({ _id: new ObjectId(id) });

  if (!user) return null;

  return mapUserDocument(user);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db
    .db()
    .collection<UserDocument>('users')
    .findOne({ email });

  if (!user) return null;

  return mapUserDocument(user);
}

export function generateToken(user: User) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  return jwt.sign(
    { 
      userId: user.id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(token: string): Promise<User | null> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string; email: string };
    const user = await getUserById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function authenticateWithGoogle(profile: {
  email: string;
  name: string;
  picture?: string;
}): Promise<{ user: User; token: string }> {
  const user = await createUser(profile);
  const token = generateToken(user);
  return { user, token };
}
