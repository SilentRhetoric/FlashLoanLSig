import { AlgorandClient } from '@algorandfoundation/algokit-utils';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { LogicSigAccount } from 'algosdk';

// Vanity substrings of 3 characters are quick to find; 4 is slow, 5+ is epic
const DESIRED_FIRST_CHARACTERS = 'NAM';

async function compileWithBytes(bytes: string) {
  const algorand = AlgorandClient.defaultLocalNet();
  const tealString = readFileSync('contracts/artifacts/FlashLoan.lsig.teal', 'utf8');
  const compiledTeal = await algorand.app.compileTealTemplate(tealString, { BYTES: bytes });
  const loanLSigAccount = algorand.account.logicsig(compiledTeal.compiledBase64ToBytes);
  return loanLSigAccount;
}

async function lsigVanityAddrSearch() {
  let tmplStr: string = '';
  let lsigAcct: LogicSigAccount = (await compileWithBytes(tmplStr)).account;
  let firstChars: string = '';
  let attempts: number = 0;
  process.stdout.write(`Searching for vanity LogicSig address starting with "${DESIRED_FIRST_CHARACTERS}"\n`);
  while (firstChars !== DESIRED_FIRST_CHARACTERS) {
    // Generate random values
    const bytes = randomBytes(16);
    // Convert to hex string
    const randomStr = Buffer.from(bytes).toString('hex');
    tmplStr = randomStr;
    // eslint-disable-next-line no-await-in-loop
    lsigAcct = (await compileWithBytes(randomStr)).account;
    firstChars = lsigAcct.address().toString().slice(0, DESIRED_FIRST_CHARACTERS.length);
    attempts += 1;
    process.stdout.write(`\rAttempts: ${attempts}`);
  }
  process.stdout.write(
    `\nFound LogicSig vanity address using TMPL_BYTES ${tmplStr}\n${lsigAcct.address().toString()}\n`
  );
}

lsigVanityAddrSearch();
