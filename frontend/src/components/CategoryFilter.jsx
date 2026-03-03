function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          activeCategory === 'all' ? 'bg-brandBlue text-white' : 'bg-brandLight text-brandBlue hover:bg-blue-100'
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategory === category.id ? 'bg-brandBlue text-white' : 'bg-brandLight text-brandBlue hover:bg-blue-100'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
