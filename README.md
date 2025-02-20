# HeX: Your MIPS Assembly Companion 🚀

HeX is a VS Code extension designed to make your MIPS assembly programming journey smoother and more enjoyable.  It provides helpful features like hover information for directives and instructions, and intelligent autocompletion for system calls.  Tired of constantly looking up MIPS documentation? HeX has you covered!

## Features

### 1. Instant MIPS Gratification 🎉

HeX loves MIPS as much as you do!  When you open a `.s` or `.asm` file, you'll get a friendly reminder:

### 2. Hover Documentation 🔍

No more flipping through manuals!  Hover over any supported MIPS directive or instruction to see a concise description and a clear example. This feature currently supports a wide range of commonly used directives and instructions, covering data definition, arithmetic operations, logical operations, memory access, control flow, and more.

**Supported Directives and Instructions (Complete List):**

*   `.text`, `.data`, `.ktext`, `.kdata`, `.align`, `.ascii`, `.asciiz`, `.space`, `.byte`, `.half`, `.word`, `.float`, `.double`, `.globl`
*   `add`, `sub`, `addi`, `addu`, `addiu`, `subu`, `mul`, `mult`, `multu`, `madd`, `maddu`, `msub`, `msubu`, `div`, `divu`, `rem`, `remu`, `clo`, `clz`, `seb`, `seh`, `seq`, `sne`, `sle`, `sleu`, `slt`, `sltu`, `sgt`, `sgtu`, `sge`, `sgeu`, `slti`, `sltiu`
*    `abs`, `neg`, `negu`
*   `and`, `andi`, `or`, `ori`, `nor`, `xor`, `xori`, `not`, `rol`, `ror`,`rotr`, `rotrv`, `sll`, `sllv`, `sra`, `srav`, `srl`, `srlv`
*   `li`, `la`, `lui`, `lb`, `lbu`, `lh`, `lhu`, `lw`, `sb`, `sh`, `sw`, `push`, `pop`
*    `begin`, `end`
*   `mfhi`, `mflo`, `mthi`, `mtlo`, `move`, `movz`, `movn`
*   `b`, `beq`, `beqz`, `bne`, `bnez`, `bge`, `bgez`, `bgeu`, `bgt`, `bgtu`, `bgtz`, `blt`, `bltz`, `bltu`, `j`, `jal`, `jalr`, `jr`
*   `syscall`, `break`
* `teq`, `teqi`, `tne`, `tnei`, `tge`, `tgeu`, `tgei`, `tgeiu`, `tgt`, `tgti`, `tgtu`, `tgtiu`,`tlt`, `tltu`, `tlti`, `tltiu`, `tle`, `tleu`, `tlei`, `tleiu`
*   `nop`

### 3.  SYSCALL Autocompletion ⚡️

Writing MIPS system calls just got easier.  When you type `li $v0, ` in a MIPS file, HeX will provide a list of all available syscalls with their corresponding numbers, descriptions, and C equivalents.  Select the one you need, and HeX will automatically insert the correct number and a helpful comment.


**Supported Syscalls (Complete List):**

| Number | Label            | C Equivalent | Description                                                                                                                         |
|--------|-------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------|
| 1      | `print_int`      | `printf("%d")`   | Print the integer in `$a0` to the console as a signed decimal.                                                                    |
| 2      | `print_float`    | `printf("%f")`   | Print the float in `$f12` to the console as a `%.8f`.                                                                            |
| 3      | `print_double`   | `printf("%g")`   | Print the double in `$f12/$f13` to the console as a `%.18g`.                                                                    |
| 4      | `print_string`   | `printf("%s")`   | Print the nul-terminated array of bytes referenced by `$a0` to the console as an ASCII string.                                  |
| 5      | `read_int`       | `scanf("%d")`    | Read an integral value from the console, with `atol`'s semantics, into register `$v0`.                                          |
| 6      | `read_float`     | `scanf("%f")`    | Read a floating-point value from the console, with `atof`'s semantics, into register `$f0`.                                    |
| 7      | `read_double`    | `scanf("%lf")`   | Read a double-precision floating-point value from the console, with `atof`'s semantics, into registers `$f0/$f1`.              |
| 8      | `read_string`    | `fgets()`        | Read a string into the provided buffer (referenced by `$a0`); up to `size` (given in `$a1`) bytes are read and nul-terminated. |
| 9      | `sbrk`           | `malloc()`       | Extend the `.data` segment by adding `$a0` bytes; a primitive useful for, e.g., implementing `malloc`.                             |
| 10     | `exit`           | `exit(0)`        | The program exits with code 0.                                                                                                    |
| 11     | `print_character`| `putchar()`      | Print the character in `$a0`, analogous to `putchar`.                                                                              |
| 12     | `read_character` | `getchar()`      | Read the next character from the console into register `$v0`; analogous to `getchar`.                                               |
| 13     | `open`           | `open()`         | Open the file specified by name (referenced by `$a0`) with flags (given by `$a1`) and mode (given by `$a2`). Returns file descriptor.|
| 14     | `read`           | `read()`         | Read `len` bytes (given by `$a2`) into `buffer` (given by `$a1`) from file descriptor `fd` (given in `$a0`).                       |
| 15     | `write`          | `write()`        | Write `len` bytes (given by `$a2`) from `buffer` (given by `$a1`) to file descriptor `fd` (given in `$a0`).                       |
| 16     | `close`          | `close()`        | Close the file given by the file descriptor `fd` (given in `$a0`).                                                                  |
| 17     | `exit2`          | `exit(n)`        | The program exits with code (given in `$a0`).                                                                                       |

## Installation

1.  Open **Visual Studio Code**.
2.  Go to the **Extensions** view by clicking on the Extensions icon in the Activity Bar on the side of the window or pressing `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS).
3.  Search for "**HeX - MIPS Helper**".
4.  Click **Install**.
5.  Reload VS Code.

##  About the Creator

<img src="https://avatars.githubusercontent.com/u/73017980?v=4&size=64" width="100" alt="Gururam's Avatar">

This extension was created by Gururam K, a passionate programmer who loves low-level systems programming.  You can find more of my work on my website: [gururam.vercel.app](https://gururam.vercel.app)

## Contributing

Contributions are welcome!  If you have suggestions for improvements, find a bug, or want to add support for more MIPS instructions, please open an issue or submit a pull request on the [GitHub repository]([https://github.com/CentillionJinx/mips-helper]).