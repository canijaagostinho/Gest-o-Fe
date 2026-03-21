export const Heading: React.FC<HeadingProps> = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-3xl font-heading font-black tracking-tight text-slate-900">{title}</h2>
      <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
    </div>
  );
};
