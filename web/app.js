import {cases} from "./cases.js";
const byId = id => document.getElementById(id);
const make = (tag, text) => Object.assign(document.createElement(tag), {textContent:text});
let engine, current = 0;
const chosen = cases.map(() => 0);
function displayImpact() {
  const c = cases[current], mask = chosen[current];
  const down = engine.impact(current, mask, Number(byId("failed").value));
  byId("impact").textContent = c.nodes.filter((_, i) => down & (1 << i)).join(" · ");
  const edges = c.links.flatMap(([a,b], i) => mask & (1 << i) ? [make("li", c.nodes[a]+" → "+c.nodes[b])] : []);
  byId("map").replaceChildren(...(edges.length ? edges : [make("li","Select a supported link in the notebook.")]));
}
function inspect(index) {
  current = index;
  const c = cases[index];
  Array.from(byId("cases").children).forEach((btn,i) => btn.setAttribute("aria-pressed", String(i === index)));
  for (const key of ["topic","title","brief"]) byId(key).textContent = c[key];
  byId("failed").replaceChildren(...c.nodes.map((name,i) => Object.assign(make("option",name), {value:i})));
  byId("failed").value = c.links[c.links.length-1][1];
  byId("feedback").textContent = "";
  byId("claims").replaceChildren(...c.links.map(([a,b],i) => {
    const label = make("label",""), input = document.createElement("input"), body = make("span","");
    label.className = "claim"; input.type = "checkbox"; input.checked = Boolean(chosen[index] & (1 << i));
    body.append(make("strong",c.nodes[a]+" → "+c.nodes[b]),make("small",c.clues[i]), make("em",""));
    input.onchange = () => {
      chosen[index] ^= 1 << i;
      byId("feedback").textContent = "";
      document.querySelectorAll(".claim em").forEach(note => note.textContent = "");
      displayImpact();
    };
    label.append(input,body); return label;
  }));
  displayImpact();
}
async function start() {
  const response = await fetch("./engine.wasm");
  if (!response.ok) throw Error("Engine unavailable");
  engine = (await WebAssembly.instantiate(await response.arrayBuffer())).instance.exports;
  cases.forEach((c,i) => {
    const btn = make("button",c.title); btn.onclick = () => inspect(i); byId("cases").append(btn);
  });
  byId("failed").onchange = displayImpact;
  byId("check").onclick = () => {
    const missed = engine.missing(current,chosen[current]), extra = engine.unsupported(current,chosen[current]);
    document.querySelectorAll(".claim em").forEach((note,i) => {
      note.textContent = missed & (1 << i) ? "Revisit the runtime evidence for this link." : extra & (1 << i) ? "This clue does not establish a direct dependency." : "";
    });
    byId("feedback").textContent = missed || extra ? "Review the marked links and test your revised map." : "Map verified. "+cases[current].lesson;
  };
  byId("check").disabled = false; inspect(0);
}
start().catch(() => byId("title").textContent = "The Rust engine could not load. Reload to retry.");
