import { DEFAULT_TAGS } from '@hoesikplate/shared';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  tags?: readonly string[];
}

export function TagSelector({ selectedTags, onChange, tags = DEFAULT_TAGS }: TagSelectorProps) {
  const toggle = (tag: string) => {
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className="px-3 py-1 rounded-full text-xs transition-colors"
            style={
              isSelected
                ? { backgroundColor: '#3182f6', color: '#fff' }
                : { backgroundColor: '#f3f4f6', color: '#4b5563' }
            }
          >
            #{tag}
          </button>
        );
      })}
    </div>
  );
}
