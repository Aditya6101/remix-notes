import { Button, TextArea, TextField } from "@radix-ui/themes";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { editNote, deleteNote, getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ id: params.noteId, userId });
  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ note });
};

export const action = async (args: ActionArgs) => {
  const formData = await args.request.clone().formData();
  const actionType = formData.get("_action");

  switch (actionType) {
    case "update":
      return editAction(args);
    case "delete":
      return deleteAction(args);

    default:
      return json(
        { errors: { formError: "Something went wrong!" } },
        { status: 400 }
      );
  }
};

const deleteAction = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote({ id: params.noteId, userId });
  return redirect("/notes");
};

const editAction = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  invariant(params.noteId, "noteId not found");

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

  const note = await editNote({ id: params.noteId, body, title });

  return redirect(`/notes/${note.id}`);
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof editAction>();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div>
      <h3 className="text-2xl font-bold">Edit - {data.note.title}</h3>
      <Form
        method="post"
        className="mx-auto flex w-1/2 flex-col gap-4 rounded-md border border-neutral-100 p-6 shadow-sm"
      >
        <div>
          <TextField.Input
            ref={titleRef}
            name="title"
            defaultValue={data.note.title}
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
            rows={8}
            defaultValue={data.note.body}
            className="w-full flex-1 rounded-md border-2 border-blue-500 px-3 py-2 text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />

          {actionData?.errors?.body ? (
            <div className="pt-1 text-red-700" id="body-error">
              {actionData.errors.body}
            </div>
          ) : null}
        </div>

        <Button type="submit" name="_action" value="update">
          Save
        </Button>

        <Form method="post">
          <Button
            variant="soft"
            color="red"
            type="submit"
            name="_action"
            value="delete"
            className="w-full"
          >
            Delete
          </Button>
        </Form>
      </Form>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
