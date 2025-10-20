import fs from 'fs';
import path from 'path';

export async function appendToFile(filename: string, text: string) {
    const filePath = path.resolve(filename);
    await fs.promises.appendFile(filePath, text + '\n');
}
