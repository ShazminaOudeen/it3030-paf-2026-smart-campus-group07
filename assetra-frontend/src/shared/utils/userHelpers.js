export function getUserDisplayName(user) {
  return (
    user?.name ||
    user?.displayName ||
    user?.login ||           // GitHub
    user?.username ||
    user?.email?.split("@")[0] ||
    "User"
  );
}

export function getUserAvatar(user) {
  return (
    user?.picture ||
    user?.photoURL ||        // Google
    user?.avatar_url ||      // GitHub
    user?.photo ||
    null
  );
}

export function getUserEmail(user) {
  return user?.email || user?.emailAddress || "";
}

export function getUserRole(user) {
  return user?.role?.toUpperCase() || "USER";
}