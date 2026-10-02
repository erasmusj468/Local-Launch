import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to Dashboard</h1>
      <p>Logged in as: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
