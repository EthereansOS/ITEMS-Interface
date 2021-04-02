import PropTypes from 'prop-types';
import { useState } from 'react';

const ApproveButton = (props) => {
    const { contract, spender, from, text, onApproval, isERC1155, onError, disabled } = props;
    const [loading, setLoading] = useState(false);

    const approveContract = async () => {
        setLoading(true);
        if (!isERC1155) {
            try {
                // const approval = await contract.methods.allowance(from, spender).call();
                // const totalSupply = await contract.methods.totalSupply().call();
                const gas = await contract.methods.approve(spender, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").estimateGas({ from });
                const approve = await contract.methods.approve(spender, "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff").send({ from, gas });
                setLoading(false);
                onApproval(approve);
            } catch (error) {
                setLoading(false);
                onError(error);
            }
        } else {
            try {
                const gas = await contract.methods.setApprovalForAll(spender, true).estimateGas({ from });
                const approve = await contract.methods.setApprovalForAll(spender, true).send({ from, gas });
                setLoading(false);
                onApproval(approve);
            } catch (error) {
                setLoading(false);
                onError(error);
            }
        }
    }

    return (
        loading ? <a className="ApproveBTN" disabled={loading}>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </a> : <a onClick={() => approveContract()} disabled={disabled} className="ApproveBTN">{ text || "Approve" }</a>
    )
}

ApproveButton.propTypes = {
    from: PropTypes.string,
    contract: PropTypes.any,
    spender: PropTypes.string,
    text: PropTypes.string,
    onApproval: PropTypes.func,
    onError: PropTypes.func,
}

export default ApproveButton;