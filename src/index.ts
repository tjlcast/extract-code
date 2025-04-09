import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

function trimChar(str: string, char: string): string {
  let start = 0;
  let end = str.length;
  while (start < end && str[start] === char) start++;
  while (end > start && str[end - 1] === char) end--;
  return str.substring(start, end);
}

interface FileInfo {
  filePath: string;
  content: string;
}

function extractFileInfo(input: string): FileInfo[] {
  const fileInfoRegex = /file:\s*([^\n]+?)\s*\n```.*?\n([\s\S]*?)\n```/g;
  const files: FileInfo[] = [];
  let match;
  while ((match = fileInfoRegex.exec(input)) !== null) {
    files.push({
      filePath: trimChar(match[1].trim(), "`"),
      content: match[2].trim(),
    });
  }
  return files;
}

function processFiles(fileInfos: FileInfo[], outDir: string): void {
  fileInfos.forEach(({ filePath, content }) => {
    const finalPath = path.join(outDir, filePath);
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(finalPath)) {
      fs.writeFileSync(finalPath, content);
      console.log(`✅ Created file: ${finalPath}`);
    } else {
      console.log(`⚠️ File already exists: ${finalPath}`);
    }
  });
}

function runFromFile(inputFilePath: string, outDir: string): void {
  console.log(`Try to load file: ${inputFilePath}`);
  console.log(`Output directory: ${outDir}`);
  if (!fs.existsSync(inputFilePath)) {
    console.error(`❌ File not found: ${inputFilePath}`);
    process.exit(1);
  }

  const input = fs.readFileSync(inputFilePath, "utf-8");
  const fileInfos = extractFileInfo(input);
  console.log(`📝 Extracted ${fileInfos.length} files`);
  processFiles(fileInfos, outDir);
}

const prompt = `
以下是大模型的结尾提示词:
>>>
要求:
- 给出完成的项目文件，文件内容不能省略;
- 相关的文件给出输时需要完整的路径文件名和对应的文件内容。如下：
  file: \`src/types.ts\`
  \`\`\` ts
  export type EditorMode = 'edit' | 'preview' | 'mindmap';
  \`\`\`
<<<
  `;

// 🧾 解析命令行参数
const argv = yargs(hideBin(process.argv))
  .option("input", {
    alias: "i",
    type: "string",
    description: "Input file path",
    default: "example-input.txt",
  })
  .option("outDir", {
    alias: "o",
    type: "string",
    description: "Output base directory",
    default: ".",
  })
  .help()
  .alias("help", "h")
  .epilog(prompt)
  .parseSync();

runFromFile(argv.input!, argv.outDir);
