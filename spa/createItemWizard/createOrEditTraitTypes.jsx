import { useEffect, useState } from "react";

function CreateOrEditTraitTypes({ metadataType, state }) {

    const [traitTypesTemplates, setTraitTypesTemplates] = useState(window.traitTypesTemplates);
    const [attributes, setAttributes] = useState(state.attributes || []);
    const [newTraitType, setNewTraitType] = useState("");

    window.traitTypesTemplates = window.traitTypesTemplates || traitTypesTemplates;

    useEffect(function () {
        !window.traitTypesTemplates && window.AJAXRequest('data/traitTypesTemplates.json').then(setTraitTypesTemplates)
    }, []);

    var standardTraitTypes = [];
    if (traitTypesTemplates) {
        standardTraitTypes.push(...traitTypesTemplates["global"]);
        standardTraitTypes.push(...traitTypesTemplates[metadataType]);
    }

    var customTraitTypes = attributes.filter(it => it.trait_type && standardTraitTypes.indexOf(it.trait_type) === -1).map(it => it.trait_type);

    function deleteCustomTraitType(e) {
        window.preventItem(e);
        var key = e.currentTarget.dataset.key;
        var index = attributes.indexOf(attributes.filter(it => it.trait_type === key));
        var newAttributes = attributes.map(it => it);
        newAttributes.splice(index, 1);
        setAttributes(newAttributes);
    }

    function renterTraitTypeValue(key) {
        try {
            return attributes.filter(it => it.trait_type === key)[0].value;
        } catch(e) {
            return "";
        }
    }

    function onTraitTypeValueChange(e) {
        window.preventItem(e);
        var key = e.currentTarget.dataset.key;
        var newAttributes = attributes.map(it => it);
        try {
            newAttributes.filter(it => it.trait_type === key)[0].value = e.currentTarget.value;
        } catch(e) {
            newAttributes.push({
                trait_type : key,
                value : e.currentTarget.value
            })
        }
        setAttributes(newAttributes);
    }

    function renderTraitTypeElement(it, isCustom) {
        return <section key={it}>
            {isCustom && <a href="javascript:;" data-key={it} onClick={deleteCustomTraitType}>X</a>}
            <label>
                <span>{it}</span>
                <input id={it.split(' ').join('')} data-key={it} type="text" value={renterTraitTypeValue(it)} onChange={onTraitTypeValueChange} />
            </label>
        </section>
    }

    function addTraitType(e) {
        window.preventItem(e);
        var allTraitTypes = standardTraitTypes.map(it => it.split(' ').join('').toLowerCase());
        allTraitTypes.push(...customTraitTypes.map(it => it.split(' ').join('').toLowerCase()));
        if(allTraitTypes.indexOf(newTraitType.split(" ").join('').toLowerCase()) !== -1) {
            return;
        }
        var newAttributes = attributes.map(it => it);
        newAttributes.push({
            trait_type : newTraitType,
            value : ''
        });
        setAttributes(newAttributes);
        setNewTraitType("");
    }

    function renderNewTraitType() {
        return <section>
            <label>
                <span>New Trait Type</span>
                <input type="text" value={newTraitType} onChange={e => setNewTraitType(window.preventItem(e).currentTarget.value)}/>
            </label>
            <a href="javascript:;" onClick={addTraitType}>Add</a>
        </section>
    }

    return !traitTypesTemplates ? <InnerLoader /> : <section>
        {standardTraitTypes.map(it => renderTraitTypeElement(it))}
        {customTraitTypes.map(it => renderTraitTypeElement(it, true))}
        {renderNewTraitType()}
    </section>
}