# IEthItemOrchestratorDependantElement

* **Path:** IEthItemOrchestratorDependantElement.sol
* **Version:** 1
* **Title:** IEthItemOrchestratorDependantElement

---

- [Description](#description)
- [Methods](#methods)
  - [doubleProxy()](#doubleproxy)
  - [setDoubleProxy(address)](#setdoubleproxyaddress)
  - [Params](#params)
  - [isAuthorizedOrchestrator(address)](#isauthorizedorchestratoraddress)

## Description

## Methods

### doubleProxy()

GET - The DoubleProxy of the DFO linked to this Contract

### setDoubleProxy(address)

SET - The DoubleProxy of the DFO linked to this Contract.
It can be done only by the Factory controller

### Params

- `newDoubleProxy`: the new DoubleProxy address

### isAuthorizedOrchestrator(address)

Check that an address is an authorized Orchestrator. Returns a boolean.
