# Il Mercatino del Libro

## Dev quick start

Copy the `.env.example` files to `.env` files in both client and server folders, then execute the following commands:

```bash
$ pnpm install
# Cleans all generated NestJS/GraphQL helpers, GraphQL schema, dist bundles, etc.
# Helpful when switching branches or when the client code generator fails
$ pnpm clean
# Generate all NestJS/GraphQL helpers and GraphQL schema which you'd need to run the app
$ pnpm generate
# Runs the needed docker containers
$ pnpm db:start
# Wipe out the DB (if present), re-run all migrations, then seed the DB
$ pnpm server:migrate:reset
```

If this is the first time working on this project, make sure to read the following documents before starting to code:

- [server README](/packages/server/README.md)
- [client README](/packages/client/README.md)

## Run in development mode (everyday usage)

```bash
# Runs the needed docker containers, only needed if you haven't run it already
$ pnpm db:start
# Open the following commands in 2 distinct terminals
$ pnpm server:dev
$ pnpm client:dev

# Stops docker containers
$ pnpm db:stop
```

## Generate prod bundle

Replace values into `.env` with production ones, then execute the following commands:

```bash
# Clean all generated files, re-generate them anew, then build the app
$ pnpm build
# Serve the production build
$ pnpm serve

# You can now access the app on the URL specified into .env file
# If you're serving it locally, you can access it at http://localhost:3000 by default
```
