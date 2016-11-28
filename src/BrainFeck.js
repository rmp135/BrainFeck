import EventEmitter from './EventEmitter.js'

export default class BrainFeck  {
  constructor (instructions) {
    this.memory = new Uint8Array(300);
    this.memPointer = 0;
    this.instPointer = 0;
    this.instructions = [];
    this.setInstructions(instructions);
    this.state = "RUNNING"; //RUNNING | AWAITING | PAUSED
    this.eventEmitter = new EventEmitter();
  }
  setInstructions (instructions) {
    if (Array.isArray(instructions)) {
      this.instructions = instructions;
    }
    else if (typeof instructions === "string") {
      this.instructions = instructions.split("");
    }
    return this;
  }
  reset () {
    this.memPointer = 0;
    this.instPointer = 0;
    this.memory.forEach((m,i,mem) => mem[i] = 0);
  }
  on (event, f) {
    this.eventEmitter.on(event, f);
    return this;
  }
  emit (event, props) {
    this.eventEmitter.emit(event, props);
    return this;
  }
  executeInstruction (instruction) {
    switch (instruction) {
      case ">":
        this.memPointer++;
        if (this.memPointer >= this.memory.length) throw new Error("Memory pointer overflow.");
        break;
      case "<":
        this.memPointer--;
        if (this.memPointer < 0) throw new Error("Memory pointer underflow.");
        break;
      case "+":
        this.memory[this.memPointer]++;
        break;
      case "-":
        this.memory[this.memPointer]--;
        break;
      case "[": (function() {
        let tempPointer = this.instPointer;
        if (this.memory[this.memPointer] === 0) {
          tempPointer++;
          let bracketCount = 1;
          while (bracketCount > 0) {
            if (this.instructions[tempPointer] === "[") {
              bracketCount++;
            }
            else if (this.instructions[tempPointer] === "]") {
              bracketCount--;
            }
            tempPointer++;
          }
          this.instPointer = tempPointer - 1;
        }
      }).call(this);
      break;
      case "]": (function() {
        let tempPointer = this.instPointer;
        if (this.memory[this.memPointer] !== 0) {
          tempPointer--;
          let bracketCount = 1;
          while (bracketCount > 0) {
            if (this.instructions[tempPointer] === "]") {
              bracketCount++;
            }
            else if (this.instructions[tempPointer] === "[") {
              bracketCount--;
            }
            tempPointer--;
          }
          this.instPointer = tempPointer + 1;
        }
      }).call(this);
      break;
      case ".":
        this.eventEmitter.emit("output", String.fromCharCode(this.memory[this.memPointer]));
        break;
      case ",": (function() {
        this.state = "AWAITING";
        let callback = (char) => {
          let key = 0;
          if (Number.isNaN(Number(char))) {
            key = char.charCodeAt(0);
          }
          else {
            key = Number(char);
          }
          this.memory[this.memPointer] = key;
          this.state = "RUNNING";
        };
        this.eventEmitter.once('input', callback);
        this.eventEmitter.emit('awaiting', callback);
      }).call(this)
      break;
    }
    this.eventEmitter.emit('instruction', this);
  }
  step () {
    this.executeInstruction(this.instructions[this.instPointer]);
    this.instPointer++;
  }
  run () {
    function _run() {
      if (this.state === "RUNNING") {
        if (this.instPointer >= this.instructions.length) {
          this.eventEmitter.emit('complete', this);
          return;
        }
        this.step();
      }
      setTimeout(_run.bind(this), 1);
    }
    _run.call(this);
    return this;    
  }
}
