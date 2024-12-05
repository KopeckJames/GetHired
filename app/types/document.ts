export type DocumentType = 'resume' | 'cover_letter' | 'job_description' | 'other';

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  content: string;
  uploadedAt: Date;
}

export interface SerializedDocument {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  content: string;
  uploadedAt: string;
}

export interface DocumentCreate {
  name: string;
  type: DocumentType;
  content: string;
  userId: string;
}

export function deserializeDocument(doc: SerializedDocument): Document {
  return {
    ...doc,
    uploadedAt: new Date(doc.uploadedAt),
  };
}

export function serializeDocument(doc: Document): SerializedDocument {
  return {
    ...doc,
    uploadedAt: doc.uploadedAt.toISOString(),
  };
}
