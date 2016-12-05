import CodeMirror from "codemirror"
import "codemirror/lib/codemirror.css"
import "./style.css"
import BrainFeck from "./BrainFeck.js"

const $ = document.querySelector.bind(document);

const elStartBtn = $("#startBtn");
const elPauseBtn = $("#pauseBtn");
const elStepBtn = $("#stepBtn");
const elTextInput = $("#userinput");
const elOut = $("#appoutput");
const elInstructions = $("#instructions");
const elMemory = $("#memory");
const elSlowerBtn = $("#slowerBtn");
const elFasterBtn = $("#fasterBtn");
const elNumberTypeChk = $("#numberTypeChk");

const breakPoints = new Set();
const memoryBlocks = [];
let marker = null;
let oldMemPointer = 0;
let out = [];

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
  const block = document.createElement("div");
  block.classList.add("memblock");
  block.innerText = "0";
  memoryBlocks.push(block);
  elMemory.appendChild(block);
})

brain
.on("awaiting", (cb) => {
  elPauseBtn.disabled = true;
  elStepBtn.disabled = true;
  elTextInput.disabled = false;
})
.on("output", (e) => {
  out.push(e);
  elOut.innerText = out.join("");
})
.on("instruction", (self) => {
  memoryBlocks[oldMemPointer].classList.remove("highlight");
  const pos = editor.posFromIndex(self.instPointer);
  if (marker !== null) {
    marker.clear();
  }
  marker = editor.markText(pos,{line:pos.line, ch:pos.ch+1}, {className: "highlight"});
  memoryBlocks[self.memPointer].innerText = self.memory[self.memPointer];
  memoryBlocks[self.memPointer].classList.add("highlight");
  oldMemPointer = self.memPointer;
  if (pos.ch === 0 && breakPoints.has(pos.line)) {
    elPauseBtn.disabled = false;
    elStepBtn.disabled = false;
    self.state = "PAUSED";
    elPauseBtn.value = "Resume";
  }
})
.on("complete", (self) => {
  ResetFrontEnd({ includingData: false });
  self.reset();
});

// Resets the visuals of the dom for starting again.
// Optionally, also resets the data.
function ResetFrontEnd({ includingData }) {
  elPauseBtn.value = "Pause";
  elPauseBtn.disabled = true;
  elStartBtn.value = "Start";
  elStartBtn.disabled = false;
  memoryBlocks[oldMemPointer].classList.remove("highlight");
  marker ? marker.clear() : void(0);
  editor.setOption("readOnly", false);
  editor.getWrapperElement().classList.remove("cm-readonly");
  if (includingData) {
      memoryBlocks.forEach((m) => {
        m.innerText = "0";
      });
      out = [];
      elOut.innerText = "";
  }
};

elSlowerBtn.addEventListener("click", () => {
  brain.delay = brain.delay * 5;
  elFasterBtn.disabled = false;
});

elFasterBtn.addEventListener("click", () => {
  brain.delay = brain.delay / 5;
  if (brain.delay === 1) {
    elFasterBtn.disabled = true;
  }
});

elStepBtn.addEventListener("click", () => {
  brain.step();
});

elPauseBtn.addEventListener("click", () => {
  switch (elPauseBtn.value) {
    case "Pause":
      brain.state = "PAUSED";
      elPauseBtn.value = "Resume";
      elStepBtn.disabled = false;
      break;
    case "Resume":
      elPauseBtn.value = "Resume";
      brain.state = "RUNNING";
      elPauseBtn.value = "Pause";
      break;
  }
});

elTextInput.addEventListener("keydown", (e) => {
  let key = e.key;
  if (elNumberTypeChk.checked && !Number.isNaN(e.key)) {
    key = Number(e.key);
  };
  brain.emit("input", key);
  elTextInput.disabled = true;
  elPauseBtn.disabled = false;
});

elStartBtn.addEventListener("click", () => {
  const el = editor.getWrapperElement();
  switch (elStartBtn.value) {
    case "Stop":
      ResetFrontEnd({ includingData: true });
      brain.stop();
      brain.reset();
      break;
    case "Start":
      ResetFrontEnd({ includingData: true });
      elPauseBtn.value = "Pause";
      elPauseBtn.disabled = false;
      el.classList.add("cm-readonly");
      editor.setOption("readOnly", true);
      brain
        .setInstructions(editor.getValue())
        .run();
      elStartBtn.value = "Stop";
      break;
  }
});
