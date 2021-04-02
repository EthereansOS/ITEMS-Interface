import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Coin, Input, TokenInput } from '../../../../components/shared';
import { setFarmingContractStep, updateFarmingContract, addFarmingSetup, removeFarmingSetup } from '../../../../store/actions';
import { ethers } from "ethers";
import ContractEditor from '../../../../components/editor/ContractEditor';
import CreateOrEditFarmingSetups from './CreateOrEditFarmingSetups';
import FarmingExtensionTemplateLocation from '../../../../data/FarmingExtensionTemplate.sol';
import { useParams } from 'react-router';

const abi = new ethers.utils.AbiCoder();

const Create = (props) => {
    const { address } = useParams();
    const { inputRewardToken } = props;
    // utils
    const [loading, setLoading] = useState(false);
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    // booleans
    const [isDeploy, setIsDeploy] = useState(false);
    // reward token
    const [selectedRewardToken, setSelectedRewardToken] = useState(inputRewardToken || null);
    const [byMint, setByMint] = useState(false);
    // setups
    const [farmingSetups, setFarmingSetups] = useState([]);
    // deploy data
    const [treasuryAddress, setTreasuryAddress] = useState(null);
    const [hostWalletAddress, setHostWalletAddress] = useState(null);
    const [hostDeployedContract, setHostDeployedContract] = useState(null);
    const [deployContract, setDeployContract] = useState(null);
    const [useDeployedContract, setUseDeployedContract] = useState(false);
    const [extensionPayload, setExtensionPayload] = useState("");
    const [selectedHost, setSelectedHost] = useState("");
    const [deployLoading, setDeployLoading] = useState(false);
    const [deployStep, setDeployStep] = useState(0);
    const [deployData, setDeployData] = useState(null);
    const [farmingExtensionTemplateCode, setFarmingExtensionTemplateCode] = useState("");

    const [hasTreasuryAddress, setHasTreasuryAddress] = useState(false);
    const [farmingContract, setFarmingContract] = useState("");
    const [totalRewardToSend, setTotalRewardToSend] = useState(0);

    useEffect(async () => {
        //setFarmingExtensionTemplateCode(await (await fetch(FarmingExtensionTemplateLocation)).text());
        if (props.farmingContract?.rewardToken) {
            onSelectRewardToken(props.farmingContract.rewardToken.address);
        } else if (address) {
            onSelectRewardToken(address);
        }
        if (currentBlockNumber === 0) {
            props.dfoCore.getBlockNumber().then((blockNumber) => {
                setCurrentBlockNumber(blockNumber);
            });
        }
    }, []);

    useEffect(() => {
        setByMint(false);
    }, [selectedRewardToken]);

    const addFarmingSetup = (setup) => {
        setFarmingSetups(farmingSetups.concat(setup));
    }

    const editFarmingSetup = (setup, index) => {
        const updatedSetups = farmingSetups.map((s, i) => {
            return i !== index ? s : setup;
        })
        setFarmingSetups(updatedSetups);
    }

    const removeFarmingSetup = (i) => {
        const updatedSetups = farmingSetups.filter((_, index) => index !== i);
        setFarmingSetups(updatedSetups);
    }

    const onSelectRewardToken = async (address) => {
        setLoading(true);
        try {
            const rewardToken = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), address);
            const symbol = await rewardToken.methods.symbol().call();
            const decimals = await rewardToken.methods.decimals().call();
            setSelectedRewardToken({ symbol, address, decimals });
        } catch (error) {
            console.error(error);
            setSelectedRewardToken(null);
        } finally {
            setLoading(false);
        }
    }

    const initializeDeployData = async () => {
        setDeployLoading(true);
        try {
            const data = { setups: [], rewardTokenAddress: selectedRewardToken.address, byMint, deployContract, extensionInitData: extensionPayload || '' };
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            console.log(farmingSetups);
            var calculatedTotalToSend = "0";
            for (let i = 0; i < farmingSetups.length; i++) {
                const setup = farmingSetups[i];
                calculatedTotalToSend =
                    props.dfoCore.web3.utils.toBN(calculatedTotalToSend).add(
                        props.dfoCore.web3.utils.toBN(window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.rewardPerBlock), selectedRewardToken.decimals)),
                        ).mul(props.dfoCore.web3.utils.toBN(window.numberToString(setup.blockDuration)))
                    ).toString();
                const isFree = setup.free;
                const result = await ammAggregator.methods.findByLiquidityPool(setup.liquidityPoolToken.address).call();
                const { amm } = result;
                var mainTokenAddress = isFree ? setup.liquidityPoolToken.tokens[0].address : setup.mainToken.address;
                const mainTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), mainTokenAddress);
                const mainTokenDecimals = mainTokenAddress === window.voidEthereumAddress ? 18 : await mainTokenContract.methods.decimals().call();

                const parsedSetup =
                    [
                        isFree,
                        parseInt(setup.blockDuration),
                        window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.rewardPerBlock), selectedRewardToken.decimals)),
                        window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.minStakeable), mainTokenDecimals)),
                        !isFree ? window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.maxStakeable)), mainTokenDecimals) : 0,
                        setup.renewTimes,
                        amm,
                        setup.liquidityPoolToken.address,
                        mainTokenAddress,
                        props.dfoCore.voidEthereumAddress,
                        setup.involvingEth,
                        isFree ? 0 : props.dfoCore.fromDecimals(window.numberToString(parseFloat(setup.penaltyFee) / 100)),
                        0,
                        0
                    ];
                data.setups.push(parsedSetup)
            }
            console.log(data);
            setDeployData(data);
            setTotalRewardToSend(calculatedTotalToSend);
            return data;
        } catch (error) {
            console.error(error);
            setDeployData(null);
        } finally {
            setDeployLoading(false);
        }
    }

    async function deployDFO() {
        var farmingData = await initializeDeployData();
        var sequentialOps = [{
            name: "Clone Extension",
            description: "Farm Extension will comunicate with the DFO for Token and ETH transmission to the Farming Contract Contract",
            async call(data) {
                var transaction = await window.blockchainCall(dfoBasedFarmExtensionFactory.methods.cloneModel);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            },
            onTransaction(data, transaction) {
                data.extensionAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('ExtensionCloned(address,address)'))[0].topics[1]);
            }
        }, {
            name: "Deploy Farm Contract",
            description: 'New Farm Contract will be deployed.',
            async call(data) {
                var deployPayload = window.newContract(props.dfoCore.getContextElement("FarmMainABI")).methods.init(
                    data.extensionAddress,
                    window.web3.utils.sha3("init(bool,address,address)").substring(0, 10) + window.web3.eth.abi.encodeParameters(["bool", "address", "address"], [farmingData.byMint, data.element.doubleProxyAddress, window.voidEthereumAddress]).substring(2),
                    window.getNetworkElement("ethItemOrchestratorAddress"),
                    farmingData.rewardTokenAddress,
                    abi.encode(["tuple(bool,uint256,uint256,uint256,uint256,uint256,address,address,address,address,bool,uint256,uint256,uint256)[]"], [farmingData.setups])
                ).encodeABI();
                var transaction = await window.blockchainCall(farmFactory.methods.deploy, deployPayload);
                var receipt = await window.web3.eth.getTransactionReceipt(transaction.transactionHash);
                data.farmAddress = window.web3.eth.abi.decodeParameter("address", receipt.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FarmMainDeployed(address,address,bytes)'))[0].topics[1]);
            },
            async onTransaction(data, transaction) {
                data.farmAddress = window.web3.eth.abi.decodeParameter("address", transaction.logs.filter(it => it.topics[0] === window.web3.utils.sha3('FarmMainDeployed(address,address,bytes)'))[0].topics[1]);
            }
        }, {
            name: "Generate SmartContract Proposal",
            async call(data) {
                data.selectedSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.6'];
                data.bypassFunctionalitySourceId = true;
                data.contractName = 'ProposalCode';
                var fileName = "NewFarmingExtension";

                data.functionalityMethodSignature = 'callOneTime(address)';
                if (JSON.parse(await window.blockchainCall(data.element.functionalitiesManager.methods.functionalityNames)).filter(it => it === 'manageFarming').length === 0) {
                    fileName = "ManageFarmingFunctionality";
                    data.functionalityMethodSignature = 'manageFarming(address,uint256,bool,address,address,uint256,bool)';
                    data.functionalityName = 'manageFarming';
                    data.functionalitySubmitable = true;
                    data.functionalityNeedsSender = true;
                }
                data.sourceCode = (await (await fetch(`data/${fileName}.sol`)).text()).format(window.web3.utils.toChecksumAddress(data.extensionAddress));

                console.log(data.sourceCode);
            }
        }];

        var context = {
            element: props.element,
            sequentialOps,
            sourceCode: 'test',
            title: (!props.fixedInflationContractAddress ? 'New' : 'Edit') + ' Farming'
        };
        window.showProposalLoader(context);
    };

    const deploy = async () => {
        let error = false;
        let deployTransaction = null;
        setDeployLoading(true);
        try {
            const { setups, rewardTokenAddress, extensionAddress, extensionInitData } = deployData;
            const factoryAddress = props.dfoCore.getContextElement("farmFactoryAddress");
            const farmFactory = await props.dfoCore.getContract(props.dfoCore.getContextElement("FarmFactoryABI"), factoryAddress);
            const types = [
                "address",
                "bytes",
                "address",
                "address",
                "bytes",
            ];
            console.log(deployData);
            const encodedSetups = abi.encode(["tuple(bool,uint256,uint256,uint256,uint256,uint256,address,address,address,address,bool,uint256,uint256,uint256)[]"], [setups]);
            const params = [props.dfoCore.web3.utils.toChecksumAddress(extensionAddress ? extensionAddress : hostDeployedContract), extensionPayload || extensionInitData || "0x", props.dfoCore.getContextElement("ethItemOrchestratorAddress"), rewardTokenAddress, encodedSetups || 0];
            console.log(params)
            console.log(extensionInitData);
            console.log(extensionPayload);
            console.log(extensionAddress);
            const payload = props.dfoCore.web3.utils.sha3(`init(${types.join(',')})`).substring(0, 10) + (props.dfoCore.web3.eth.abi.encodeParameters(types, params).substring(2));
            console.log(payload);
            const gas = await farmFactory.methods.deploy(payload).estimateGas({ from: props.dfoCore.address });
            deployTransaction = await farmFactory.methods.deploy(payload).send({ from: props.dfoCore.address, gas });
            deployTransaction = await props.dfoCore.web3.eth.getTransactionReceipt(deployTransaction.transactionHash);
            var farmMainContractAddress = props.dfoCore.web3.eth.abi.decodeParameter("address", deployTransaction.logs.filter(it => it.topics[0] === props.dfoCore.web3.utils.sha3("FarmMainDeployed(address,address,bytes)"))[0].topics[1]);
            setFarmingContract(farmMainContractAddress);
        } catch (error) {
            console.error(error);
            error = true;
        } finally {
            if (!error && deployTransaction) {
                props.updateFarmingContract(null);
                await Promise.all(farmingSetups.map(async (_, i) => {
                    removeFarmingSetup(i);
                }));
                props.setFarmingContractStep(0);
                setSelectedRewardToken(null);
                setByMint(false);
                setDeployStep(deployStep + 1);
            }
            setDeployLoading(false);
        }
    }

    const deployExtension = async () => {
        let error = false;
        setDeployLoading(true);
        try {
            const { byMint, host, deployContract } = deployData;
            if (!deployContract) {
                const factoryAddress = props.dfoCore.getContextElement("farmFactoryAddress");
                const farmFactory = await props.dfoCore.getContract(props.dfoCore.getContextElement("FarmFactoryABI"), factoryAddress);
                const cloneGasLimit = await farmFactory.methods.cloneFarmDefaultExtension().estimateGas({ from: props.dfoCore.address });
                const cloneExtensionTransaction = await farmFactory.methods.cloneFarmDefaultExtension().send({ from: props.dfoCore.address, gas: cloneGasLimit });
                const cloneExtensionReceipt = await props.dfoCore.web3.eth.getTransactionReceipt(cloneExtensionTransaction.transactionHash);
                const extensionAddress = props.dfoCore.web3.eth.abi.decodeParameter("address", cloneExtensionReceipt.logs.filter(it => it.topics[0] === props.dfoCore.web3.utils.sha3('ExtensionCloned(address)'))[0].topics[1])
                const farmExtension = new props.dfoCore.web3.eth.Contract(props.dfoCore.getContextElement("FarmExtensionABI"), extensionAddress);
                const extensionInitData = farmExtension.methods.init(byMint, host, treasuryAddress || props.dfoCore.voidEthereumAddress).encodeABI();
                setDeployData({ ...deployData, extensionAddress, extensionInitData });
            } else {
                const { abi, bytecode } = deployContract;
                const gasLimit = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).estimateGas({ from: props.dfoCore.address });
                const extension = await new props.dfoCore.web3.eth.Contract(abi).deploy({ data: bytecode }).send({ from: props.dfoCore.address, gasLimit, gas: gasLimit });
                console.log(extension.options.address);
                setDeployData({ ...deployData, extensionAddress: extension.options.address });
            }
            setDeployStep(!error ? deployStep + 1 : deployStep);
        } catch (error) {
            console.error(error);
            error = true;
        } finally {
            setDeployLoading(false);
        }
    }

    function filterDeployedContract(contractData) {
        var abi = contractData.abi;
        if (abi.filter(abiEntry => abiEntry.type === 'constructor').length > 0) {
            return false;
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability !== 'view' && abiEntry.stateMutability !== 'pure' && abiEntry.name === 'transferTo' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false;
        }
        if (abi.filter(abiEntry => abiEntry.type === 'function' && abiEntry.stateMutability === 'payable' && abiEntry.name === 'backToYou' && (!abiEntry.outputs || abiEntry.outputs.length === 0) && abiEntry.inputs && abiEntry.inputs.length === 1 && abiEntry.inputs[0].type === 'uint256').length === 0) {
            return false;
        }
        return true;
    }

    function onHasTreasuryAddress(e) {
        setTreasuryAddress("");
        setHasTreasuryAddress(e.target.checked);
    }

    function onTreasuryAddressChange(e) {
        var addr = e.currentTarget.value;
        setTreasuryAddress(window.isEthereumAddress(addr) ? addr : "");
    }

    function onHostSelection(e) {
        setSelectedHost(e.target.value);
        setHostWalletAddress("");
        setHostDeployedContract("");
        setExtensionPayload("");
        setUseDeployedContract(false);
        setTreasuryAddress("");
        setHasTreasuryAddress(false);
        setDeployContract(null);
    }

    function canDeploy() {
        if (!selectedHost) {
            return false;
        }
        if (selectedHost === 'address') {
            if (hasTreasuryAddress && !window.isEthereumAddress(treasuryAddress)) {
                return false;
            }
            return window.isEthereumAddress(hostWalletAddress);
        }
        if (selectedHost === 'deployedContract') {
            if (useDeployedContract) {
                return window.isEthereumAddress(hostDeployedContract);
            }
            return deployContract !== undefined && deployContract !== null && deployContract.contract !== undefined && deployContract.contract !== null;
        }
        return window.isEthereumAddress(hostDeployedContract);
    }

    const getCreationComponent = () => {
        return <div className="CheckboxQuestions">
            <h6>Reward token address</h6>
            <p className="BreefRecapB">The reward token is the token chosen to reward farmers and can be one per contract.</p>
            <TokenInput placeholder={"Reward token"} onClick={onSelectRewardToken} tokenAddress={(selectedRewardToken && selectedRewardToken.address) || ""} text={"Load"} />
            {
                loading ? <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div> : <>
                    {selectedRewardToken && <div className="CheckboxQuestions">
                        <p><Coin address={selectedRewardToken.address} /> {selectedRewardToken.symbol}</p>
                        <p className="BreefRecapB">If “by reserve” is selected, the input token will be sent from a wallet. If “by mint” is selected, it will be minted and then sent. The logic of this action must be carefully coded into the extension! To learn more, read the Documentation <a>Documentation (coming Soon)</a></p>
                        <select value={byMint === true ? "true" : "false"} onChange={e => setByMint(e.target.value === 'true')} className="SelectRegular">
                            <option value="">Select method</option>
                            {/*!enterInETH &&*/ <option value="true">By mint</option>}
                            <option value="false">By reserve</option>
                        </select>
                    </div>}
                    {selectedRewardToken && <div className="Web2ActionsBTNs">
                        <a className="web2ActionBTN" onClick={() => {
                            props.updateFarmingContract({ rewardToken: { ...selectedRewardToken, byMint } });
                            setDeployStep(0);
                        }}>Start</a>
                    </div>}
                </>
            }
        </div>
    }

    const getDeployComponent = () => {

        if (deployLoading) {
            return <div className="col-12">
                <div className="row justify-content-center">
                    <div className="spinner-border text-secondary" role="status">
                        <span className="visually-hidden"></span>
                    </div>
                </div>
            </div>
        }

        if (deployStep === 1) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6><b>Deploy extension</b></h6>
                </div>
                <div className="row">
                    <a onClick={() => setDeployStep(0)} className="backActionBTN mr-4">Back</a>
                    <a onClick={() => deployExtension()} className="Web3ActionBTN">Deploy extension</a>
                </div>
            </div>
        } else if (deployStep === 2) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6><b>Deploy Farming Contract</b></h6>
                </div>
                <div className="row">
                    <a onClick={() => setDeployStep(hostDeployedContract ? 0 : 1)} className="backActionBTN mr-4">Back</a>
                    <a onClick={() => deploy()} className="Web3ActionBTN">Deploy contract</a>
                </div>
            </div>
        } else if (deployStep === 3) {
            return <div className="col-12 flex flex-column justify-content-center align-items-center">
                <div className="row mb-4">
                    <h6 className="text-secondary"><b>Deploy successful!</b></h6>
                </div>
            </div>
        }

        return (
            <div className="CheckboxQuestions">
                <h6>Host</h6>
                <p className="BreefRecapB">The host is the Contract, Wallet, DAO, or DFO with permissions to manage and add new setups in this contract. The host permissions are set into the extension contract. If you choose "Standard Extension (Address, wallet)," the extension must have all of the tokens needed to fill every setup rewards. You can also program extension permissions by your Organization, DFO to mint or transfer directly from the treasury, using the DFOhub website or a custom contract (more info in the Documentation).</p>
                <select className="SelectRegular" value={selectedHost} onChange={onHostSelection}>
                    <option value="">Choose the host type</option>
                    <option value="address">Standard Extension (Address, wallet)</option>
                    <option value="deployedContract">Custom Extension (Deployed Contract)</option>
                    <option value="fromSourceCode">Custom Extension (Deploy Contract)</option>
                </select>
                {
                    selectedHost === 'address' ? <>
                        <div className="InputTokensRegular InputRegularB">
                            <input type="text" className="TextRegular" value={hostWalletAddress || ""} onChange={(e) => setHostWalletAddress(e.target.value.toString())} placeholder={"Wallet address"} aria-label={"Host address"} />
                        </div>
                        <div className="CheckboxQuestions">
                            <h6><input type="checkbox" checked={hasTreasuryAddress} onChange={onHasTreasuryAddress} /> External Treasury</h6>
                            {hasTreasuryAddress && <input type="text" className="TextRegular" value={treasuryAddress || ""} onChange={onTreasuryAddressChange} placeholder={"Treasury address"} aria-label={"Treasury address"} />}
                            <p className="BreefRecapB">[Optional] Separate the Extension to the treasury used to send tokens to the Farm contract to activate setups.</p>
                        </div>
                    </> : selectedHost === 'fromSourceCode' ? <>
                            <p className="BreefRecapB">Deploy a custom extension contract. In the IDE, we loaded a simple extension contract, and you can use it as a guide. Before building a custom contract, we kindly recommend reading the Covenants Documentation. Do it at your own risk.</p>
                            <ContractEditor filterDeployedContract={filterDeployedContract} dfoCore={props.dfoCore} onContract={setDeployContract} templateCode={farmingExtensionTemplateCode} />
                            <h6>Extension payload</h6>
                            <div className="InputTokensRegular InputRegularB">
                                <input type="text" className="TextRegular" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"} />
                            </div>
                    </> : selectedHost === 'deployedContract' ? <>
                        <div className="InputTokensRegular InputRegularB">
                            <input type="text" className="TextRegular" value={hostDeployedContract} onChange={(e) => setHostDeployedContract(e.target.value.toString())} placeholder="Insert extension address" aria-label={"Deployed contract address"} />
                        </div>
                        <h6>[Optional] Extension payload</h6>
                        <div className="InputTokensRegular InputRegularB">
                            <input type="text" className="TextRegular" value={extensionPayload || ""} onChange={(e) => setExtensionPayload(e.target.value.toString())} placeholder={"Payload"} aria-label={"Payload"} />
                        </div>
                    </> : <></>
                }
                <div className="Web2ActionsBTNs">
                    <a onClick={() => {
                        setSelectedHost(null);
                        setIsDeploy(false);
                    }} className="backActionBTN">Back</a>
                    <a onClick={() => {
                        if (!canDeploy()) {
                            return;
                        }
                        initializeDeployData();
                        setDeployStep(hostDeployedContract ? 2 : 1);
                    }} className="web2ActionBTN" disabled={!canDeploy()}>Deploy</a>
                </div>
            </div>
        )
    }

    const getFarmingContractStatus = () => {
        return (
            <div className="col-12">
                <div className="row flex-column align-items-start mb-4">
                    <h5 className="text-secondary"><b>Farm {props.farmingContract.rewardToken.symbol}</b></h5>
                </div>
                <CreateOrEditFarmingSetups
                    rewardToken={selectedRewardToken}
                    farmingSetups={farmingSetups}
                    onAddFarmingSetup={addFarmingSetup}
                    onRemoveFarmingSetup={removeFarmingSetup}
                    onEditFarmingSetup={editFarmingSetup}
                    onCancel={() => { props.updateFarmingContract(null); }}
                    onFinish={deployDFO} 
                />
            </div>
        )
    }

    if (farmingContract) {
        return (
            <div>
                <h3>Farming Contract Deployed!</h3>
                <p>The contract address is <a href={props.dfoCore.getContextElement("etherscanURL") + "address/" + farmingContract} target="_blank">{farmingContract}</a></p>
                <p>To activate all the setups you created, {byMint ? "be sure to grant the permission to mint at least" : "you must send"} <b>{window.fromDecimals(totalRewardToSend, selectedRewardToken.decimals, true)}</b> {selectedRewardToken.symbol} <Coin address={selectedRewardToken.address} /> {byMint ? "for the extension" : "to its extension, having address"} <a href={props.dfoCore.getContextElement("etherscanURL") + "address/" + deployData.extensionAddress} target="_blank">{deployData.extensionAddress}</a></p>
                <p>If you need more information, copy the two addresses and check documentation.</p>
            </div>
        );
    }

    if (isDeploy) {
        return (
            <div className="create-component">
                <div className="row mb-4">
                    {getDeployComponent()}
                </div>
            </div>
        )
    }

    return (
        <div>
            { !props.farmingContract && getCreationComponent()}
            { props.farmingContract && getFarmingContractStatus()}
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core, session } = state;
    const { farmingContract, farmingSetups, creationStep } = session;
    return { dfoCore: core.dfoCore, farmingContract, farmingSetups, creationStep };
}

const mapDispatchToProps = (dispatch) => {
    return {
        setFarmingContractStep: (index) => dispatch(setFarmingContractStep(index)),
        updateFarmingContract: (contract) => dispatch(updateFarmingContract(contract)),
        addFarmingSetup: (setup) => dispatch(addFarmingSetup(setup)),
        removeFarmingSetup: (index) => dispatch(removeFarmingSetup(index)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Create);