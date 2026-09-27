
export interface ExternalLinksProps {
  links?: string[] | null;
  emptyText?: string;
  className?: string;
}

export function ExternalLinks({
  links,
  emptyText = "Not provided",
  className = "",
}: ExternalLinksProps) {
  if (!links || links.length === 0) {
    return <span className="text-sm text-slate-400">{emptyText}</span>;
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline break-all"
        >
          {link}
        </a>
      ))}
    </div>
  );
}

export default ExternalLinks;
