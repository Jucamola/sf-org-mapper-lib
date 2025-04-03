#!/usr/bin/env node

const repl = require('repl');
const { Org } = require('@salesforce/core');
const {
  buildGraph,
  buildDependenciesGraph,
  buildDependenciesGraphs,
  buildDependenciesGraphWithoutRedundancy,
  buildUsesGraph,
  buildUsesGraphs,
  buildUsesGraphWithoutRedundancy,
  parseCSVFile,
  queryMetadatas,
  queryPackage2Members,
  queryMetadataComponentDependencies,
  writeGexf,
} = require('../lib/index');

const startMessage = `
Usage:
  // Get an org Connection
  const conn = await getConnection(username);
  const metadataComponentDependencies = parseCSVFile("data/data.csv")
  const metadatas = await queryMetadatas(conn);
  const graph = buildGraph(metadatas, metadataComponentDependencies);
  writeGexf(graph,'data/data', metadatas)
`;
console.log(startMessage);

const replServer = repl.start({ breakEvalOnSigint: true });
replServer.setupHistory('.repl_history', (err, repl) => {});

const context = {
  buildGraph,
  buildDependenciesGraph,
  buildDependenciesGraphs,
  buildDependenciesGraphWithoutRedundancy,
  buildUsesGraph,
  buildUsesGraphs,
  buildUsesGraphWithoutRedundancy,
  parseCSVFile,
  queryMetadatas,
  queryPackage2Members,
  queryMetadataComponentDependencies,
  writeGexf,
  getConnection: async (username) => {
    const org = await Org.create({ aliasOrUsername: username });
    return org.getConnection();
  },
};

Object.assign(replServer.context, context);
