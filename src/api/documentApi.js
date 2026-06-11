import { API_CONFIG, getAuthHeaders } from "../config/api";
import { getAccessToken } from "@/features/auth/api/authUtils";

/**
 * Upload a document via multipart/form-data.
 * @param {File} file - The file to upload
 * @param {number|string} subjectId - Subject ID
 * @param {number|string} chapterId - Chapter ID
 * @param {string} title - Document title
 * @param {function} [onProgress] - Optional progress callback (0-100)
 * @returns {Promise<Object>} The uploaded document data
 */
export async function uploadDocument(file, subjectId, chapterId, title, onProgress) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/documents`;

  const formData = new FormData();
  formData.append("File", file);
  formData.append("SubjectId", subjectId);
  formData.append("ChapterId", chapterId);
  formData.append("Title", title);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    const token = getAccessToken();
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else if (xhr.status === 409) {
        reject(new Error("Duplicate: This document already exists"));
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.send(formData);
  });
}

/**
 * Fetch paginated documents.
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Number of items per page (default: 20)
 * @returns {Promise<Object>} The documents response data
 */
export async function getDocuments(page = 1, pageSize = 20) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/documents?page=${page}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single document by ID.
 * @param {number|string} id - Document ID
 * @returns {Promise<Object>} The document data
 */
export async function getDocumentById(id) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/documents/${id}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Trigger re-indexing of a document.
 * @param {number|string} id - Document ID
 * @returns {Promise<Object>} The response data
 */
export async function reindexDocument(id) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/documents/${id}/reindex`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to reindex document: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a document by ID.
 * @param {number|string} id - Document ID
 * @returns {Promise<void>}
 */
export async function deleteDocument(id) {
  const url = `${API_CONFIG.BASE_URL}/api/v1/documents/${id}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`);
  }
}
