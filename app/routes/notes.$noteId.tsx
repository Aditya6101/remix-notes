import { Button } from "@radix-ui/themes";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import Spinner from "~/components/Spinner";

import { deleteNote, getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { formateDate } from "~/utils";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  const note = await getNote({ id: params.noteId, userId });

  if (!note) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ note: { ...note, updatedAt: formateDate(note.updatedAt) } });
};

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "noteId not found");

  await deleteNote({ id: params.noteId, userId });

  return redirect("/notes");
};

export default function NoteDetailsPage() {
  const { note } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isDeleting = navigation.formData?.get("intent") === "delete";

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="pb-3 text-base font-medium text-slate-500">
          Last Updated at <time>{note.updatedAt}</time>
        </p>

        <div className="flex gap-4">
          <Link to={`/notes/edit/${note.id}`}>
            <Button variant="surface" color="blue">
              Edit
            </Button>
          </Link>
          <Form method="post">
            <Button
              type="submit"
              variant="surface"
              color="red"
              name="intent"
              value="delete"
            >
              {isDeleting ? (
                <>
                  <Spinner />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </Form>
        </div>
      </div>
      <h3 className="text-5xl font-extrabold">{note.title}</h3>
      <p className="py-6 text-lg font-medium text-slate-600">{note.body}</p>
      <hr className="my-4" />
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
