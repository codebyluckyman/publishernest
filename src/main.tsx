import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext";
import { OrganizationProvider } from "./context/OrganizationContext";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "./lib/react-query";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toaster
      toastOptions={{
        classNames: {
          error: "bg-red-400",
          success: "text-green-400",
          warning: "text-yellow-400",
          info: "bg-blue-400",
          toast: "bg-white text-gray-900 shadow-md border border-gray-200",
          description: "text-gray-900",
        },
      }}
    />
    <AuthProvider>
      <OrganizationProvider>
        <App />
      </OrganizationProvider>
    </AuthProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
