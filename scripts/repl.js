#!/usr/bin/env node

const repl = require('repl');
const { Org } = require('@salesforce/core');
const { parseCSVFile } = require('../lib/index');

const startMessage = `
Usage:
  // Get an org Connection
  const conn = await getConnection(username);
`;
console.log(startMessage);

const replServer = repl.start({ breakEvalOnSigint: true });
replServer.setupHistory('.repl_history', (err, repl) => {});

const context = {
  parseCSVFile,
  getConnection: async (username) => {
    const org = await Org.create({ aliasOrUsername: username });
    return org.getConnection();
  },
};

Object.assign(replServer.context, context);
