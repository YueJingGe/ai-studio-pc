import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router";
import { PageSkeleton } from "../components/PageSkeleton";
import { ErrorBoundary } from "./ErrorBoundary";
import { Layout } from "./Layout";

const HomePage = lazy(() => import("../pages/HomePage"));
const GenPage = lazy(() => import("../pages/GenPage"));
const WorkflowPage = lazy(() => import("../pages/WorkflowPage"));
const AssetsPage = lazy(() => import("../pages/AssetsPage"));

const susp = (node: React.ReactNode) => <Suspense fallback={<PageSkeleton />}>{node}</Suspense>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: susp(<HomePage />) },
      { path: "gen", element: susp(<GenPage />) },
      { path: "workflow", element: susp(<WorkflowPage />) },
      { path: "assets", element: susp(<AssetsPage />) },
    ],
  },
]);
