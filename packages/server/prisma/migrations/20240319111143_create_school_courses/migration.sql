-- CreateTable
CREATE TABLE "SchoolCourse" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "school_code" TEXT NOT NULL,

    CONSTRAINT "SchoolCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BooksOnCourses" (
    "school_course_id" UUID NOT NULL,
    "book_id" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SchoolCourse_year_section_school_code_key" ON "SchoolCourse"("year", "section", "school_code");

-- CreateIndex
CREATE UNIQUE INDEX "BooksOnCourses_school_course_id_book_id_key" ON "BooksOnCourses"("school_course_id", "book_id");

-- AddForeignKey
ALTER TABLE "SchoolCourse" ADD CONSTRAINT "SchoolCourse_school_code_fkey" FOREIGN KEY ("school_code") REFERENCES "School"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BooksOnCourses" ADD CONSTRAINT "BooksOnCourses_school_course_id_fkey" FOREIGN KEY ("school_course_id") REFERENCES "SchoolCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BooksOnCourses" ADD CONSTRAINT "BooksOnCourses_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
