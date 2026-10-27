import { EmptyState } from "../components/EmptyState";

export default function WorkflowPage() {
  return (
    <div>
      <h1 className="px-6 py-4 text-lg font-semibold">工作流</h1>
      <EmptyState text="节点编排画布（P3 里程碑：React Flow DAG + 拓扑执行）" />
    </div>
  );
}
