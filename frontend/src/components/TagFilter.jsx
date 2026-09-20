/**
 * Controlled filter: the parent owns `selected`, this component only renders
 * buttons and calls onChange. A prop is the right tool — nothing else needs
 * this value, so context would be overkill.
 */
export function TagFilter({ tags, selected, onChange }) {
  return (
    <div className="tag-row" role="group" aria-label="Filter by tag">
      <button
        type="button"
        className={!selected ? "tag tag-active" : "tag"}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.slug}
          type="button"
          className={selected === tag.slug ? "tag tag-active" : "tag"}
          onClick={() => onChange(tag.slug)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
