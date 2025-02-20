// The module 'vscode' contains the VS Code extensibility API
import * as vscode from "vscode";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "mips-helper" is now active!');

  // Register an event listener for active editor changes
  const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        const fileName = editor.document.fileName.toLowerCase();
        if (fileName.endsWith(".s") || fileName.endsWith(".asm")) {
          vscode.window.showInformationMessage("Yes, I LOVE MIPS!");
        }
      }
    }
  );

  // Register hover provider for MIPS files
  const hoverProvider = vscode.languages.registerHoverProvider(["mips"], {
    provideHover(document: vscode.TextDocument, position: vscode.Position) {
      const lineText = document.lineAt(position.line).text;

      interface DirectiveInfo {
        description: string;
        example: string;
      }

      const directives: { [key: string]: DirectiveInfo } = {
        ".text": {
          description:
            "Marks the start of the text segment (code/instructions)",
          example: `.text              # Start of code segment
main:             # Program entry point
    li   $v0, 4   # print_string syscall
    la   $a0, msg # load message address
    syscall       # print the message`,
        },
        ".data": {
          description: "Marks the start of the data segment (program data)",
          example: `.data             # Start of data segment
msg:  .asciiz "Hello"  # String variable
num:  .word   42       # Integer variable
arr:  .word   1, 2, 3  # Array of integers`,
        },
        ".ktext": {
          description:
            "Marks the start of kernel text segment (exception handlers)",
          example: `.ktext 0x80000180     # Exception handler address
    mfc0 $k0, $13     # Get cause register
    mfc0 $k1, $k14     # Get EPC
    jr   $k1          # Return to interrupted instruction`,
        },
        ".kdata": {
          description: "Marks the start of kernel data segment",
          example: `.kdata
saved_regs: .space 128    # Space to save registers
cause_msg:  .asciiz "Exception cause: "`,
        },
        ".align": {
          description: "Align next data on 2^N byte boundary",
          example: `.data
.align 2       # Align on word boundary (2^2 = 4 bytes)
array: .word 1, 2, 3, 4`,
        },
        ".ascii": {
          description: "Store ASCII string in memory (no null terminator)",
          example: `.data
msg: .ascii "Hello"    # Stores exactly 5 bytes
len: .word 5          # Need to track length manually`,
        },
        ".asciiz": {
          description: "Store null-terminated ASCII string in memory",
          example: `.data
msg: .asciiz "Hello\\n"  # Automatically adds null terminator
len = 7                # 5 chars + newline + null`,
        },
        ".space": {
          description: "Allocate n bytes of uninitialized space",
          example: `.data
buffer: .space 100    # Reserve 100 bytes
array:  .space 40     # Space for 10 words (4 bytes each)`,
        },
        ".byte": {
          description: "Store 8-bit values in memory",
          example: `.data
flags:  .byte 0xFF        # Single byte
array:  .byte 1, 2, 3, 4  # Array of bytes
mask:   .byte 0b10101010  # Binary value`,
        },
        ".half": {
          description: "Store 16-bit values in memory",
          example: `.data
shorts: .half 12345       # Single halfword
array:  .half 1, 2, 3     # Array of halfwords
port:   .half 0xFFFF      # Max 16-bit value`,
        },
        ".word": {
          description: "Store 32-bit values in memory",
          example: `.data
num:    .word 12345678    # Single word
array:  .word 1, 2, 3     # Array of words
addr:   .word 0x12345678  # Memory address`,
        },
        ".float": {
          description: "Store single-precision floating-point values in memory",
          example: `.data
pi:     .float 3.14159    # Single float
array:  .float 1.0, 2.5   # Array of floats
zero:   .float 0.0        # Zero in float`,
        },
        ".double": {
          description: "Store double-precision floating-point values in memory",
          example: `.data
pi:     .double 3.14159265359 # Single double
array:  .double 1.0, 2.5     # Array of doubles
e:      .double 2.71828      # Euler's number`,
        },
        ".globl": {
          description: "Make labels accessible to other files",
          example: `.globl main          # Entry point
.globl factorial     # Exported function
.globl MAX_SIZE      # Shared constant`,
        },
        add: {
          description: "Add (with overflow)",
          example: "add $t0, $t1, $t2   # $t0 = $t1 + $t2",
        },
        sub: {
          description: "Subtract (with overflow)",
          example: "sub $t0, $t1, $t2   # $t0 = $t1 - $t2",
        },

        addi: {
          description: "Add immediate (with overflow)",
          example: "addi $t0, $t1, 100   # $t0 = $t1 + 100",
        },
        addu: {
          description: "Add unsigned (no overflow)",
          example: "addu $t0, $t1, $t2   # $t0 = $t1 + $t2",
        },
        addiu: {
          description: "Add immediate unsigned (no overflow)",
          example: "addiu $t0, $t1, 100  # $t0 = $t1 + 100",
        },
        subu: {
          description: "Subtract unsigned (no overflow)",
          example: "subu $t0, $t1, $t2   # $t0 = $t1 - $t2",
        },
        mul: {
          description: "Multiply (32-bit result)",
          example: "mul $t0, $t1, $t2    # $t0 = $t1 * $t2",
        },
        mult: {
          description: "Multiply (64-bit result in HI/LO)",
          example: "mult $t1, $t2       # HI/LO = $t1 * $t2",
        },
        multu: {
          description: "Multiply unsigned (64-bit result in HI/LO)",
          example: "multu $t1, $t2      # HI/LO = $t1 * $t2",
        },
        madd: {
          description: "Multiply and add to HI/LO (signed)",
          example: "madd $t0, $t1, $t2       # HI/LO = HI/LO + $t1 * $t2",
        },
        maddu: {
          description: "Multiply and add to HI/LO (unsigned)",
          example: "maddu $t0, $t1, $t2      # HI/LO = HI/LO + $t1 * $t2",
        },
        msub: {
          description: "Multiply and subtract from HI/LO (signed)",
          example: "msub $t0, $t1, $t2       # HI/LO = HI/LO - $t1 * $t2",
        },
        msubu: {
          description: "Multiply and subtract from HI/LO (unsigned)",
          example: "msubu $t0, $t1, $t2      # HI/LO = HI/LO - $t1 * $t2",
        },
        div: {
          description: "Divide (signed, quotient to LO, remainder to HI)",
          example: "div $t0, $t1, $t2        # LO = $t1 / $t2, HI = $t1 % $t2",
        },
        divu: {
          description: "Divide unsigned (quotient to LO, remainder to HI)",
          example: "divu $t0, $t1, $t2       # LO = $t1 / $t2, HI = $t1 % $t2",
        },
        rem: {
          description: "Remainder (signed)",
          example: "rem $t0, $t1, $t2    # $t0 = $t1 % $t2",
        },
        remu: {
          description: "Remainder (unsigned)",
          example: "remu $t0, $t1, $t2   # $t0 = $t1 % $t2",
        },
        clo: {
          description: "Count leading ones",
          example: "clo $t0, $t1        # Count leading 1s in $t1",
        },
        clz: {
          description: "Count leading zeros",
          example: "clz $t0, $t1        # Count leading 0s in $t1",
        },
        seb: {
          description: "Sign-extend byte",
          example: "seb $t0, $t1        # Sign-extend $t1[7:0] to $t0",
        },
        seh: {
          description: "Sign-extend halfword",
          example: "seh $t0, $t1        # Sign-extend $t1[15:0] to $t0",
        },
        seq: {
          description: "Set if equal",
          example: "seq $t0, $t1, $t2    # $t0 = ($t1 == $t2)",
        },
        sne: {
          description: "Set if not equal",
          example: "sne $t0, $t1, $t2    # $t0 = ($t1 != $t2)",
        },
        sle: {
          description: "Set if less than or equal (signed)",
          example: "sle $t0, $t1, $t2    # $t0 = ($t1 <= $t2)",
        },
        sleu: {
          description: "Set if less than or equal (unsigned)",
          example: "sleu $t0, $t1, $t2   # $t0 = ($t1 <= $t2)",
        },
        slt: {
          description: "Set if less than (signed)",
          example: "slt $t0, $t1, $t2    # $t0 = ($t1 < $t2)",
        },
        sltu: {
          description: "Set if less than (unsigned)",
          example: "sltu $t0, $t1, $t2   # $t0 = ($t1 < $t2)",
        },
        sgt: {
          description: "Set if greater than (signed)",
          example: "sgt $t0, $t1, $t2    # $t0 = ($t1 > $t2)",
        },
        sgtu: {
          description: "Set if greater than (unsigned)",
          example: "sgtu $t0, $t1, $t2   # $t0 = ($t1 > $t2)",
        },
        sge: {
          description: "Set if greater or equal (signed)",
          example: "sge $t0, $t1, $t2    # $t0 = ($t1 >= $t2)",
        },
        sgeu: {
          description: "Set if greater or equal (unsigned)",
          example: "sgeu $t0, $t1, $t2   # $t0 = ($t1 >= $t2)",
        },
        slti: {
          description: "Set if less than immediate (signed)",
          example: "slti $t0, $t1, 100   # $t0 = ($t1 < 100)",
        },
        sltiu: {
          description: "Set if less than immediate (unsigned)",
          example: "sltiu $t0, $t1, 100  # $t0 = ($t1 < 100",
        },
        abs: {
          description: "Compute absolute value of rs",
          example: "abs $t0, $t1         # $t0 = abs($t1)",
        },
        neg: {
          description: "Negate rs (with overflow check)",
          example: "neg $t0, $t1         # $t0 = -$t1",
        },
        negu: {
          description: "Negate unsigned (no overflow)",
          example: "negu $t0, $t1        # $t0 = -$t1",
        },
        and: {
          description: "Bitwise AND",
          example: "and $t0, $t1, $t2    # $t0 = $t1 & $t2",
        },
        andi: {
          description: "Bitwise AND immediate",
          example: "andi $t0, $t1, 0xFF  # $t0 = $t1 & 0xFF",
        },
        or: {
          description: "Bitwise OR",
          example: "or $t0, $t1, $t2     # $t0 = $t1 | $t2",
        },
        ori: {
          description: "Bitwise OR immediate",
          example: "ori $t0, $t1, 0xFF   # $t0 = $t1 | 0xFF",
        },
        nor: {
          description: "Bitwise NOR",
          example: "nor $t0, $t1, $t2    # $t0 = ~($t1 | $t2)",
        },
        xor: {
          description: "Bitwise XOR",
          example: "xor $t0, $t1, $t2    # $t0 = $t1 ^ $t2",
        },
        xori: {
          description: "Bitwise XOR immediate",
          example: "xori $t0, $t1, 0xFF  # $t0 = $t1 ^ 0xFF",
        },
        not: {
          description: "Bitwise NOT",
          example: "not $t0, $t1        # $t0 = ~$t1",
        },
        rol: {
          description: "Rotate left",
          example: "rol $t0, $t1, $t2    # Rotate $t1 left by $t2",
        },
        ror: {
          description: "Rotate right",
          example: "ror $t0, $t1, $t2    # Rotate $t1 right by $t2",
        },
        rotr: {
          description: "Rotate right fixed",
          example: "rotr $t0, $t1, 5     # Rotate $t1 right by 5 bits",
        },
        rotrv: {
          description: "Rotate right variable",
          example: "rotrv $t0, $t1, $t2   # $t0 = $t1 right by $t2 bits",
        },
        sll: {
          description: "Shift left logical",
          example: "sll $t0, $t1, 5      # $t0 = $t1 << 5",
        },
        sllv: {
          description: "Shift left logical variable",
          example: "sllv $t0, $t1, $t2   # $t0 = $t1 << $t2",
        },
        sra: {
          description: "Shift right arithmetic",
          example: "sra $t0, $t1, 5      # $t0 = $t1 >> 5 (sign extend)",
        },
        srav: {
          description: "Shift right arithmetic variable",
          example: "srav $t0, $t1, $t2   # $t0 = $t1 >> $t2 (sign extend)",
        },
        srl: {
          description: "Shift right logical",
          example: "srl $t0, $t1, 5      # $t0 = $t1 >>> 5 (zero fill)",
        },
        srlv: {
          description: "Shift right logical variable",
          example: "srlv $t0, $t1, $t2   # $t0 = $t1 >>> $t2 (zero fill)",
        },
        li: {
          description: "Load immediate",
          example: "li $t0, 123         # $t0 = 123",
        },
        la: {
          description: "Load address",
          example: "la $t0, data_label  # $t0 = address of data_label",
        },
        lui: {
          description: "Load upper immediate",
          example:
            "lui $t0, 0x1234      # Load 0x1234 into upper 16 bits of $t0",
        },
        lb: {
          description: "Load byte (sign-extended)",
          example: "lb $t0, 0($sp)       # Load byte from stack to $t0",
        },
        lbu: {
          description: "Load byte unsigned (zero-extended)",
          example:
            "lbu $t0, 0($sp)      # Load byte from stack to $t0 (zero-extended)",
        },
        lh: {
          description: "Load halfword (sign-extended)",
          example: "lh $t0, 0($sp)       # Load halfword from stack to $t0",
        },
        lhu: {
          description: "Load halfword unsigned (zero-extended)",
          example:
            "lhu $t0, 0($sp)      # Load halfword from stack to $t0 (zero-extended)",
        },
        lw: {
          description: "Load word",
          example: "lw $t0, 0($sp)       # Load word from stack to $t0",
        },
        sb: {
          description: "Store byte",
          example: "sb $t0, 0($sp)       # Store byte from $t0 to stack",
        },
        sh: {
          description: "Store halfword",
          example: "sh $t0, 0($sp)       # Store halfword from $t0 to stack",
        },
        sw: {
          description: "Store word",
          example: "sw $t0, 0($sp)       # Store word from $t0 to stack",
        },
        push: {
          description: "Push register onto stack",
          example: "push $t0             # Push $t0 onto stack",
        },
        pop: {
          description: "Pop register from stack",
          example: "pop $t0              # Pop top of stack into $t0",
        },
        begin: {
          description: "Function prologue",
          example:
            "begin_func:\\n  sw $ra, ($sp)\\n  sw $fp, -4($sp)\\n  move $fp, $sp\\n  addiu $sp, $sp, -8",
        },
        end: {
          description: "Function epilogue",
          example:
            "end_func:\\n  move $sp, $fp\\n  lw $ra, ($sp)\\n  lw $fp, -4($sp)\\n  jr $ra",
        },
        mfhi: {
          description: "Move from HI register",
          example: "mfhi $t0             # Copy HI to $t0",
        },
        mflo: {
          description: "Move from LO register",
          example: "mflo $t0             # Copy LO to $t0",
        },
        mthi: {
          description: "Move to HI register",
          example: "mthi $t0             # Copy $t0 to HI",
        },
        mtlo: {
          description: "Move to LO register",
          example: "mtlo $t0             # Copy $t0 to LO",
        },
        move: {
          description: "Move register to register",
          example: "move $t0, $t1         # $t0 = $t1",
        },
        movz: {
          description: "Move if zero",
          example: "movz $t0, $t1, $t2    # $t0 = $t1 if $t2 == 0",
        },
        movn: {
          description: "Move if not zero",
          example: "movn $t0, $t1, $t2    # $t0 = $t1 if $t2 != 0",
        },
        b: {
          description: "Branch unconditionally",
          example: "b label             # Branch to label",
        },
        beq: {
          description: "Branch if equal",
          example: "beq $t0, $t1, label   # Branch if $t0 == $t1",
        },
        beqz: {
          description: "Branch if equal to zero",
          example: "beqz $t0, label    # Branch if $t0 == 0",
        },
        bne: {
          description: "Branch if not equal",
          example: "bne $t0, $t1, label   # Branch if $t0 != $t1",
        },
        bnez: {
          description: "Branch if not equal to zero",
          example: "bnez $t0, label    # Branch if $t0 != 0",
        },
        bge: {
          description: "Branch if greater or equal (signed)",
          example: "bge $t0, $t1, label   # Branch if $t0 >= $t1",
        },
        bgez: {
          description: "Branch if greater or equal to zero",
          example: "bgez $t0, label    # Branch if $t0 >= 0",
        },
        bgeu: {
          description: "Branch if greater or equal unsigned",
          example: "bgeu $t0, $t1, label  # Branch if $t0 >= $t1 (unsigned)",
        },
        bgt: {
          description: "Branch if greater than (signed)",
          example: "bgt $t0, $t1, label   # Branch if $t0 > $t1",
        },
        bgtu: {
          description: "Branch if greater than unsigned",
          example: "bgtu $t0, $t1, label  # Branch if $t0 > $t1 (unsigned)",
        },
        bgtz: {
          description: "Branch if greater than zero",
          example: "bgtz $t0, label    # Branch if $t0 > 0",
        },
        blt: {
          description: "Branch if less than (signed)",
          example: "blt $t0, $t1, label   # Branch if $t0 < $t1",
        },
        bltz: {
          description: "Branch if less than zero",
          example: "bltz $t0, label    # Branch if $t0 < 0",
        },
        bltu: {
          description: "Branch if less than unsigned",
          example: "bltu $t0, $t1, label  # Branch if $t0 < $t1 (unsigned)",
        },
        j: {
          description: "Jump",
          example: "j label             # Jump to label",
        },
        jal: {
          description: "Jump and link",
          example: "jal label           # Call subroutine at label",
        },
        jalr: {
          description: "Jump and link register",
          example: "jalr $ra, $t0       # Jump to address in $t0",
        },
        jr: {
          description: "Jump register",
          example: "jr $ra              # Return from subroutine",
        },
        syscall: {
          description: "System call",
          example: "syscall             # Execute system call",
        },
        break: {
          description: "Breakpoint",
          example: "break               # Break execution",
        },
        teq: {
          description: "Trap if equal",
          example: "teq $t0, $t1        # Trap if $t0 == $t1",
        },
        teqi: {
          description: "Trap if equal immediate",
          example: "teqi $t0, 10         # Trap if $t0 == 10",
        },
        tne: {
          description: "Trap if not equal",
          example: "tne $t0, $t1        # Trap if $t0 != $t1",
        },
        tnei: {
          description: "Trap if not equal immediate",
          example: "tnei $t0, 10         # Trap if $t0 != 10",
        },
        tge: {
          description: "Trap if greater or equal (signed)",
          example: "tge $t0, $t1        # Trap if $t0 >= $t1",
        },
        tgeu: {
          description: "Trap if greater or equal unsigned",
          example: "tgeu $t0, $t1       # Trap if $t0 >= $t1 (unsigned)",
        },
        tgei: {
          description: "Trap if greater or equal immediate (signed)",
          example: "tgei $t0, 10         # Trap if $t0 >= 10",
        },
        tgeiu: {
          description: "Trap if greater or equal immediate unsigned",
          example: "tgeiu $t0, 10        # Trap if $t0 >= 10 (unsigned)",
        },
        tgt: {
          description: "Trap if greater than (signed)",
          example: "tgt $t0, $t1        # Trap if $t0 > $t1",
        },
        tgti: {
          description: "Trap if greater than immediate (signed)",
          example: "tgti $t0, 10         # Trap if $t0 > 10",
        },
        tgtu: {
          description: "Trap if greater than unsigned",
          example: "tgtu $t0, $t1       # Trap if $t0 > $t1 (unsigned)",
        },
        tgtiu: {
          description: "Trap if greater than immediate unsigned",
          example: "tgtiu $t0, 10        # Trap if $t0 > 10 (unsigned)",
        },
        tlt: {
          description: "Trap if less than (signed)",
          example: "tlt $t0, $t1        # Trap if $t0 < $t1",
        },
        tltu: {
          description: "Trap if less than unsigned",
          example: "tltu $t0, $t1       # Trap if $t0 < $t1 (unsigned)",
        },
        tlti: {
          description: "Trap if less than immediate (signed)",
          example: "tlti $t0, 10         # Trap if $t0 < 10",
        },
        tltiu: {
          description: "Trap if less than immediate unsigned",
          example: "tltiu $t0, 10        # Trap if $t0 < 10 (unsigned)",
        },
        tle: {
          description: "Trap if less or equal (signed)",
          example: "tle $t0, $t1        # Trap if $t0 <= $t1",
        },
        tleu: {
          description: "Trap if less or equal unsigned",
          example: "tleu $t0, $t1       # Trap if $t0 <= $t1 (unsigned)",
        },
        tlei: {
          description: "Trap if less or equal immediate (signed)",
          example: "tlei $t0, 10         # Trap if $t0 <= 10",
        },
        tleiu: {
          description: "Trap if less or equal immediate unsigned",
          example: "tleiu $t0, 10        # Trap if $t0 <= 10 (unsigned)",
        },
        nop: {
          description: "No operation",
          example: "nop               # No operation",
        },
      };

      const createDirectiveHover = (
        description: string,
        example: string,
        range: vscode.Range
      ): vscode.Hover => {
        const hoverContent = new vscode.MarkdownString();
        hoverContent.isTrusted = true;
        hoverContent.supportHtml = true;
        hoverContent.appendMarkdown(description);
        hoverContent.appendCodeblock(example, "mips");
        return new vscode.Hover(hoverContent, range);
      };

      for (const directiveName in directives) {
        const directive = directives[directiveName as keyof typeof directives];
        const directiveIndex = lineText.indexOf(directiveName);
        if (
          directiveIndex !== -1 &&
          position.character >= directiveIndex &&
          position.character <= directiveIndex + directiveName.length
        ) {
          const range = new vscode.Range(
            position.line,
            directiveIndex,
            position.line,
            directiveIndex + directiveName.length
          );
          return createDirectiveHover(
            directive.description,
            directive.example,
            range
          );
        }
      }

      return undefined;
    },
  });

  // Register completion provider for SYSCALL values
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    ["mips"],
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const lineText = document.lineAt(position.line).text;
        const linePrefix = lineText.substring(0, position.character);
        if (linePrefix !== "$v0, ") {
        }

        const syscalls = [
          {
            number: "1",
            label: "print_int",
            cEquiv: 'printf("%d")',
            description:
              "Print the integer in $a0 to the console as a signed decimal.",
          },
          {
            number: "2",
            label: "print_float",
            cEquiv: 'printf("%f")',
            description: "Print the float in $f12 to the console as a %.8f.",
          },
          {
            number: "3",
            label: "print_double",
            cEquiv: 'printf("%g")',
            description:
              "Print the double in $f12/$f13 to the console as a %.18g",
          },
          {
            number: "4",
            label: "print_string",
            cEquiv: 'printf("%s")',
            description:
              "Print the nul-terminated array of bytes referenced by $a0 to the console as an ASCII string.",
          },
          {
            number: "5",
            label: "read_int",
            cEquiv: 'scanf("%d")',
            description:
              "Read an integral value from the console, with atol's semantics, into register $v0",
          },
          {
            number: "6",
            label: "read_float",
            cEquiv: 'scanf("%f")',
            description:
              "Read a floating-point value from the console, with atof's semantics, into register $f0",
          },
          {
            number: "7",
            label: "read_double",
            cEquiv: 'scanf("%lf")',
            description:
              "Read a double-precision floating-point value from the console, with atof's semantics, into registers $f0/$f1",
          },
          {
            number: "8",
            label: "read_string",
            cEquiv: "fgets()",
            description:
              "Read a string into the provided buffer (referenced by $a0); up to size (given in $a1) bytes are read, and the result is nul-terminated.",
          },
          {
            number: "9",
            label: "sbrk",
            cEquiv: "malloc()",
            description:
              "Extend the .data segment by adding $a0 bytes; a primitive useful for, e.g., implementing malloc",
          },
          {
            number: "10",
            label: "exit",
            cEquiv: "exit(0)",
            description: "The program exits with code 0.",
          },
          {
            number: "11",
            label: "print_character",
            cEquiv: "putchar()",
            description: "Print the character in $a0, analogous to putchar.",
          },
          {
            number: "12",
            label: "read_character",
            cEquiv: "getchar()",
            description:
              "Read the next character from the console into register $v0; analogous to getchar",
          },
          {
            number: "13",
            label: "open",
            cEquiv: "open()",
            description:
              "Open the file specified by name (referenced by $a0) in a particular access mode as specified by flags (given by $a1), and, if it is to be created, with mode mode (given by $a2). Returns a file descriptor, a small non-negative int.",
          },
          {
            number: "14",
            label: "read",
            cEquiv: "read()",
            description:
              "On the file given by the file descriptor fd (given in $a0), read len bytes (given by $a2) into buffer (given by $a1). Returns the number of bytes read, or -1 if an error occurred.",
          },
          {
            number: "15",
            label: "write",
            cEquiv: "write()",
            description:
              "On the file given by the file descriptor fd (given in $a0), write len bytes (given by $a2) from buffer (given by $a1). Returns the number of bytes written, or -1 if an error occurred.",
          },
          {
            number: "16",
            label: "close",
            cEquiv: "close()",
            description:
              "Close the file given by the file descriptor fd (given in $a0). Returns 0 if successful, or -1 if an error occurred.",
          },
          {
            number: "17",
            label: "exit2",
            cEquiv: "exit(n)",
            description: "The program exits with code (given in $a0).",
          },
        ];

        return syscalls.map((syscall) => {
          const item = new vscode.CompletionItem(
            `${syscall.number} - ${syscall.label}`
          );
          item.detail = syscall.description;
          item.documentation = new vscode.MarkdownString(syscall.description);
          item.insertText = `${syscall.number}\t#${syscall.cEquiv}`;
          item.kind = vscode.CompletionItemKind.Value;
          return item;
        });
      },
    },
    " " // Trigger completion after space
  );

  context.subscriptions.push(
    activeEditorListener,
    hoverProvider,
    completionProvider
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
