import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import NoteForm from "~/components/NoteForm";

import { deleteNote, editNote, getNote } from "~/models/note.server";
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
  const intent = formData.get("intent");

  switch (intent) {
    case "update":
      return updateAction(args);
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

const updateAction = async ({ params, request }: ActionArgs) => {
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

  const actionData = useActionData<typeof updateAction>();

  return <NoteForm actionData={actionData} notesData={data} />;
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
