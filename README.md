# Service Map Observatory

Three original service-mapping investigations. Read synthetic evidence, reconstruct direct dependencies and simulate an outage. Try a shared database, a stale payment endpoint and an indirect broker dependency. The simulator treats every selected link as required. It models availability within each case, without failover or queue buffering.

[Open the lab](https://kmrreddy111.github.io/service-map-observatory/)

## Learn the Rust
Start in `src/lib.rs`. A struct pairs each directed graph with the set of supported links. Each bit in a selection mask represents a link. The Rust exports compare the learner's mask with the supported mask, then walk from a failed provider back to its consumers until the affected set stops growing. The browser loads this crate as WebAssembly. HTML, CSS and JavaScript handle the controls and evidence cards.

Run locally with Rust, Cargo and Python 3:

```sh
cargo test
rustup target add wasm32-unknown-unknown
cargo build --lib --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/service_map_observatory.wasm web/engine.wasm
python3 -m http.server 8000 --directory web
```

Open http://localhost:8000. To experiment, remove one supported link in the broker case and write a test predicting which publishers still depend on the disk. To add an investigation, match the edge order in the Rust case and the evidence entries in `web/cases.js`.

GitHub Actions runs the native tests, compiles the WebAssembly module and publishes the web directory to GitHub Pages on pushes to main.
