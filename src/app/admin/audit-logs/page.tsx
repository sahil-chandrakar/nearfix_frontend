"use client";

import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminPageHeader,
  AdminShell,
  formatAdminDate,
} from "@/components/admin/admin-shell";
import { useAuthToken } from "@/hooks/use-auth-token";
import { ApiError } from "@/lib/http-client";
import { getAdminAuditLogs } from "@/services/admin-service";
import type { AdminAuditLog } from "@/types/admin";

export default function AdminAuditLogsPage() {
  const { token } = useAuthToken();
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }
    getAdminAuditLogs(token)
      .then((nextLogs) => {
        setLogs(nextLogs);
        setError("");
      })
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "Unable to load audit logs.",
        );
      });
  }, [token]);

  return (
    <AdminShell>
      <AdminPageHeader
        subtitle="Read-only trail of admin approval and management actions."
        title="Audit Logs"
      />

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-[14px] text-red-600">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {logs.length === 0 ? (
          <AdminCard>No audit activity yet.</AdminCard>
        ) : (
          logs.map((log) => (
            <AdminCard key={log.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-[17px] font-extrabold capitalize text-black">
                    {log.action.replaceAll("_", " ")}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#6d737c]">
                    Target: {log.targetType}
                    {log.targetId ? ` #${log.targetId}` : ""} • Admin{" "}
                    {log.adminUserId ?? "unknown"}
                  </p>
                  {log.metadata ? (
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-[#f5fbfd] p-3 text-[12px] leading-5 text-[#4d525a]">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  ) : null}
                </div>
                <p className="text-[12px] font-semibold text-[#8a9098]">
                  {formatAdminDate(log.createdAt)}
                </p>
              </div>
            </AdminCard>
          ))
        )}
      </div>
    </AdminShell>
  );
}
