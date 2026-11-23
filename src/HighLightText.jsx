// Wraps the part of `text` that starts with `search` in <mark>.
const HighLightText = ({ search = "", text = "" }) => {
  const query = search.trim();
  const value = String(text ?? "");

  if (!query || !value.toLowerCase().startsWith(query.toLowerCase())) {
    return <span className="highLightText">{value}</span>;
  }

  return (
    <span className="highLightText">
      <mark>{value.slice(0, query.length)}</mark>
      {value.slice(query.length)}
    </span>
  );
};

export default HighLightText;
