import { Button, TextArea, TextField } from "@radix-ui/themes";
import { Form, useNavigation } from "@remix-run/react";
import { useRef } from "react";
import Spinner from "./Spinner";

type Note = {
  id: string;
  body: string;
  title: string;
};

type Errors = Omit<Note, "id">;

const NoteForm = ({
  actionData,
  notesData,
}: {
  actionData: { errors: Errors };
  notesData?: { note: Note };
}) => {
  const formRef = useRef(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
  const isUpdating = navigation.formData?.get("intent") === "update";
  const isDeleting = navigation.formData?.get("intent") === "delete";

  return (
    <Form
      ref={formRef}
      method="post"
      className="mx-auto w-1/2 rounded-md bg-neutral-100"
    >
      <h3 className="px-8 pt-4 text-lg font-semibold text-neutral-900">
        {notesData ? `Editing - ${notesData.note.title}` : "Create New Note"}
      </h3>
      <fieldset
        disabled={navigation.state === "submitting"}
        className="mx-auto flex w-full flex-col gap-4 rounded-md bg-neutral-100 p-8 py-4 shadow-sm"
      >
        <div>
          <TextField.Input
            name="title"
            ref={titleRef}
            placeholder="Enter your email"
            defaultValue={notesData ? notesData.note.title : ""}
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
            name="body"
            ref={bodyRef}
            placeholder="Start writing here..."
            defaultValue={notesData ? notesData.note.title : ""}
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

        <Button
          type="submit"
          value={notesData ? "update" : "create"}
          name="intent"
        >
          {isUpdating || isCreating ? (
            <>
              <Spinner />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>

        <Button
          variant="soft"
          color="red"
          type="submit"
          name="intent"
          value="delete"
          className="w-full"
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
      </fieldset>
    </Form>
  );
};

export default NoteForm;
