PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "refreshToken" TEXT,
    "profile_image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otp_expires" DATETIME,
    "password_reset_otp" TEXT,
    "password_reset_otp_expires" DATETIME,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO users VALUES(2,'admin','User','admin@example.com','$2b$12$IAJ.FHtjD0z.GFLS5wLOWuO7L/.KIo21wiPWXY.QkWN0YwaWWJh9O',NULL,NULL,'active',1,NULL,NULL,NULL,NULL,1775986597313,1770387016431,1775986597315);
INSERT INTO users VALUES(3,'Head','CS','hod.cs@lms.com','$2b$12$Gdrp3wwXpcM.bYJncCaBC.TuLc1yt9Akt74zyfd6VsiC3LngfOi0a',NULL,NULL,'active',1,NULL,NULL,NULL,NULL,1771790736589,1770389565228,1771790736590);
INSERT INTO users VALUES(5,'taimoor','iqbal','taimoorkhan@student.com','$2b$12$JNXKIYklgxTDed.agRIzveMlMFLJ0xdJZAc0ZL4DASScUjoJoYqIG',NULL,'https://example.com/profile.jpg','active',1,NULL,NULL,'364810',1771099234202,1775986682963,1770551169894,1775986682965);
INSERT INTO users VALUES(9,'Wahab','Khan','wahab@gmail.com','$2b$12$WHY8HCGIrlD6dlxPDLlfVeHAF1D7rVXaVVTc0r.FshOsTdpelUD/m',NULL,'https://res.cloudinary.com/doem8zq0d/image/upload/v1771009996/lms_profiles/yddbzkj4f1tfngue3ett.jpg','active',1,NULL,NULL,NULL,NULL,1775985974007,1771009997334,1775985974017);
INSERT INTO users VALUES(12,'Kamran','Khan','kamran@gmail.com','$2b$12$BUWDAobire5n8iHGT5rMk.lwhd5D0/JsP/AqLUj.rO5/DkU5t.gF.',NULL,'https://res.cloudinary.com/doem8zq0d/image/upload/v1771011546/lms_profiles/ofkczbxva9yvkpnvdqpy.png','active',1,NULL,NULL,NULL,NULL,1775986167367,1771011547653,1775986167371);
CREATE TABLE IF NOT EXISTS "roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role_name" TEXT NOT NULL
);
INSERT INTO roles VALUES(1,'ADMIN');
INSERT INTO roles VALUES(2,'INSTRUCTOR');
INSERT INTO roles VALUES(3,'STUDENT');
CREATE TABLE IF NOT EXISTS "user_role" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO user_role VALUES(2,1);
INSERT INTO user_role VALUES(3,2);
INSERT INTO user_role VALUES(5,3);
INSERT INTO user_role VALUES(9,2);
INSERT INTO user_role VALUES(12,2);
CREATE TABLE IF NOT EXISTS "departments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hod_user_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "departments_hod_user_id_fkey" FOREIGN KEY ("hod_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO departments VALUES(1,'SE','Computer Science',9,'inactive',1770389565279,1771726429256);
INSERT INTO departments VALUES(2,'EE','Electrical Engineering',9,'active',1770389565306,1771554773268);
INSERT INTO departments VALUES(3,'MATH','Mathematucs',9,'active',1770389652599,1771554779696);
CREATE TABLE IF NOT EXISTS "programs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO programs VALUES(1,'BSCS','BS Computer Science',1,2,1770389565400,1770451479338);
INSERT INTO programs VALUES(2,'BSSE','BS Software Engineering',1,4,1770389565428,1770389565428);
INSERT INTO programs VALUES(3,'BSEE','BS Electrical Engineering',2,2,1770389565454,1770450972591);
CREATE TABLE IF NOT EXISTS "instructors" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employee_no" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    CONSTRAINT "instructors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "instructors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO instructors VALUES(3,'EMP001',1);
INSERT INTO instructors VALUES(9,'Eml8383',3);
INSERT INTO instructors VALUES(12,'Emp1334',2);
CREATE TABLE IF NOT EXISTS "students" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ag_no" TEXT NOT NULL,
    "department_id" INTEGER NOT NULL,
    "admission_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "program_id" INTEGER NOT NULL,
    CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "students_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO students VALUES(5,'2024-AG-1234',1,1725148800000,1);
CREATE TABLE IF NOT EXISTS "academic_terms" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO academic_terms VALUES(1,'Fall 2026 Spring',1687219200000,1813449600000,1,1770409409526,1770409409526);
CREATE TABLE IF NOT EXISTS "courses" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "credit_hours" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "updated_at" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "academic_term_id" INTEGER,
    CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "courses_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO courses VALUES(1,'CS-414','Machine Learning','An introductory course to neural networks and data science.',3,1,1770800458125,2,1770800458125,1,1);
INSERT INTO courses VALUES(2,'ACCA-410','BBA Fundaminetals','A comprehensive study of the software development lifcle, methodologies, and tools.',1,1,1770981757649,2,1771788974681,1,1);
INSERT INTO courses VALUES(3,'CS-410','Programing  Fundaminetals','A comprehensive study of the software development lifecycle, methodologies, and tools.',2,1,1771403247460,2,1771403247460,1,1);
INSERT INTO courses VALUES(4,'STATS-780','Introduction of Stats','Vsjshnxodbximjd',5,3,1771485851699,3,1771485851699,1,1);
CREATE TABLE IF NOT EXISTS "academic_term_mappings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "academic_term_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "academic_term_mappings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "academic_term_mappings_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "course_instructors" (
    "course_id" INTEGER NOT NULL,
    "instructor_user_id" INTEGER NOT NULL,

    PRIMARY KEY ("course_id", "instructor_user_id"),
    CONSTRAINT "course_instructors_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_instructors_instructor_user_id_fkey" FOREIGN KEY ("instructor_user_id") REFERENCES "instructors" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO course_instructors VALUES(1,12);
INSERT INTO course_instructors VALUES(1,9);
INSERT INTO course_instructors VALUES(3,12);
INSERT INTO course_instructors VALUES(2,3);
INSERT INTO course_instructors VALUES(3,3);
CREATE TABLE IF NOT EXISTS "course_contents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtube_url" TEXT,
    "uploaded_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "course_contents_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "course_contents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO course_contents VALUES(1,1,'Your Very First Lesson ','You have to learn it ','https://www.youtube.com/@panaverse/playlists',2,1770900667292,1770900667292);
INSERT INTO course_contents VALUES(3,2,'your very second lessopn ','kdhwqiqwdjijqwpdjixpiwmjxp','https://youtu.be/7dFd4uuGjQQ?si=MQzmPtEjoTc-McxG',3,1771518462081,1771518462081);
INSERT INTO course_contents VALUES(4,2,'Newbub','B h hvhbhb',NULL,3,1771521692912,1771521692912);
CREATE TABLE IF NOT EXISTS "enrollments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_user_id" INTEGER NOT NULL,
    "enrolled_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "course_id" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'enrolled',
    "academic_term_id" INTEGER NOT NULL,
    CONSTRAINT "enrollments_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "students" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "enrollments_academic_term_id_fkey" FOREIGN KEY ("academic_term_id") REFERENCES "academic_terms" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO enrollments VALUES(2,5,1770983477339,1,'enrolled',1);
INSERT INTO enrollments VALUES(5,5,1771589916912,3,'enrolled',1);
CREATE TABLE IF NOT EXISTS "societies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "incharge_user_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "societies_incharge_user_id_fkey" FOREIGN KEY ("incharge_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO societies VALUES(1,'Coding Society','A society for passionate developers and competitive programmers.',NULL,3,0,1770452369733,1775986517086);
INSERT INTO societies VALUES(4,'Music Club','A society for passionate developers and competitive programmers.','https://res.cloudinary.com/doem8zq0d/image/upload/v1770467773/lms_profiles/cdetrrz4mor6pl5cu7vk.png',9,1,1770467774352,1771522319616);
CREATE TABLE IF NOT EXISTS "society_positions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL
);
INSERT INTO society_positions VALUES(1,'President',1);
INSERT INTO society_positions VALUES(2,'Vice President',2);
INSERT INTO society_positions VALUES(3,'Secatory',3);
INSERT INTO society_positions VALUES(4,'Finance Secatory',5);
INSERT INTO society_positions VALUES(5,'Member',5);
CREATE TABLE IF NOT EXISTS "society_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "society_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "position_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "society_members_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_members_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "society_positions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO society_members VALUES(3,4,5,5,1);
INSERT INTO society_members VALUES(6,1,5,3,1);
CREATE TABLE IF NOT EXISTS "society_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "society_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATETIME NOT NULL,
    "event_time" TEXT NOT NULL,
    "poster_url" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "society_events_society_id_fkey" FOREIGN KEY ("society_id") REFERENCES "societies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "society_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO society_events VALUES(3,4,'Welcome Party 2026','Annual welcome party for new student',1728950400000,'14:00','https://example.com/poster.jpg',2,1770546174757,1771425874024);
INSERT INTO society_events VALUES(4,1,'Annual Tech Symposium 2026','A grand gathering of technology enthusiasts to share knowledge and projects.',1774429200000,'09:00 AM',NULL,2,1771419197709,1771419197709);
INSERT INTO society_events VALUES(5,1,'Test','NB DG HF Ru ',1771372800000,'16:19','https://res.cloudinary.com/doem8zq0d/image/upload/v1771420811/lms_profiles/ouwnmfqdel4ozkjtxw1g.png',3,1771420812253,1771529177597);
INSERT INTO sqlite_sequence VALUES('roles',3);
INSERT INTO sqlite_sequence VALUES('users',12);
INSERT INTO sqlite_sequence VALUES('departments',3);
INSERT INTO sqlite_sequence VALUES('instructors',12);
INSERT INTO sqlite_sequence VALUES('programs',4);
INSERT INTO sqlite_sequence VALUES('academic_terms',1);
INSERT INTO sqlite_sequence VALUES('societies',4);
INSERT INTO sqlite_sequence VALUES('society_events',5);
INSERT INTO sqlite_sequence VALUES('students',5);
INSERT INTO sqlite_sequence VALUES('society_positions',5);
INSERT INTO sqlite_sequence VALUES('society_members',6);
INSERT INTO sqlite_sequence VALUES('courses',4);
INSERT INTO sqlite_sequence VALUES('enrollments',5);
INSERT INTO sqlite_sequence VALUES('course_contents',4);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "programs_code_key" ON "programs"("code");
CREATE UNIQUE INDEX "instructors_employee_no_key" ON "instructors"("employee_no");
CREATE UNIQUE INDEX "students_ag_no_key" ON "students"("ag_no");
CREATE UNIQUE INDEX "courses_code_key" ON "courses"("code");
CREATE UNIQUE INDEX "enrollments_student_user_id_course_id_key" ON "enrollments"("student_user_id", "course_id");
CREATE UNIQUE INDEX "societies_name_key" ON "societies"("name");
CREATE UNIQUE INDEX "society_positions_name_key" ON "society_positions"("name");
CREATE UNIQUE INDEX "society_members_society_id_user_id_key" ON "society_members"("society_id", "user_id");
COMMIT;
