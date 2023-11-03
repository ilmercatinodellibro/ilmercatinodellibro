# Il Mercatino del Libro server (@ilmercatinodellibro/server)

## Dev quick start

The following instructions are meant only for development.

1. Make sure you have Docker installed and running on your system.
2. To run PostgreSQL on Docker:
   ```bash
   $ pnpm db:start
   ```
3. Once the container is running, run the following commands:
   ```bash
   $ pnpm migrate:dev
   $ pnpm dev
   ```

## DB management scripts

```bash
# Start DB in interactive mode, CTRL+C to stop
$ pnpm db
# Start DB in detached mode
$ pnpm db:start
# Stop DB started in detached mode
$ pnpm db:stop
# Launch Prisma seeders to fill in the DB
$ pnpm db:seed
# Connect to the postgres management utility via Docker container
$ pnpm db:psql
```

## Run code generators and migrations

```bash
$ pnpm generate
$ pnpm migrate:reset
```

Code generators are executed automatically:

- After installing the dependencies
- Before building the app

Seeding is performed automatically after a migration reset

## Running the app

```bash
# development
$ pnpm start

# watch mode
$ pnpm start:dev

# production mode (requires you to build the app first)
$ pnpm start:prod
```

## Test

```bash
# unit tests
$ pnpm test

# e2e tests
$ pnpm test:e2e

# test coverage
$ pnpm test:cov
```

## Redis usage

We added several Redis-related commands to the `package.json` file

```bash
$ pnpm queue:cli # Start Redis in interactive mode, CTRL+C to stop
$ pnpm queue:flush # Flush all Redis keys
$ pnpm queue:list # List all jobs
$ pnpm queue:show bull:xxx # Show data about the specified job
```

Consumer processes may get stuck, keeping NestJS in zombie mode and preventing a new server instance to spin up.
In those cases, use `sudo netstat -nlp | grep :3000` to find the process pid and kill the process using `kill -9 <pid>`.

## Dev environment

We use Prisma as ORM and GraphQL as API layer.
We generate NestJS entities from Prisma schema, then we use those entities and manually authored resolvers to generate the GraphQL schema.
All generated artifacts live into `src/@generated` folder, which is git ignored, and are generated upon installing the project dependencies or by calling `pnpm generate` script.

## Generating a new module

> AFAIK there isn't a schematic to add Prisma-ready resources to NestJS, but we could create one

Run `pnpm nest g resource modules/<resource-name>`, select the following options:

- `What transport layer do you use?` -> `GraphQL (code first)`
- `Would you like to generate CRUD entry points?` -> `n`

Feel free to delete `<resource-name>.service.ts` and related test files, if you don't need them.
Add `import { beforeEach, describe, expect, it } from "@jest/globals";` at the beginning of all test files, since we don't rely on global typings.
Add `imports: [PrismaService]` into the newly generated `<resource-name>.module.ts` file and inject it into your resolver construct method `constructor(private readonly prisma: PrismaService) {}`.

## NestJS + Prisma + GraphQL stack

We've used the following technologies and resources to structure the project:

- Starter kit with code-first GraphQL: https://github.com/notiz-dev/nestjs-prisma-starter#instructions

- Setup Prisma in NestJS recipe: https://docs.nestjs.com/recipes/prisma#prisma
- Add GraphQL in NestJS: https://docs.nestjs.com/graphql/quick-start#installation
- Automatically generate NestJS entities from Prisma schema (install `class-transformer` too): https://github.com/unlight/prisma-nestjs-graphql
- Other Prisma generators: https://www.prisma.io/docs/concepts/components/prisma-schema/generators

### n+1 problem

See [Solving n+1 in GraphQL with `findUnique` and Prisma's dataloader](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance#solving-n1-in-graphql-with-findunique-and-prismas-dataloader)

Example with our stack:

```ts
@Resolver(() => Dashboard)
export class DashboardResolver {
  // ...

  @ResolveField(() => [Widget])
  async widgets(@Root() dashboard: Dashboard) {
    return await this.prisma.dashboard
      .findUnique({
        where: {
          id: dashboard.id,
        },
      })
      .widgets();
  }
}
```

## PostgreSQL

Remember to disable generic SQL extension for this workspace and install the PostgreSQL one, when first adding.

## Push notifications

We have different drivers for sending push notifications:

- `void`: does nothing. Can be used for testing or when you don't want to send notifications
- `local`: displays a system notification on the machine the server runs on. It doesn't discriminate between different users, it displays them all. Can be used when you don't want to bother configuring a real driver
- `firebase`: sends notifications using [FCM(Firebase Cloud Messaging)](https://firebase.google.com/docs/cloud-messaging). Can be used in production.

`firebase` driver needs a Firebase project to be configured:

- Create a Firebase project for free: https://firebase.google.com/docs/web/setup#create-firebase-project-and-app
- Generate a new private key for your service account: https://firebase.google.com/docs/admin/setup#initialize_the_sdk_in_non-google_environments
- Copy the generated private key file into `./.firebase-service-account.json`(_default path in env config_) or set the `FIREBASE_SERVICE_ACCOUNT` env variable to the path of the file

Also see [Client README | Push notifications](../client/README.md#push-notifications) for setting up and configuring the client.
