import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { TextField } from "@/components/ui/text-field";

export function UserSearchForm({ search }: { search: string }) {
  return (
    <form
      action="/admin/users"
      method="get"
      className="mb-6 flex flex-wrap items-end gap-3"
    >
      <div className="min-w-0 flex-1 basis-64">
        {/* The key resets the field when the search changes or is cleared. */}
        <TextField
          key={search}
          label="Search by name, username or email"
          id="admin-user-search"
          name="search"
          type="search"
          defaultValue={search}
          maxLength={100}
          placeholder="Search users…"
        />
      </div>

      <Button type="submit">Search</Button>

      <LinkButton href="/admin/users" prefetch={false} variant="secondary">
        Clear
      </LinkButton>
    </form>
  );
}