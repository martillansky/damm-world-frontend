import WarningIcon from "@/app/components/icons/WarningIcon";

const WarningCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <p className="text-sm text-amber-500">
        <span className="font-medium block mb-2 flex items-center gap-2">
          <WarningIcon />
          {title}
        </span>
        {children}
      </p>
    </div>
  );
};

export default WarningCard;
