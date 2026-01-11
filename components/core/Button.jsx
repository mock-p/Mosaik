'use client'

import PropTypes from 'prop-types';

export default function Button({text = true, primary}){

    return (
        <button className={`select-none rounded-tl-md rounded-br-md px-4 py-2 font-dm-sans ${primary ? 
        'bg-primary shadow-sm shadow-primary/50 text-white hover:shadow-md active:shadow-sm transition' : 
        'bg-white ring ring-gray-300 text-black hover:inset-shadow-2xs active:inset-shadow-sm'} cursor-pointer`}>
            {text}
        </button>
    )
}

Button.propTypes = {
    primary: PropTypes.bool,
    text: PropTypes.string.isRequired
};
