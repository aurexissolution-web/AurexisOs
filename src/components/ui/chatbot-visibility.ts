export function shouldHideChatbot(pathname: string | null): boolean {
  return (
    pathname === "/login" ||
    pathname === "/solutions" ||
    pathname === "/solutions/" ||
    pathname?.startsWith("/portal") === true ||
    pathname?.startsWith("/admin") === true ||
    pathname === "/sanjay" ||
    pathname?.startsWith("/sanjay/") === true
  );
}
