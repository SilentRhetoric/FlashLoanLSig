import { describe, test, expect, beforeAll, beforeEach } from '@jest/globals';
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing';
import { Config } from '@algorandfoundation/algokit-utils';
import { readFileSync } from 'fs';
import { Address, LogicSigAccount } from 'algosdk';
import { TransactionSignerAccount } from '@algorandfoundation/algokit-utils/types/account';
import { HelloWorldClient, HelloWorldFactory } from '../contracts/clients/HelloWorldClient';

const fixture = algorandFixture();
Config.configure({ populateAppCallResources: true });

let helloWorldAppClient: HelloWorldClient;
let flashLoanLsig: Address &
  TransactionSignerAccount & {
    account: LogicSigAccount;
  };

describe('FlashLoan', () => {
  beforeEach(fixture.beforeEach);

  beforeAll(async () => {
    await fixture.beforeEach();
    const { testAccount } = fixture.context;
    const { algorand } = fixture;

    const factory = new HelloWorldFactory({
      algorand,
      defaultSender: testAccount.addr,
    });

    // Create an app factory to deploy the hello world contract
    const createResult = await factory.send.create.createApplication();
    helloWorldAppClient = createResult.appClient;

    // Grab the compiled Teal template file and compile it with a template variable
    const tealString = readFileSync('contracts/artifacts/FlashLoan.lsig.teal', 'utf8');
    const compiledTeal = await algorand.app.compileTealTemplate(tealString, { BYTES: 'a' });
    // Create a LogicSigAccount from the completely compiled Teal contract
    flashLoanLsig = algorand.account.logicsig(compiledTeal.compiledBase64ToBytes);
  });

  test('hello', async () => {
    const { testAccount } = fixture.context;
    const { algorand } = fixture;

    // This flash loan transaction is from the lsig and contains an extra fee
    // to cover the fee of the txn that will be sandwiched between the loan and repayment
    const loan = await algorand.createTransaction.payment({
      sender: flashLoanLsig.addr,
      receiver: flashLoanLsig.addr,
      amount: (0).algo(),
      extraFee: (1000).microAlgo(),
      note: 'loan',
    });

    // This repayment transaction is from the test account back to the lsig
    // at the end of the atomic group to complete the flash loan sandwich
    const repayment = await algorand.createTransaction.payment({
      sender: testAccount.addr,
      receiver: flashLoanLsig.addr,
      amount: (2000).microAlgo(),
      note: 'repayment',
    });

    // The lsig account must be funded in the first place to enable this flash loan
    algorand.account.ensureFunded(flashLoanLsig.addr, testAccount.addr, (1).algo());

    // Construct the flash loan sandwich atomic group in which the first txn
    // includes an extra fee to cover the fee of the second txn through fee pooling
    const result = helloWorldAppClient
      .newGroup()
      .addTransaction(loan, flashLoanLsig.signer) // Loan txn has an extra fee
      .hello({ args: { name: 'world!' }, staticFee: (0).microAlgo() }) // This txn pays no fee
      .addTransaction(repayment, testAccount.signer) // Repay the lsig at the end
      .send();

    expect((await result).returns[0]).toBe('Hello, world!');
  });
});
