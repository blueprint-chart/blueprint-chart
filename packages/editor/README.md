# @blueprint-chart/editor

Static-site bundle of the Blueprint Chart editor. Use it self-hosted or via the live version at [blueprintchart.com](https://blueprintchart.com).

## Live version

[https://blueprintchart.com](https://blueprintchart.com)

## Self-host

Install the package and point any static file server at the `dist/` directory.

```bash
npm install @blueprint-chart/editor
npx serve node_modules/@blueprint-chart/editor/dist
```

Or copy `node_modules/@blueprint-chart/editor/dist/*` into your own static hosting (S3, Nginx, GitHub Pages, etc.).

## Develop

See [the main repository](https://github.com/blueprint-chart/blueprint-chart) for development instructions.

## Optional: Accounts & hosted charts (Supabase)

The editor works fully without an account — charts live in your browser and embed
via self-contained base64 links. To additionally let users sign in, store charts
in the cloud, and publish live permalinks, configure Supabase.

### 1. Create a Supabase project and apply the schema

Run the migration in `supabase/migrations/0001_charts.sql` against your project
(`supabase db push`, or paste it into the SQL editor). It creates the `charts`
table and RLS policies (owner full access; public read of published charts).

### 2. Configure credentials

Either bake them at build time:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLIC-ANON-KEY
```

…or deploy a runtime `config.json` next to `index.html` (overrides env, so one
build can be configured per deploy — see `config.example.json`):

```json
{ "supabaseUrl": "https://YOUR-PROJECT.supabase.co", "supabaseAnonKey": "YOUR-PUBLIC-ANON-KEY" }
```

If neither is set (or only one value is present), the accounts feature stays off
and the editor behaves exactly as the self-contained build.

### 3. Auth provider

Sign-in uses passwordless magic links. In your Supabase project enable the Email
provider and add your deployed origin to the allowed redirect URLs.

## License

MIT
