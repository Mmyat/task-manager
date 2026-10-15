import "dotenv/config";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth/password";
import { db } from "./index";
import { todos, users } from "./schema";

async function main() {
  const email = (
    process.env.SEED_ADMIN_EMAIL ?? "admin@example.com"
  ).toLowerCase();
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";

  let [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!admin) {
    [admin] = await db
      .insert(users)
      .values({
        username,
        email,
        password: await hashPassword(password),
        role: "admin",
        bio: "Seeded administrator account",
      })
      .returning();
    console.log(`Created admin user: ${email} / ${password}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  const existingTasks = await db.select({ id: todos.id }).from(todos).limit(1);
  if (existingTasks.length > 0) {
    console.log("Tasks already exist, skipping sample data");
    return;
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await db.insert(todos).values([
    {
      title: "Design the database schema",
      description: "Model users and tasks with Drizzle ORM and Postgres.",
      status: "Completed",
      completed: true,
      completedAt: new Date(now - day),
      priority: "High",
      category: "Backend",
      createdByUserId: admin.id,
      assignedToUserId: admin.id,
      dueDate: new Date(now - 2 * day),
    },
    {
      title: "Build the BFF API routes",
      description: "Implement auth and task CRUD route handlers.",
      status: "InProgress",
      priority: "High",
      category: "Backend",
      createdByUserId: admin.id,
      assignedToUserId: admin.id,
      dueDate: new Date(now + 3 * day),
    },
    {
      title: "Create the dashboard UI",
      description: "Task board with filters, stats and dialogs.",
      status: "Pending",
      priority: "Medium",
      category: "Frontend",
      createdByUserId: admin.id,
      dueDate: new Date(now + 7 * day),
    },
    {
      title: "Write documentation",
      description: "README with local setup and API reference.",
      status: "Pending",
      priority: "Low",
      category: "Docs",
      createdByUserId: admin.id,
    },
  ]);

  console.log("Seeded 4 sample tasks");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
