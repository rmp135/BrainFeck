import CodeMirror from "codemirror"
import "codemirror/lib/codemirror.css"
import "./style.css"
import BrainFeck from "./BrainFeck.js"

let out = [];
const $ = document.querySelector.bind(document);

const elButton = $("#button");
const elTextInput = $("#userinput");
const elOut = $("#appoutput");
const elTextArea = $("#instructions");
const elMemory = $("#memory");

elTextInput.disabled = true;

let marker = null;

const editor = CodeMirror.fromTextArea(elTextArea, {
  lineNumbers: true,
  lineWrapping: true
});

const brain = new BrainFeck();

let memoryBlocks = [];
let oldMemPointer = 0;

brain.memory.forEach((m) => {
  let block = document.createElement("div");
  block.classList.add("memblock");
  block.innerText = "0";
  memoryBlocks.push(block);
  elMemory.appendChild(block);
})

brain
.on("awaiting", (cb) => elTextInput.disabled = false)
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
})
.on("complete", (self) => {
  elButton.disabled = false;
  editor.setOption("readOnly", false);
  elOut.innerText = out.join("");
  self.reset();
});

elTextInput.addEventListener("keydown", (e) => {
  brain.emit("input", e.key);
  elTextInput.disabled = true;
})
elButton.addEventListener("click", () => {
  elOut.innerText = "";
  out = [];
  memoryBlocks.forEach((m) => {
    m.innerText = "0";
  });
  elButton.disabled = true;
  editor.setOption("readOnly", true);
  brain
    .setInstructions(editor.getValue())
    .run()
});
