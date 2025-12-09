type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
      <p className="text-sm text-[#B6B09F]">{description}</p>
    </div>
  );
}