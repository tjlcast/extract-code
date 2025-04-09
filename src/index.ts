import fs from 'fs';
import path from 'path';

function trimChar(str: string, char: string): string {
  let start = 0;
  let end = str.length;

  while (start < end && str[start] === char) {
    start++;
  }

  while (end > start && str[end - 1] === char) {
    end--;
  }

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

interface FileInfo {
  filePath: string;
  content: string;
}

function extractFileInfo(input: string): FileInfo[] {
  const fileInfoRegex = /file:\s*([^\n]+?)\s*\n···.*?\n([\s\S]*?)\n···/g;
  const files: FileInfo[] = [];
  let match;

  while ((match = fileInfoRegex.exec(input)) !== null) {
    files.push({
      filePath: trimChar(match[1].trim(), "·"),
      content: match[2].trim()
    });
  }

  return files;
}
function processFiles(fileInfos: FileInfo[]): void {
  fileInfos.forEach(({ filePath, content }) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content);
      console.log(`Created file: ${filePath}`);
    } else {
      console.log(`File already exists: ${filePath}`);
    }
  });
}

// Example usage
const sampleInput = `

fd ·file: src/types.ts·
··· ts
export type EditorMode = 'edit' | 'preview' | 'mindmap';
···

file: src/utils/file-helper.ts
··· ts
export function readFile(path: string): string {
  return '';
}
···

`;

const fileInfos = extractFileInfo(sampleInput);
processFiles(fileInfos);