import { ObjectId } from 'mongodb';
import { getDb } from '~/utils/db.server';
import type { Document, DocumentType, DocumentCreate } from '~/types/document';

interface DocumentModel {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  type: DocumentType;
  content: string;
  uploadedAt: Date;
}

function mapDocumentToResponse(doc: DocumentModel): Document {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    type: doc.type,
    content: doc.content,
    uploadedAt: doc.uploadedAt,
  };
}

export async function getDocuments(userId: string): Promise<Document[]> {
  const db = await getDb();
  const documents = await db
    .db()
    .collection<DocumentModel>('documents')
    .find({ userId: new ObjectId(userId) })
    .sort({ uploadedAt: -1 })
    .toArray();

  return documents.map(mapDocumentToResponse);
}

export async function getDocumentsByType(type: DocumentType, userId: string): Promise<Document[]> {
  const db = await getDb();
  const documents = await db
    .db()
    .collection<DocumentModel>('documents')
    .find({ 
      userId: new ObjectId(userId),
      type: type
    })
    .sort({ uploadedAt: -1 })
    .toArray();

  return documents.map(mapDocumentToResponse);
}

export async function createDocument(data: DocumentCreate): Promise<Document> {
  const db = await getDb();
  const doc: Omit<DocumentModel, '_id'> = {
    userId: new ObjectId(data.userId),
    name: data.name,
    type: data.type,
    content: data.content,
    uploadedAt: new Date(),
  };

  const result = await db
    .db()
    .collection<DocumentModel>('documents')
    .insertOne(doc as DocumentModel);

  return {
    id: result.insertedId.toString(),
    userId: data.userId,
    name: data.name,
    type: data.type,
    content: data.content,
    uploadedAt: doc.uploadedAt,
  };
}

export async function updateDocument(id: string, userId: string, content: string): Promise<Document | null> {
  const db = await getDb();
  const collection = db.db().collection<DocumentModel>('documents');
  
  // Update the document
  const updateResult = await collection.updateOne(
    {
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    },
    {
      $set: { content },
    }
  );

  if (updateResult.matchedCount === 0) {
    return null;
  }

  // Fetch the updated document
  const updatedDoc = await collection.findOne({
    _id: new ObjectId(id),
    userId: new ObjectId(userId),
  });

  if (!updatedDoc) {
    return null;
  }

  return mapDocumentToResponse(updatedDoc);
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .db()
    .collection('documents')
    .deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

  return result.deletedCount > 0;
}

export async function getDocument(id: string, userId: string): Promise<Document | null> {
  const db = await getDb();
  const document = await db
    .db()
    .collection<DocumentModel>('documents')
    .findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

  if (!document) return null;

  return mapDocumentToResponse(document);
}
