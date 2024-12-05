import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import Card from "~/components/Card";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Select from "~/components/Select";
import Modal from "~/components/Modal";
import Alert from "~/components/Alert";
import EmptyState from "~/components/EmptyState";
import { useState, useRef } from "react";
import type { DocumentType, SerializedDocument } from "~/types/document";
import { getDocuments } from "~/models/document.server";
import { useAuth } from "~/context/AuthContext";
import { verifyToken } from "~/models/user.server";
import { serializeDocument } from "~/types/document";

interface LoaderData {
  documents: SerializedDocument[];
  error: string | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Get token from cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(cookie => {
      const [name, value] = cookie.split('=');
      return [name, decodeURIComponent(value)];
    })
  );
  
  const token = cookies.auth_token;

  if (!token) {
    return json(
      { documents: [], error: "Please sign in to view documents" },
      { status: 401 }
    );
  }

  try {
    const user = await verifyToken(token);
    if (!user) {
      return json(
        { documents: [], error: "Please sign in to view documents" },
        { status: 401 }
      );
    }

    const documents = await getDocuments(user.id);
    return json<LoaderData>(
      { 
        documents: documents.map(serializeDocument), 
        error: null 
      }
    );
  } catch (error) {
    console.error('Error fetching documents:', error);
    return json<LoaderData>(
      { documents: [], error: "Failed to load documents" },
      { status: 500 }
    );
  }
}

export default function Documents() {
  const { documents, error: loaderError } = useLoaderData<typeof loader>();
  const [selectedDoc, setSelectedDoc] = useState<SerializedDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("resume");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revalidator = useRevalidator();

  if (loaderError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{loaderError}</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("type", docType);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload document");
      }

      // Reset form and close modal
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setShowUploadModal(false);
      
      // Refresh the documents list
      revalidator.revalidate();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete document");
      }

      // Refresh the documents list
      revalidator.revalidate();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={() => setShowUploadModal(true)}>Upload Document</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {documents.length === 0 ? (
        <EmptyState
          title="No documents"
          description="Upload your first document to get started"
          action={
            <Button onClick={() => setShowUploadModal(true)}>
              Upload Document
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              variant="bordered"
              className="p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{doc.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{doc.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        title="Upload Document"
      >
        <div className="space-y-4">
          <Select
            label="Document Type"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            options={[
              { value: "resume", label: "Resume" },
              { value: "job_description", label: "Job Description" },
              { value: "cover_letter", label: "Cover Letter" },
              { value: "other", label: "Other" },
            ]}
          />

          <Input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <p className="text-sm text-gray-500">
            Supported formats: PDF, DOC, DOCX, TXT
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.name ?? ""}
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap">{selectedDoc?.content}</pre>
        </div>
      </Modal>
    </div>
  );
}
