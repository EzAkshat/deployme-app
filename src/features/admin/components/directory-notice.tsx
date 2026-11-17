import { AdminNotice } from "./admin-notice";

export function DirectoryNotice({ message }: { message: string }) {
  return (
    <AdminNotice
      title="User directory unavailable"
      message={message}
      retryHref="/admin/users"
      retryLabel="Return to user directory"
    />
  );
}