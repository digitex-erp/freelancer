import React from 'react';

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Luxury Velvet Collection',
    description: 'Premium velvet sample books for high-end upholstery.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=400',
    markets: ['UK', 'USA', 'UAE']
  },
  {
    id: 'p2',
    name: 'Organic Linen Series',
    description: 'Eco-friendly linen swatches for sustainable brands.',
    image: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80&w=400',
    markets: ['Germany', 'Sweden', 'France']
  },
  {
    id: 'p3',
    name: 'Technical Fabrics',
    description: 'Durable, fire-retardant fabric samples for commercial use.',
    image: 'https://images.unsplash.com/photo-1558317374-a354d5f6d4da?auto=format&fit=crop&q=80&w=400',
    markets: ['USA', 'Canada', 'Australia']
  },
  {
    id: 'p4',
    name: 'Embroidered Silks',
    description: 'Intricate embroidery designs for luxury curtains.',
    image: 'https://images.unsplash.com/photo-1576014131341-fe1486fab247?auto=format&fit=crop&q=80&w=400',
    markets: ['UAE', 'Saudi Arabia', 'Qatar']
  }
];

export default function ProductCatalog() {
  return (
    <div className="space-y-8">
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-2">Product Catalog</h2>
        <p className="text-slate-400">Showcasing our premium fabric sample book manufacturing capabilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRODUCTS.map(product => (
          <div key={product.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition-all group">
            <div className="h-48 overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-white mb-2">{product.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{product.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {product.markets.map(market => (
                  <span key={market} className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">
                    {market}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-8 border border-indigo-500/20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Ready to Export?</h3>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Our automated agents are constantly scanning for buyers in these key markets. 
          Use the "Feed" tab to see live opportunities matching these products.
        </p>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          View Export Leads
        </button>
      </div>
    </div>
  );
}
