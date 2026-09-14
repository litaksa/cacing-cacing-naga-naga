import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CcnnApp } from "@/components/ccnn-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <CcnnApp />
    </QueryClientProvider>
  );
}
