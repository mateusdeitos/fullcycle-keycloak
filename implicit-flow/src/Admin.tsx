import { useAuth } from "./AuthProvider";

export function Admin() {
  const { auth } = useAuth();

  return (
    <div>
      <h1>Admin</h1>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  );
}
