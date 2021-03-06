import {readFileSync} from 'fs';

const inputs = readFileSync('./day17-2.txt', 'utf8').split('\n');
const programmm = inputs[0].split(',').map(num => Number.parseInt(num));

type InstructionResult =
  | 'next'
  | 'modifiedPointer'
  | 'halt'
  | 'consumedInput'
  | 'exit';

const positionModeEnum = {
  positional: 0,
  absolute: 1,
  relative: 2,
}

class IntcodeInterpreter {
  /** The current program being ran */
  program: number[];

  /** Our global instruction pointer used to keep track of our current location */
  instructionPointer: number;

  input: number;

  /** output */
  output: number;

  /** the relative base */
  relativeBase: number;


  constructor(program: number[], hyperParam: number) {
    this.program = program.slice();

    this.instructionPointer = 0;
    this.input = hyperParam;
    this.output = -Infinity;
    this.relativeBase = 0;
  }

  /** Parses an operation for the opCode and parameter position / immediate modes */
  parseOperation(operation: number) {
    function getNthDigit(num: number, digit: number) {
      return Math.floor(num % (10 ** (digit + 1)) / (10 ** digit));
    }

    const opCode = operation % 100;
    const modes = [getNthDigit(operation, 2), getNthDigit(operation, 3), getNthDigit(operation, 4)];
    return {opCode, modes};
  }

  getParams(readWriteModes: Array<'r' | 'w'>, positionModes: number[]) {
    return readWriteModes
      .map((_, i) => this.program[this.instructionPointer + i + 1] || 0)
      .map((param, i) => {
        const readWriteMode = readWriteModes[i];
        let positionMode = positionModes[i];

        if (readWriteMode === 'w') {
          switch (positionMode) {
            case positionModeEnum.positional:
              return param;
            case positionModeEnum.absolute:
              return param;
            case positionModeEnum.relative:
              return param + this.relativeBase;
          }
        }

        switch (positionMode) {
          case positionModeEnum.positional:
            return this.program[param] || 0;
          case positionModeEnum.absolute:
            return param;
          case positionModeEnum.relative:
            return this.program[this.relativeBase + param] || 0;
          default:
            throw new Error('wtf invalid position mode')
        }
      });
  }

  /** Use to define the schema and operation of an instruction */
  instruction(args: Array<'r' | 'w'>, cb: (params: number[]) => InstructionResult) {
    return (operation: number) => {
      const {modes} = this.parseOperation(operation);
      const params = this.getParams(args, modes);

      const instructionResult = cb(params);

      // only increment the instruction pointer if the instruction is unchanged
      if (instructionResult !== 'modifiedPointer') {
        this.instructionPointer += args.length + 1;
      }

      return instructionResult;
    }
  }

  instructions = {
    // exit
    99: this.instruction([], params => {
      return 'exit';
    }),
    // add
    1: this.instruction(['r', 'r', 'w'], params => {
      this.program[params[2]] = params[0] + params[1];
      return 'next';
    }),
    // multiply
    2: this.instruction(['r', 'r', 'w'], params => {
      this.program[params[2]] = params[0] * params[1];
      return 'next';
    }),
    // input
    3: this.instruction(['w'], (params) => {
      this.program[params[0]] = this.input;
      return 'consumedInput';
    }),
    // output
    4: this.instruction(['r'], params => {
      this.output = params[0];
      return 'halt';
    }),
    // is not zero
    5: this.instruction(['r', 'r'], params => {
      if (params[0] !== 0) {
        this.instructionPointer = params[1];
        return 'modifiedPointer';
      }
    }),
    // is zero
    6: this.instruction(['r', 'r'], (params) => {
      if (params[0] === 0) {
        this.instructionPointer = params[1];
        return 'modifiedPointer';
      }
    }),
    // less than
    7: this.instruction(['r', 'r', 'w'], params => {
      this.program[params[2]] = params[0] < params[1] ? 1 : 0;
      return 'next';
    }),
    // equal
    8: this.instruction(['r', 'r', 'w'], params => {
      this.program[params[2]] = params[0] === params[1] ? 1 : 0;
      return 'next';
    }),
    // adjust relative base
    9: this.instruction(['r'], params => {
      this.relativeBase += params[0];
      return 'next';
    }),
  };

  step() {
    const currentOperation = this.program[this.instructionPointer];
    const {opCode} = this.parseOperation(currentOperation);

    return this.instructions[opCode](currentOperation);
  }

  runTillConsumeInput(input: number) {
    this.input = input;
    while (true) {
      const instructionResult = this.step();

      if (instructionResult === 'consumedInput' || instructionResult === 'exit') {
        return [this.output, instructionResult];
      }
    }
  }

  runTillHalt(input: number) {
    this.input = input;
    while (true) {
      const instructionResult = this.step();

      if (instructionResult === 'halt' || instructionResult === 'exit') {
        return [this.output, instructionResult];
      }
    }
  }

  runTillExit(input: number) {
    this.input = input;
    while (true) {
      const instructionResult = this.step();

      if (instructionResult === 'exit') {
        return [this.output, instructionResult];
      }
    }
  }
}

const vaccumRobot = new IntcodeInterpreter(programmm, 0);

function printTillKeyword(keyword: string) {
  let rawGrid = '';

  while (true) {
    const [pixel, outputCode] = vaccumRobot.runTillHalt(2);

    if (outputCode === 'consumedInput') {
      console.log(pixel, 'wtf')
    }

    rawGrid += String.fromCharCode(pixel);

    if (outputCode === 'exit' || rawGrid.includes(keyword)) {
      break;
    }
  }

  console.log(rawGrid);
}

const instructions = [
  'A,B,A,C,A,B,C,B,C,B',
  'L,5,5,R,8,L,6,R,6',
  'L,8,L,8,R,8',
  'R,8,L,6,L,10,L,10',
  'n',
]
  .map(row => ([...row.split('').map(_ => _.charCodeAt(0)), '\n'.charCodeAt(0)]))
  // .reduce((a, b) => ([...a, ...b]), [])

printTillKeyword('\n\n');

instructions[0].forEach(instruction => {
  const [dust] = vaccumRobot.runTillConsumeInput(instruction);
});

instructions[1].forEach(instruction => {
  const [dust] = vaccumRobot.runTillConsumeInput(instruction);
});

instructions[2].forEach(instruction => {
  const [dust] = vaccumRobot.runTillConsumeInput(instruction);
});

instructions[3].forEach(instruction => {
  const [dust] = vaccumRobot.runTillConsumeInput(instruction);
});

instructions[4].forEach(instruction => {
  const [dust] = vaccumRobot.runTillConsumeInput(instruction);
});

const [dust, exitCode] = vaccumRobot.runTillExit(0);
console.log(dust, 'what', exitCode);





/**


..............###########.###########................
..............#.........#.#.........#................
..............#.......#########.....#................
..............#.......#.#.#...#.....#................
..............#.......#.#.#...#.....#................
..............#.......#.#.#...#.....#................
..............#.#########.#...#.....#................
..............#.#.....#...#...#.....#................
..............#.#.....#...#########.#................
..............#.#.....#.......#...#.#................
..............#########.......#######................
................#.................#..................
................#...........#########................
................#...........#.....#.#................
................#########...#.....#.#................
........................#...#.....#.#................
........................#...#.....#.#................
........................#...#.......#................
........................#...#.......#######..........
........................#...#.............#..........
....................#########.............#..........
....................#...#.................#..........
..................#######.................#..........
..................#.#.....................#..........
..................#.#.....................#..........
..................#.#.....................#..........
..................#.#.....................##########^
..................#.#................................
#######...#########.#................................
#.....#...#.........#................................
#.....#...#.#########................................
#.....#...#.#........................................
#.....#...#.#........................................
#.....#...#.#........................................
#.....#...#.#........................................
#.....#...#.#........................................
#.....#######........................................
#.........#..........................................
###########..........................................

L,10,R,8,L,6,R,6,L,8,L,8,R,8,L,10,R,8,L,6,R,6,R,8,L,6,L,10,L,10,L,10,R,8,L,6,R,6,L,8,L,8,R,8,R,8,L,6,L,10,L,10,L,8,L,8,R,8,R,8,L,6,L,10,L,10,L,8,L,8,R,8,
-----------------&&&&&&&&&&&&-----------------$$$$$$$$$$$$$$$$$$-----------------&&&&&&&&&&&&$$$$$$$$$$$$$$$$$$&&&&&&&&&&&&$$$$$$$$$$$$$$$$$$&&&&&&&&&&&&
A                B           A                C                 A                B           C                 B           C                 B

A,B,A,C,A,B,C,B,C,B

L,10,R,8,L,6,R,6,

L,8,L,8,R,8,

R,8,L,6,L,10,L,10,

const instructions = [
  'A,B,A,C,A,B,C,B,C,B',
  'L,5,5,R,8,L,6,R,6',
  'L,8,L,8,R,8'
  'R,8,L,6,L,10,L,10',
]

 */


[120,112,101,99,116,101,100,32,102,117,110,99,116,105,111,110]