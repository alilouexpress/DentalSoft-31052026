import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient, InsertPatient } from "@shared/schema";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dentalsoft-token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers as Record<string, string> },
  });
  if (response.status === 401) {
    localStorage.removeItem("dentalsoft-token");
    window.location.href = "/login";
    throw new Error("Session expirée");
  }
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  return response.json();
}

export function useUpdatePatientGeneralInfo() {
  const qc = useQueryClient();
  return useMutation<Patient, Error, { id: string; data: Partial<InsertPatient> }>({
    mutationFn: ({ id, data }) =>
      fetchJson(`${API_BASE}/patients/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["patients", variables.id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUploadPatientPhoto() {
  const qc = useQueryClient();
  return useMutation<{ photoUrl: string }, Error, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("dentalsoft-token") : null;
      const formData = new FormData();
      formData.append("photo", file);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE}/patients/${id}/photo`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (response.status === 401) {
        localStorage.removeItem("dentalsoft-token");
        window.location.href = "/login";
        throw new Error("Session expirée");
      }
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["patients", variables.id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
