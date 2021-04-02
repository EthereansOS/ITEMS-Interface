import { useState } from "react";
import ApproveButton from "../buttons/ApproveButton";

const LockedPositionComponent = (props) => {
    const { 
        position, 
        dfoCore, 
        blockNumber, 
        setup, 
        setupInfo, 
        mainTokenInfo, 
        onRewardTokenApproval, 
        setupTokens, 
        rewardTokenInfo, 
        lockedPositionReward, 
        lockedPositionStatus, 
        lpTokenInfo, 
        lmContract, 
        onComplete,
        farmTokenSymbol,
        farmTokenDecimals,
    } = props;
    // booleans
    const [showTransfer, setShowTransfer] = useState(false);
    const [showUnlock, setShowUnlock] = useState(false);
    const [unlockLoading, setUnlockLoading] = useState(false);
    const [transferLoading, setTransferLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [transferAddress, setTransferAddress] = useState("");

    let mainTokenIndex = 0;
    
    setupTokens.forEach((token, i) => {
        if (token.address === setupInfo.mainTokenAddress) {
            mainTokenIndex = i;
        }
    });

    const transferPosition = async () => {
        if (!transferAddress) return;
        setTransferLoading(true);
        try {
            const gasLimit = await lmContract.methods.transferPosition(transferAddress, position.positionId).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.transferPosition(transferAddress, position.positionId).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
            onComplete(result);
        } catch (error) {
            console.error(error);
        } finally {
            setTransferLoading(false);
        }

    }

    const unlockPosition = async () => {
        setUnlockLoading(true);
        try {
            const gasLimit = await lmContract.methods.unlock(position.positionId, false).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.unlock(position.positionId, false).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
            onComplete(result);
        } catch (error) {
            console.error(error);
        } finally {
            setUnlockLoading(false);
        }
    }

    const withdrawReward = async () => {
        setClaimLoading(true);
        try {
            const gasLimit = await lmContract.methods.withdrawReward(position.positionId).estimateGas({ from: dfoCore.address });
            const result = await lmContract.methods.withdrawReward(position.positionId).send({ from: dfoCore.address, gasLimit, gas: gasLimit });
            onComplete(result);
        } catch (error) {
            console.error(error);
        } finally {
            setClaimLoading(false);
        }
    }

    const giveBackRewardTokenValue = parseInt(parseInt(position.reward) * (parseInt(setupInfo.penaltyFee) / 1e18));

    return (
        <div className="LockedFarmPositions">
            <div className="FarmYou">
                <p><b>Position Weight</b>: {window.formatMoney(window.fromDecimals(position.mainTokenAmount, mainTokenInfo.decimals, true), 6)} {mainTokenInfo.symbol}</p>
                {
                    (parseInt(blockNumber) < parseInt(setup.endBlock) && !showUnlock) && <a onClick={() => setShowUnlock(true)} className="web2ActionBTN">Unlock</a>
                }
                {
                    showUnlock && <a onClick={() => setShowUnlock(false)} className="backActionBTN">Close</a>
                }
                {
                    showUnlock && <div className="UnlockDiv">
                        <p className="UnlockInfo">{window.formatMoney(window.fromDecimals(giveBackRewardTokenValue + parseInt(lockedPositionStatus.partiallyRedeemed), rewardTokenInfo.decimals, true), 6)} {rewardTokenInfo.symbol} - {window.formatMoney(dfoCore.toDecimals(position.liquidityPoolTokenAmount, parseInt(lpTokenInfo.decimals)), parseInt(lpTokenInfo.decimals))} {/* farmTokenSymbol */"fLP"} needed to Unlock this position</p>
                        <p className="UnlockInfoBal">Balance: {window.formatMoney(window.fromDecimals(rewardTokenInfo.balance, rewardTokenInfo.decimals, true), 6)} {rewardTokenInfo.symbol} - {window.formatMoney(window.fromDecimals(position.liquidityPoolTokenAmount, parseInt(lpTokenInfo.decimals), true), 9)} fLP</p>
                        {
                            !rewardTokenInfo.approval ? <ApproveButton contract={rewardTokenInfo.contract} from={dfoCore.address} spender={lmContract.options.address} onApproval={() => onRewardTokenApproval()} onError={(error) => console.error(error)} text={`Approve ${rewardTokenInfo.symbol}`} /> : 
                                unlockLoading ? <a className="Web3ActionBTN" disabled={unlockLoading}>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                </a> : parseInt(blockNumber) < parseInt(setup.endBlock) ? <a onClick={() => unlockPosition()} className="Web3ActionBTN">Unlock</a> : <></>
                        }
                    </div>
                }
            </div>
            <div className="Farmed">
                <p><b>Reward</b>: {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(position.reward), rewardTokenInfo.decimals), rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</p>
                <p><b>Available</b>: {window.formatMoney(dfoCore.toDecimals(dfoCore.toFixed(lockedPositionReward), rewardTokenInfo.decimals), rewardTokenInfo.decimals)} {rewardTokenInfo.symbol}</p>
                {
                    !showTransfer ? <a onClick={() => setShowTransfer(true)} className="web2ActionBTN">Transfer</a> : <a onClick={() => setShowTransfer(false)} className="backActionBTN">Close</a>
                }
                {
                    claimLoading ? <a className="Web3ActionBTN" disabled={claimLoading}>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    </a> : <a onClick={() => withdrawReward()} className="Web3ActionBTN">Claim</a>
                }
                {
                    showTransfer && <div className="Tranferpos">
                        <input type="text" className="TextRegular" placeholder="Position receiver" value={transferAddress} onChange={(e) => setTransferAddress(e.target.value)} id="transferAddress" />
                        {
                            transferLoading ? <a className="Web3ActionBTN" disabled={transferLoading}>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            </a> : <a onClick={() => transferPosition()} className="Web3ActionBTN">Transfer</a>
                        }
                    </div>
                }
            </div>
        </div>
    )
}

export default LockedPositionComponent;