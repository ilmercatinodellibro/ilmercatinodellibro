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

### Quick access to data on Windows

Docker for Windows has a GUI executable that can be used to perform many different actions.

One of them is being able to run commands directly inside the Docker instances. This can be useful if a developer needs to quickly access the data from the native Postgre tables.
To do so, follow these steps (_Docker version 4.25.0_):

1. Launch Docker and make sure the proper container for Mercatino is running.
2. Expand the group of the container for the Mercatino and click on the `ilmercatinodellibro-postgres` container.
3. A number of tabs should be shown to you.
4. Click on the tab named `Exec`. A terminal should be shown inside the tab panel.
5. in there type the following command, substituting the `${values}` with the ones coming from your `.env` file: `psql -d ${postgres_database_name} -U ${postgres_database_user}` and then press `Enter`.
6. The terminal should change and bring you into something labelled as `postgres=#`.
7. To select the records from a table then run, for example: `select human_readable_id from public."RetailLocation";`.

Of course you can change the names of the entities to query from as you need.

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

## Importing data from files

These sections explain how to load the Books and Schools plus Courses data correctly into the server at startup time for each new year.

First, make sure that the Books, Schools, Courses and BooksOnCourses records have been removed, then proceed with these steps.

### 1. Import Books

The first step needed is to import the books dataset from the [ministry website](https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Adozioni%20libri%20di%20testo) and place it into the folder called `tmp-files`. The file name should be `ALTEMILIAROMAGNA.csv`, so the location of the file with respect to where the CLI command to run the server is executed should be `./tmp-files/ALTEMILIAROMAGNA.csv`.

This operation **must** be executed before importing the schools, because this CSV directs how the content of the other CSVs needs to be managed and parsed.
In particular, it prints out a list of School codes that were found during the analysis of the books, and only the schools with at least a book in the `ALTEMILIAROMAGNA.csv` can be later added to the DB.

Note: Additionally, from this CSV it is possible to derive which books belongs to which study course and which course belongs to which school.
The output of this operation is stored to a file called `school_courses.json`.

With everything in place, at the moment the easiest way to load the Books data into DB is to go to `book.resolver.ts` and inside its constructor add the line `void this.loadBooksIntoDatabase();`, save the file and run `pnpm dev` inside the server CLI. Once the server is up and running and the operation is concluded, usually it does not take much time, you can then stop the `dev server` and remove that line of code.

Once this steps is concluded, we can move on to step 2.

### 2. Import School CSV and connect School Courses to their Schools

Before being able to actually import School and School Courses, it is necessary to:

1. Have run the import of books in step 1.
2. Download peer schools's CSV for the current year from the [ministry website](https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Scuole) It is in the section _Informazioni anagrafiche scuole paritarie_.
3. Rename CSV downloaded in point 2 of this list to `SCUOLE_PARITARIE.csv` and place it into the folder `./tmp-files/`.
4. From the same link in point 2 of this list, download the CSV for the state's schools from the area called _Informazioni anagrafiche scuole statali_ and pay attention it its year.
5. Rename CSV downloaded in point 4 of this list to `SCUOLE_STATALI.csv` and place it into the folder `./tmp-files/`.

After the setup operations are concluded, you can then use the same trick of the Import Books section: go to `book.resolver.ts` and inside its constructor add the line `void this.loadSchoolsIntoDb();`, save the file and run `pnpm dev` inside the server CLI. Once the server is up and running and the operation is concluded you can then stop the `dev server` and remove that line of code. This operation takes much more time when compared to the first operation because it needs to loop through courses, create them first and then generate their books related records. From current tests it takes up to a full minute for the system to be able to create all the records it needs.

After this step is done, all the pieces of the puzzle are in their place and the data has been loaded.

### Improvements for import

There are some possible improvements that we'll need to make in order to make the execution of the import of data more seamless.

1. Use [Nest.js command files](https://docs.nestjs.com/recipes/nest-commander#a-command-file) to add a couple of commands to the available ones: one for dropping old DB content and the other one to import the Books, then Schools and courses.
2. We can think about adding a capability of the client app that only admins can leverage to load the data of both Schools and Books into the DB.

At the moment, we do not have that much time to take care of this, but the first approach sounds more like the most secure one.

Another note: for the moment I decided not to connect Schools to a retailLocation, even if the school code already includes the province, thus the retailLocationId.
This is because at the moment there are no requirements involving such a thing and in this way schools can be still viewed from other retailLocations.
