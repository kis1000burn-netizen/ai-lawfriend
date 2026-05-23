type Props = {
  message: string;
};

export function DashboardPreviewEmpty({ message }: Props) {
  return (
    <p className="mt-5 rounded-2xl border border-aibeop-line bg-aibeop-soft p-4 text-sm font-semibold leading-6 text-aibeop-text">
      {message}
    </p>
  );
}
