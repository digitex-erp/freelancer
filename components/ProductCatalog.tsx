import React from 'react';

const PRODUCTS = [
    {
        id: 'p1',
        name: 'Fabric Sample Swatch Album',
        description: 'Premium quality sample albums for upholstery and curtain fabric manufacturers. Waterfall binding, hardbound covers.',
        price: '₹450/Piece',
        moq: 'MOQ: 50 Pieces',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400',
        markets: ['Germany', 'Dubai', 'UK', 'USA']
    },
    {
        id: 'p2',
        name: 'Fabric Display Pattern Book',
        description: 'Professional display books for textile showrooms. Perfect for organizing fabric swatches and samples.',
        price: '₹210/Piece',
        moq: 'MOQ: 100 Pieces',
        image: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80&w=400',
        markets: ['Germany', 'Dubai', 'Turkey', 'China']
    },
    {
        id: 'p3',
        name: 'Fabric Waterfall Hanger',
        description: 'Space-saving waterfall hangers for fabric sample display. Ideal for showrooms and exhibitions.',
        price: '₹65/Piece',
        moq: 'MOQ: 200 Pieces',
        image: 'https://images.unsplash.com/photo-1558317374-a354d5f6d4da?auto=format&fit=crop&q=80&w=400',
        markets: ['Dubai', 'Turkey', 'India']
    },
    {
        id: 'p4',
        name: 'Fabric Swatch Cards',
        description: 'Individual swatch cards for fabric samples. Customizable with company branding and fabric details.',
        price: '₹180/Piece',
        moq: 'MOQ: 500 Pieces',
        image: 'https://images.unsplash.com/photo-1576014131341-fe1486fab247?auto=format&fit=crop&q=80&w=400',
        markets: ['Germany', 'USA', 'UK']
    },
    {
        id: 'p5',
        name: 'Fabric Header Display',
        description: 'Premium fabric headers for curtain and upholstery display. Custom sizes available.',
        price: '₹185/sq ft',
        moq: 'MOQ: 10 sq ft',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400',
        markets: ['Dubai', 'Germany', 'UK']
    },
    {
        id: 'p6',
        name: 'Fabric Sample Stack Books',
        description: 'Heavy-duty stack books for large fabric collections. Waterfall binding, durable construction.',
        price: '₹650-675/Unit',
        moq: 'MOQ: 25 Units',
        image: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80&w=400',
        markets: ['Germany', 'Dubai', 'USA', 'China']
    }
];

export default function ProductCatalog() {
    return (
        <div className="space-y-8">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-2">Product Catalog</h2>
                <p className="text-slate-400 mb-4">Premium fabric sample book manufacturing from DIGITEX STUDIO, Bhiwandi</p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-phone text-indigo-400"></i>
                        <span className="text-slate-300">+91 9004962871 / 9867638113</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-map-marker-alt text-indigo-400"></i>
                        <span className="text-slate-300">Bhiwandi - 421302, Maharashtra</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fas fa-id-card text-indigo-400"></i>
                        <span className="text-slate-300">GSTIN: 27AAAPP9753F2ZF</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PRODUCTS.map(product => (
                    <div key={product.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all group">
                        <div className="h-48 overflow-hidden bg-slate-800">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-white mb-2">{product.name}</h3>
                            <p className="text-sm text-slate-400 mb-3">{product.description}</p>

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-emerald-400 font-bold text-lg">{product.price}</span>
                                <span className="text-xs text-slate-500">{product.moq}</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {product.markets.map(market => (
                                    <span key={market} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
                                        {market}
                                    </span>
                                ))}
                            </div>

                            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                Request Quote
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-8 border border-indigo-500/20">
                <div className="max-w-3xl mx-auto text-center">
                    <h3 className="text-2xl font-bold text-white mb-3">Ready to Order?</h3>
                    <p className="text-slate-400 mb-6">
                        We manufacture premium fabric sample books for upholstery and curtain fabric manufacturers worldwide.
                        Our automated agents are constantly finding buyers in Germany (Heimtextil), Dubai (Index), and other key textile markets.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <i className="fas fa-envelope"></i>
                            Contact Us
                        </button>
                        <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                            <i className="fas fa-search"></i>
                            View Export Leads
                        </button>
                    </div>
                    <div className="mt-6 text-sm text-slate-500">
                        <p>Serving: Upholstery Manufacturers • Curtain Fabric Mills • Textile Wholesalers • Private Label Resellers</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
