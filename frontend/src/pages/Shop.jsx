import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchProducts } from "../lib/api";
import ProductCard from "../components/ProductCard";

const CATS = [
  { key: "all", label: "All Jewellery" },
  { key: "bridal", label: "Bridal Sets" },
  { key: "mehndi", label: "Mehndi" },
  { key: "haldi", label: "Haldi" },
  { key: "assamese", label: "Assamese" },
  { key: "ethnic", label: "Indian Ethnic" },
  { key: "earrings", label: "Earrings" },
  { key: "necklaces", label: "Necklaces" },
  { key: "oxidised", label: "Oxidised" },
  { key: "polki", label: "Polki & Kundan" },
  { key: "temple", label: "Temple" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProducts(category !== "all" ? { category } : {}).then((d) => {
      setProducts(d);
      setLoading(false);
    });
  }, [category]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort === "discount") list.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
    return list;
  }, [products, sort]);

  return (
    <div className="px-4 md:px-12 py-12" data-testid="shop-page">
      <div className="text-center mb-10">
        <p className="overline">Shop</p>
        <h1 className="font-serif text-4xl md:text-6xl text-[#1C1917] mt-3 font-light">
          {CATS.find((c) => c.key === category)?.label || "All Jewellery"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5 mb-10">
        <div className="flex flex-wrap gap-2 md:gap-6 text-xs uppercase tracking-[0.2em]" data-testid="category-tabs">
          {CATS.map((c) => (
            <button
              key={c.key}
              onClick={() => setParams(c.key === "all" ? {} : { category: c.key })}
              data-testid={`cat-tab-${c.key}`}
              className={`px-3 py-2 transition-colors ${category === c.key ? "text-[#1C1917] border-b border-[#D4AF37]" : "text-[#57534E] hover:text-[#1C1917]"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="box-input text-sm w-auto"
          data-testid="sort-select"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Biggest Discount</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8" data-testid="shop-loading">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-[#FAFAF9] animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-[#57534E]">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8" data-testid="shop-grid">
          {sorted.map((p) => <ProductCard key={p.id} product={p} testIdPrefix="shop" />)}
        </div>
      )}

      <div className="text-center mt-16">
        <Link to="/" className="text-xs uppercase tracking-[0.25em] text-[#57534E] hover:text-[#D4AF37]">← Back to Home</Link>
      </div>
    </div>
  );
}
