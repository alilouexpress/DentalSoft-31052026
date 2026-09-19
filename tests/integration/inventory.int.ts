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

async function createProduct(body: Record<string, unknown>) {
  const res = await fetch(`${srv.baseUrl}/api/inventory/products`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  return res;
}

async function deleteProduct(id: string) {
  await fetch(`${srv.baseUrl}/api/inventory/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

describe("cycle de vie produit inventaire (eval #3)", () => {
  it("cree un produit en alerte stock faible et le retrouve dans low-stock", async () => {
    const name = `it-prod-${Date.now()}`;
    const create = await createProduct({ name, unit: "piece", currentStock: 2, minimumStock: 5, sellingPrice: "1000.00" });
    expect(create.status).toBe(201);
    const product = (await create.json()) as { id: string; currentStock: number };
    expect(product.currentStock).toBe(2);

    const products = (await (await fetch(`${srv.baseUrl}/api/inventory/products`, { headers: getAuthHeaders(token) })).json()) as Array<{ id: string }>;
    expect(products.some((p) => p.id === product.id)).toBe(true);

    const low = (await (await fetch(`${srv.baseUrl}/api/inventory/products/low-stock`, { headers: getAuthHeaders(token) })).json()) as Array<{ id: string }>;
    expect(low.some((p) => p.id === product.id)).toBe(true);

    await deleteProduct(product.id);
  });
});

describe("ajustement de stock (eval #4)", () => {
  it("incremente currentStock et journalise un mouvement", async () => {
    const create = await createProduct({ name: `it-adj-${Date.now()}`, unit: "piece", currentStock: 10, minimumStock: 5 });
    const product = (await create.json()) as { id: string };

    const res = await fetch(`${srv.baseUrl}/api/inventory/products/${product.id}/adjust-stock`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ quantity: 3, type: "in", notes: "test integration" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as { currentStock: number };
    expect(updated.currentStock).toBe(13);

    const movements = (await (await fetch(`${srv.baseUrl}/api/inventory/products/${product.id}/movements`, { headers: getAuthHeaders(token) })).json()) as Array<{ type: string; quantity: number }>;
    expect(movements.some((m) => m.type === "in" && m.quantity === 3)).toBe(true);

    await deleteProduct(product.id);
  });

  it("decremente currentStock sur une sortie", async () => {
    const create = await createProduct({ name: `it-out-${Date.now()}`, unit: "piece", currentStock: 10, minimumStock: 5 });
    const product = (await create.json()) as { id: string };

    const res = await fetch(`${srv.baseUrl}/api/inventory/products/${product.id}/adjust-stock`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ quantity: 4, type: "out", notes: "sortie test" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as { currentStock: number };
    expect(updated.currentStock).toBe(6);

    await deleteProduct(product.id);
  });

  it("rejette une quantite non positive en 400", async () => {
    const create = await createProduct({ name: `it-inv-${Date.now()}`, unit: "piece", currentStock: 5, minimumStock: 5 });
    const product = (await create.json()) as { id: string };

    const zero = await fetch(`${srv.baseUrl}/api/inventory/products/${product.id}/adjust-stock`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ quantity: 0, type: "in" }),
    });
    expect(zero.status).toBe(400);

    const negative = await fetch(`${srv.baseUrl}/api/inventory/products/${product.id}/adjust-stock`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ quantity: -2, type: "in" }),
    });
    expect(negative.status).toBe(400);

    await deleteProduct(product.id);
  });
});