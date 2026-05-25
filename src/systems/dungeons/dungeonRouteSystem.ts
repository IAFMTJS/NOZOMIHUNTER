import type {
  DungeonRouteGraph,
  DungeonRouteNode,
  DungeonRunContract,
} from "@/contracts/dungeon-contract"

export function getCurrentNode(run: DungeonRunContract): DungeonRouteNode | null {
  const graph = run.routeGraph
  const id = run.currentNodeId
  if (!graph || !id) return null
  return graph.nodes[id] ?? null
}

export function listRouteChoices(run: DungeonRunContract): DungeonRouteNode[] {
  const node = getCurrentNode(run)
  const graph = run.routeGraph
  if (!node || !graph) return []
  const completed = new Set(run.completedNodeIds ?? [])
  return node.exits
    .map((id) => graph.nodes[id])
    .filter((n): n is DungeonRouteNode => n != null && !completed.has(n.id))
}

export function isNodeCompleted(run: DungeonRunContract, nodeId: string): boolean {
  return (run.completedNodeIds ?? []).includes(nodeId)
}

export function markNodeCompleted(
  run: DungeonRunContract,
  nodeId: string
): DungeonRunContract {
  const completed = new Set(run.completedNodeIds ?? [])
  completed.add(nodeId)
  return {
    ...run,
    completedNodeIds: [...completed],
    routeSelectPending: true,
  }
}

export function chooseRouteExit(
  run: DungeonRunContract,
  exitId: string,
  masteryScore = 0
): { run: DungeonRunContract; error?: string } {
  const graph = run.routeGraph
  const node = getCurrentNode(run)
  if (!graph || !node) {
    return { run, error: "No active route graph." }
  }
  if (!node.exits.includes(exitId)) {
    return { run, error: "Invalid route exit." }
  }
  const target = graph.nodes[exitId]
  if (!target) {
    return { run, error: "Unknown sector node." }
  }
  if (
    target.requiredMasteryScore != null &&
    masteryScore < target.requiredMasteryScore
  ) {
    return { run, error: "Mastery too low for this route." }
  }
  return {
    run: {
      ...run,
      currentNodeId: exitId,
      routeSelectPending: false,
      explorationProgress: 100,
      explorationBeat: "ENGAGE",
    },
  }
}

export function allEncounterNodesComplete(run: DungeonRunContract): boolean {
  const graph = run.routeGraph
  if (!graph) return false
  const completed = new Set(run.completedNodeIds ?? [])
  return Object.values(graph.nodes).every((n) => {
    if (n.type !== "ENCOUNTER") return true
    return completed.has(n.id)
  })
}

export function isAtBossGate(run: DungeonRunContract): boolean {
  const node = getCurrentNode(run)
  return node?.type === "BOSS_GATE"
}

export function initRouteRun(
  run: DungeonRunContract,
  graph: DungeonRouteGraph
): DungeonRunContract {
  return {
    ...run,
    runSchemaVersion: 2,
    routeGraph: graph,
    currentNodeId: graph.entryId,
    completedNodeIds: [],
    routeSelectPending: true,
  }
}
