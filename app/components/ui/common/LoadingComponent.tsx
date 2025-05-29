interface LoadingComponentProps {
  text?: string;
}

export default function LoadingComponent({ text }: LoadingComponentProps) {
  return (
    <div className="relative w-full h-full">
      <div className="fixed inset-0 flex items-center justify-center bg-background-light dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400 dark:border-lime-400 mx-auto mb-4"></div>
          {text && (
            <p className="text-foreground-light dark:text-foreground text-sm">
              {text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
