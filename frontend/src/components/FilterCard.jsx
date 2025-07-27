import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { Filter, MapPin, Briefcase, DollarSign, X } from 'lucide-react';
import { Button } from './ui/button';

const filterData = [
    {
        filterType: "Location",
        icon: MapPin,
        array: ["Islamabad", "Karachi", "Lahore", "Peshawar", "Quetta"]
    },
    {
        filterType: "Industry",
        icon: Briefcase,
        array: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Science"]
    },
    {
        filterType: "Salary",
        icon: DollarSign,
        array: ["0-40K", "42-1 Lakh", "1 Lakh to 5 Lakh"]
    }
]

function FilterCard() {
    const [selectedValue, setSelectedValue] = useState("");
    const changeHandler = (value) => {
        setSelectedValue(value);
    }
    const dispatch = useDispatch();

    const clearFilters = () => {
        setSelectedValue("");
    }

    useEffect(() => {
        dispatch(setSearchedQuery(selectedValue));
    }, [selectedValue])
    
    return (
        <div className='w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden'>
            {/* Header */}
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-4'>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className='w-5 h-5 text-white' />
                        <h1 className='font-bold text-lg text-white'>Filter Jobs</h1>
                    </div>
                    {selectedValue && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={clearFilters}
                            className="text-white hover:bg-white/20 p-1 h-auto"
                        >
                            <X className='w-4 h-4' />
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="p-4">
                <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                    {
                        filterData.map((data, index) => (
                            <div key={index} className="mb-6 last:mb-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <data.icon className='w-4 h-4 text-gray-600' />
                                    <h2 className='font-semibold text-gray-800'>{data.filterType}</h2>
                                </div>
                                <div className="space-y-2 pl-6">
                                    {
                                        data.array.map((item, idx) => {
                                            const itemId = `id${index}-${idx}`;
                                            return (
                                                <div key={itemId} className='flex items-center space-x-3 py-1'>
                                                    <RadioGroupItem 
                                                        value={item} 
                                                        id={itemId} 
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <label 
                                                        htmlFor={itemId} 
                                                        className='text-sm text-gray-700 hover:text-blue-600 cursor-pointer transition-colors flex-1'
                                                    >
                                                        {item}
                                                    </label>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        ))
                    }
                </RadioGroup>
            </div>
        </div>
    )
}

export default FilterCard
