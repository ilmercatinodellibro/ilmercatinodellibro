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

## Application Backup

The system performs automated backups of both the **database** and **application files** to ensure full recoverability. Backups are stored locally and synced with Aruba Cloud Storage.

### 📦 What Gets Backed Up

| Component         | Details                                                                               | Frequency               | Retention |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------- | --------- |
| **Database**      | Complete PostgreSQL dump (compressed)                                                 | 2x daily (14:00, 19:30) | 7 days    |
| **Application**   | All application files (excluding `node_modules`, `.git`, and logs)                    | Daily (02:00)           | 7 days    |
| **Configuration** | Critical config files (`.env`, [Docker configs](/packages/server/docker-compose.yml)) | With application        | 7 days    |

> ⚠️ **Note**: Insure you have `.env` configured correctly for the backup process to work. The backup script will not run if the `.env` file is missing or misconfigured.

---

### 🔧 How It Works

#### **1. Database Backup**

Automated PostgreSQL backups via Alpine container with cron scheduling.

- To manage the cron jobs, see the [`crontab`](/packages/server/backup/config/crontabs) file.
- To view the DB backup script, see [`backup_db.sh`](/packages/server/backup/scripts/backup_db.sh).

**Schedule:**

```bash
# Minute  Hour  Day/Month  Month  Day/Week  Command
# ──────  ────  ─────────  ─────  ────────  ──────────────────
0         14    *          *      *         /scripts/backup_db.sh    # Daily at 14:00
30        19    *          *      *         /scripts/backup_db.sh    # Daily at 19:30
0         0     *          *      *         /scripts/sync.sh         # Cloud sync at midnight
```

**Key Features:**

- **Retention:** 7 days (local and cloud)
- **Compression:** Gzip-compressed SQL dumps
- **Verification:** Automatic integrity checks
- **Naming:** `db_backup_YYYYMMDD_HHMMSS.sql.gz`

---

#### **2. Application Backup**

Full application directory backup excluding non-essential files.

- To view the application backup script, see [`backup_app.sh`](/packages/server/backup/scripts/backup_app.sh).

**Schedule:**

```bash
0  2  *  *  *  /scripts/backup_app.sh  # Daily at 02:00
```

**Excluded:**

```text
node_modules/
.git/
*.log
```

---

#### **3. Cloud Sync with Rclone**

Backups are synced to Aruba Cloud via S3 protocol.

**Configuration:**

- To view the Rclone configuration, see [`rclone.conf`](/packages/server/backup/config/rclone.conf).
- To view the sync script, see [`sync.sh`](/packages/server/backup/scripts/sync.sh).
- To view the cron job for syncing, see [`crontab`](/packages/server/backup/config/crontabs).

#### Email Alerts

- Email alerts for backup failures are sent to the configured email address.
- To view the email configuration, see [`msmtprc`](/packages/server/backup/config/msmtprc).
- To view the email script, see [`send_mail.sh`](/packages/server/backup/scripts/send_mail.sh).

---

### 🚀 Useful Commands

#### Manual Backups

```bash
# Manual DB backup
pnpm backup:db

# Full app backup
pnpm backup:app

# Force cloud sync
pnpm backup:sync
```

#### To enter the backup container

```bash
# Enter the backup container
pnpm backup:alpine
```

### 🔍 Monitoring

- Check logs file in `$HOME/mdl_backups/logs/` for backup status
- Email alerts for backup failures are sent to the configured email address

## **Restore Procedures**

### **1. How Restoration Works**

Restoration is performed via dedicated scripts running inside the `backup` container. The system supports:

| Type            | Script Location                                                                     | Key Features                                                                |
| --------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Database**    | [`./backup/scripts/restore_db.sh`](/packages/server/backup/scripts/restore_db.sh)   | - Atomic operation<br>- Preserves permissions<br>- Interactive confirmation |
| **Application** | [`./backup/scripts/restore_app.sh`](/packages/server/backup/scripts/restore_app.sh) | - Selective file extraction<br>- Version rollback capability                |

### **2. Step-by-Step Guide**

#### **Database Restoration**

```bash
# 1. List available backups
pnpm restore:db:list

# 2. Run restore
pnpm restore:db <backup_file_name>
```

> 💡 **Note:** Requires active PostgreSQL container. The script will prompt for confirmation before overwriting data.

#### **Application Restoration**

```bash
# 1. List application backups
pnpm restore:app:list

# 2. Run restore
pnpm restore:app <backup_file_name>
```

> ⚠️ **Warning:** This overwrites existing files in `/app`. Critical files like `.env` should be backed up separately.

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
    3. `pnpm migrate:reset` to reset database, run migrations and create the structure of the DB and finally seed the DB. Do not run this command when Mercatino is in production, or all the data will be lost!
    4. `pnpm build` to prepare the server app
    5. Now follow instruction inside the [server's README.md](./packages/server/README.md#2-import-books) to import books and schools.
    6. Now run `pnpm start:prod` to start the application of the server.
13. Now, while the server is running in the other terminal, in the second opened terminal return to the `packages/client` directory:
    1. Run `pnpm generate`.
    2. Run `pnpm build`. This should copy the just built client into the server folder and thus it should already be accessible since the server is running.
14. Make sure your web server is publishing the app on the correct port.
15. Bonus tip: in order to be sure that the server is always running or that at least it gets restarted, we suggest to install and configure [PM2](https://www.npmjs.com/package/pm2) in order to restart the server process should it crash.
