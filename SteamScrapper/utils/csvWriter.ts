import fs from 'fs';
import path from 'path';

export async function writeCsvRow(filename: string, row: string[]) {
    const filePath = path.resolve(filename);
    const line = row.join(',') + '\n';
    await fs.promises.appendFile(filePath, line);
}

