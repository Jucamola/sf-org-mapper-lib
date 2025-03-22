import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import { parseCSVFile } from '../../../src/csv';
import { MetadataComponentDependency } from '../../../src/types/SObjects';

describe('CSV Parser', () => {
  const testDataDir = path.join(__dirname, 'data');

  before(() => {
    // Create test data directory if it doesn't exist
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir);
    }
  });

  after(() => {
    // Clean up test data directory after tests
    if (fs.existsSync(testDataDir)) {
      fs.readdirSync(testDataDir).forEach((file) => {
        fs.unlinkSync(path.join(testDataDir, file));
      });
      fs.rmdirSync(testDataDir);
    }
  });

  it('should parse a valid CSV file', () => {
    const csvContent = `"MetadataComponentId";"MetadataComponentNamespace";"MetadataComponentName";"MetadataComponentType";"RefMetadataComponentId";"RefMetadataComponentNamespace";"RefMetadataComponentName";"RefMetadataComponentType"
"comp1";"ns1";"name1";"type1";"ref1";"refns1";"refname1";"reftype1"
"comp2";"ns2";"name2";"type2";"ref2";"refns2";"refname2";"reftype2"`;
    const csvFilePath = path.join(testDataDir, 'test.csv');
    fs.writeFileSync(csvFilePath, csvContent);

    const expected: MetadataComponentDependency[] = [
      {
        MetadataComponentId: 'comp1',
        MetadataComponentNamespace: 'ns1',
        MetadataComponentName: 'name1',
        MetadataComponentType: 'type1',
        RefMetadataComponentId: 'ref1',
        RefMetadataComponentNamespace: 'refns1',
        RefMetadataComponentName: 'refname1',
        RefMetadataComponentType: 'reftype1',
      },
      {
        MetadataComponentId: 'comp2',
        MetadataComponentNamespace: 'ns2',
        MetadataComponentName: 'name2',
        MetadataComponentType: 'type2',
        RefMetadataComponentId: 'ref2',
        RefMetadataComponentNamespace: 'refns2',
        RefMetadataComponentName: 'refname2',
        RefMetadataComponentType: 'reftype2',
      },
    ];

    const result = parseCSVFile(csvFilePath);
    expect(result).to.deep.equal(expected);
  });

  it('should handle an empty CSV file', () => {
    const csvContent =
      'MetadataComponentId;MetadataComponentNamespace;MetadataComponentName;MetadataComponentType;RefMetadataComponentId;RefMetadataComponentNamespace;RefMetadataComponentName;RefMetadataComponentType';
    const csvFilePath = path.join(testDataDir, 'empty.csv');
    fs.writeFileSync(csvFilePath, csvContent);

    const expected: MetadataComponentDependency[] = [];

    const result = parseCSVFile(csvFilePath);
    expect(result).to.deep.equal(expected);
  });

  it('should handle a CSV file with only one row', () => {
    const csvContent = `MetadataComponentId;MetadataComponentNamespace;MetadataComponentName;MetadataComponentType;RefMetadataComponentId;RefMetadataComponentNamespace;RefMetadataComponentName;RefMetadataComponentType
comp1;ns1;name1;type1;ref1;refns1;refname1;reftype1`;
    const csvFilePath = path.join(testDataDir, 'one-row.csv');
    fs.writeFileSync(csvFilePath, csvContent);

    const expected: MetadataComponentDependency[] = [
      {
        MetadataComponentId: 'comp1',
        MetadataComponentNamespace: 'ns1',
        MetadataComponentName: 'name1',
        MetadataComponentType: 'type1',
        RefMetadataComponentId: 'ref1',
        RefMetadataComponentNamespace: 'refns1',
        RefMetadataComponentName: 'refname1',
        RefMetadataComponentType: 'reftype1',
      },
    ];

    const result = parseCSVFile(csvFilePath);
    expect(result).to.deep.equal(expected);
  });

  it('should throw an error if the file does not exist', () => {
    const nonExistentFilePath = path.join(testDataDir, 'nonexistent.csv');
    expect(() => parseCSVFile(nonExistentFilePath)).to.throw();
  });
});
