# Branded auth email templates

Version-controlled source for Blueprint Chart's branded authentication emails.
Blueprint Chart signs users in **only** via magic link (`signInWithOtp`, see
`src/stores/account.ts`), so only two GoTrue email templates ever fire:

| Template          | When it sends                         | File                  |
|-------------------|---------------------------------------|-----------------------|
| Magic Link        | returning, already-confirmed users    | `magic_link.html`     |
| Confirm signup    | a brand-new user's first sign-in      | `confirmation.html`   |

Both use a table-based, inline-styled layout (the only thing email clients
render reliably), the Prussian Blue palette and Geist / DM Serif type from
`packages/ui/src/styles/tokens.scss`, and degrade gracefully when images or
webfonts are blocked. The only dynamic values are `{{ .ConfirmationURL }}` (the
magic-link button) and `{{ .SiteURL }}` (the logo mark).

## Applying them (hosted project)

The editor runs against a **hosted** Supabase project, so these templates are
applied by hand in the dashboard — `config.toml` does **not** affect a hosted
project (it only configures a local `supabase start` Docker stack).

1. **Dashboard → Authentication → Email Templates** — paste the file contents
   into the matching template and set the subject:
   - **Magic Link** ← `magic_link.html`, subject `Your Blueprint Chart sign-in link`
   - **Confirm signup** ← `confirmation.html`, subject `Confirm your email for Blueprint Chart`
   Changes take effect on the next email — no restart needed.
2. **Dashboard → Authentication → URL Configuration** — make sure your dev/app
   origin is in **Redirect URLs** (e.g. `http://localhost:5555`), or GoTrue will
   reject the magic-link redirect after the user clicks it.
3. **Dashboard → Authentication → SMTP Settings** — the default Supabase sender
   is rate-limited and unbranded. Configure a custom SMTP provider with a
   branded sender name (`Blueprint Chart`) and from-address so the branding
   carries through the envelope, not just the body.

The logo mark (`{{ .SiteURL }}/favicon-128.png`) only loads when the project's
**Site URL** points at a deployment that actually serves `/favicon-128.png`. In
local dev the image won't load (the text wordmark still carries the brand) —
that's expected.

Keep the dashboard templates in sync with these files whenever they change.

## Local stack (not used today)

If you ever switch to a local `supabase start` stack, wire these via
`config.toml` instead of the dashboard:

```toml
[auth.email.template.magic_link]
subject = "Your Blueprint Chart sign-in link"
content_path = "./supabase/templates/magic_link.html"

[auth.email.template.confirmation]
subject = "Confirm your email for Blueprint Chart"
content_path = "./supabase/templates/confirmation.html"
```

Then `supabase stop && supabase start` (from `packages/editor`) and view the
rendered mail in the local inbox at `http://127.0.0.1:54324`.
