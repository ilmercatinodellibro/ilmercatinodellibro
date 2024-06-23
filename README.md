# Il Mercatino del Libro

## Dev quick start

Make sure you have Corepack installed and enabled. See [Corepack - How to Install](https://github.com/nodejs/corepack#how-to-install) for more information.

```bash
$ corepack enable
```

Copy the `.env.example` files to `.env` files in both client and server folders, make adjustments if needed.

Afterwards, execute the following commands:

```bash
$ pnpm install

# Runs the needed docker containers
$ pnpm db:start

# Wipe out the DB (if present), (re)run all migrations, then seed the DB
$ pnpm server:migrate:reset
```

If this is the first time working on this project, make sure to read the following documents before starting to code:

- [server README](/packages/server/README.md)
- [client README](/packages/client/README.md)

## Run in development mode (everyday usage)

```bash
# Runs the needed docker containers, only needed if you haven't run it already
$ pnpm db:start
# Open the following commands in 2 separate terminals
$ pnpm server:dev
$ pnpm client:dev

# Stops docker containers
$ pnpm db:stop
```

## Useful commands

```bash
# Cleans all generated NestJS/GraphQL helpers, GraphQL schema, dist bundles, etc.
# Helpful when switching branches or when the client code generator fails
$ pnpm clean

# Generate all NestJS/GraphQL helpers and GraphQL schema which you'd need to run the app
$ pnpm generate

# Wipe out the DB (if present), re-run all migrations, then seed the DB
$ pnpm server:migrate:reset
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

## Production Setup

This section is meant to describe the setup steps for a production installation of the software or anyway the installation on a machine that needs to be configured from scratch.
It will list the minimal requirements needed to be able to install the code and make it run in production mode.

1. Install [Node.js](https://nodejs.org/en/download/prebuilt-binaries) version 18.20(LTS) or 20.12(LTS) on the server machine.
   1. Notice that if you do not have access to a graphical UI but just to a CLI, it is better to follow [these instructions](https://nodejs.org/en/download/package-manager) instead.
2. Verify Node.js installation by running `node -v` in the terminal. It shall return its version.
3. From an elevated terminal (or using the `sudo` prefix on Linux/Mac), run `corepack enable`. This will make sure that Node.js can install `pnpm` autonomously.
4. Install [Docker](https://docs.docker.com/get-docker/) according to the OS the app will run on.
5. Make sure Docker is up and running properly. In the terminal run `docker -v` and it shall return the installed Docker version.
6. We recommend to _not_ install Git on the production server in order to minimize installed apps.
7. Download the code of this repository, then copy and move it into the desired location in the server machine. Use either `ftp` client or a `.zip` file for this.
8. Once the files have been correctly uploaded to the server, update the server package `.env` file.
   1. In the terminal run cd `packages/server`.
   2. Copy and rename the file `.env.example` to `.env`.
   3. Open the `.env` file in edit mode.
   4. Replace `NODE_ENV=development` with `NODE_ENV=production`.
   5. Use a tool like [this one](https://generate-random.org/encryption-key-generator) to generate a 32byte secret string (or also run `openssl rand -base64 32` command if installed in your machine or on the server).
   6. Replace `APPLICATION_SECRET=secret` with `APPLICATION_SECRET=the_secret_generated_in_previous_step`.
   7. Increase `TOKEN_EXPIRATION` however you like. Suggest `4h` or `8h`.
   8. If a Facebook or Google login has been created to be linked to the app, set the correct `SOCIAL_CLIENT_ID` and respective `SOCIAL_CLIENT_SECRET`. To create a social app and get the necessary configurations, please follow the [instructions listed here](./packages/server/README.md#social-login).
   9. Change `CLIENT_URL` and `SERVER_URL` to your domain. It should be `https://www.ilmercatinodellibro.com`. Note that in this case you need to define the protocol (`https://`) too. If you are using a different endpoint for the server than the client, make sure to replace it with the correct one.
   10. Set `DB_USER` and `DB_PASS` to a more secure value. Remember that if you change these after the database in docker has been created and seeded, the app may no longer be able to connect to the database.
   11. Be sure to replace the values of all the different `MAIL_*` entries with the values provided you by your email provider.
   12. Set `PUSH_NOTIFICATIONS_DRIVER=local` to `PUSH_NOTIFICATIONS_DRIVER=void`
   13. Set `OS_FILESYSTEM_PATH=path` to the folder path that you like.
   14. Save and close this file.
9. Now update the client package `.env` file as well.
   1. Preferably in another terminal, `cd` into `packages/client`.
   2. Copy and rename the file `.env.example` to `.env`.
   3. Open the `.env` file in edit mode.
   4. Replace `DOMAIN` with the domain of your application. It should be `www.ilmercatinodellibro.com`. Notice that in this case you shouldn't include the protocol (`https://`) since it will be added automatically.
   5. If you have configured some options for social login, set either (or both) `FACEBOOK_LOGIN_ENABLED=true` and `GOOGLE_LOGIN_ENABLED=true` according to your needs.
   6. Save and close this file.
10. In the terminal, go back to the root of the code, where this file is located.
11. From there run `pnpm i` and wait until it completes.
12. Go back to the server folder `cd packages/server` and in there run:
    1. `pnpm generate` to create GraphQL types.
    2. `pnpm db:start` to crate Docker container for PostgreDB.
    3. `pnpm prisma migrate reset -f` to reset database, run migrations and create the structure of the DB and finally seed the DB. Do not run this command when Mercatino is in production, or all the data will be lost!
    4. `pnpm build` to prepare the server app
    5. Now follow instruction inside the [server's README.md](./packages/server/README.md#2-import-books) to import books and schools.
    6. Now run `pnpm start:prod` to start the application of the server.
13. Now, while the server is running in the other terminal, in the second opened terminal return to the `packages/client` directory:
    1. Run `pnpm generate`.
    2. Run `pnpm build`. This should copy the just built client into the server folder and thus it should already be accessible since the server is running.
14. Make sure your web server is publishing the app on the correct port.
15. Bonus tip: in order to be sure that the server is always running or that at least it gets restarted, we suggest to install and configure [PM2](https://www.npmjs.com/package/pm2) in order to restart the server process should it crash.
