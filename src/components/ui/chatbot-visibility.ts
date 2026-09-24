export function shouldHideChatbot(pathname: string | null): boolean {
  return (
    pathname === "/login" ||
    pathname?.startsWith("/portal") === true ||
    pathname === "/sanjay" ||
    pathname?.startsWith("/sanjay/") === true
  );
}
