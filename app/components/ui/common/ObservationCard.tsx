import InfoIcon from "@/app/components/icons/InfoIcon";

const ObservationCard = ({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
      <p className="text-sm text-blue-500">
        {title && (
          <span className="font-medium block mb-2 flex items-center gap-2">
            <InfoIcon />
            {title}
          </span>
        )}
        {children}
      </p>
    </div>
  );
};

export default ObservationCard;
