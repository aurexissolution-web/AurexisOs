# Policy Pages & Footer Links
Create dedicated Privacy Policy, Terms of Service, and Cookie Policy pages and wire them into the footer navigation.

1. **Add static routes and metadata** – Create `/privacy-policy`, `/terms-of-service`, and `/cookie-policy` page files under `src/app` with appropriate metadata (title/description) to keep SEO consistent.
2. **Implement page content** – Render the provided copy for each policy using the existing typography system (e.g., container widths, headings, lists) so the pages match the site's look without altering global styles.
3. **Update footer links** – Replace the current placeholder footer links with the new routes (Privacy, Terms, Cookie Policy) and ensure they’re accessible from every page.
4. **Verify experience** – Run `next build` (or at least `next lint`) to ensure the pages compile, then spot-check navigation to confirm the new pages display correctly and the footer links work.
