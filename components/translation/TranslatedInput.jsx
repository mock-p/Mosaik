'use client'

import { useState } from 'react';
import PropTypes from 'prop-types';

export default function TranslatedInput({label, translatedValueObject = {}, langList= ["en"], defaultLang="en", placeholder = "", onChange = undefined, ...props }) {
    const [newTranslatedValue, setNewTranslatedValue] = useState(structuredClone(translatedValueObject));
    const [currentLang, setCurrentLang] = useState(defaultLang);
    const uniqueUUID = crypto.randomUUID();

    function inputChange(newValue){
        newTranslatedValue[currentLang] = newValue;
        setNewTranslatedValue(newTranslatedValue);

        
        if (onChange != undefined) onChange(newTranslatedValue);
    }

    function langChange(newLang){
        setCurrentLang(newLang);
        
        //update the input value
        const input = document.getElementById("Input-" + uniqueUUID);
        input.value = newTranslatedValue[newLang] == undefined ? "" : newTranslatedValue[newLang];
    }

    return (<div id={"TranslatedInput-" + uniqueUUID} {...props}>
        <label className="block text-sm/6 font-medium text-gray-900 ml-1 font-DM-Sans">
            {label}
        </label>
        <div className="flex rounded-md shadow-xs">
            <input
                id={"Input-" + uniqueUUID}
                type="text"
                placeholder={placeholder}
                defaultValue={newTranslatedValue[currentLang]}
                onChange={(e) => inputChange(e.target.value)}

                className="block w-full min-w-0 flex-1 rounded-none rounded-bl-md py-1.5 text-gray-900 border border-gray-300 placeholder:text-gray-400 text-sm/6 pl-2 bg-white focus:outline-none font-DM-Sans"
            />
            <select
                id={"LangSelector-" + uniqueUUID}
                defaultValue={defaultLang}
                onChange={(e) => langChange(e.target.value)}
                className="inline-flex items-center rounded-tr-md border border-l-0 border-gray-300 py-1.5 pl-2 pr-2 text-gray-900 text-sm/6 cursor-pointer bg-white focus:outline-none font-DM-Sans"
            >
                {
                    langList.map((lang, index) => {
                        return <option value={lang} key={index} className='cursor-pointer font-DM-Sans'>{lang}</option>
                    })
                }
            </select>
        </div>
    </div>
    )

}

TranslatedInput.propTypes = {
    label: PropTypes.string.isRequired,
    translatedValueObject: PropTypes.object,
    langList: PropTypes.arrayOf(PropTypes.string),
    defaultLang: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func
};