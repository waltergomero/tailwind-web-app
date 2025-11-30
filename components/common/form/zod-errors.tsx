

interface ZodErrorsProps {
    error?: string[] | null;
}

export function ZodErrors({ error }: ZodErrorsProps) {
    if (!error) return null;
    return error.map((err: string, index: number) => (
      <div key={index} className="text-red-600 text-xs mt-1">
        {err}
      </div>
    ));
  }
