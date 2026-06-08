export const GET = () => {
  if (process.env.SANBI_E2E !== "1") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ status: "ok" });
};
