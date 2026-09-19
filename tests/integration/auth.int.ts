import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { startTestServer, login, type TestServer } from "./helpers";

let srv: TestServer;

beforeAll(async () => {
  srv = await startTestServer();
});

afterAll(async () => {
  await srv.close();
});

describe("POST /api/auth/login (eval #2)", () => {
  it("renvoie 200 avec { token, user } pour les identifiants seed", async () => {
    const res = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { token: string; user: { username: string } };
    expect(typeof data.token).toBe("string");
    expect(data.token.length).toBeGreaterThan(20);
    expect(data.user.username).toBe("admin");
  });

  it("renvoie 401 avec un mauvais mot de passe", async () => {
    const res = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "mauvais-mot-de-passe" }),
    });
    expect(res.status).toBe(401);
  });

  it("renvoie 400 si un identifiant manque", async () => {
    const res = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("renvoie 401 sans token", async () => {
    const res = await fetch(`${srv.baseUrl}/api/auth/me`);
    expect(res.status).toBe(401);
  });

  it("renvoie 200 avec un token valide", async () => {
    const token = await login(srv.baseUrl);
    const res = await fetch(`${srv.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
  });

  it("renvoie 401 avec un token invalide", async () => {
    const res = await fetch(`${srv.baseUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer token-fabrique" },
    });
    expect(res.status).toBe(401);
  });
});