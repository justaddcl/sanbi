import * as z from "zod";

import { organizationProcedure, publicProcedure } from "@server/orpc/base";

export const deleteResource = publicProcedure
  .route({
    method: "DELETE",
    path: "/resource/delete",
    summary: "Deletes a song resource",
  })
  .output(z.string())
  .handler(() => {
    return "hi there";
  });

export const resourceRouter = {
  delete: deleteResource,
};
