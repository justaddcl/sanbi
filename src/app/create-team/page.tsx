import { api } from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { NEW_USER_SIGN_UP_KEY } from "@app/create-team/consts";
import { createOrganizationAndAddUser } from "@/server/mutations";
import { insertOrganizationSchema } from "@/lib/types/zod";

export default async function CreateTeamPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  async function createOrganizationMembership(formData: FormData) {
    "use server";
    console.log("🚀 ~ createOrganizationMembership ~ formData:", formData);

    // TODO: create rules that only allow for URL-safe characters in `slug`
    const validatedFields = insertOrganizationSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
    });

    // Return early if the form data is invalid
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    try {
      const data = await createOrganizationAndAddUser(validatedFields.data);
      console.log("🚀 ~ createOrganizationMembership ~ data:", data);
    } catch (createOrganizationAndAddUserError) {
      // TODO: add robust error handling
      // console.error(createOrganizationAndAddUserError);
    }
  }

  const shouldCreateNewUser = Object.keys(searchParams).includes(
    NEW_USER_SIGN_UP_KEY as string, // type assertion here since ESLint removes `string` typing on the const
  );

  if (shouldCreateNewUser) {
    console.log("🖥 - Should create a new user - create-team page");
    try {
      const newUser = await api.user.createMe();
      console.log("🖥 - User created - create-team page", newUser);
    } catch (createUserError) {
      console.log(
        "🖥 - Something has gone wrong while creating a user - create-team page",
      );
      if (createUserError instanceof TRPCError) {
        if (createUserError.code === "CONFLICT") {
          console.info(createUserError.message);
        }
      }
      console.error(createUserError);
    }
  }

  return (
    <form action={createOrganizationMembership}>
      <label htmlFor="name">Team name *</label>
      <input id="name" type="text" name="name" />
      <label htmlFor="slug">Team URL *</label>
      <input id="slug" type="text" name="slug" />
      <button type="submit">Create team</button>
    </form>
  );
}
