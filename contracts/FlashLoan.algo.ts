import { LogicSig } from '@algorandfoundation/tealscript';

export class FlashLoan extends LogicSig {
  BYTES = TemplateVar<bytes>();

  logic(): void {
    // Payment txn only, no close remainder, no rekey, first in group
    verifyPayTxn(this.txn, { closeRemainderTo: globals.zeroAddress, rekeyTo: globals.zeroAddress, groupIndex: 0 });
    // Repayment txn at end of group has receiver=sender of first txn, amt >= amt+fee of first txn
    verifyPayTxn(this.txnGroup[this.txnGroup.length - 1], {
      receiver: this.txn.sender,
      amount: { greaterThanEqualTo: this.txn.amount + this.txn.fee },
    });
    // Incude templated arbitrary bytes for vanity address customization
    assert(this.BYTES !== '');
  }
}
