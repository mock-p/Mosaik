'use client'

import { useState } from 'react';
import PropTypes from 'prop-types';

export default function TranslatedTextArea({label, translatedValueObject = {}, langList= ["en"], defaultLang="en", placeholder = "", onChange = undefined, ...props }) {
    if (langList instanceof Array && !langList.includes(defaultLang)) throw new Error(`Default language "${defaultLang}" is not included in the provided language list.`);
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
        //update the textarea value
        const textarea = document.getElementById("TextArea-" + uniqueUUID);
        textarea.value = newTranslatedValue[newLang] == undefined ? "" : newTranslatedValue[newLang];
    }

    return (<div id={"TranslatedTextArea-" + uniqueUUID} {...props}>
        <label className="block text-sm/6 font-medium text-gray-900 ml-1 font-DM-Sans">
            {label}
        </label>
        <div className="rounded-md shadow-xs">
            <div className="w-full inline-flex justify-end items-center rounded-tr-md border border-b-0 border-gray-300 bg-white">
                <select
                    id={"LangSelector-" + uniqueUUID}
                    defaultValue={defaultLang}
                    onChange={(e) => langChange(e.target.value)}
                    className="inline-flex items-center text-gray-900 sm:text-sm/6 border border-t-0 border-r-0 border-b-0 rounded-tr-md border-gray-300 pl-2 pr-2 py-1.5 cursor-pointer bg-white focus:outline-none font-DM-Sans"
                >
                    {
                        langList.map((lang, index) => {
                            return <option value={lang} key={index} className='cursor-pointer font-DM-Sans'>{lang}</option>
                        })
                    }
                </select>
            </div>
            <textarea
                id={"TextArea-" + uniqueUUID}
                placeholder={placeholder}
                rows={4}
                className="block w-full rounded-none rounded-bl-md py-1.5 text-gray-900 border border-gray-300 placeholder:text-gray-400 sm:text-sm/6 px-2 bg-white focus:outline-none font-DM-Sans"
                defaultValue={newTranslatedValue[currentLang]}
                onChange={(e) => inputChange(e.target.value)}
            />
            

            
        </div>
    </div>
    )
}

TranslatedTextArea.propTypes = {
    label: PropTypes.string.isRequired,
    translatedValueObject: PropTypes.object,
    langList: PropTypes.arrayOf(PropTypes.string),
    defaultLang: PropTypes.string,
    placeholder: PropTypes.string,
    onChange: PropTypes.func
};
