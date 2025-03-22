/*
 * Copyright (c) 2025, Juan Carlos Montero Lamata.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'csv-parse/sync';
import { MetadataComponentDependency } from '../types/SObjects';

export function parseCSVFile(file: string): MetadataComponentDependency[] {
  const csvFilePath = path.resolve(file);
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  return parseCSV(fileContent);
}

function parseCSV(csv: string): MetadataComponentDependency[] {
  const records: MetadataComponentDependency[] = parse(csv, {
    columns: true,
    delimiter: ';',
  }) as MetadataComponentDependency[];

  return records;
}
