import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestServer, login, authHeaders, getAuthHeaders, type TestServer } from "./helpers";

let srv: TestServer;
let token: string;

beforeAll(async () => {
  srv = await startTestServer();
  token = await login(srv.baseUrl);
});

afterAll(async () => {
  await srv.close();
});

const marker = `it-patient-${Date.now()}`;

describe("POST /api/patients", () => {
  it("crée un patient avec des données valides", async () => {
    const res = await fetch(`${srv.baseUrl}/api/patients`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: marker, age: 25, gender: "M", phone: "0555000000" }),
    });
    expect(res.status).toBe(201);
    const patient = (await res.json()) as { id: string; name: string };
    expect(patient.name).toBe(marker);

    const del = await fetch(`${srv.baseUrl}/api/patients/${patient.id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
    expect(del.status).toBe(204);
  });

  it("rejette un age negatif en 400 SANS creer de ligne (eval #1)", async () => {
    const negName = `${marker}-neg`;
    const res = await fetch(`${srv.baseUrl}/api/patients`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: negName, age: -3, gender: "M" }),
    });
    expect(res.status).toBe(400);

    const all = (await (await fetch(`${srv.baseUrl}/api/patients`, { headers: getAuthHeaders(token) })).json()) as Array<{ name: string }>;
    expect(all.some((p) => p.name === negName)).toBe(false);
  });

  it("renvoie 401 sans token", async () => {
    const res = await fetch(`${srv.baseUrl}/api/patients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${marker}-unauth`, age: 30, gender: "M" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/patients/:id", () => {
  it("met a jour un patient existant", async () => {
    const created = await fetch(`${srv.baseUrl}/api/patients`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: `${marker}-patch`, age: 30, gender: "F" }),
    });
    const patient = (await created.json()) as { id: string };

    const res = await fetch(`${srv.baseUrl}/api/patients/${patient.id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ phone: "0660000000" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as { phone: string };
    expect(updated.phone).toBe("0660000000");

    await fetch(`${srv.baseUrl}/api/patients/${patient.id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    });
  });

  it("renvoie 404 pour un id inconnu", async () => {
    const res = await fetch(`${srv.baseUrl}/api/patients/id-inexistant`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ phone: "0660000000" }),
    });
    expect(res.status).toBe(404);
  });
});