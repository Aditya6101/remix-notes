import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import NoteForm from "~/components/NoteForm";

import { createNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { body: null, title: "Title is required" } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { body: "Body is required", title: null } },
      { status: 400 }
    );
  }

  const note = await createNote({ body, title, userId });

  return redirect(`/notes/${note.id}`);
};

export default function NewNotePage() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <NoteForm actionData={actionData} />
      {/* <Form
        ref={formRef}
        method="post"
        className="mx-auto w-1/2 rounded-md bg-neutral-100"
      >
        <h3 className="px-8 pt-4 text-lg font-semibold text-neutral-900">
          Create New Note
        </h3>
        <fieldset
          disabled={navigation.state === "submitting"}
          className="mx-auto flex w-full flex-col gap-4 rounded-md bg-neutral-100 p-8 py-4 shadow-sm"
        >
          <div>
            <TextField.Input
              placeholder="Enter your email"
              ref={titleRef}
              name="title"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.title ? true : undefined}
              aria-errormessage={
                actionData?.errors?.title ? "title-error" : undefined
              }
            />
            {actionData?.errors?.title ? (
              <div className="pt-1 text-red-700" id="title-error">
                {actionData.errors.title}
              </div>
            ) : null}
          </div>
          <div>
            <TextArea
              ref={bodyRef}
              name="body"
              placeholder="Start writing here..."
              rows={8}
              aria-invalid={actionData?.errors?.body ? true : undefined}
              aria-errormessage={
                actionData?.errors?.body ? "body-error" : undefined
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.form?.dispatchEvent(
                    new Event("submit", { bubbles: true, cancelable: true })
                  );
                }
              }}
            />
            {actionData?.errors?.body ? (
              <div className="pt-1 text-red-700" id="body-error">
                {actionData.errors.body}
              </div>
            ) : null}
          </div>
          <Button type="submit" value="create" name="intent">
            {isCreating ? (
              <>
                <svg
                  aria-hidden="true"
                  className="inline h-4 w-4 animate-spin fill-blue-500 text-white"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </fieldset>
      </Form> */}
    </div>
  );
}
