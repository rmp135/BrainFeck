import BrainFeck from "./BrainFeck.js"

describe("BrainFeck", () => {
  let bf = null;
  beforeEach(() => {
    bf = new BrainFeck();
  });
  describe("Initialising", () => {
    it("should be at memory position 0", () => {
      expect(bf.memPointer).toBe(0);
    });
    it("should have a set of memory blocks", () => {
      expect(bf.memory.length).toBe(300);
      expect(bf.memory.every((m) => m === 0)).toBe(true);
    });
    it("should being at instruction pointer 0", () => {
      expect(bf.instPointer).toBe(0);
    });
    it("should have a set of instructions.", () => {
      bf = new BrainFeck(",,..[]");
      expect(bf.instructions).toEqual([",",",",".",".","[","]"]);
    });
  });
  describe("Run", () => {
    it("should perform multiple steps", (done) => {
      bf = new BrainFeck(".+.");
      const mock = jest.fn(bf.step);
      bf.step = mock;
      bf.on('complete', () => {
        expect(mock.mock.calls.length).toBe(3);
        expect(bf.instPointer).toBe(3);
        done();
      });
      bf.run();
    });
    it("should be delayed by the delay amount", () => {
      jest.useFakeTimers();
      bf = new BrainFeck("..");
      bf.delay = 10;
      const mock = jest.fn(bf.step);
      bf.step = mock;
      bf.run();
      expect(mock).toHaveBeenCalled();
      expect(mock.mock.calls.length).toBe(1);
      mock.mockReset();
      jest.runTimersToTime(9);
      expect(mock).not.toHaveBeenCalled();
      jest.runTimersToTime(10);
      expect(mock).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
  describe("Step", () => {
    it("should execute the current instruction", () => {
      bf = new BrainFeck(".");
      const mock = jest.fn(bf.executeInstruction);
      bf.executeInstruction = mock;
      bf.step();
      expect(mock.mock.calls.length).toBe(1);
      expect(mock.mock.calls[0].length).toBe(1);
      expect(mock.mock.calls[0][0]).toBe(".");
    });
    it("should increase the instruction pointer by 1", () => {
      bf.step();
      expect(bf.instPointer).toBe(1);
    });
  });
  describe(">", () => {
    it("should increase memory pointer given space", () => {
      bf.executeInstruction(">");
      expect(bf.memPointer).toBe(1);
    });
    it("should throw an exception if an overflow occurs", () => {
      bf.memPointer = 299;
      expect(bf.executeInstruction.bind(bf, ">")).toThrow("Memory pointer overflow.");
    });
  });
  describe("<", () => {
    it("should decrease the memory pointer given space", () => {
      bf.memPointer = 123;
      bf.executeInstruction("<");
      expect(bf.memPointer).toBe(122);
    });
    it("should throw an exception if an underflow occurs", () => {
      expect(bf.executeInstruction.bind(bf, "<")).toThrow("Memory pointer underflow.");
    });
  });
  describe("+", () => {
    it("should increasea the value at the memory pointer", () => {
      bf.executeInstruction("+");
      expect(bf.memory[0]).toBe(1);
    });
    it("should overflow if increased past 255", () => {
      bf.memory[0] = 255;
      bf.executeInstruction("+");
      expect(bf.memory[0]).toBe(0);
    });
  });
  describe("-", () => {
    it("should decrease the value at the memory pointer", () => {
      bf.memory[0] = 123;
      bf.executeInstruction("-");
      expect(bf.memory[0]).toBe(122);
    });
    it("should underflow if the memory value goes below 0", () => {
      bf.executeInstruction("-");
      expect(bf.memory[0]).toBe(255);
    });
  });
  describe(".", () => {
    it("should emit an 'output' event with the char oode at the memory location", (done) => {
      bf.memory[0] = 97;
      bf.on('output', (mem) => {
        expect(mem).toBe("a");
        done();
      });
      bf.executeInstruction(".");
    });
  });
  describe(",", () => {
    it("should set the state the 'awaiting'", () => {
      bf.executeInstruction(",");
      expect(bf.state).toBe("AWAITING");
    });
    it("should emit an 'awaiting' event", (done) => {
      bf.on("awaiting", (cb) => {
        expect(typeof cb).toBe("function");
        done();
      });
      bf.executeInstruction(",");
    });
    it("should set the memory location with the callback", (done) => {
      bf.on("awaiting", (cb) => {
        cb("a");
        expect(bf.memory[0]).toBe(97);
        expect(bf.state).toBe("RUNNING");
        done();
      });
      bf.executeInstruction(",");
    });
    it("should allow for emitting 'input' to set memory", (done) => {
      bf.on("awaiting", () => {
        bf.emit("input", "a");
        expect(bf.memory[0]).toBe(97);
        expect(bf.state).toBe("RUNNING");
        done();
      });
      bf.executeInstruction(",");
    });
  });
  describe("[", () => {
    it("should not move if the memory value is not 0", () => {
      bf = new BrainFeck();
      bf.memory[0] = 1;
      bf.executeInstruction("[");
      expect(bf.instPointer).toBe(0);
    });
    it("should move to the matching ']' if the memory value is 0", () => {
      const bf = new BrainFeck("[.[.[]].]");
      bf.instPointer = 2;
      bf.executeInstruction("[");
      expect(bf.instPointer).toBe(6);
    });
  });
  describe("]", () => {
    it("should not move if the memory value is 0", () => {
      bf.instPointer = 2;
      bf.executeInstruction("]");
      expect(bf.instPointer).toBe(2);
    });
    it("should move to the matching '[' if the memory value is not 0", () => {
      const bf = new BrainFeck("[.[.[]].]");
      bf.memory[0] = 1;
      bf.instPointer = 6;
      bf.executeInstruction("]");
      expect(bf.instPointer).toBe(2);
    });
  });
});
