/*
  Warnings:

  - The values [USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OPERATOR', 'ADMIN');
ALTER TABLE "LocationMember" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "LocationMember" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "LocationMember" ALTER COLUMN "role" DROP DEFAULT;

-- CreateTable
CREATE TABLE "SchoolCourse" (
    "id" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "school_code" TEXT NOT NULL,

    CONSTRAINT "SchoolCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BooksOnCourses" (
    "school_course_id" TEXT NOT NULL,
    "book_id" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolCourse_grade_section_school_code_key" ON "SchoolCourse"("grade", "section", "school_code");

-- CreateIndex
CREATE UNIQUE INDEX "BooksOnCourses_school_course_id_book_id_key" ON "BooksOnCourses"("school_course_id", "book_id");

-- AddForeignKey
ALTER TABLE "SchoolCourse" ADD CONSTRAINT "SchoolCourse_school_code_fkey" FOREIGN KEY ("school_code") REFERENCES "School"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BooksOnCourses" ADD CONSTRAINT "BooksOnCourses_school_course_id_fkey" FOREIGN KEY ("school_course_id") REFERENCES "SchoolCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BooksOnCourses" ADD CONSTRAINT "BooksOnCourses_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
