import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword, generateToken, verifyToken } from "../server/auth";

describe("mots de passe", () => {
  it("hache sans stocker le mot de passe en clair", async () => {
    const hash = await hashPassword("admin123");
    expect(hash).not.toBe("admin123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("valide le bon mot de passe", async () => {
    const hash = await hashPassword("mot-de-passe-clinique");
    await expect(comparePassword("mot-de-passe-clinique", hash)).resolves.toBe(true);
  });

  it("rejette un mauvais mot de passe", async () => {
    const hash = await hashPassword("correct");
    await expect(comparePassword("incorrect", hash)).resolves.toBe(false);
  });

  it("produit des sels différents pour un même mot de passe", async () => {
    const h1 = await hashPassword("identique");
    const h2 = await hashPassword("identique");
    expect(h1).not.toBe(h2);
  });
});

describe("tokens JWT", () => {
  const payload = { userId: "u-123", username: "dr.amine", role: "dentist", staffId: "s-9" };

  it("vérifie le round-trip complet", () => {
    const token = generateToken(payload);
    expect(verifyToken(token)).toMatchObject(payload);
  });

  it("rejette un token falsifié", () => {
    const token = generateToken(payload);
    const falsifié = token.slice(0, -4) + "aaaa";
    expect(() => verifyToken(falsifié)).toThrow();
  });

  it("rejette une chaîne arbitraire", () => {
    expect(() => verifyToken("pas-un-token")).toThrow();
  });
});
