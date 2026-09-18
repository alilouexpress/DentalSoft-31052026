let raw = "";
process.stdin.on("data", (d) => { raw += d; });
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    const cmd = String(input?.tool_input?.command || "");
    const destructive = [
      /remove-item\s+[^|;&]*-recurse[^|;&]*-force[^|;&]*\s+[a-z]:?\\?(\s|$)/i,
      /rm\s+(-[a-z]*r[a-z]*f|-rf)\s+\/(\s|$)/,
      /rd\s+\/s\s+\/q\s+[a-z]:\\\s*$/i,
      /format\s+[a-z]:/i,
      /mkfs/i,
    ];
    if (destructive.some((r) => r.test(cmd))) {
      console.error("Bloque par le garde-fou projet : operation destructrice detectee.");
      process.exit(2);
    }
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
