import Coin from '../coin/Coin';
import { useEffect, useState } from 'react';
import { Input, ApproveButton } from '..';
import { connect } from 'react-redux';
import { addTransaction, removeInflationSetup } from '../../../store/actions';
import axios from 'axios';
import LockedPositionComponent from './LockedPositionComponent';
import metamaskLogo from "../../../assets/images/metamask-fox.svg";
import Loading from "../Loading";
import { useRef } from 'react';

const SetupComponent = (props) => {
    let { className, dfoCore, setupIndex, lmContract, hostedBy } = props;
    // general info and setup data
    const [setup, setSetup] = useState(null);
    const [setupInfo, setSetupInfo] = useState(null);
    const [blockNumber, setBlockNumber] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activateLoading, setActivateLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [removeLoading, setRemoveLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    // panel status
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [showFreeTransfer, setShowFreeTransfer] = useState(false);
    const [canActivateSetup, setCanActivateSetup] = useState(false);
    const [setupReady, setSetupReady] = useState(false);
    const [showPrestoError, setShowPrestoError] = useState(false);
    // amm data
    const [AMM, setAMM] = useState({ name: "", version: "" });
    const [ammContract, setAmmContract] = useState(null);

    const [freeTransferAddress, setFreeTransferAddress] = useState("");
    const [extensionContract, setExtensionContract] = useState(null);
    const [farmTokenDecimals, setFarmTokenDecimals] = useState(18);
    const [farmTokenERC20Address, setFarmTokenERC20Address] = useState("");
    const [farmTokenSymbol, setFarmTokenSymbol] = useState("");
    const [farmTokenBalance, setFarmTokenBalance] = useState("0");
    const [farmTokenRes, setFarmTokenRes] = useState([]);
    const [setupTokens, setSetupTokens] = useState([]);
    const [tokensAmounts, setTokensAmount] = useState([]);
    const [tokensApprovals, setTokensApprovals] = useState([]);
    const [tokensContracts, setTokensContracts] = useState([]);
    const [lpTokenAmount, setLpTokenAmount] = useState(0);
    const [lockedEstimatedReward, setLockedEstimatedReward] = useState(0);
    const [freeEstimatedReward, setFreeEstimatedReward] = useState(0);
    const [lpTokenInfo, setLpTokenInfo] = useState(null);
    const [mainTokenInfo, setMainTokenInfo] = useState(null);
    const [rewardTokenInfo, setRewardTokenInfo] = useState(null);
    const [removalAmount, setRemovalAmount] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [manageStatus, setManageStatus] = useState(null);
    const [freeAvailableRewards, setFreeAvailableRewards] = useState(0);
    const [lockedPositions, setLockedPositions] = useState([]);
    const [lockedPositionStatuses, setLockedPositionStatuses] = useState([]);
    const [lockedPositionRewards, setLockedPositionRewards] = useState([]);
    const [updatedRewardPerBlock, setUpdatedRewardPerBlock] = useState(0);
    const [updatedRenewTimes, setUpdatedRenewTimes] = useState(0);
    const [openPositionForAnotherWallet, setOpenPositionForAnotherWallet] = useState(false);
    const [uniqueOwner, setUniqueOwner] = useState("");
    const [apy, setApy] = useState(0);
    const [inputType, setInputType] = useState("add-pair");
    const [outputType, setOutputType] = useState("to-pair");
    const [ethAmount, setEthAmount] = useState(0);
    const [ethBalanceOf, setEthBalanceOf] = useState("0");
    const intervalId = useRef(null);
    const [prestoData, setPrestoData] = useState(null);
    const [selectedAmmIndex, setSelectedAmmIndex] = useState(0);
    const [amms, setAmms] = useState(0);
    const [loadingPrestoData, setLoadingPrestoData] = useState(false);

    var farmingPresto = new props.dfoCore.web3.eth.Contract(props.dfoCore.getContextElement("FarmingPrestoABI"), props.dfoCore.getContextElement("farmingPrestoAddress"));

    useEffect(() => {
        getSetupMetadata();
        setTimeout(async () => {
            let amms = [];
            const ammAggregator = await props.dfoCore.getContract(props.dfoCore.getContextElement('AMMAggregatorABI'), props.dfoCore.getContextElement('ammAggregatorAddress'));
            const ammAddresses = await ammAggregator.methods.amms().call();
            for (let address of ammAddresses) {
                const ammContract = await props.dfoCore.getContract(props.dfoCore.getContextElement("AMMABI"), address);
                const amm = {
                    address,
                    contract: ammContract,
                    info: await ammContract.methods.info().call(),
                    data: await ammContract.methods.data().call()
                }
                amm.data[2] && amms.push(amm);
            }
            setSelectedAmmIndex(0);
            const uniswap = amms.filter(it => it.info[0] === 'UniswapV2')[0];
            const index = amms.indexOf(uniswap);
            amms.splice(index, 1);
            amms.unshift(uniswap);
            setAmms(amms);
        });
        return () => {
            clearInterval(intervalId.current)
        }
    }, []);

    useEffect(() => {
        updateEthAmount(ethAmount);
    }, [uniqueOwner, selectedAmmIndex]);

    const getSetupMetadata = async () => {
        setLoading(true);
        try {
            const { '0': farmSetup, '1': farmSetupInfo } = await lmContract.methods.setup(setupIndex).call();
            setSetup(farmSetup);
            setSetupInfo(farmSetupInfo);
            setShowPrestoError(false);
            await loadData(farmSetup, farmSetupInfo, true);
            if (!intervalId.current) {
                intervalId.current = setInterval(async () => {
                    const { '0': s, '1': si } = await lmContract.methods.setup(setupIndex).call();
                    setSetup(s);
                    setSetupInfo(si);
                    await loadData(s, si);
                }, 5000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const loadData = async (farmSetup, farmSetupInfo, reset) => {
        let position = null;
        let lockPositions = [];
        let positionIds = [];
        const farmTokenCollectionAddress = await lmContract.methods._farmTokenCollection().call();
        const farmTokenCollection = await props.dfoCore.getContract(props.dfoCore.getContextElement('INativeV1ABI'), farmTokenCollectionAddress);
        const ammContract = await dfoCore.getContract(dfoCore.getContextElement('AMMABI'), farmSetupInfo.ammPlugin);
        setAmmContract(ammContract);
        if (!farmSetup.free) {
            // retrieve farm token data
            const objectId = farmSetup.objectId;
            if (objectId !== "0") {
                const ftBalance = await farmTokenCollection.methods.balanceOf(props.dfoCore.address, objectId).call();
                const ftSymbol = await farmTokenCollection.methods.symbol(objectId).call();
                const ftDecimals = await farmTokenCollection.methods.decimals(objectId).call();
                const ftERC20Address = await farmTokenCollection.methods.asInteroperable(objectId).call();
                setFarmTokenERC20Address(ftERC20Address);
                setFarmTokenSymbol(ftSymbol);
                setFarmTokenBalance(ftBalance);
                setFarmTokenDecimals(ftDecimals);
                const ftRes = await ammContract.methods.byLiquidityPoolAmount(farmSetupInfo.liquidityPoolTokenAddress, ftBalance).call();
                setFarmTokenRes(ftRes['tokensAmounts']);
            } else {
                setFarmTokenBalance("0");
            }
        }
        reset && setLockedEstimatedReward(0);
        setUpdatedRenewTimes(farmSetupInfo.renewTimes);
        setUpdatedRewardPerBlock(farmSetup.rewardPerBlock);
        const events = await window.getLogs({
            address: lmContract.options.address,
            topics: [
                window.web3.utils.sha3("Transfer(uint256,address,address)")
            ],
            fromBlock: props.dfoCore.getContextElement('deploySearchStart'),
            toBlock: 'latest',
        });
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const { topics } = event;
            var positionId = props.dfoCore.web3.eth.abi.decodeParameter("uint256", topics[1]);
            const pos = await lmContract.methods.position(positionId).call();
            if (dfoCore.isValidPosition(pos) && parseInt(pos.setupIndex) === parseInt(setupIndex)) {
                if (farmSetupInfo.free) {
                    position = { ...pos, positionId };
                } else if (!positionIds.includes(positionId)) {
                    lockPositions.push({ ...pos, positionId });
                    positionIds.push(positionId);
                }
            }
        }
        setCurrentPosition(position);
        setLockedPositions(lockPositions);
        if (!position && reset) {
            setOpen(false);
            setWithdrawOpen(false);
        }
        const extensionAddress = await lmContract.methods._extension().call();
        const extContract = await dfoCore.getContract(dfoCore.getContextElement("FarmExtensionABI"), extensionAddress);
        reset && setExtensionContract(extContract);
        const rewardTokenAddress = await lmContract.methods._rewardTokenAddress().call();
        const isEth = rewardTokenAddress === dfoCore.voidEthereumAddress;
        const rewardToken = !isEth ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), rewardTokenAddress) : null;
        const rewardTokenSymbol = !isEth ? await rewardToken.methods.symbol().call() : 'ETH';
        const rewardTokenDecimals = !isEth ? await rewardToken.methods.decimals().call() : 18;
        const rewardTokenApproval = !isEth ? await rewardToken.methods.allowance(dfoCore.address, lmContract.options.address).call() : 2 ^ 256 - 1;
        const rewardTokenBalance = !isEth ? await rewardToken.methods.balanceOf(dfoCore.address).call() : await dfoCore.web3.eth.getBalance(dfoCore.address);
        setRewardTokenInfo({ contract: rewardToken, symbol: rewardTokenSymbol, decimals: rewardTokenDecimals, balance: rewardTokenBalance, address: rewardTokenAddress, approval: parseInt(rewardTokenApproval) !== 0 && parseInt(rewardTokenApproval) >= parseInt(rewardTokenBalance) });

        const bNumber = await dfoCore.getBlockNumber();
        setBlockNumber(bNumber);

        const lpToken = await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), farmSetupInfo.liquidityPoolTokenAddress);
        const lpTokenSymbol = await lpToken.methods.symbol().call();
        const lpTokenDecimals = await lpToken.methods.decimals().call();
        const lpTokenBalance = await lpToken.methods.balanceOf(dfoCore.address).call();
        const lpTokenApproval = await lpToken.methods.allowance(dfoCore.address, lmContract.options.address).call();
        setLpTokenInfo({ contract: lpToken, symbol: lpTokenSymbol, decimals: lpTokenDecimals, balance: lpTokenBalance, approval: parseInt(lpTokenApproval) !== 0 && parseInt(lpTokenApproval) >= parseInt(lpTokenBalance) });

        const activateSetup = parseInt(farmSetupInfo.renewTimes) > 0 && !farmSetup.active && parseInt(farmSetupInfo.lastSetupIndex) === parseInt(setupIndex);
        setCanActivateSetup(activateSetup);

        const { host, byMint } = await extContract.methods.data().call();
        let isSetupReady = false;
        const extensionBalance = !isEth ? await rewardToken.methods.balanceOf(extensionAddress).call() : await dfoCore.web3.eth.getBalance(extensionAddress);
        // check if it's a setup from a DFO
        try {
            const doubleProxyContract = await dfoCore.getContract(dfoCore.getContextElement('dfoDoubleProxyABI'), host);
            const proxyContract = await dfoCore.getContract(dfoCore.getContextElement('dfoProxyABI'), await doubleProxyContract.methods.proxy().call());
            const stateHolderContract = await dfoCore.getContract(dfoCore.getContextElement('dfoStateHolderABI'), await proxyContract.methods.getStateHolderAddress().call());
            isSetupReady = await stateHolderContract.methods.getBool(`farming.authorized.${extensionAddress.toLowerCase()}`).call();
        } catch (error) {
            // not from dfo
            isSetupReady = byMint || parseInt(extensionBalance) >= (parseInt(farmSetup.rewardPerBlock) * parseInt(farmSetupInfo.blockDuration));
        }
        setSetupReady(isSetupReady);

        const tokenAddress = farmSetupInfo.liquidityPoolTokenAddress;
        let res;
        if (farmSetupInfo.free) {
            res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, farmSetup.totalSupply).call();
        } else {
            res = await ammContract.methods.byTokenAmount(tokenAddress, farmSetupInfo.mainTokenAddress, farmSetup.totalSupply).call();
            res = await ammContract.methods.byLiquidityPoolAmount(tokenAddress, res.liquidityPoolAmount).call();
        }
        let mtInfo = null;
        const tokens = [];
        const approvals = [];
        const contracts = [];
        for (let i = 0; i < res.liquidityPoolTokens.length; i++) {
            const address = res.liquidityPoolTokens[i];
            const token = !isWeth(farmSetupInfo, address) ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), address) : null;
            const symbol = token ? await token.methods.symbol().call() : 'ETH';
            const decimals = token ? await token.methods.decimals().call() : 18;
            const balance = token ? await token.methods.balanceOf(dfoCore.address).call() : await dfoCore.web3.eth.getBalance(dfoCore.address);
            const approval = token ? await token.methods.allowance(dfoCore.address, lmContract.options.address).call() : true;
            approvals.push(parseInt(approval) !== 0 && (parseInt(approval) >= parseInt(balance) || !token));
            tokens.push({ amount: 0, balance: dfoCore.toDecimals(dfoCore.toFixed(balance), decimals), liquidity: res.tokensAmounts[i], decimals, address: token ? address : dfoCore.voidEthereumAddress, symbol });
            contracts.push(token);
            if (address.toLowerCase() === farmSetupInfo.mainTokenAddress.toLowerCase()) {
                mtInfo = { approval: parseInt(approval) !== 0 && (parseInt(approval) >= parseInt(balance) || !token), decimals, contract: token, address: token ? address : dfoCore.voidEthereumAddress, symbol };
                setMainTokenInfo(mtInfo)
            }
        }
        const info = await ammContract.methods.info().call();
        setAMM({ name: info['0'], version: info['1'] });
        setSetupTokens(tokens);
        setTokensContracts(contracts);
        reset && setLpTokenAmount(0);
        reset && setTokensAmount(new Array(tokens.length).fill(0));
        setTokensApprovals(approvals);
        // retrieve the manage data using the position
        if (position) {
            const free = position['free'];
            const creationBlock = position['creationBlock'];
            const positionSetupIndex = position['setupIndex'];
            const liquidityPoolTokenAmount = position['liquidityPoolTokenAmount'];
            const mainTokenAmount = position['mainTokenAmount'];
            const amounts = await ammContract.methods.byLiquidityPoolAmount(farmSetupInfo.liquidityPoolTokenAddress, liquidityPoolTokenAmount).call();
            console.log(position.positionId);
            const availableReward = await lmContract.methods.calculateFreeFarmingReward(position.positionId, true).call();
            let freeReward = parseInt(availableReward);
            if (blockNumber < parseInt(farmSetup.endBlock)) {
                freeReward += (parseInt(farmSetup.rewardPerBlock) * (parseInt(position.liquidityPoolTokenAmount) / parseInt(farmSetup.totalSupply)))
            }
            freeReward = window.numberToString(freeReward).split('.')[0];
            setFreeAvailableRewards(freeReward);
            setManageStatus({ free, creationBlock, positionSetupIndex, liquidityPoolAmount: liquidityPoolTokenAmount, mainTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens })
        } else if (lockPositions.length > 0) {
            const lockStatuses = [];
            const lockRewards = [];
            for (let j = 0; j < lockPositions.length; j++) {
                const lockedPosition = lockPositions[j];
                const free = lockedPosition['free'];
                const creationBlock = lockedPosition['creationBlock'];
                const positionSetupIndex = lockedPosition['setupIndex'];
                const liquidityPoolTokenAmount = lockedPosition['liquidityPoolTokenAmount'];
                const mainTokenAmount = lockedPosition['mainTokenAmount'];
                const amounts = await ammContract.methods.byLiquidityPoolAmount(farmSetupInfo.liquidityPoolTokenAddress, liquidityPoolTokenAmount).call();
                const availableReward = await lmContract.methods.calculateLockedFarmingReward(0, 0, true, lockedPosition.positionId).call();
                const lockedReward = parseInt(availableReward.reward) + (parseInt(farmSetup.endBlock) <= parseInt(blockNumber) ? 0 : parseInt(lockedPosition.lockedRewardPerBlock));
                const partiallyRedeemed = await lmContract.methods._partiallyRedeemed(lockedPosition.positionId).call();
                lockRewards.push(lockedReward);
                lockStatuses.push({ free, creationBlock, positionSetupIndex, partiallyRedeemed, liquidityPoolAmount: liquidityPoolTokenAmount, mainTokenAmount, tokensAmounts: amounts['tokensAmounts'], tokens })
            }
            setLockedPositionStatuses(lockStatuses);
            setLockedPositionRewards(lockRewards);
        }
        // calculate APY
        setApy(await calculateApy(farmSetup, farmSetupInfo, rewardTokenAddress, rewardTokenDecimals, tokens));
    }

    const calculateApy = async (setup, setupInfo, rewardTokenAddress, rewardTokenDecimals, setupTokens) => {
        if (parseInt(setup.totalSupply) === 0) return -1;
        const yearlyBlocks = 2304000;
        try {
            const ethPrice = await axios.get(dfoCore.getContextElement("coingeckoEthereumPriceURL"));
            const wusdAddress = await dfoCore.getContextElement("WUSDAddress");
            if (setupInfo.free) {
                const searchTokens = `${rewardTokenAddress},${setupTokens.map((token) => (token && token.address) ? `${token.address},` : '')}`.slice(0, -1);
                const { data } = await axios.get(dfoCore.getContextElement("coingeckoCoinPriceURL") + searchTokens);
                const rewardTokenPriceUsd = rewardTokenAddress !== dfoCore.voidEthereumAddress ? rewardTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[rewardTokenAddress.toLowerCase()].usd : ethPrice;
                let den = 0;
                await Promise.all(setupTokens.map(async (token) => {
                    if (token && token.address) {
                        const tokenPrice = token.address !== dfoCore.voidEthereumAddress ? token.address.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[token.address.toLowerCase()].usd : ethPrice.data[0].current_price;
                        den += (tokenPrice * token.liquidity * 10 ** (18 - token.decimals));
                    }
                }))
                const num = (parseInt(setup.rewardPerBlock) * 10 ** (18 - rewardTokenDecimals) * yearlyBlocks) * rewardTokenPriceUsd;
                return (num * 100 / den);
            } else {
                const { mainTokenAddress } = setupInfo;
                const mainTokenContract = mainTokenAddress !== dfoCore.voidEthereumAddress ? await dfoCore.getContract(dfoCore.getContextElement('ERC20ABI'), mainTokenAddress) : null;
                const decimals = mainTokenAddress !== dfoCore.voidEthereumAddress ? await mainTokenContract.methods.decimals().call() : 18;
                const searchTokens = `${rewardTokenAddress},${mainTokenAddress}`;
                const { data } = await axios.get(dfoCore.getContextElement("coingeckoCoinPriceURL") + searchTokens);
                const rewardTokenPriceUsd = rewardTokenAddress !== dfoCore.voidEthereumAddress ? rewardTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[rewardTokenAddress.toLowerCase()].usd : ethPrice;
                const mainTokenPriceUsd = mainTokenAddress !== dfoCore.voidEthereumAddress ? mainTokenAddress.toLowerCase() === wusdAddress.toLowerCase() ? 1 : data[mainTokenAddress.toLowerCase()].usd : ethPrice;
                const num = (parseInt(setup.rewardPerBlock) * 10 ** (18 - rewardTokenDecimals) * yearlyBlocks) * rewardTokenPriceUsd * 100;
                const den = (parseInt(setupInfo.maxStakeable) * 10 ** (18 - decimals) * mainTokenPriceUsd) * 2;
                return num / den;
            }
        } catch (error) {
            return 0;
        }
    }

    const isWeth = (setupInfo, address) => {
        return address.toLowerCase() === setupInfo.ethereumAddress.toLowerCase() && setupInfo.involvingETH;
    }

    const getPeriodFromDuration = (duration) => {
        const blockIntervals = dfoCore.getContextElement('blockIntervals');
        const inv = Object.entries(blockIntervals).reduce((ret, entry) => {
            const [key, value] = entry;
            ret[value] = key;
            return ret;
        }, {});
        return inv[duration];
    }

    const activateSetup = async () => {
        if (!setupReady) return;
        setActivateLoading(true);
        try {
            const gas = await lmContract.methods.activateSetup(setupIndex).estimateGas({ from: props.dfoCore.address });
            const result = await lmContract.methods.activateSetup(setupIndex).send({ from: props.dfoCore.address, gas });
            props.addTransaction(result);
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setActivateLoading(false);
        }
    }

    const onTokenApproval = (index, isLp) => {
        if (isLp) {
            setLpTokenInfo({ ...lpTokenInfo, approval: true });
            return;
        }
        setTokensApprovals(tokensApprovals.map((val, i) => i === index ? true : val));
    }

    var updateAmountTimeout;

    const onUpdateTokenAmount = async (value, index) => {
        updateAmountTimeout && clearTimeout(updateAmountTimeout);
        if (!value) {
            setLockedEstimatedReward(0);
            setFreeEstimatedReward(0);
            setTokensAmount(tokensAmounts.map(() => 0));
            return;
        }
        updateAmountTimeout = setTimeout(async function () {
            var ethereumAddress = (await ammContract.methods.data().call())[0];
            var tokenAddress = setupTokens[index].address;
            tokenAddress = tokenAddress === window.voidEthereumAddress ? ethereumAddress : tokenAddress;
            const fullValue = props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(setupTokens[index].decimals)));
            var result = await ammContract.methods.byTokenAmount(setupInfo.liquidityPoolTokenAddress, tokenAddress, fullValue).call();
            var { liquidityPoolAmount } = result;
            result = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, liquidityPoolAmount).call();
            var ams = result.tokensAmounts;
            setLpTokenAmount(liquidityPoolAmount)
            setTokensAmount(ams.map((_, i) => { return index === i ? { value: window.numberToString(value), full: fullValue } : ams[i] }));
            if (!setupInfo.free) {
                let mainTokenIndex = 0;
                setupTokens.forEach((t, i) => {
                    if (t.address === setupInfo.mainTokenAddress) {
                        mainTokenIndex = i;
                    }
                })
                if (parseInt(ams[mainTokenIndex]) > 0) {
                    const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, ams[mainTokenIndex], false, 0).call();
                    setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(reward.relativeRewardPerBlock) * (parseInt(setup.endBlock) - blockNumber)), rewardTokenInfo.decimals));
                }
            } else {
                if (parseInt(setup.totalSupply) + parseInt(liquidityPoolAmount) > 0) {
                    const val = parseInt(liquidityPoolAmount) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(liquidityPoolAmount));
                    if (!isNaN(val)) {
                        setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(val), rewardTokenInfo.decimals))
                    }
                }
            }
        }, 300);
    }

    const onUpdateLpTokenAmount = async (value, index, isFull) => {
        updateAmountTimeout && clearTimeout(updateAmountTimeout);
        if (!value || value === 'NaN') {
            setLockedEstimatedReward(0);
            setFreeEstimatedReward(0);
            // setLpTokenAmount("0");
            return;
        }
        updateAmountTimeout = setTimeout(async function () {
            try {
                const fullValue = isFull ? value : props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals)));
                setLpTokenAmount({ value: window.numberToString(value), full: fullValue })
                const result = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, fullValue).call();
                const ams = result.tokensAmounts;
                setTokensAmount(ams);
                if (!setupInfo.free) {
                    let mainTokenIndex = 0;
                    await setupTokens.map((t, i) => {
                        if (t.address === setupInfo.mainTokenAddress) {
                            mainTokenIndex = i;
                        }
                    })
                    if (parseInt(ams[mainTokenIndex]) > 0) {
                        const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, ams[mainTokenIndex], false, 0).call();
                        setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(reward.relativeRewardPerBlock) * (parseInt(setup.endBlock) - blockNumber)), rewardTokenInfo.decimals));
                    }
                } else {
                    const val = parseInt(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals))) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals))));
                    if (!isNaN(val)) {
                        setFreeEstimatedReward(props.dfoCore.toDecimals(window.numberToString(val), rewardTokenInfo.decimals))
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }, 300);
        // setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(props.dfoCore.toFixed(props.dfoCore.fromDecimals(value, parseInt(lpTokenInfo.decimals)))) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(value))), rewardTokenInfo.decimals))
    }

    const addLiquidity = async () => {
        setAddLoading(true);
        try {
            if (!lpTokenAmount) return;
            const stake = {
                setupIndex,
                amount: 0,
                amountIsLiquidityPool: inputType === 'add-lp' ? true : false,
                positionOwner: openPositionForAnotherWallet ? uniqueOwner : dfoCore.voidEthereumAddress,
            };

            let ethTokenIndex = null;
            let ethTokenValue = 0;
            let mainTokenIndex = 0;
            await Promise.all(setupTokens.map(async (token, i) => {
                if (setupInfo.involvingETH && token.address === props.dfoCore.voidEthereumAddress) {
                    ethTokenIndex = i;
                } else if (token.address === setupInfo.mainTokenAddress) {
                    mainTokenIndex = i;
                }
            }))
            let lpAmount = lpTokenAmount.full || lpTokenAmount.toString();
            const res = await ammContract.methods.byLiquidityPoolAmount(setupInfo.liquidityPoolTokenAddress, lpAmount).call();

            var localTokensAmounts = res.tokensAmounts;
            // const res = await ammContract.methods.byTokensAmount(setupInfo.liquidityPoolTokenAddress,  , stake.amount).call();
            stake.amount = stake.amountIsLiquidityPool ? lpAmount : localTokensAmounts[mainTokenIndex];
            ethTokenValue = localTokensAmounts[ethTokenIndex];
            var value = setupInfo.involvingETH && !stake.amountIsLiquidityPool ? ethTokenValue : 0;

            if (prestoData) {
                console.log('using presto!')
                var sendingOptions = { from: dfoCore.address, value: prestoData.ethValue, gasLimit: 9999999 };
                sendingOptions.gasLimit = await prestoData.transaction.estimateGas(sendingOptions);
                sendingOptions.gasLimit = parseInt(sendingOptions.gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1));
                sendingOptions.gas = sendingOptions.gasLimit;
                var result = await prestoData.transaction.send(sendingOptions)
                props.addTransaction(result);
            } else {
                if (setupInfo.free) {
                    if (!currentPosition || openPositionForAnotherWallet) {
                        const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value });
                        const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), value });
                        props.addTransaction(result);
                    } else if (currentPosition) {
                        const gasLimit = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).estimateGas({ from: dfoCore.address, value });
                        const result = await lmContract.methods.addLiquidity(currentPosition.positionId, stake).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), value });
                        props.addTransaction(result);
                    }
                } else {
                    // opening position
                    const gasLimit = await lmContract.methods.openPosition(stake).estimateGas({ from: dfoCore.address, value });
                    const result = await lmContract.methods.openPosition(stake).send({ from: dfoCore.address, gas: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), gasLimit: parseInt(gasLimit * (props.dfoCore.getContextElement("farmGasMultiplier") || 1)), value });
                    props.addTransaction(result);
                }
            }
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
            if (inputType === 'add-eth' && error.code && error.code !== 4001) {
                setShowPrestoError(true);
            }
        } finally {
            setAddLoading(false);
        }
    }

    const removeLiquidity = async () => {
        if (setupInfo.free && (!removalAmount || removalAmount === 0)) return;
        setRemoveLoading(true);
        try {
            if (setupInfo.free) {
                const removedLiquidity = removalAmount === 100 ? manageStatus.liquidityPoolAmount : props.dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString().split('.')[0];
                const gasLimit = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, 0, outputType === 'to-pair', removedLiquidity).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.withdrawLiquidity(currentPosition.positionId, 0, outputType === 'to-pair', removedLiquidity).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                props.addTransaction(result);
            } else {
                const gasLimit = await lmContract.methods.withdrawLiquidity(0, setup.objectId, outputType === 'to-pair', farmTokenBalance).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.withdrawLiquidity(0, setup.objectId, outputType === 'to-pair', farmTokenBalance).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                props.addTransaction(result);
            }
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setRemoveLoading(false);
        }
    }

    const withdrawReward = async () => {
        setClaimLoading(true);
        try {
            const gasLimit = await lmContract.methods.withdrawReward(currentPosition.positionId).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.withdrawReward(currentPosition.positionId).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
            props.addTransaction(result);
            await getSetupMetadata();
        } catch (error) {
            console.error(error);
        } finally {
            setClaimLoading(false);
        }
    }

    const transferPosition = async (positionId, index) => {
        if (!positionId) return;
        if (setupInfo.free) {
            setTransferLoading(true);
            try {
                const gasLimit = await lmContract.methods.transferPosition(freeTransferAddress, positionId).estimateGas({ from: dfoCore.address });
                const result = await lmContract.methods.transferPosition(freeTransferAddress, positionId).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                props.addTransaction(result);
                await getSetupMetadata();
            } catch (error) {
                console.error(error);
            } finally {
                setTransferLoading(false);
            }
        }
    }
    /*
        const updateSetup = async () => {
            setLoading(true);
            try {
                const updatedSetup = {
                    free: false,
                    blockDuration: 0,
                    originalRewardPerBlock: updatedRewardPerBlock,
                    minStakeable: 0,
                    maxStakeable: 0,
                    renewTimes: updatedRenewTimes,
                    ammPlugin: dfoCore.voidEthereumAddress,
                    liquidityPoolTokenAddress: dfoCore.voidEthereumAddress,
                    mainTokenAddress: dfoCore.voidEthereumAddress,
                    ethereumAddress: dfoCore.voidEthereumAddress,
                    involvingETH: false,
                    penaltyFee: 0,
                    setupsCount: 0,
                    lastSetupIndex: 0,
                };
                const updatedSetupConfiguration = { add: false, disable: false, index: parseInt(setupIndex), info: updatedSetup };
                const gasLimit = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).estimateGas({ from: dfoCore.address });
                const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                await getSetupMetadata();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    
        const disableSetup = async () => {
            setLoading(true);
            try {
                const updatedSetup = {
                    free: false,
                    blockDuration: 0,
                    originalRewardPerBlock: 0,
                    minStakeable: 0,
                    maxStakeable: 0,
                    renewTimes: 0,
                    ammPlugin: dfoCore.voidEthereumAddress,
                    liquidityPoolTokenAddress: dfoCore.voidEthereumAddress,
                    mainTokenAddress: dfoCore.voidEthereumAddress,
                    ethereumAddress: dfoCore.voidEthereumAddress,
                    involvingETH: false,
                    penaltyFee: 0,
                    setupsCount: 0,
                    lastSetupIndex: 0,
                };
                const updatedSetupConfiguration = { add: false, disable: true, index: parseInt(setupIndex), info: updatedSetup };
                const gasLimit = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).estimateGas({ from: dfoCore.address });
                const result = await extensionContract.methods.setFarmingSetups([updatedSetupConfiguration]).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
                await getSetupMetadata();
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        */

    const getApproveButton = (isLp) => {
        if (!isLp) {
            const notApprovedIndex = tokensApprovals.findIndex((value) => !value);
            if (notApprovedIndex !== -1) {
                return <ApproveButton contract={tokensContracts[notApprovedIndex]} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(notApprovedIndex, false)} onError={(error) => console.error(error)} text={`Approve ${setupTokens[notApprovedIndex].symbol}`} />
            } else {
                return <div />
            }
        } else {

            if (!lpTokenInfo.approval) {
                return <ApproveButton contract={lpTokenInfo.contract} from={props.dfoCore.address} spender={lmContract.options.address} onApproval={() => onTokenApproval(null, true)} onError={(error) => console.error(error)} text={`Approve ${lpTokenInfo.symbol}`} />
            } else {
                return <div />
            }
        }
    }

    const onInputTypeChange = async (e) => {
        setInputType(e.target.value);
        const ethBalance = await props.dfoCore.web3.eth.getBalance(props.dfoCore.address);
        setEthBalanceOf(ethBalance);
        setPrestoData(null);
        setShowPrestoError(false);
        setEthAmount(0);
        if (e.target.value === 'add-eth') {
            setLpTokenAmount(0);
            setTokensAmount(new Array(setupTokens.length).fill(0));
            setFreeEstimatedReward("0");
            setLockedEstimatedReward("0");
        }
    }

    const onOutputTypeChange = e => {
        setOutputType(e.target.value);
    }

    const updateEthAmount = async amount => {
        try {
            setLoadingPrestoData(true);
            setPrestoData(null);
            setEthAmount(amount || "0");
            if (!parseFloat(amount)) {
                return setLoadingPrestoData(false);
            };
            var value = window.toDecimals(window.numberToString(amount), 18);

            var halfValue = props.dfoCore.web3.utils.toBN(value).div(props.dfoCore.web3.utils.toBN(2)).toString();
            var ammEthereumAddress = (await ammContract.methods.data().call())[0];

            var info = setupInfo;

            var liquidityPool = info.liquidityPoolTokenAddress;

            var tokens = await ammContract.methods.byLiquidityPool(liquidityPool).call();
            var token0 = new window.web3.eth.Contract(props.dfoCore.getContextElement("ERC20ABI"), tokens[2][0]);
            var token1 = new window.web3.eth.Contract(props.dfoCore.getContextElement("ERC20ABI"), tokens[2][1]);
            var token0decimals = tokens[2][0] === window.voidEthereumAddress ? 18 : await token0.methods.decimals().call();
            var token1decimals = tokens[2][1] === window.voidEthereumAddress ? 18 : await token1.methods.decimals().call();

            var mainTokenIndex = tokens[2].indexOf(info.mainTokenAddress);

            var amm = ammContract;//amms[selectedAmmIndex].contract;

            var ethereumAddress = (await amm.methods.data().call())[0];

            async function calculateBestLP(firstToken, secondToken, firstDecimals, secondDecimals, hf) {

                var data = (await amm.methods.byTokens([ethereumAddress, firstToken]).call());

                var liquidityPoolAddress = data[2];

                if (liquidityPoolAddress === window.voidEthereumAddress) {
                    return {};
                }

                var mainTokenIndex = data[3].indexOf(firstToken);
                var middleTokenIndex = data[3].indexOf(ethereumAddress);

                var mainAmount = window.formatNumber(window.normalizeValue(data[1][mainTokenIndex], firstDecimals));
                var middleTokenAmount = window.formatNumber(window.normalizeValue(data[1][middleTokenIndex], 18));

                var constant = mainAmount * middleTokenAmount;

                var newMiddleTokenAmount = middleTokenAmount + window.formatNumber(window.normalizeValue(halfValue, 18));

                var newMainAmount = constant / newMiddleTokenAmount;

                var mainReceived = mainAmount - newMainAmount;

                var firstTokenEthLiquidityPoolAddress = liquidityPoolAddress;
                var token0Value = (await amm.methods.getSwapOutput(ethereumAddress, hf || halfValue, [liquidityPoolAddress], [firstToken]).call())[1];

                var ratio = newMainAmount / mainAmount;

                if (!hf) {
                    return await calculateBestLP(firstToken, secondToken, firstDecimals, secondDecimals, halfValue = window.numberToString(window.formatNumber(halfValue) * ratio).split('.')[0])
                }

                var token1Value = (await ammContract.methods.byTokenAmount(liquidityPool, firstToken, token0Value).call());
                var lpAmount = token1Value[0];
                token1Value = token1Value[1][token1Value[2].indexOf(secondToken)];

                lpAmount = window.numberToString(parseInt(lpAmount) / ratio).split('.')[0];
                token1Value = window.numberToString(parseInt(token1Value) / ratio).split('.')[0];

                const updatedFirstTokenAmount = window.formatNumber(window.normalizeValue(token0Value, firstDecimals));
                const updatedSecondTokenAmount = window.formatNumber(window.normalizeValue(token1Value, secondDecimals));

                liquidityPoolAddress = (await amm.methods.byTokens([ethereumAddress, secondToken]).call())[2];
                var secondTokenEthLiquidityPoolAddress = liquidityPoolAddress;
                var token1ValueETH = "0";
                if (secondTokenEthLiquidityPoolAddress !== window.voidEthereumAddress) {
                    token1ValueETH = (await amm.methods.getSwapOutput(secondToken, token1Value, [liquidityPoolAddress], [ethereumAddress]).call())[1];
                }

                return { lpAmount, updatedFirstTokenAmount, updatedSecondTokenAmount, token0Value, token1Value, token1ValueETH, firstTokenEthLiquidityPoolAddress, secondTokenEthLiquidityPoolAddress };
            }

            var bestLP = await calculateBestLP(token0.options.address, token1.options.address, token0decimals, token1decimals);

            var lpAmount = bestLP.lpAmount;
            var firstTokenAmount = bestLP.token0Value;
            var secondTokenAmount = bestLP.token1Value;
            var firstTokenETH = halfValue;
            var secondTokenETH = bestLP.token1ValueETH;
            var token0EthLiquidityPoolAddress = bestLP.firstTokenEthLiquidityPoolAddress;
            var token1EthLiquidityPoolAddress = bestLP.secondTokenEthLiquidityPoolAddress;

            if (token0.options.address === ammEthereumAddress || !lpAmount || (bestLP.updatedSecondTokenAmount > bestLP.updatedFirstTokenAmount)) {
                bestLP = await calculateBestLP(token1.options.address, token0.options.address, token1decimals, token0decimals);

                lpAmount = bestLP.lpAmount;
                firstTokenAmount = bestLP.token1Value;
                secondTokenAmount = bestLP.token0Value;
                firstTokenETH = bestLP.token1ValueETH;
                secondTokenETH = halfValue;
                token0EthLiquidityPoolAddress = bestLP.secondTokenEthLiquidityPoolAddress;
                token1EthLiquidityPoolAddress = bestLP.firstTokenEthLiquidityPoolAddress;
            }

            var operations = [];

            token0EthLiquidityPoolAddress !== window.voidEthereumAddress && operations.push({
                inputTokenAddress: ethereumAddress,
                inputTokenAmount: firstTokenETH,
                ammPlugin: amm.options.address,
                liquidityPoolAddresses: [token0EthLiquidityPoolAddress],
                swapPath: [token0.options.address],
                enterInETH: true,
                exitInETH: false,
                receivers: [farmingPresto.options.address],
                receiversPercentages: []
            });

            token1EthLiquidityPoolAddress !== window.voidEthereumAddress && operations.push({
                inputTokenAddress: ethereumAddress,
                inputTokenAmount: secondTokenETH,
                ammPlugin: amm.options.address,
                liquidityPoolAddresses: [token1EthLiquidityPoolAddress],
                swapPath: [token1.options.address],
                enterInETH: true,
                exitInETH: false,
                receivers: [farmingPresto.options.address],
                receiversPercentages: []
            });

            var ethValue = 0;
            token0EthLiquidityPoolAddress !== window.voidEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(firstTokenETH)).toString());
            token1EthLiquidityPoolAddress !== window.voidEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(secondTokenETH)).toString());
            info.involvingETH && token0.options.address === ammEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(firstTokenAmount)).toString());
            info.involvingETH && token1.options.address === ammEthereumAddress && (ethValue = props.dfoCore.web3.utils.toBN(ethValue).add(props.dfoCore.web3.utils.toBN(secondTokenAmount)).toString());

            var request = {
                setupIndex,
                amount: mainTokenIndex === 0 ? firstTokenAmount : secondTokenAmount,
                amountIsLiquidityPool: false,
                positionOwner: window.isEthereumAddress(uniqueOwner) ? uniqueOwner : props.dfoCore.address
            }

            if (!setupInfo.free) {
                const reward = await lmContract.methods.calculateLockedFarmingReward(setupIndex, mainTokenIndex === 0 ? firstTokenAmount : secondTokenAmount, false, 0).call();
                setLockedEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(parseInt(reward.relativeRewardPerBlock) * (parseInt(setup.endBlock) - blockNumber)), rewardTokenInfo.decimals));
            } else {
                const val = parseInt(lpAmount) * 6400 * parseInt(setup.rewardPerBlock) / (parseInt(setup.totalSupply) + parseInt(lpAmount));
                if (!isNaN(val)) {
                    setFreeEstimatedReward(props.dfoCore.toDecimals(props.dfoCore.toFixed(val), rewardTokenInfo.decimals))
                }
            }

            setPrestoData({
                ethValue: value,
                transaction: farmingPresto.methods.openPosition(
                    props.dfoCore.getContextElement("prestoAddress"),
                    operations,
                    lmContract.options.address,
                    request
                ),
                firstTokenAmount,
                secondTokenAmount,
                token0decimals,
                token1decimals,
                token0Address: token0.options.address,
                token1Address: token1.options.address,
                token0Symbol: info.involvingETH && token0.options.address === ammEthereumAddress ? "ETH" : await token0.methods.symbol().call(),
                token1Symbol: info.involvingETH && token1.options.address === ammEthereumAddress ? "ETH" : await token1.methods.symbol().call()
            });
        } catch (error) {
            console.error(error);
        }
        setLoadingPrestoData(false);
    }

    const calculateLockedFixedValue = () => {
        const { rewardPerBlock } = setup;
        const { maxStakeable } = setupInfo;
        const normalizedRewardPerBlock = parseInt(rewardPerBlock) * 10 ** (18 - rewardTokenInfo.decimals);
        const normalizedMaxStakeable = parseInt(maxStakeable) * 10 ** (18 - mainTokenInfo.decimals);
        const amount = normalizedRewardPerBlock * (1 / normalizedMaxStakeable);
        return (canActivateSetup) ? window.formatMoney(amount * parseInt(setupInfo.blockDuration), 6) : parseInt(blockNumber) >= parseInt(setup.endBlock) ? 0 : window.formatMoney(amount * (parseInt(setup.endBlock) - parseInt(blockNumber)), 6);
    }

    const getAdvanced = () => {
        return !edit ? getManageAdvanced() : getEdit();
    }

    const getEdit = () => {
        return

        {/* @locked For upcoming release
        <div className="pb-4 px-4">
            <hr />
            <div className="row mt-2 align-items-center justify-content-start">
                {
                    setupInfo.free &&
                    <div className="col-12 mb-md-2">
                        <Input value={dfoCore.toDecimals(updatedRewardPerBlock)} min={0} onChange={(e) => setUpdatedRewardPerBlock(dfoCore.toFixed(dfoCore.fromDecimals(e.target.value), rewardTokenInfo.decimals))} label={"Reward per block"} />
                    </div>
                }
                <div className="col-12 mb-md-2">
                    <Input value={updatedRenewTimes} min={0} onChange={(e) => setUpdatedRenewTimes(e.target.value)} label={"Renew times"} />
                </div>
                <div className="col-12">
                    <button onClick={() => updateSetup()} className="btn btn-secondary">Update</button>
                    {setup.active && <button onClick={() => disableSetup()} className="btn btn-primary">Disable</button>}
                </div>
            </div>
        </div>*/}
    }

    const getManageAdvanced = () => {
        if (withdrawOpen && currentPosition && setupInfo.free) {
            return (
                <div className="FarmActions">
                    <input type="range" value={removalAmount} onChange={(e) => setRemovalAmount(parseInt(e.target.value))} className="form-control-range" id="formControlRange" />
                    <div className="Web2ActionsBTNs">
                        <p className="BreefRecap"><b>Amount:</b> {removalAmount}% ({window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.liquidityPoolAmount) * removalAmount / 100).toString(), lpTokenInfo.decimals), lpTokenInfo.decimals)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) => <span key={token.address}> {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(parseInt(manageStatus.tokensAmounts[i].full || manageStatus.tokensAmounts[i]) * removalAmount / 100).toString(), token.decimals), token.decimals)} {token.symbol} </span>)})</p>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(10)} >10%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(25)} >25%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(50)} >50%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(75)} >75%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(90)} >90%</a>
                        <a className="web2ActionBTN" onClick={() => setRemovalAmount(100)} >MAX</a>
                    </div>
                    <div className="row">
                        <div className="QuestionRegular">
                            <label className="PrestoSelector">
                                <span>To Pair</span>
                                <input name="outputType" type="radio" value="to-pair" checked={outputType === "to-pair"} onChange={onOutputTypeChange} />
                            </label>
                            <label className="PrestoSelector">
                                <span>To LP Token</span>
                                <input name="outputType" type="radio" value="to-lp" checked={outputType === "to-lp"} onChange={onOutputTypeChange} />
                            </label>
                        </div>
                    </div>
                    <div className="Web2ActionsBTNs">
                        {
                            removeLoading ? <a className="Web3ActionBTN" disabled={removeLoading}>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </a> : <a onClick={() => removeLiquidity()} className="Web3ActionBTN">Remove</a>
                        }
                    </div>
                </div>
            )
        }

        return <div className="FarmActions">
            {
                (parseInt(setup.endBlock) > parseInt(blockNumber) || currentPosition) &&
                <div className="QuestionRegular">
                    {setup.active && (setupInfo.free || !currentPosition) && parseInt(setup.endBlock) > parseInt(blockNumber) && <>
                        <label className="PrestoSelector">
                            <span>From Pair</span>
                            <input name={`inputType-${lmContract.options.address}-${setupIndex}`} type="radio" value="add-pair" checked={inputType === "add-pair"} onChange={(e) => onInputTypeChange(e)} />
                        </label>
                        {
                            (!currentPosition || openPositionForAnotherWallet || !setupInfo.free) &&
                            <label className="PrestoSelector">
                                <span>From ETH (BETA)</span>
                                <input name={`inputType-${lmContract.options.address}-${setupIndex}`} type="radio" value="add-eth" checked={inputType === "add-eth"} onChange={(e) => onInputTypeChange(e)} />
                            </label>
                        }
                        <label className="PrestoSelector">
                            <span>From LP Token</span>
                            <input name={`inputType-${lmContract.options.address}-${setupIndex}`} type="radio" value="add-lp" checked={inputType === "add-lp"} onChange={(e) => onInputTypeChange(e)} />
                        </label>
                    </>
                    }
                </div>
            }
            {inputType === 'add-pair' ? <>
                {
                    setupTokens.map((setupToken, i) => {
                        return <div key={setupToken.address} className="InputTokenRegular">
                            <Input showMax={true} address={setupToken.address} value={tokensAmounts[i].value || window.fromDecimals(tokensAmounts[i], setupToken.decimals, true)} balance={setupToken.balance} min={0} onChange={(e) => onUpdateTokenAmount(e.target.value, i)} showCoin={true} showBalance={true} name={setupToken.symbol} />
                        </div>
                    })
                }
                {
                    parseFloat(lpTokenAmount) > 0 && <div className="DiffWallet">
                        <p className="BreefRecap"><b>LP tokens</b>:
                            <span> {window.formatMoney(dfoCore.toDecimals(lpTokenAmount, lpTokenInfo.decimals), lpTokenInfo.decimals)} {lpTokenInfo.symbol}</span>
                        </p>
                    </div>
                }
                <label className="OptionalThingsFarmers" htmlFor="openPositionWallet1">
                    <input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => {
                        if (!e.target.checked) {
                            setUniqueOwner("");
                        }
                        setOpenPositionForAnotherWallet(e.target.checked);
                    }} id="openPositionWallet1" />
                    <p>External Owner</p>
                </label>
                {
                    openPositionForAnotherWallet && <div className="DiffWallet">
                        <input type="text" className="TextRegular" placeholder="Position owner address" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} id="uniqueOwner" />
                        <p className="BreefExpl">Open this farming position as another wallet - The wallet you insert here will be the owner of the entire position and Farm Tokens (if "Locked Position")</p>
                    </div>
                }
                {
                    (!setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                        <p className="BreefRecap">Total Rewards until end block: <br></br><b>{window.formatMoney(lockedEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b></p>
                        <p className="BreefExpl">Once you lock this liquidity you'll be able to withdraw it at the Setup End Block. If you want to Unlock this position earlier, you'll need to pay a Penalty Fee (in Reward Tokens) + all of the Reward Tokens you Claimed from this position + All of the Farm Token you're minting (representing your LP tokens locked).</p>
                    </div>
                }
                {
                    (setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                        <p className="BreefRecap">Estimated reward per day: <br></br><b>{window.formatMoney(freeEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b></p>
                    </div>
                }
                <div className="Web3BTNs">
                    {
                        tokensApprovals.some((value) => !value) && <>
                            {getApproveButton()}
                        </>
                    }
                    {
                        addLoading ? <a className="Web3ActionBTN" disabled={addLoading}>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </a> : <a className="Web3ActionBTN" onClick={() => addLiquidity()} disabled={tokensApprovals.some((value) => !value) || tokensAmounts.some((value) => value === 0)}>Add Liquidity</a>
                    }
                </div>
            </> : inputType === 'add-lp' ? <>
                <div className="InputTokenRegular">
                    <Input showMax={true} address={lpTokenInfo.contract.options.address} value={lpTokenAmount.value || window.fromDecimals(lpTokenAmount, lpTokenInfo.decimals, true)} balance={window.fromDecimals(lpTokenInfo.balance, lpTokenInfo.decimals, true)} min={0} onChange={(e) => onUpdateLpTokenAmount(e.target.value)} showCoin={true} showBalance={true} name={lpTokenInfo.symbol} />
                </div>
                {
                    parseFloat(lpTokenAmount.value || lpTokenAmount) > 0 && <div className="DiffWallet">
                        <p className="BreefRecap"><b>Pair</b>:
                            {
                                setupTokens.map((setupToken, i) => <span key={setupToken.address}> {tokensAmounts[i].value || window.formatMoney(dfoCore.toDecimals(tokensAmounts[i], setupToken.decimals), setupToken.decimals)} {setupToken.symbol}</span>)
                            }
                        </p>
                    </div>
                }
                <label className="OptionalThingsFarmers" htmlFor="openPosition2">
                    <input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => {
                        if (!e.target.checked) {
                            setUniqueOwner("");
                        }
                        setOpenPositionForAnotherWallet(e.target.checked);
                    }} id="openPosition2" />
                    <p>External Owner</p>
                </label>
                {
                    openPositionForAnotherWallet && <div className="DiffWallet">
                        <input type="text" className="TextRegular" placeholder="Position owner address" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} id="uniqueOwner" />
                        <p className="BreefExpl">Open this farming position as another wallet - The wallet you insert here will be the owner of the entire position and Farm Tokens (if "Locked Position")</p>
                    </div>
                }
                {
                    (!setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                        <p className="BreefRecap">Total Rewards until end block: <br></br><b>{window.formatMoney(lockedEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b></p>
                        <p className="BreefExpl">Once you lock this liquidity you'll be able to withdraw it at the Setup End Block. If you want to Unlock this position earlier, you'll need to pay a Penalty Fee (in Reward Tokens) + all of the Reward Tokens you Claimed from this position + All of the Farm Token you're minting (representing your LP tokens locked).</p>
                    </div>
                }
                {
                    (setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                        <p className="BreefRecap"><b>Estimated reward per day</b>: {window.formatMoney(freeEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</p>
                    </div>
                }
                <div className="Web3BTNs">
                    {
                        !lpTokenInfo.approval && <>
                            {getApproveButton(true)}
                        </>
                    }
                    {
                        addLoading ? <a className="Web3ActionBTN" disabled={addLoading}>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        </a> : <a className="Web3ActionBTN" onClick={() => addLiquidity()} disabled={!lpTokenInfo.approval || parseFloat(lpTokenAmount) === 0}>Add Liquidity</a>
                    }
                </div>
            </> :
                inputType === 'add-eth' ? <>
                    <div className="InputTokenRegular">
                        <Input showMax={true} address={dfoCore.voidEthereumAddress} value={ethAmount} balance={dfoCore.toDecimals(ethBalanceOf, 18)} min={0} onChange={e => updateEthAmount(e.target.value)} showCoin={true} showBalance={true} name={"ETH"} />
                    </div>
                    <div className="DiffWallet">
                        {false && amms.length > 0 && <select className="SelectRegular" value={selectedAmmIndex.toString()} onChange={e => setSelectedAmmIndex(e.target.value)}>
                            {amms.map((it, i) => <option key={it.address} value={i}>{it.info[0]}</option>)}
                        </select>}
                        {loadingPrestoData && <Loading />}
                        {prestoData && <p className="BreefRecap">Position Weight: <br></br><b>{window.fromDecimals(prestoData.firstTokenAmount, prestoData.token0decimals)} {prestoData.token0Symbol}</b> and <b>{window.fromDecimals(prestoData.secondTokenAmount, prestoData.token1decimals)} {prestoData.token1Symbol}</b></p>}
                    </div>
                    <label className="OptionalThingsFarmers" htmlFor="openPosition2">
                        <input className="form-check-input" type="checkbox" checked={openPositionForAnotherWallet} onChange={(e) => {
                            if (!e.target.checked) {
                                setUniqueOwner("");
                            }
                            setOpenPositionForAnotherWallet(e.target.checked);
                        }} id="openPosition2" />
                        <p>External Owner</p>
                    </label>
                    {
                        openPositionForAnotherWallet && <div className="DiffWallet">
                            <input type="text" className="TextRegular" placeholder="Position owner address" value={uniqueOwner} onChange={(e) => setUniqueOwner(e.target.value)} id="uniqueOwner" />
                            <p className="BreefExpl">Open this farming position as another wallet - The wallet you insert here will be the owner of the entire position and Farm Tokens (if "Locked Position")</p>
                        </div>
                    }
                    {
                        (!setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                            <p className="BreefRecap">Total Rewards until end block: <br></br><b>{window.formatMoney(lockedEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b></p>
                            <p className="BreefExpl">Once you lock this liquidity you'll be able to withdraw it at the Setup End Block. If you want to Unlock this position earlier, you'll need to pay a Penalty Fee (in Reward Tokens) + all of the Reward Tokens you Claimed from this position + All of the Farm Token you're minting (representing your LP tokens locked).</p>
                        </div>
                    }
                    {
                        (setupInfo.free && rewardTokenInfo) && <div className="DiffWallet">
                            <p className="BreefRecap">Estimated reward per day: <br></br><b>{window.formatMoney(freeEstimatedReward, rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</b></p>
                        </div>
                    }
                    <div className="Web3BTNs">
                        {
                            addLoading ? <a className="Web3ActionBTN" disabled={addLoading}>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </a> : <a className="Web3ActionBTN" onClick={() => addLiquidity()} disabled={parseFloat(ethAmount) === 0}>Add Liquidity</a>
                        }
                    </div>
                    {
                        (showPrestoError && inputType === 'add-eth') && <div className="BetaAllert"><p className="BreefRecap"><b>The Presto "From ETH" feature is in beta. You might received a failed transaction. Use it at your own risk!</b></p></div>
                    }
                </> : <></>
            }
        </div>
    }

    if (loading || !setup) {
        return (
            <div className={className}>
                <div className="row px-2 farming-component-main-row">
                    <div className="col-12 flex justify-content-center align-items-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="FarmSetupMain">
                <h5><b>{setupInfo.free ? "Free Farming" : "Locked Farming"} {(!setup.active && canActivateSetup) ? <span className="text-secondary">{setupReady ? "(new)" : "(soon)"}</span> : (!setup.active) ? <span className="text-danger">(inactive)</span> : <></>} {(parseInt(setup.endBlock) <= blockNumber && parseInt(setup.endBlock) !== 0) && <span>(ended)</span>}</b> <a target="_blank" href={`${window.getNetworkElement("etherscanURL")}/token/${setupInfo.liquidityPoolTokenAddress}`}>{AMM.name}</a></h5>
                <aside>
                    {parseInt(setup.endBlock) > 0 ? <p><b>block end</b>: <a className="BLKEMD" target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}block/${setup.endBlock}`}>{setup.endBlock}</a></p> : <p><b>Duration</b>: {getPeriodFromDuration(setupInfo.blockDuration)}</p>}
                    {!setupInfo.free && <>
                        <p><b>Limit</b>: {props.dfoCore.toDecimals(setupInfo.maxStakeable, mainTokenInfo.decimals)} {mainTokenInfo.symbol}</p>
                        <p><b>Penalty fee</b>: {parseInt(setupInfo.penaltyFee) === 0 ? `0` : props.dfoCore.formatMoney(props.dfoCore.toDecimals(props.dfoCore.toFixed(setupInfo.penaltyFee), 18) * 100, 18)}%</p>
                    </>}
                    {setupInfo.minStakeable > 0 && <p><b>Min to Farm</b>: {window.formatMoney(window.fromDecimals(setupInfo.minStakeable, mainTokenInfo.decimals, true), 6)} {mainTokenInfo.symbol}</p>}
                </aside>
                <div className="SetupFarmingInstructions">
                    <p>{setupTokens.map((token, i) => <figure key={token.address}>{i !== 0 ? '+ ' : ''}{token.address !== props.dfoCore.voidEthereumAddress ? <a target="_blank" href={`${props.dfoCore.getContextElement("etherscanURL")}token/${token.address}`}><Coin address={token.address} /></a> : <Coin address={token.address} />} </figure>)} = <b>APY</b>: {apy < 0 ? "(Insufficient Liquidity)" : apy === 0 ? "(Missing Price Feed)" : `${window.formatMoney(apy, 3)}%`}</p>
                </div>
                <div className="SetupFarmingOthers">
                    {
                        setupInfo.free ? <>
                            <p><b>Daily Rate</b>: {props.dfoCore.toDecimals(parseInt(setup.rewardPerBlock) * 6400, rewardTokenInfo.decimals, 6)} {rewardTokenInfo.symbol} <span>(Shared)</span></p>
                            <p><b>Total Deposited</b>: {props.dfoCore.toDecimals(parseInt(setup.totalSupply), lpTokenInfo.decimals, 6)} LP ({setupTokens.map((token, index) => <span key={token.address}>{props.dfoCore.toDecimals(token.liquidity, token.decimals, 6)} {token.symbol}{index !== setupTokens.length - 1 ? ' - ' : ''}</span>)})</p>
                        </> : <>
                            <p><b>Available to Farm</b>: {window.fromDecimals(parseInt(setupInfo.maxStakeable) - parseInt(setup.totalSupply), mainTokenInfo.decimals)} {mainTokenInfo.symbol}</p>
                            <p><b>Rate</b>: {calculateLockedFixedValue()} {rewardTokenInfo.symbol} (fixed) (for every {mainTokenInfo.symbol} locked until the end block)</p>
                        </>
                    }
                </div>
            </div>
            <div className="YourFarmingPositions">
                {
                    setupInfo.free ? <>
                        <div className="FarmYou">
                            {
                                currentPosition && <>
                                    <p>
                                        <b>Your Deposit</b>: {window.formatMoney(window.fromDecimals(manageStatus.liquidityPoolAmount, lpTokenInfo.decimals, true), 6)} {lpTokenInfo.symbol} - {manageStatus.tokens.map((token, i) => <span key={token.address}> {window.formatMoney(window.fromDecimals(manageStatus.tokensAmounts[i], token.decimals, true), 6)} {token.symbol} </span>)}
                                    </p>
                                </>
                            }
                            {
                                canActivateSetup && <>
                                    {
                                        setupReady && <>
                                            {
                                                activateLoading ? <a className="Web3ActionBTN" disabled={activateLoading}>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                </a> : <a className="Web3ActionBTN" onClick={() => { activateSetup() }}>Activate</a>
                                            }
                                        </>
                                    }
                                    {
                                        !setupReady && <>
                                            <p className="BreefRecap">Not ready to be activated, come back at another time</p>
                                        </>
                                    }
                                </>
                            }
                            {
                                (hostedBy && extensionContract && !edit && parseInt(setupInfo.lastSetupIndex) === parseInt(setupIndex) && hostedBy) &&
                                <a className="web2ActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(true) }}>Edit</a>
                            }
                            {
                                (edit) &&
                                <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>
                            }
                            {
                                (!open && parseInt(setup.endBlock) > parseInt(blockNumber)) && <a className="web2ActionBTN" onClick={() => { setOpen(true); setWithdrawOpen(false); setEdit(false); }}>Farm</a>
                            }
                            {
                                (open) &&
                                <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>
                            }
                            {
                                (!withdrawOpen && currentPosition) && <a className="web2ActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(true); setEdit(false); }}>Remove</a>
                            }
                            {
                                (withdrawOpen) &&
                                <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>
                            }
                        </div>
                        {
                            currentPosition &&
                            <div className="Farmed">
                                <p><b>Daily Earnings</b>: {window.formatMoney(dfoCore.toDecimals((parseInt(setup.rewardPerBlock) * 6400 * parseInt(manageStatus.liquidityPoolAmount) / parseInt(setup.totalSupply)).toString().split('.')[0], rewardTokenInfo.decimals), 9)} {rewardTokenInfo.symbol}</p>
                                <p><b>Available</b>: {window.fromDecimals(freeAvailableRewards, rewardTokenInfo.decimals, true)} {rewardTokenInfo.symbol}</p>
                                {
                                    !showFreeTransfer ? <a onClick={() => setShowFreeTransfer(true)} className="web2ActionBTN">Transfer</a> : <a onClick={() => setShowFreeTransfer(false)} className="backActionBTN">Close</a>
                                }
                                {
                                    claimLoading ? <a className="Web3ActionBTN" disabled={claimLoading}>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </a> : <a onClick={() => withdrawReward()} className="Web3ActionBTN">Claim</a>
                                }
                                {
                                    showFreeTransfer && <div className="Tranferpos">
                                        <input type="text" className="TextRegular" placeholder="Position receiver" value={freeTransferAddress} onChange={(e) => setFreeTransferAddress(e.target.value)} id={`transferAddress`} />
                                        {
                                            transferLoading ? <a className="Web3ActionBTN" disabled={transferLoading}>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                            </a> : <a onClick={() => transferPosition(currentPosition.positionId)} className="Web3ActionBTN">Transfer</a>
                                        }
                                    </div>
                                }
                            </div>
                        }
                    </> : <>
                        {
                            parseInt(farmTokenBalance) > 0 && <div className="LockedFarmTokensPosition">
                                <p><b>Your Farm ITEM (fLP) Balance</b>:</p>
                                <p>{window.formatMoney(window.fromDecimals(farmTokenBalance, farmTokenDecimals, true), 9)} ({setupTokens.map((setupToken, i) => `${parseInt(farmTokenBalance) === 0 ? 0 : window.formatMoney(window.fromDecimals(farmTokenRes[i], setupToken.decimals, true), 3)} ${setupToken.symbol}${i !== setupTokens.length - 1 ? ' - ' : ''}`)})
                            <a className="MetamaskAddButton" onClick={() => props.dfoCore.addTokenToMetamask(farmTokenERC20Address, /* farmTokenSymbol */"fLP", farmTokenDecimals)}>
                                        <img height={14} src={metamaskLogo} alt="Metamask" className="mb-1" /> Add {/* farmTokenSymbol */ "fLP"}
                                    </a>
                                </p>
                            </div>
                        }
                        {
                            (parseInt(blockNumber) >= parseInt(setup.endBlock) && parseInt(farmTokenBalance) > 0) && <>
                                <div className="QuestionRegular">
                                    <label className="PrestoSelector">
                                        <span>To Pair</span>
                                        <input name={`outputType-${lmContract.options.address}-${setupIndex}`} type="radio" value="to-pair" checked={outputType === "to-pair"} onChange={onOutputTypeChange} />
                                    </label>
                                    <label className="PrestoSelector">
                                        <span>To LP Token</span>
                                        <input name={`outputType-${lmContract.options.address}-${setupIndex}`} type="radio" value="to-lp" checked={outputType === "to-lp"} onChange={onOutputTypeChange} />
                                    </label>
                                </div>
                                {
                                    removeLoading ? <a className="Web3ActionBTN Web3ActionBTNV" disabled={removeLoading}>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    </a> : (parseInt(blockNumber) >= parseInt(setup.endBlock)) ? <a className="Web3ActionBTN Web3ActionBTNV" onClick={() => removeLiquidity()}>Withdraw Liquidity</a> : <></>
                                }
                            </>
                        }
                        {
                            lockedPositions.length > 0 && <>
                                {
                                    lockedPositions.map((position, index) => {
                                        return (
                                            <LockedPositionComponent
                                                key={index}
                                                farmTokenBalance={farmTokenBalance}
                                                farmTokenSymbol={farmTokenSymbol}
                                                farmTokenDecimals={farmTokenDecimals}
                                                onComplete={(result) => {
                                                    props.addTransaction(result); getSetupMetadata();
                                                }
                                                }
                                                lmContract={lmContract}
                                                position={position}
                                                blockNumber={blockNumber}
                                                setup={setup}
                                                setupInfo={setupInfo}
                                                dfoCore={dfoCore}
                                                rewardTokenInfo={rewardTokenInfo}
                                                setupTokens={setupTokens}
                                                lpTokenInfo={lpTokenInfo}
                                                lockedPositionStatus={lockedPositionStatuses[index]}
                                                lockedPositionReward={lockedPositionRewards[index]}
                                                mainTokenInfo={mainTokenInfo}
                                                onRewardTokenApproval={() => setRewardTokenInfo({ ...rewardTokenInfo, approval: true })}
                                            />
                                        )
                                    })
                                }
                            </>
                        }
                        {(canActivateSetup || (hostedBy && extensionContract && parseInt(setupInfo.lastSetupIndex) === parseInt(setupIndex)) || parseInt(setup.endBlock) > parseInt(blockNumber)) &&
                            <div className="FarmYou">
                                {
                                    canActivateSetup && <>
                                        {
                                            setupReady && <>
                                                {
                                                    activateLoading ? <a className="Web3ActionBTN" disabled={activateLoading}>
                                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    </a> : <a className="Web3ActionBTN" onClick={() => { activateSetup() }}>Activate</a>
                                                }
                                            </>
                                        }
                                        {
                                            !setupReady && <>
                                                <p className="BreefRecap">Not ready to be activated, come back at another time</p>
                                            </>
                                        }
                                    </>
                                }
                                {
                                    (hostedBy && extensionContract && !edit && parseInt(setupInfo.lastSetupIndex) === parseInt(setupIndex)) &&
                                    <a className="web2ActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(true) }}>Edit</a>
                                }
                                {
                                    (edit) &&
                                    <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>
                                }
                                {
                                    (!open && parseInt(setup.endBlock) > parseInt(blockNumber)) && <a className="web2ActionBTN" onClick={() => { setOpen(true); setWithdrawOpen(false); setEdit(false); }}>Farm</a>
                                }
                                {
                                    (open) &&
                                    <a className="backActionBTN" onClick={() => { setOpen(false); setWithdrawOpen(false); setEdit(false) }}>Close</a>
                                }
                            </div>
                        }
                    </>
                }
            </div>
            {
                ((open || withdrawOpen) && !edit) ? <><hr />{getAdvanced()}</> : <div />
            }
            {
                (edit && !open && !withdrawOpen) ? getEdit() : <div />
            }
        </div>
    )
}

const mapStateToProps = (state) => {
    return {};
}

const mapDispatchToProps = (dispatch) => {
    return {
        addTransaction: (index) => dispatch(addTransaction(index))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SetupComponent);