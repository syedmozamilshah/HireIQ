import React from 'react';

const Radio = ({ id, name, value, checked, onChange, children, className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <label 
        htmlFor={id} 
        className={`flex items-center justify-center w-full h-full cursor-pointer transition-all duration-200 ${
          checked 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 shadow-lg' 
            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
        } border-2 rounded-xl p-4 min-h-[80px]`}
      >
        <div className="flex items-center space-x-3 w-full">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            checked ? 'border-white bg-white' : 'border-gray-300'
          }`}>
            {checked && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
          </div>
          <div className={`flex-1 text-center ${
            checked ? 'text-white' : 'text-gray-700'
          }`}>
            {children}
          </div>
        </div>
      </label>
    </div>
  );
};

export default Radio;
