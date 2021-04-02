import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { SetupComponent } from '../../../../components';

const Positions = (props) => {
    const [farmingSetups, setFarmingSetups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPositions();
    }, []);

    const getPositions = async () => {
        setLoading(true);
        try {
            await props.dfoCore.loadPositions();
            setFarmingSetups(props.dfoCore.positions);
        } catch (error) {
            console.error(error);
            setFarmingSetups([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="MainExploration">
            {
                loading ? 
                <div className="row mt-4">
                    <div className="col-12 justify-content-center">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden"></span>
                        </div>
                    </div>
                </div> : 
                <div className="ListOfThings">
                    {
                        farmingSetups.length === 0 && <div className="col-12 text-left">
                            <h6><b>No opened positions!</b></h6>
                        </div>
                    }
                    {
                        farmingSetups.length > 0 && farmingSetups.map((farmingSetup) => {
                            return (
                                <SetupComponent className="FarmSetup" setupIndex={farmingSetup.setupIndex} setupInfo={farmingSetup.setupInfo} key={`${farmingSetup.contract.options.address}-${farmingSetup.setupInfo}`} lmContract={farmingSetup.contract} dfoCore={props.dfoCore} setup={farmingSetup} hasBorder />
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}

const mapStateToProps = (state) => {
    const { core } = state;
    return { dfoCore: core.dfoCore };
}

export default connect(mapStateToProps)(Positions);