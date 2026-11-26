// Node indices and candidate order correspond to CASES in src/lib.rs.
export const cases = [
  {
    title: "The shared ledger", topic: "Shared infrastructure", nodes: ["Mobile banking","Transfer API","Ledger DB","Statements"],
    brief: "Two banking journeys share a database. Reconstruct their direct runtime dependencies before a ledger maintenance window.",
    links: [[0,1],[1,2],[0,3],[1,3],[3,2]],
    clues: ["Gateway trace · Mobile banking forwards transfer requests to Transfer API.","Connection pool · Transfer API opens SQL sessions to Ledger DB.","CMDB label · Mobile banking and Statements share a support group.","Inventory · Transfer API and Statements run in the same cluster.","Query log · Statements reads posted balances directly from Ledger DB."],
    lesson: "Fail Ledger DB and both journeys are affected. Fail Transfer API and Statements can still read the ledger."
  },
  {
    title: "The stale endpoint", topic: "Map drift", nodes: ["Checkout","Current gateway","Legacy gateway","Payments DB"],
    brief: "A payment migration left an old DNS alias behind. Map the current production calls. The legacy gateway still serves a separate workload.",
    links: [[0,1],[0,2],[1,3],[2,3],[0,3]],
    clues: ["Active trace · Every Checkout authorization calls Current gateway.","Archived setting · Last month's Checkout config names Legacy gateway. Today's traces use its replacement.","SQL trace · Current gateway writes authorizations to Payments DB.","Session audit · Legacy gateway still reads Payments DB for another workload.","Ownership tag · Checkout and Payments DB have the same cost center."],
    lesson: "Fail Legacy gateway and Checkout stays available. Fail Payments DB and both gateways lose their provider."
  },
  {
    title: "The invisible broker", topic: "Indirect dependencies", nodes: ["Dispatch","Tracking","Event broker","Journal disk"],
    brief: "Two logistics services require broker acknowledgments. Model the direct dependencies needed to publish an event durably.",
    links: [[0,2],[1,2],[0,3],[2,3],[1,3]],
    clues: ["Publisher trace · Dispatch requires an acknowledgment from Event broker.","Publisher trace · Tracking also waits for the broker acknowledgment.","Incident timeline · Dispatch stalled during disk maintenance. Its trace ends at the broker.","Storage config · Event broker acknowledges only after flushing to Journal disk.","Tag export · Tracking and Journal disk have the same application tag."],
    lesson: "A journal failure reaches both publishers through the broker. Direct disk links from either publisher would misrepresent the call path."
  }
];
