import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navigation } from "@/components/Navigation";
import { DevUtilities } from "@/components/DevUtilities";
import { Code, Bug, GitPullRequest } from "lucide-react";

export default async function DeveloperPage() {
  const user = await getSessionUser();
  if (!user || !user.devModeUnlocked || user.officeRole !== "Developer") {
    redirect("/dashboard");
  }

  const { prisma } = await import("@/lib/prisma");
  const tasks = await prisma.developerTask.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" }
  });

  return (
    <div className="min-h-screen bg-app md:pl-64 pb-20 md:pb-10">
      <Navigation user={user} onOpenQuickAdd={() => {}} />

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              Developer Workspace <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Technical task tracking, architecture notes, and local engineering utilities
            </p>
          </div>
        </div>

        {/* Developer Tasks Section */}
        <div className="bg-card border border-border p-5 rounded-xl">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4 text-pink-400" /> Technical Issues & Tasks ({tasks.length})
          </h3>
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No technical issues logged.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border text-sm">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.issueType} &bull; Severity: {t.severity}</div>
                  </div>
                  <span className="text-xs bg-surface border border-border px-2 py-1 rounded">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 11 Client-Side Developer Utilities */}
        <div>
          <h3 className="text-base font-bold mb-3">Client-Side Developer Utilities</h3>
          <DevUtilities />
        </div>
      </main>
    </div>
  );
}
