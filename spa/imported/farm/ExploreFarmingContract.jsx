import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import { FarmingComponent, SetupComponent } from '../../../../components';
import Create from './Create';
import CreateOrEditFarmingSetups from './CreateOrEditFarmingSetups';
import { Coin } from '../../../../components/shared';
import Loading from '../../../../components/shared/Loading'

const ExploreFarmingContract = (props) => {
    const { dfoCore, farmAddress, withoutBack } = props;
    let { address } = useParams();
    if (!address) {
        address = farmAddress;
    }
    const isHost = props.edit;
    const [farmingSetups, setFarmingSetups] = useState([]);
    const [contract, setContract] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isAdd, setIsAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [extension, setExtension] = useState(null);
    const [setupsLoading, setSetupsLoading] = useState(false);
    const [token, setToken] = useState(null);
    const [showOldSetups, setShowOldSetups] = useState(false);
    const [newFarmingSetups, setNewFarmingSetups] = useState([]);
    const [totalRewardToSend, setTotalRewardToSend] = useState(0);

    useEffect(() => {
        if (dfoCore) {
            getContractMetadata();
        }
    }, []);

    useEffect(() => {
        isAdd && !isHost && setIsAdd(false);
    });

    const getContractMetadata = async () => {
        setLoading(true);
        try {
            const lmContract = await dfoCore.getContract(dfoCore.getContextElement('FarmMainABI'), address);
            setContract(lmContract);
            const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
            const rewardToken = await dfoCore.getContract(dfoCore.getContextElement("ERC20ABI"), rewardTokenAddress);
            const rewardTokenSymbol = await rewardToken.methods.symbol().call();
            const rewardTokenDecimals = await rewardToken.methods.decimals().call();
            setToken({ symbol: rewardTokenSymbol, address: rewardTokenAddress, decimals: rewardTokenDecimals });
            const extensionAddress = await lmContract.methods._extension().call();
            const extensionContract = await dfoCore.getContract(dfoCore.getContextElement('FarmExtensionABI'), extensionAddress);
            setExtension(extensionContract);
            const { host, byMint } = await extensionContract.methods.data().call();
            const setups = await lmContract.methods.setups().call();
            const blockNumber = await dfoCore.getBlockNumber();
            const freeSetups = [];
            const lockedSetups = [];
            let totalFreeSetups = 0;
            let totalLockedSetups = 0;
            let rewardPerBlock = 0;
            let canActivateSetup = false;

            const res = [];
            for (let i = 0; i < setups.length; i++) {
                const { '0': setup, '1': setupInfo } = await lmContract.methods.setup(i).call();
                if (!canActivateSetup) {
                    canActivateSetup = parseInt(setupInfo.renewTimes) > 0 && !setup.active && parseInt(setupInfo.lastSetupIndex) === parseInt(i);
                }
                if (setup.rewardPerBlock !== "0") {
                    setupInfo.free ? totalFreeSetups += 1 : totalLockedSetups += 1;
                    res.push({ ...setup, setupInfo, rewardTokenAddress, setupIndex: i, finished: (parseInt(blockNumber) > parseInt(setup.endBlock) && parseInt(setup.endBlock) !== 0) || (parseInt(setup.endBlock) === 0 && parseInt(setupInfo.renewTimes) === 0) })
                }
                if (setup.active && (parseInt(setup.endBlock) > blockNumber)) {
                    setupInfo.free ? freeSetups.push(setup) : lockedSetups.push(setup);
                    rewardPerBlock += parseInt(setup.rewardPerBlock);
                }
            }
            const sortedRes = res.sort((a, b) => b.active - a.active);
            setFarmingSetups(sortedRes);

            const metadata = {
                name: `Farm ${rewardTokenSymbol}`,
                contractAddress: lmContract.options.address,
                rewardTokenAddress: rewardToken.options.address,
                rewardPerBlock: dfoCore.toDecimals(dfoCore.toFixed(rewardPerBlock).toString(), rewardTokenDecimals),
                byMint,
                freeSetups,
                lockedSetups,
                totalFreeSetups,
                totalLockedSetups,
                canActivateSetup,
                extension: `${extensionAddress.substring(0, 5)}...${extensionAddress.substring(extensionAddress.length - 3, extensionAddress.length)}`,
                fullExtension: `${extensionAddress}`,
                farmAddress: `${lmContract.options.address.substring(0, 5)}...${lmContract.options.address.substring(lmContract.options.address.length - 3, lmContract.options.address.length)}`,
                host: `${host.substring(0, 5)}...${host.substring(host.length - 3, host.length)}`,
                fullhost: `${host}`,
            };
            setMetadata({ contract: lmContract, metadata, isActive: freeSetups + lockedSetups > 0 || canActivateSetup });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const isWeth = (address) => {
        return (address.toLowerCase() === dfoCore.getContextElement('wethTokenAddress').toLowerCase()) || (address === dfoCore.voidEthereumAddress);
    }

    const addFarmingSetup = (setup) => {
        setNewFarmingSetups(newFarmingSetups.concat(setup));
    }

    const editFarmingSetup = (setup, index) => {
        const updatedSetups = newFarmingSetups.map((s, i) => {
            return i !== index ? s : setup;
        })
        setNewFarmingSetups(updatedSetups);
    }

    const removeFarmingSetup = (i) => {
        const updatedSetups = newFarmingSetups.filter((_, index) => index !== i);
        setNewFarmingSetups(updatedSetups);
    }

    const updateSetups = async () => {
        console.log(newFarmingSetups);
        setSetupsLoading(true);
        try {
            const newSetupsInfo = [];
            const ammAggregator = await dfoCore.getContract(dfoCore.getContextElement('AMMAggregatorABI'), dfoCore.getContextElement('ammAggregatorAddress'));
            var calculatedTotalToSend = "0";
            for (var i in newFarmingSetups) {
                const setup = newFarmingSetups[i];
                calculatedTotalToSend =
                    props.dfoCore.web3.utils.toBN(calculatedTotalToSend).add(
                        props.dfoCore.web3.utils.toBN(window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.rewardPerBlock), token.decimals)),
                        ).mul(props.dfoCore.web3.utils.toBN(window.numberToString(setup.blockDuration)))
                    ).toString();
                const isFree = setup.free;
                const result = await ammAggregator.methods.findByLiquidityPool(setup.liquidityPoolToken.address).call();
                const { amm } = result;
                var mainTokenAddress = isFree ? setup.liquidityPoolToken.tokens[0].address : setup.mainToken.address;
                const mainTokenContract = await props.dfoCore.getContract(props.dfoCore.getContextElement('ERC20ABI'), mainTokenAddress);
                const mainTokenDecimals = mainTokenAddress === window.voidEthereumAddress ? 18 : await mainTokenContract.methods.decimals().call();
                const setupInfo =
                {
                    add: true,
                    disable: false,
                    index: 0,
                    info: {
                        free: isFree,
                        blockDuration: parseInt(setup.blockDuration),
                        originalRewardPerBlock: window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.rewardPerBlock), token.decimals)),
                        minStakeable: window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.minStakeable), mainTokenDecimals)),
                        maxStakeable : !isFree ? window.numberToString(props.dfoCore.fromDecimals(window.numberToString(setup.maxStakeable)), mainTokenDecimals) : 0,
                        renewTimes: setup.renewTimes,
                        ammPlugin: amm,
                        liquidityPoolTokenAddress: setup.liquidityPoolToken.address,
                        mainTokenAddress,
                        ethereumAddress: dfoCore.voidEthereumAddress,
                        involvingETH: setup.involvingEth,
                        penaltyFee: isFree ? 0 : props.dfoCore.fromDecimals(window.numberToString(parseFloat(setup.penaltyFee) / 100)),
                        setupsCount: 0,
                        lastSetupIndex: 0
                    }
                };
                newSetupsInfo.push(setupInfo);
            }
            await deployDFO(newSetupsInfo);
        } catch (error) {
            console.error(error);
        }
    }

    async function deployDFO(setups) {
        var sequentialOps = [{
            name: "Generate SmartContract Proposal",
            async call(data) {
                data.selectedSolidityVersion = (await window.SolidityUtilities.getCompilers()).releases['0.7.6'];
                data.bypassFunctionalitySourceId = true;
                data.contractName = 'ProposalCode';

                data.functionalityMethodSignature = 'callOneTime(address)';

                var fileName = 'FarmingSetFarmingSetupsProposal';
                var setupsCode = '';
                for(var i in setups) {
                    var setup = setups[i];
                    setupsCode = "        " + 
                    `farmingSetups[${i}] = FarmingSetupConfiguration(${setup.add}, ${setup.disable}, ${setup.index}, FarmingSetupInfo(${setup.info.free}, ${setup.info.blockDuration}, ${setup.info.originalRewardPerBlock}, ${setup.info.minStakeable}, ${setup.info.maxStakeable}, ${setup.info.renewTimes}, ${window.web3.utils.toChecksumAddress(setup.info.ammPlugin)}, ${window.web3.utils.toChecksumAddress(setup.info.liquidityPoolTokenAddress)}, ${window.web3.utils.toChecksumAddress(setup.info.mainTokenAddress)}, ${window.web3.utils.toChecksumAddress(setup.info.ethereumAddress)}, ${setup.info.involvingETH}, ${setup.info.penaltyFee}, ${setup.info.setupsCount}, ${setup.info.lastSetupIndex}));` +
                    "\n";
                }
                data.sourceCode = (await (await fetch(`data/${fileName}.sol`)).text()).format(setups.length, setupsCode.trim(), metadata.metadata.fullExtension);
                console.log(data.sourceCode);
            }
        }];
        var context = {
            element: props.element,
            sequentialOps,
            sourceCode: 'test',
            title: 'Manage Farming Setups'
        };
        window.showProposalLoader(context);
    };

    if (loading) {
        return (<Loading/>);
    }

    const lockedSetups = farmingSetups.filter((s) => !s.setupInfo.free && !s.finished);
    const freeSetups = farmingSetups.filter((s) => s.setupInfo.free && !s.finished);
    const finishedSetups = farmingSetups.filter((s) => s.finished);

    if(totalRewardToSend) {
        return (
            <div>
                <h3>Congratulations!</h3>
                <p>In order to be able to activate the new setups you created, {metadata.metadata.byMint ? "be sure to grant the permission to mint at least" : "you must send"} <b>{window.fromDecimals(totalRewardToSend, token.decimals, true)}</b> {token.symbol} <Coin address={token.address}/> {metadata.metadata.byMint ? "for the extension" : "to its extension, having address"} <a href={props.dfoCore.getContextElement("etherscanURL") + "address/" + metadata.metadata.fullExtension} target="_blank">{metadata.metadata.fullExtension}</a></p>
                <a href="javascript:;" onClick={() => setTotalRewardToSend("")}>Got it</a>
            </div>
        );
    }

    return (
        <div className="ListOfThings">
            {
                (contract && metadata) ?
                    <div className="row">
                        <FarmingComponent className="FarmContractOpen" dfoCore={dfoCore} contract={metadata.contract} metadata={metadata.metadata} goBack={false} withoutBack={withoutBack} hostedBy={isHost} />
                    </div> : <div />
            }
            {
                isHost && <>
                    { !isAdd && <button className="btn btn-primary" onClick={() => setIsAdd(true)}>Add new setups</button>}
                </>
            }
            {false && <div className="ListOfThings">
                {
                    (!isAdd && farmingSetups.length > 0) && <div>
                        {freeSetups.length > 0 && <h3>Free setups</h3>}
                        {
                            freeSetups.map((farmingSetup) => {
                                return (
                                    <SetupComponent key={farmingSetup.setupIndex} className="FarmSetup" setupIndex={farmingSetup.setupIndex} setupInfo={farmingSetup.setupInfo} lmContract={contract} dfoCore={dfoCore} setup={farmingSetup} hostedBy={isHost} hasBorder />
                                )
                            })
                        }
                        {lockedSetups.length > 0 && <h3>Locked setups</h3>}
                        {
                            lockedSetups.map((farmingSetup) => {
                                return (
                                    <SetupComponent key={farmingSetup.setupIndex} className="FarmSetup" setupIndex={farmingSetup.setupIndex} setupInfo={farmingSetup.setupInfo} lmContract={contract} dfoCore={dfoCore} setup={farmingSetup} hostedBy={isHost} hasBorder />
                                )
                            })
                        }
                        {finishedSetups.length > 0 && <a className="web2ActionBTN my-4" onClick={() => setShowOldSetups(!showOldSetups)}>{`${showOldSetups ? 'Hide' : 'Show'} old setups`}</a>}
                        {(finishedSetups.length > 0 && showOldSetups) && <h3>Old setups</h3>}
                        {
                            showOldSetups && finishedSetups.map((farmingSetup) => {
                                return (
                                    <SetupComponent key={farmingSetup.setupIndex} className="FarmSetup" setupIndex={farmingSetup.setupIndex} setupInfo={farmingSetup.setupInfo} lmContract={contract} dfoCore={dfoCore} setup={farmingSetup} hostedBy={isHost} hasBorder />
                                )
                            })
                        }
                    </div>
                }
                {
                    isAdd && <CreateOrEditFarmingSetups
                        rewardToken={token}
                        farmingSetups={newFarmingSetups}
                        onAddFarmingSetup={(setup) => addFarmingSetup(setup)}
                        onRemoveFarmingSetup={(i) => removeFarmingSetup(i)}
                        onEditFarmingSetup={(setup, i) => editFarmingSetup(setup, i)}
                        onCancel={() => { setNewFarmingSetups([]); setIsAdd(false); }}
                        onFinish={() => {}}
                        finishButton={setupsLoading ? <Loading/> : <button className="btn btn-primary" onClick={() => updateSetups()}>Update setups</button>}
                        forEdit={true}
                    />
                }
            </div>}
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(ExploreFarmingContract);