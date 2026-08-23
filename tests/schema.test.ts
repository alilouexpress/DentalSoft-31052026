import { describe, it, expect } from "vitest";
import { insertPatientSchema, insertUserSchema } from "../shared/schema";

describe("insertPatientSchema", () => {
  const valide = { name: "Karim Benali", age: 34, gender: "Homme" };

  it("accepte un patient minimal et laisse les défauts SQL à la base", () => {
    const p = insertPatientSchema.parse(valide);
    expect(p.name).toBe("Karim Benali");
    expect(p.status).toBeUndefined();
    expect(p.balance).toBeUndefined();
  });

  it("accepte les champs optionnels fournis", () => {
    const p = insertPatientSchema.parse({ ...valide, phone: "0555123456", email: "karim@example.com" });
    expect(p.phone).toBe("0555123456");
    expect(p.email).toBe("karim@example.com");
  });

  it("rejette un patient sans nom", () => {
    expect(() => insertPatientSchema.parse({ age: 30, gender: "Femme" })).toThrow();
  });

  it("rejette un âge non entier", () => {
    expect(() => insertPatientSchema.parse({ ...valide, age: 30.5 })).toThrow();
  });

  it("rejette un âge négatif", () => {
    expect(() => insertPatientSchema.parse({ ...valide, age: -5 })).toThrow();
  });

  it("rejette l'injection d'un id fourni par le client", () => {
    const result = insertPatientSchema.safeParse({ ...valide, id: "hack" });
    expect(result.success).toBe(true);
    if (result.success) expect((result.data as Record<string, unknown>).id).toBeUndefined();
  });
});

describe("insertUserSchema", () => {
  it("accepte un utilisateur complet", () => {
    const u = insertUserSchema.parse({ username: "admin", password: "admin123", role: "admin", staffId: null });
    expect(u.username).toBe("admin");
  });

  it("rejette un utilisateur sans mot de passe", () => {
    expect(() => insertUserSchema.parse({ username: "admin", role: "admin" })).toThrow();
  });

  it("rejette un utilisateur sans nom d'utilisateur", () => {
    expect(() => insertUserSchema.parse({ password: "x", role: "admin" })).toThrow();
  });
});
