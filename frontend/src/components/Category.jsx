import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel'
import { Button } from './ui/button'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Code, Database, BarChart3, Palette, Layers } from 'lucide-react';

const category = [
    {
        name: "Frontend Developer",
        icon: Code,
        description: "Build amazing user interfaces"
    },
    {
        name: "Backend Developer",
        icon: Database,
        description: "Power the server-side logic"
    },
    {
        name: "Data Science",
        icon: BarChart3,
        description: "Extract insights from data"
    },
    {
        name: "Graphics Designer",
        icon: Palette,
        description: "Create stunning visuals"
    },
    {
        name: "Full Stack Developer",
        icon: Layers,
        description: "Master both frontend & backend"
    },
]

const Category = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        if (query.trim() === "") {
            toast("Please enter a search query")
            return
        };
        dispatch(setSearchedQuery(query));
        navigate('/browse')
    }
    
    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Explore by <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Category</span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Find jobs in your area of expertise. Click on any category to explore relevant opportunities.
                </p>
            </div>

            {/* Category Carousel */}
            <Carousel className="w-full max-w-5xl mx-auto">
                <CarouselContent className="-ml-2 md:-ml-4">
                    {
                        category.map((cat, index) => (
                            <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Button 
                                        onClick={() => searchJobHandler(cat.name)} 
                                        variant="outline"
                                        className="w-full h-auto p-6 rounded-2xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 group"
                                    >
                                        <div className="flex flex-col items-center gap-3 text-center">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <cat.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
                                                <p className="text-xs text-gray-500">{cat.description}</p>
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                <CarouselPrevious className="-left-12 bg-white/90 border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300" />
                <CarouselNext className="-right-12 bg-white/90 border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-300" />
            </Carousel>
        </div>
    )
}

export default Category
