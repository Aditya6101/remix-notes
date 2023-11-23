import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { deleteNote, getNoteListItems } from "~/models/note.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";

export const meta: V2_MetaFunction = () => [{ title: "Remix Notes" }];

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const noteListItems = await getNoteListItems({ userId });
  return json({ noteListItems });
};

export const action = async ({ params, request }: ActionArgs) => {
  const formData = await request.formData();
  const id = formData.get("id");
  invariant(id, "noteId not found");

  const userId = await requireUserId(request);

  if (typeof id !== "string" || !id) {
    return json(
      { errors: { body: null, title: "id is required" } },
      { status: 400 }
    );
  }

  await deleteNote({ id: id, userId });

  return redirect("/notes");
};

export default function NotesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <Button type="submit" variant="soft">
            <ExitIcon width="16" height="16" /> Logout
          </Button>
        </Form>
      </header>

      <main className="flex h-screen bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link
            to="new"
            className="block p-4 text-base text-blue-500 hover:bg-gray-100"
          >
            + New Note
          </Link>

          <hr />

          {data.noteListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id} className="px-2 py-1">
                  <NavLink
                    className={({ isActive }) =>
                      `flex w-full items-center justify-between rounded-md bg-white p-2 text-base ${
                        isActive
                          ? "border border-blue-400 bg-white shadow-sm"
                          : ""
                      }`
                    }
                    to={note.id}
                  >
                    {note.title}
                    <Link
                      to={`edit/${note.id}`}
                      className="text-sm font-normal text-blue-400"
                    >
                      Edit
                    </Link>
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
