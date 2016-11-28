import CodeMirror from "codemirror"
import "codemirror/lib/codemirror.css"
import "./style.css"
import BrainFeck from "./BrainFeck.js"

let out = [];
const $ = document.querySelector.bind(document);

const elRunBtn = $("#runBtn");
const elPauseBtn = $("#pauseBtn");
const elTextInput = $("#userinput");
const elOut = $("#appoutput");
const elInstructions = $("#instructions");
const elMemory = $("#memory");

elTextInput.disabled = true;

let marker = null;
let breakPoints = new Set();
let memoryBlocks = [];
let oldMemPointer = 0;

const editor = CodeMirror.fromTextArea(elInstructions, {
  lineNumbers: true,
  lineWrapping: true,
  gutters: ["CodeMirror-linenumbers", "breakpoints"]
});

editor.on("gutterClick", (cm, n) => {
  const info = cm.lineInfo(n);
  const line = editor.doc.getLineHandle(n);
  line.on("delete", () => {
    breakPoints.delete(n);
  });
  function makeMarker() {
    const marker = document.createElement("div");
    marker.style.color = "#822";
    marker.innerHTML = "●";
    return marker;
  };
  cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
  if (breakPoints.has(n)) {
    breakPoints.delete(n);
  }
  else {
    breakPoints.add(n);
  }
});

const brain = new BrainFeck();

brain.memory.forEach((m) => {
  let block = document.createElement("div");
  block.classList.add("memblock");
  block.innerText = "0";
  memoryBlocks.push(block);
  elMemory.appendChild(block);
})

brain
.on("awaiting", (cb) => {
  elPauseBtn.disabled = true;
  elTextInput.disabled = false;
})
.on("output", (e) => {
  out.push(e);
  elOut.innerText = out.join("");
})
.on("instruction", (self) => {
  memoryBlocks[oldMemPointer].classList.remove("highlight");
  let pos = editor.posFromIndex(self.instPointer);
  if (marker !== null) {
    marker.clear();
  }
  marker = editor.markText(pos,{line:pos.line, ch:pos.ch+1}, {className: "highlight"});
  memoryBlocks[self.memPointer].innerText = self.memory[self.memPointer];
  memoryBlocks[self.memPointer].classList.add("highlight");
  oldMemPointer = self.memPointer;
  if (pos.ch === 0 && breakPoints.has(pos.line)) {
    elPauseBtn.disabled = false;
    self.state = "PAUSED";
    elPauseBtn.value = "Resume";
  }
})
.on("complete", (self) => {
  elRunBtn.disabled = false;
  elPauseBtn.disabled = true;
  editor.setOption("readOnly", false);
  elOut.innerText = out.join("");
  self.reset();
});

elPauseBtn.addEventListener("click", () => {
  if (elPauseBtn.value === "Pause") {
    brain.state = "PAUSED";
    elPauseBtn.value = "Resume";
  }
  else {
    elPauseBtn.value = "Resume";
    brain.state = "RUNNING";
    elPauseBtn.value = "Pause";
  }
});

elTextInput.addEventListener("keydown", (e) => {
  brain.emit("input", e.key);
  elTextInput.disabled = true;
  elPauseBtn.disabled = false;
});

elRunBtn.addEventListener("click", () => {
  elPauseBtn.value = "Pause";
  elPauseBtn.disabled = false;
  elOut.innerText = "";
  out = [];
  memoryBlocks.forEach((m) => {
    m.innerText = "0";
  });
  elRunBtn.disabled = true;
  editor.setOption("readOnly", true);
  brain
    .setInstructions(editor.getValue())
    .run()
});
