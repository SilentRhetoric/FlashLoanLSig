# TEALScript Project - Hello World + Flash Loan LogicSig

This example extends the AlgoKit HelloWorld TealScript contract by creating a second smart contract--a logic signature (LSig)--which enables flash loans as long as it is repayed at the end of the atomic transaction group. The compilation of the LSig and construction of this transaction group sandwich, with the flash loan at the start and repayment at the end, can be seen in the test.

## Documentation

For TEALScript documentation, go to <https://tealscript.algo.xyz>

## Usage

### Algokit

This template assumes you have a local network running on your machine. The easiet way to setup a local network is with [algokit](https://github.com/algorandfoundation/algokit-cli). If you don't have Algokit or its dependencies installed locally you can open this repository in a GitHub codespace via <https://codespaces.new> and choosing this repo.

### Build Contract

`npm run build` will compile the contract to TEAL in [./contracts/artifacts](./contracts/artifacts/).

`npm run compile-contract` or `npm run generate-client` can be used to compile the contract or generate the contract seperately.

### Run Tests

`npm run test` will execute the tests defined in [./\_\_test\_\_](./__test__)

### Lint

`npm run lint` will lint the contracts and tests with ESLint.
