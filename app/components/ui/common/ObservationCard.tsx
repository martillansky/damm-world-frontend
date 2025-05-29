import PencilIcon from "@/app/components/icons/PencilIcon";

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
            <PencilIcon />
            {title}
          </span>
        )}
        {children}
      </p>
    </div>
  );
};

export default ObservationCard;
